import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import bcrypt from "bcryptjs";

let mongoServer;
let adminToken;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashedPassword = await bcrypt.hash("Password123", 10);

  await User.create({
    name: "Admin",
    email: "dispatchadmin@test.com",
    phone: "9876543250",
    password: hashedPassword,
    role: "admin",
  });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "dispatchadmin@test.com", password: "Password123" });
  adminToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Dispatch Endpoints", () => {
  describe("Authorization", () => {
    it("should reject non-admin dispatch", async () => {
      const hashed = await bcrypt.hash("Password123", 10);
      const customer = await User.create({
        name: "Cust",
        email: "discust@test.com",
        phone: "9876543251",
        password: hashed,
        role: "customer",
      });

      const custLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: "discust@test.com", password: "Password123" });

      const res = await request(app)
        .post("/api/dispatch/123456789012345678901234")
        .set("Authorization", `Bearer ${custLogin.body.accessToken}`)
        .send({ latitude: 13, longitude: 80 });

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated dispatch", async () => {
      const res = await request(app)
        .post("/api/dispatch/123456789012345678901234")
        .send({ latitude: 13, longitude: 80 });

      expect(res.status).toBe(401);
    });
  });
});
