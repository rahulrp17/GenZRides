import request from "supertest";
import express from "express";
import rateLimit from "express-rate-limit";
import { redisAvailable } from "../src/config/redisRateLimiter.js";

describe("Rate limiting", () => {
  it("disables Redis-backed limiting when REDIS_HOST is not configured", () => {
    expect(process.env.REDIS_HOST).toBeFalsy();
    expect(redisAvailable()).toBe(false);
  });

  it("blocks requests after the configured limit (in-memory store)", async () => {
    const app = express();
    app.use(
      rateLimit({
        windowMs: 1000,
        limit: 2,
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
    app.get("/ping", (req, res) => res.json({ ok: true }));

    const first = await request(app).get("/ping");
    const second = await request(app).get("/ping");
    const third = await request(app).get("/ping");

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(third.status).toBe(429);
  });
});
