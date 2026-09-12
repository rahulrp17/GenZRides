import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import DriverProfile from "../src/models/DriverProfile.js";
import Booking from "../src/models/Booking.js";
import bcrypt from "bcryptjs";

let mongoServer;
let customerToken;
let driverToken;
let testVehicle;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashedPassword = await bcrypt.hash("Password123", 10);

  const customer = await User.create({
    name: "Test Customer",
    email: "customer@test.com",
    phone: "9876543210",
    password: hashedPassword,
    role: "customer",
  });

  const driverUser = await User.create({
    name: "Test Driver",
    email: "driver@test.com",
    phone: "9876543211",
    password: hashedPassword,
    role: "driver",
  });

  testVehicle = await Vehicle.create({
    name: "Sedan",
    seats: 4,
    oneWayBaseFare: 100,
    roundTripBaseFare: 100,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 12,
    roundTripPerKm: 12,
    minimumDistance: 1,
    isActive: true,
  });

  await DriverProfile.create({
    user: driverUser._id,
    aadhaarNumber: "123456789012",
    licenseNumber: "DL1234567890",
    vehicleType: testVehicle._id,
    vehicleBrand: "Maruti",
    vehicleModel: "Dzire",
    vehicleColor: "White",
    vehicleYear: 2022,
    vehicleNumber: "TN01AB1234",
    approvalStatus: "Approved",
    isOnline: true,
    isAvailable: true,
    currentLocation: {
      type: "Point",
      coordinates: [80.27, 13.08],
    },
  });

  const custLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "customer@test.com", password: "Password123" });
  customerToken = custLogin.body.accessToken;

  const driverLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "driver@test.com", password: "Password123" });
  driverToken = driverLogin.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
});

describe("Booking Endpoints", () => {
  describe("Validation", () => {
    it("should reject booking without required fields", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ pickup: {} });

      expect(res.status).toBe(400);
    });

    it("should reject booking with invalid coordinates", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          pickup: { address: "Test", latitude: 999, longitude: 80 },
          drop: { address: "Test", latitude: 13, longitude: 80 },
          pickupDateTime: new Date(Date.now() + 86400000).toISOString(),
          tripType: "One Way",
          days: 1,
          vehicleType: testVehicle._id.toString(),
          paymentMethod: "Cash",
        });

      expect(res.status).toBe(400);
    });

    it("should reject booking without auth", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .send({
          pickup: { address: "Test", latitude: 13, longitude: 80 },
          drop: { address: "Test", latitude: 14, longitude: 81 },
          pickupDateTime: new Date(Date.now() + 86400000).toISOString(),
          tripType: "One Way",
          days: 1,
          vehicleType: testVehicle._id.toString(),
          paymentMethod: "Cash",
        });

      expect(res.status).toBe(401);
    });

    it("should reject non-customer creating booking", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${driverToken}`)
        .send({
          pickup: { address: "Test", latitude: 13, longitude: 80 },
          drop: { address: "Test", latitude: 14, longitude: 81 },
          pickupDateTime: new Date(Date.now() + 86400000).toISOString(),
          tripType: "One Way",
          days: 1,
          vehicleType: testVehicle._id.toString(),
          paymentMethod: "Cash",
        });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/bookings/my-bookings", () => {
    it("should return empty bookings initially", async () => {
      const res = await request(app)
        .get("/api/bookings/my-bookings")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.bookings).toEqual([]);
    });
  });
});
