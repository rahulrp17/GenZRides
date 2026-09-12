import request from "supertest";
import crypto from "crypto";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import Booking from "../src/models/Booking.js";
import Payment from "../src/models/Payment.js";
import User from "../src/models/User.js";
import DriverProfile from "../src/models/DriverProfile.js";
import Vehicle from "../src/models/Vehicle.js";
import bcrypt from "bcryptjs";

let mongoServer;
const WEBHOOK_SECRET = "test-webhook-secret";

beforeAll(async () => {
  process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashed = await bcrypt.hash("Password123", 10);
  const customer = await User.create({
    name: "Webhook Customer",
    email: "wh-customer@test.com",
    phone: "9876543299",
    password: hashed,
    role: "customer",
  });
  const driverUser = await User.create({
    name: "Webhook Driver",
    email: "wh-driver@test.com",
    phone: "9876543298",
    password: hashed,
    role: "driver",
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
    isActive: true,
  });
  const driver = await DriverProfile.create({
    user: driverUser._id,
    aadhaarNumber: "123456789013",
    licenseNumber: "DL1234567891",
    vehicleType: vehicle._id,
    vehicleBrand: "Maruti",
    vehicleModel: "Dzire",
    vehicleColor: "White",
    vehicleYear: 2022,
    vehicleNumber: "TN01AB1235",
    approvalStatus: "Approved",
    isOnline: true,
  });
  const booking = await Booking.create({
    customer: customer._id,
    driver: driver._id,
    pickup: { address: "A", latitude: 13, longitude: 80 },
    drop: { address: "B", latitude: 14, longitude: 81 },
    pickupDateTime: new Date(Date.now() + 86400000),
    tripType: "One Way",
    days: 1,
    vehicleType: vehicle._id,
    paymentMethod: "Online",
    bookingStatus: "Completed",
    estimatedFare: 500,
  });
  await Payment.create({
    booking: booking._id,
    customer: customer._id,
    razorpayOrderId: "order_wh_1",
    amount: 50000,
    currency: "INR",
    status: "Created",
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

const sign = (rawBody) =>
  crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");

describe("Razorpay webhook", () => {
  it("rejects a request with an invalid signature", async () => {
    const event = {
      id: "evt_invalid",
      event: "payment.captured",
      payload: {
        payment: {
          entity: { order_id: "order_wh_1", id: "pay_1", created_at: 123 },
        },
      },
    };
    const rawBody = JSON.stringify(event);
    const res = await request(app)
      .post("/api/webhooks/razorpay")
      .set("Content-Type", "application/json")
      .set("x-razorpay-signature", "deadbeef")
      .send(rawBody);

    expect(res.status).toBe(401);
    const payment = await Payment.findOne({ razorpayOrderId: "order_wh_1" });
    expect(payment.status).toBe("Created");
  });

  it("processes a valid signature and marks the payment Paid", async () => {
    const event = {
      id: "evt_valid_1",
      event: "payment.captured",
      payload: {
        payment: {
          entity: { order_id: "order_wh_1", id: "pay_1", created_at: 123 },
        },
      },
    };
    const rawBody = JSON.stringify(event);
    const res = await request(app)
      .post("/api/webhooks/razorpay")
      .set("Content-Type", "application/json")
      .set("x-razorpay-signature", sign(rawBody))
      .send(rawBody);

    expect(res.status).toBe(200);
    const payment = await Payment.findOne({ razorpayOrderId: "order_wh_1" });
    expect(payment.status).toBe("Paid");
    expect(payment.verified).toBe(true);
  });

  it("is idempotent when the same event is delivered again", async () => {
    const event = {
      id: "evt_valid_1",
      event: "payment.captured",
      payload: {
        payment: {
          entity: { order_id: "order_wh_1", id: "pay_1", created_at: 123 },
        },
      },
    };
    const rawBody = JSON.stringify(event);
    const res = await request(app)
      .post("/api/webhooks/razorpay")
      .set("Content-Type", "application/json")
      .set("x-razorpay-signature", sign(rawBody))
      .send(rawBody);

    expect(res.status).toBe(200);
    const payment = await Payment.findOne({ razorpayOrderId: "order_wh_1" });
    expect(payment.status).toBe("Paid");
  });
});
