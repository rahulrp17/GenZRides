import Redis from "ioredis";

let redisClient = null;
let _connected = false;
let _errorLogged = false;

// Simple in-memory LRU fallback for hot reads when Redis is down
const memCache = new Map();
const memCacheExpiry = new Map();
const MEM_CACHE_MAX = 200;

const memGet = (key) => {
  const exp = memCacheExpiry.get(key);
  if (exp && Date.now() > exp) {
    memCache.delete(key);
    memCacheExpiry.delete(key);
    return null;
  }
  return memCache.get(key) ?? null;
};
const memSet = (key, val, ttlSec) => {
  if (memCache.size >= MEM_CACHE_MAX) {
    const first = memCache.keys().next().value;
    memCache.delete(first);
    memCacheExpiry.delete(first);
  }
  memCache.set(key, val);
  memCacheExpiry.set(key, Date.now() + ttlSec * 1000);
};

export const getRedisClient = () => {
  if (!redisClient) {
    // Upstash REST URL (https://...) is NOT for ioredis — use Dashboard → Connect → Node (rediss://)
    // Support REDIS_URL directly if provided (e.g. rediss://default:pass@host:6379)
    if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith("redis")) {
      redisClient = new Redis(process.env.REDIS_URL);
    } else {
      let rawHost = process.env.REDIS_HOST || "127.0.0.1";
      if (rawHost.startsWith("https://")) {
        console.error("REDIS_HOST is https:// (REST URL) — use Upstash Dashboard → Connect → Node → Host (e.g. charmed-duck-146690.upstash.io) without https://, or set REDIS_URL=rediss://...");
        rawHost = rawHost.replace(/^https:\/\//, "").replace(/\/$/, "");
      }
      const opts = {
        host: rawHost,
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false,
        retryStrategy(times) {
          if (times > 3) return null;
          return Math.min(times * 200, 2000);
        },
      };

      if (process.env.REDIS_PASSWORD) {
        opts.password = process.env.REDIS_PASSWORD;
      }

      // Upstash requires TLS
      if (
        String(process.env.REDIS_HOST || "").includes("upstash.io") ||
        String(process.env.REDIS_TLS || "").toLowerCase() === "true" ||
        String(process.env.REDIS_URL || "").startsWith("rediss")
      ) {
        opts.tls = {};
      }

      redisClient = new Redis(opts);
    }

    redisClient.on("error", (err) => {
      if (!_errorLogged) {
        console.error("Redis connection error:", err.message);
        _errorLogged = true;
      }
    });

    redisClient.on("connect", () => {
      _connected = true;
      _errorLogged = false;
      console.log("Redis connected");
    });

    redisClient.on("close", () => {
      _connected = false;
    });
  }
  return redisClient;
};

export const isRedisConnected = () => {
  if (!redisClient) return false;
  return redisClient.status === "ready" || redisClient.status === "connect";
};

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    _connected = false;
  }
};

export const withCache = async (key, ttlSec, fn) => {
  // Try Redis first
  if (isRedisConnected()) {
    try {
      const cached = await redisClient.get(key);
      if (cached) return JSON.parse(cached);
    } catch { /* fallback */ }
  } else {
    const mem = memGet(key);
    if (mem) return mem;
  }
  const fresh = await fn();
  // Store
  if (isRedisConnected()) {
    try {
      await redisClient.setex(key, ttlSec, JSON.stringify(fresh));
    } catch { /* ignore */ }
  } else {
    memSet(key, fresh, ttlSec);
  }
  return fresh;
};

export const invalidateCache = async (patternOrKey) => {
  if (isRedisConnected()) {
    try {
      if (patternOrKey.includes("*")) {
        // SCAN (cursor-based) instead of blocking KEYS() — invalidation
        // must never stall the event loop on a large keyspace.
        let cursor = "0";
        do {
          const [nextCursor, keys] = await redisClient.scan(
            cursor,
            "MATCH",
            patternOrKey,
            "COUNT",
            200
          );
          cursor = nextCursor;
          if (keys.length) await redisClient.del(...keys);
        } while (cursor !== "0");
      } else {
        await redisClient.del(patternOrKey);
      }
    } catch { /* ignore */ }
  }
  // Also clear matching mem keys
  for (const k of [...memCache.keys()]) {
    if (k === patternOrKey || (patternOrKey.includes("*") && k.startsWith(patternOrKey.replace("*","")))) {
      memCache.delete(k);
      memCacheExpiry.delete(k);
    }
  }
};
