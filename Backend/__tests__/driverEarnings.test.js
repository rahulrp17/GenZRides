import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import DriverProfile from "../src/models/DriverProfile.js";
import DriverWallet from "../src/models/DriverWallet.js";
import Booking from "../src/models/Booking.js";
import bcrypt from "bcryptjs";

let mongoServer;
let driverToken;
let testDriverProfile;
let vehicleDoc;
let customerUser;

const loc = (address) => ({ address, latitude: 13.0, longitude: 80.2 });

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashedPassword = await bcrypt.hash("Password123", 10);

  const driverUser = await User.create({
    name: "Earnings Driver",
    email: "earningsdriver@test.com",
    phone: "9876543231",
    password: hashedPassword,
    role: "driver",
  });

  customerUser = await User.create({
    name: "Test Customer",
    email: "earningscust@test.com",
    phone: "9876543232",
    password: hashedPassword,
    role: "customer",
  });

  vehicleDoc = await Vehicle.create({
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

  testDriverProfile = await DriverProfile.create({
    user: driverUser._id,
    aadhaarNumber: "123456789014",
    licenseNumber: "DL9876543211",
    vehicleType: vehicleDoc._id,
    vehicleBrand: "Honda",
    vehicleModel: "City",
    vehicleColor: "Black",
    vehicleYear: 2023,
    vehicleNumber: "KA01CD5679",
    approvalStatus: "Approved",
  });

  await DriverWallet.create({
    driver: testDriverProfile._id,
    balance: 0,
    lifetimeEarnings: 0,
    totalWithdrawn: 0,
  });

  // Poison the write-only profile counters: if any endpoint reads these,
  // "today" would show 9999 instead of the true 500.
  testDriverProfile.todayEarnings = 9999;
  testDriverProfile.weekEarnings = 8888;
  testDriverProfile.monthEarnings = 7777;
  testDriverProfile.totalTrips = 1;
  testDriverProfile.completedTrips = 1;
  testDriverProfile.cancelledTrips = 0;
  await testDriverProfile.save();

  const now = new Date();
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const base = {
    customer: customerUser._id,
    driver: testDriverProfile._id,
    pickup: loc("Pickup"),
    drop: loc("Drop"),
    pickupDateTime: now,
    vehicleType: vehicleDoc._id,
  };

  // Completed today — fare 500 (counts toward today/week/month)
  await Booking.create({
    ...base,
    bookingStatus: "Completed",
    finalFare: 500,
    completedAt: now,
  });

  // Completed 10 days ago — fare 300 (month only, outside the 7-day window)
  await Booking.create({
    ...base,
    bookingStatus: "Completed",
    finalFare: 300,
    completedAt: tenDaysAgo,
    pickupDateTime: tenDaysAgo,
  });

  // Cancelled after assignment (counts as decided + accepted offer)
  await Booking.create({ ...base, bookingStatus: "Cancelled" });

  // Offer the driver rejected (counts toward offers, not trips)
  await Booking.create({
    customer: customerUser._id,
    pickup: loc("Pickup"),
    drop: loc("Drop"),
    pickupDateTime: now,
    vehicleType: vehicleDoc._id,
    bookingStatus: "Pending",
    rejectedDrivers: [testDriverProfile._id],
  });

  const driverLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "earningsdriver@test.com", password: "Password123" });
  driverToken = driverLogin.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

const auth = (req) => req.set("Authorization", `Bearer ${driverToken}`);

describe("Driver earnings & rates (live from Bookings)", () => {
  it("GET /api/drivers/dashboard — today is today, not the total", async () => {
    const res = await auth(request(app).get("/api/drivers/dashboard"));

    expect(res.status).toBe(200);
    const s = res.body.data.statistics;
    expect(s.todayEarnings).toBe(500);
    expect(s.weekEarnings).toBe(500);
    expect(s.monthEarnings).toBe(800);
    expect(s.totalTrips).toBe(3);
    expect(s.completedTrips).toBe(2);
    expect(s.cancelledTrips).toBe(1);
    expect(s.completionRate).toBeCloseTo(66.7, 1);
    expect(s.cancellationRate).toBeCloseTo(33.3, 1);
    // 3 accepted offers / 4 total offers (incl. 1 rejection)
    expect(s.acceptanceRate).toBe(75);
  });

  it("GET /api/drivers/statistics — agrees with the dashboard", async () => {
    const res = await auth(request(app).get("/api/drivers/statistics"));

    expect(res.status).toBe(200);
    const s = res.body.data;
    expect(s.todayEarnings).toBe(500);
    expect(s.weekEarnings).toBe(500);
    expect(s.monthEarnings).toBe(800);
    expect(s.completionRate).toBeCloseTo(66.7, 1);
    expect(s.acceptanceRate).toBe(75);
  });

  it("GET /api/drivers/earnings — period earnings from completed trips", async () => {
    const res = await auth(request(app).get("/api/drivers/earnings"));

    expect(res.status).toBe(200);
    const e = res.body.data.earnings;
    expect(e.today).toBe(500);
    expect(e.thisWeek).toBe(500);
    expect(e.thisMonth).toBe(800);
  });
});
