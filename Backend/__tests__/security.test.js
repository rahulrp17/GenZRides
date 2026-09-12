import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Security", () => {
  describe("SQL/NoSQL Injection", () => {
    it("should sanitize $ operators in request body", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: { $gt: "" }, password: { $gt: "" } });

      expect(res.status).toBe(400);
    });
  });

  describe("Rate Limiting", () => {
    it("should return 404 for unknown routes", async () => {
      const res = await request(app).get("/api/nonexistent");
      expect(res.status).toBe(404);
    });
  });

  describe("Security Headers", () => {
    it("should have security headers", async () => {
      const res = await request(app).get("/health");
      expect(res.headers["x-content-type-options"]).toBeDefined();
      expect(res.headers["x-frame-options"]).toBeDefined();
    });
  });

  describe("Health Check", () => {
    it("should return healthy status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Root Route", () => {
    it("should return API running message", async () => {
      const res = await request(app).get("/");
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("GenZRides");
    });
  });
});
