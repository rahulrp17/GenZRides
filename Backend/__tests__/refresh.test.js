import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import bcrypt from "bcryptjs";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashed = await bcrypt.hash("Password123", 10);
  await User.create({
    name: "Refresh User",
    email: "refresh@test.com",
    phone: "9876543288",
    password: hashed,
    role: "customer",
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Refresh token rotation & reuse detection", () => {
  it("rotates the refresh token and rejects reuse of the old one", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "refresh@test.com", password: "Password123" });
    expect(login.status).toBe(200);
    const oldRefresh = login.body.refreshToken;
    expect(oldRefresh).toBeDefined();

    const rotate = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: oldRefresh });
    expect(rotate.status).toBe(200);
    expect(rotate.body.refreshToken).toBeDefined();
    expect(rotate.body.refreshToken).not.toBe(oldRefresh);

    const reuse = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken: oldRefresh });
    expect(reuse.status).not.toBe(200);
  });

  it("rejects a missing refresh token", async () => {
    const res = await request(app).post("/api/auth/refresh-token").send({});
    expect(res.status).not.toBe(200);
  });
});
