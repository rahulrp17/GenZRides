import express from "express";
import request from "supertest";
import {
  cacheMiddleware,
  queryCacheKey,
} from "../src/middleware/cache.middleware.js";

const buildApp = (mw, handler) => {
  const app = express();
  app.use(express.json());
  app.get("/test", mw, handler);
  app.post("/test", mw, handler);
  return app;
};

describe("cacheMiddleware (static GETs only)", () => {
  describe("queryCacheKey", () => {
    it("produces the same key regardless of query key order", () => {
      expect(queryCacheKey("maps:autocomplete", { q: "tri", limit: 5 })).toBe(
        queryCacheKey("maps:autocomplete", { limit: 5, q: "tri" })
      );
    });

    it("produces different keys for different queries", () => {
      expect(queryCacheKey("maps:autocomplete", { q: "tri" })).not.toBe(
        queryCacheKey("maps:autocomplete", { q: "che" })
      );
    });

    it("hashes oversized queries to a bounded key", () => {
      const big = { q: "x".repeat(500) };
      const key = queryCacheKey("maps:autocomplete", big);
      expect(key.length).toBeLessThan(120);
      expect(key.startsWith("maps:autocomplete:")).toBe(true);
    });
  });

  describe("fail-open without Redis", () => {
    it("passes GET through untouched when Redis is unavailable", async () => {
      const app = buildApp(cacheMiddleware("test:key", 60), (req, res) =>
        res.status(200).json({ success: true, data: [1, 2, 3] })
      );

      const res = await request(app).get("/test");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: [1, 2, 3] });
      // No interception without Redis — handler response passes verbatim.
      expect(res.headers["x-cache"]).toBeUndefined();
    });

    it("never intercepts non-GET requests", async () => {
      const app = buildApp(cacheMiddleware("test:key", 60), (req, res) =>
        res.status(200).json({ success: true })
      );

      const res = await request(app).post("/test").send({});
      expect(res.status).toBe(200);
      expect(res.headers["x-cache"]).toBeUndefined();
    });
  });
});
