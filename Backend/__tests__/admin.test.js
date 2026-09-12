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
    name: "Admin User",
    email: "admin@test.com",
    phone: "9876543240",
    password: hashedPassword,
    role: "admin",
  });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "Password123" });
  adminToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Admin Endpoints", () => {
  describe("Authorization", () => {
    it("should reject non-admin accessing admin routes", async () => {
      const custHashed = await bcrypt.hash("Password123", 10);
      const customer = await User.create({
        name: "Cust",
        email: "c@test.com",
        phone: "9876543241",
        password: custHashed,
        role: "customer",
      });

      const custLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: "c@test.com", password: "Password123" });

      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${custLogin.body.accessToken}`);

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated access", async () => {
      const res = await request(app).get("/api/admin/dashboard");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/admin/dashboard", () => {
    it("should return dashboard stats for admin", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Vehicle image handling", () => {
    const baseVehicle = {
      name: "Test Sedan",
      seats: 4,
      luggage: 2,
      oneWayBaseFare: 100,
      roundTripBaseFare: 100,
      oneWayBaseKm: 0,
      roundTripBaseKm: 0,
      oneWayPerKm: 12,
      roundTripPerKm: 12,
      waitingChargePerMinute: 2,
      driverAllowance: 0,
      nightCharge: 0,
      minimumDistance: 1,
    };

    it("should persist an image URL on create and update", async () => {
      const created = await request(app)
        .post("/api/admin/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...baseVehicle, image: "https://example.com/sedan.jpg" });

      expect(created.status).toBe(201);
      expect(created.body.vehicle.image).toBe("https://example.com/sedan.jpg");

      const updated = await request(app)
        .put(`/api/admin/vehicles/${created.body.vehicle._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ image: "https://example.com/sedan-v2.jpg" });

      expect(updated.status).toBe(200);
      expect(updated.body.vehicle.image).toBe(
        "https://example.com/sedan-v2.jpg"
      );
    });

    it("should persist a high-distance bata override and clear it with null", async () => {
      const created = await request(app)
        .post("/api/admin/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...baseVehicle, name: "Bata Hatch", driverBataHighDistance: 750 });

      expect(created.status).toBe(201);
      expect(created.body.vehicle.driverBataHighDistance).toBe(750);

      const cleared = await request(app)
        .put(`/api/admin/vehicles/${created.body.vehicle._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ driverBataHighDistance: null });

      expect(cleared.status).toBe(200);
      expect(cleared.body.vehicle.driverBataHighDistance).toBeNull();
    });

    it("should reject upload-image without a file", async () => {
      const res = await request(app)
        .post("/api/admin/vehicles/upload-image")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject upload-image for non-admins", async () => {
      const res = await request(app).post("/api/admin/vehicles/upload-image");

      expect(res.status).toBe(401);
    });
  });
});
