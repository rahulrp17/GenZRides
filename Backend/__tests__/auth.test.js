import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.JWT_EXPIRE = "1h";
  process.env.JWT_REFRESH_EXPIRES = "7d";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Auth Endpoints", () => {
  const validUser = {
    name: "Test User",
    email: "test@example.com",
    phone: "9876543210",
    password: "Password123",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new customer", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe("test@example.com");
    });

    it("should reject duplicate email", async () => {
      await request(app).post("/api/auth/register").send(validUser);
      const res = await request(app).post("/api/auth/register").send(validUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, email: "invalid-email" });

      expect(res.status).toBe(400);
    });

    it("should reject short password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, password: "short" });

      expect(res.status).toBe(400);
    });

    it("should reject invalid phone", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, phone: "12345" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(validUser);
    });

    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "Password123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it("should reject wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "WrongPassword1" });

      expect(res.status).toBe(401);
    });

    it("should reject non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "Password123" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    it("should reject invalid refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: "invalid-token" });

      expect(res.status).toBe(401);
    });

    it("should rotate the refresh token and reject reuse of the old one", async () => {
      const regRes = await request(app).post("/api/auth/register").send(validUser);
      const refreshToken = regRes.body.refreshToken;

      const rotated = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken });
      expect(rotated.status).toBe(200);
      expect(rotated.body.refreshToken).toBeDefined();
      expect(rotated.body.refreshToken).not.toBe(refreshToken);

      const reuse = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken });
      expect(reuse.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const regRes = await request(app).post("/api/auth/register").send(validUser);
      const token = regRes.body.accessToken;

      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`)
        .send({ refreshToken: regRes.body.refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/auth/profile", () => {
    it("should get profile with valid token", async () => {
      const regRes = await request(app).post("/api/auth/register").send(validUser);
      const token = regRes.body.accessToken;

      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("test@example.com");
    });

    it("should reject without token", async () => {
      const res = await request(app).get("/api/auth/profile");
      expect(res.status).toBe(401);
    });
  });

  describe("Password-reset OTP hardening", () => {
    const otpUser = {
      name: "Otp User",
      email: "otp@example.com",
      phone: "9876543299",
      password: "Password123",
    };

    const requestOtp = async () => {
      await request(app).post("/api/auth/register").send(otpUser);
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: otpUser.email });
      expect(res.status).toBe(200);
      expect(res.body.otp).toMatch(/^\d{6}$/);
      return res.body.otp;
    };

    it("stores only the OTP hash and verifies the real code", async () => {
      const otp = await requestOtp();
      const User = (await import("../src/models/User.js")).default;
      const stored = await User.findOne({ email: otpUser.email }).select(
        "+otp +otpExpiry +otpAttempts"
      );
      expect(stored.otp).not.toBe(otp);
      expect(stored.otp).toMatch(/^[0-9a-f]{64}$/);
      expect(stored.otpAttempts).toBe(0);

      const ok = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: otpUser.email, otp });
      expect(ok.status).toBe(200);
      expect(ok.body.success).toBe(true);
    });

    it("voids the code after 5 wrong guesses", async () => {
      const otp = await requestOtp();
      for (let i = 0; i < 5; i++) {
        const bad = await request(app)
          .post("/api/auth/verify-otp")
          .send({ email: otpUser.email, otp: "000000" });
        expect(bad.status).toBe(400);
      }
      // Even the correct code is dead now — a fresh OTP is required.
      const locked = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: otpUser.email, otp });
      expect(locked.status).toBe(400);
      expect(locked.body.message).toMatch(/too many|request a new/i);
    });
  });
});
