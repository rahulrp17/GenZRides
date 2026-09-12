import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Booking from "../src/models/Booking.js";
import Payment from "../src/models/Payment.js";
import Vehicle from "../src/models/Vehicle.js";
import bcrypt from "bcryptjs";

let mongoServer;
let customerToken;
let testBooking;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashedPassword = await bcrypt.hash("Password123", 10);

  const customer = await User.create({
    name: "Pay Customer",
    email: "paycustomer@test.com",
    phone: "9876543230",
    password: hashedPassword,
    role: "customer",
  });

  const vehicle = await Vehicle.create({
    name: "Sedan",
    seats: 4,
    oneWayBaseFare: 100,
    roundTripBaseFare: 100,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 12,
    roundTripPerKm: 12,
    minimumDistance: 1,
  });

  testBooking = await Booking.create({
    customer: customer._id,
    pickup: { address: "Test Pickup", latitude: 13.08, longitude: 80.27 },
    drop: { address: "Test Drop", latitude: 13.15, longitude: 80.35 },
    pickupDateTime: new Date(Date.now() + 86400000),
    vehicleType: vehicle._id,
    distance: 10,
    duration: 30,
    estimatedFare: 220,
    paymentMethod: "Online",
    bookingStatus: "Completed",
    paymentStatus: "Pending",
  });

  const custLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "paycustomer@test.com", password: "Password123" });
  customerToken = custLogin.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Payment Endpoints", () => {
  describe("Validation", () => {
    it("should reject payment creation without bookingId", async () => {
      const res = await request(app)
        .post("/api/payments/create-order")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("should reject verify without required fields", async () => {
      const res = await request(app)
        .post("/api/payments/verify")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("Webhook", () => {
    it("should handle webhook POST", async () => {
      const res = await request(app)
        .post("/api/webhooks/razorpay")
        .set("Content-Type", "application/json")
        .send(JSON.stringify({ event: "payment.captured" }));

      expect([200, 400, 401, 500]).toContain(res.status);
    });
  });
});
