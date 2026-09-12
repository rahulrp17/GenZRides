import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { getRedisClient, isRedisConnected } from "./redis.js";

let redisStore = null;
let _redisStoreAttempted = false;

/**
 * Minimal express-rate-limit v8 compatible Redis store backed by ioredis.
 * Uses INCR + PEXPIRE so counters reset/expiry exactly match windowMs.
 * (Previous implementation used connect-redis session store which does not
 * implement the rate-limit Store interface.)
 */
class IORedisRateLimitStore {
  constructor(prefix = "ratelimit:") {
    this.prefix = prefix;
    this.windowMs = 15 * 60 * 1000;
  }

  init(options) {
    if (options?.windowMs) this.windowMs = options.windowMs;
  }

  _key(key) {
    return `${this.prefix}${key}`;
  }

  async get(key) {
    try {
      const client = getRedisClient();
      const count = await client.get(this._key(key));
      const ttl = await client.pttl(this._key(key));
      if (count === null) return undefined;
      return {
        totalHits: Number(count),
        resetTime: new Date(Date.now() + (ttl > 0 ? ttl : this.windowMs)),
      };
    } catch {
      return undefined;
    }
  }

  async increment(key) {
    const client = getRedisClient();
    const redisKey = this._key(key);
    const count = await client.incr(redisKey);
    if (count === 1) {
      await client.pexpire(redisKey, this.windowMs);
    }
    const ttl = await client.pttl(redisKey);
    return {
      totalHits: count,
      resetTime: new Date(Date.now() + (ttl > 0 ? ttl : this.windowMs)),
    };
  }

  async decrement(key) {
    try {
      const client = getRedisClient();
      await client.decr(this._key(key));
    } catch {
      // best-effort; memory fallback continues to enforce limits
    }
  }

  async resetKey(key) {
    try {
      const client = getRedisClient();
      await client.del(this._key(key));
    } catch {
      // ignore
    }
  }

  async resetAll() {
    try {
      const client = getRedisClient();
      const stream = client.scanStream({ match: `${this.prefix}*`, count: 100 });
      const keys = [];
      for await (const chunk of stream) keys.push(...chunk);
      if (keys.length) await client.del(...keys);
    } catch {
      // ignore
    }
  }
}

const getRedisStore = () => {
  if (!redisStore) {
    // Throws if Redis client cannot be created; caller fails closed.
    getRedisClient();
    redisStore = new IORedisRateLimitStore("ratelimit:");
  }
  return redisStore;
};

// Redis is used only when both configured AND actually connected.
// Falls back to in-memory store when Redis is unavailable.
export const redisAvailable = () => {
  if (!process.env.REDIS_HOST) return false;
  if (!isRedisConnected()) return false;
  return true;
};

const createLimiter = (opts) => {
  if (process.env.NODE_ENV === "test") {
    return (req, res, next) => next();
  }

  const limiterOpts = {
    ...opts,
    standardHeaders: true,
    legacyHeaders: false,
    // Key by IP, but include the authenticated user id when present so
    // per-user limits are enforceable in multi-instance deployments.
    keyGenerator: (req) => {
      const base =
        ipKeyGenerator(req.ip) ||
        req.headers["x-forwarded-for"] ||
        "unknown";
      const userPart = req.user?._id ? `:${req.user._id.toString()}` : "";
      return `${base}${userPart}`;
    },
  };

  if (redisAvailable()) {
    try {
      limiterOpts.store = getRedisStore();
    } catch (err) {
      // Redis is configured for production but the store could not be created.
      // Fail closed rather than silently degrading to a per-instance memory
      // limiter (which would allow clients to bypass throttling across the
      // fleet). Operators must restore Redis connectivity.
      console.error("Redis rate-limit store unavailable; failing closed:", err.message);
      return (req, res, next) =>
        res.status(503).json({
          success: false,
          message: "Service temporarily unavailable. Please try again later.",
        });
    }
  }

  return rateLimit(limiterOpts);
};

// Warn once if REDIS_HOST is set but Redis isn't connected (dev convenience)
if (
  process.env.REDIS_HOST &&
  process.env.NODE_ENV !== "test" &&
  process.env.NODE_ENV !== "production"
) {
  setTimeout(() => {
    if (!isRedisConnected() && !_redisStoreAttempted) {
      _redisStoreAttempted = true;
      console.warn(
        `REDIS_HOST=${process.env.REDIS_HOST} is set but Redis is not connected. ` +
        `Using in-memory rate limiting. Start Redis or remove REDIS_HOST from .env to suppress this warning.`
      );
    }
  }, 5000);
}

export const generalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: "Too many requests. Please try again later." },
  skip: (req) => {
    // Polling endpoints for live tracking — high frequency is expected, handled by socket primary
    const p = req.path || req.originalUrl || "";
    return (
      p.includes("/drivers/current-booking") ||
      p.includes("/bookings/my-bookings") ||
      p.includes("/bookings/available") ||
      p === "/health"
    );
  },
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many authentication attempts. Please try again later." },
});

export const uploadLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many upload requests. Please try again later." },
});

export const paymentLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: "Too many payment requests. Please try again later." },
});

export const dispatchLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many dispatch requests. Please try again later." },
});

// Public guest endpoints (no JWT): tighter per-IP limits to prevent abuse.
export const guestBookingLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many guest booking attempts. Please try again later." },
});

export const guestSearchLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, message: "Too many search requests. Please try again later." },
});
