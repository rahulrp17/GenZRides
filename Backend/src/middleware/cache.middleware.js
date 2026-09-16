import crypto from "crypto";
import { getRedisClient, isRedisConnected } from "../config/redis.js";

/**
 * Route-level Redis response cache for STATIC, user-invariant GETs only.
 *
 * NEVER apply to bookings, rides, locations, wallets, dispatch, auth or
 * anything user-specific — this middleware has no user scoping by design.
 * Safe targets: Maps autocomplete/place-details (same query → same Google
 * data for everyone), vapid public key (identical for all users).
 *
 * Fail-open: Redis down/unreachable → requests pass through uncached with
 * identical responses. Only 2xx `success: true` bodies are stored.
 */

// Deterministic stringify (sorted keys) so equal queries share a key.
const stableStringify = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) return JSON.stringify(value.map(stableStringify));
  return JSON.stringify(
    Object.keys(value)
      .sort()
      .map((k) => [k, stableStringify(value[k])])
  );
};

// Bounded key: long queries are hashed so keys can't grow unbounded in Redis.
export const queryCacheKey = (prefix, query) => {
  const s = stableStringify(query);
  return s.length > 160
    ? `${prefix}:${crypto.createHash("sha1").update(s).digest("hex")}`
    : `${prefix}:${s}`;
};

const redisGet = async (key) => {
  try {
    const raw = await getRedisClient().get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const redisSet = async (key, value, ttlSec) => {
  try {
    await getRedisClient().setex(key, ttlSec, JSON.stringify(value));
  } catch {
    // ignore — caching is best-effort
  }
};

export const cacheMiddleware = (keyFn, ttlSec = 300) => {
  return async (req, res, next) => {
    if (req.method !== "GET" || !isRedisConnected()) {
      return next();
    }

    let cacheKey;
    try {
      cacheKey = typeof keyFn === "function" ? keyFn(req) : keyFn;
    } catch {
      return next();
    }

    try {
      const cached = await redisGet(cacheKey);
      if (cached) {
        res.set("X-Cache", "HIT");
        return res
          .status(200)
          .json({ ...cached, timestamp: new Date().toISOString() });
      }

      res.set("X-Cache", "MISS");
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && data?.success) {
          await redisSet(cacheKey, data, ttlSec);
        }
        return originalJson(data);
      };
      return next();
    } catch {
      return next();
    }
  };
};
