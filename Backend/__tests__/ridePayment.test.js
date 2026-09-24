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

const tripPayload = () => ({
  pickup: { address: "Trichy, Tamil Nadu", latitude: 10.79, longitude: 78.7 },
  drop: { address: "Chennai, Tamil Nadu", latitude: 13.08, longitude: 80.27 },
  pickupDateTime: new Date(Date.now() + 2 * 86400000).toISOString(),
  tripType: "One Way",
  days: 1,
  vehicleType: testVehicle._id.toString(),
  paymentMethod: "Cash",
});

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  process.env.GOOGLE_ROUTES_MOCK_KM = "100";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashedPassword = await bcrypt.hash("Password123", 10);

  const customer = await User.create({
    name: "Pay Customer",
    email: "paycust@test.com",
    phone: "9830000001",
    password: hashedPassword,
    role: "customer",
  });

  const driverUser = await User.create({
    name: "Pay Driver",
    email: "paydriver@test.com",
    phone: "9830000002",
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
    aadhaarNumber: "983000000011",
    licenseNumber: "PYDL00000001",
    vehicleType: testVehicle._id,
    vehicleBrand: "Maruti",
    vehicleModel: "Dzire",
    vehicleColor: "White",
    vehicleYear: 2022,
    vehicleNumber: "TN98PY0001",
    approvalStatus: "Approved",
    isOnline: true,
    isAvailable: true,
    currentLocation: { type: "Point", coordinates: [80.27, 13.08] },
  });

  const custLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "paycust@test.com", password: "Password123" });
  customerToken = custLogin.body.accessToken;

  const driverLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "paydriver@test.com", password: "Password123" });
  driverToken = driverLogin.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
  await DriverProfile.updateMany(
    {},
    { $set: { currentRide: null, isOnline: true, isAvailable: true } }
  );
});

const authCust = (req) => req.set("Authorization", `Bearer ${customerToken}`);
const authDriver = (req) => req.set("Authorization", `Bearer ${driverToken}`);

// Drives one booking from creation to Reached and returns its id.
async function rideToReached() {
  const created = await authCust(request(app).post("/api/bookings")).send(
    tripPayload()
  );
  expect(created.status).toBe(201);
  const id = created.body.booking._id;

  // Direct accept works with or without a dispatch queue, so no manual
  // dispatch is needed regardless of auto-dispatch timing.
  for (const step of ["accept", "reached", "arrived", "start", "reach-destination"]) {
    const res = await authDriver(request(app).patch(`/api/bookings/${id}/${step}`));
    expect(res.status).toBe(200);
  }
  return id;
}

describe("Driver cash-collection payment input", () => {
  it("rejects missing, zero, negative amounts and the legacy Paid/Unpaid body", async () => {
    const id = await rideToReached();

    for (const body of [{}, { amount: 0 }, { amount: -50 }, { paymentStatus: "Paid" }]) {
      const res = await authDriver(
        request(app).patch(`/api/bookings/${id}/payment`).send(body)
      );
      expect(res.status).toBe(400);
    }
  });

  it("rejects payment before the destination is reached", async () => {
    const created = await authCust(request(app).post("/api/bookings")).send(
      tripPayload()
    );
    const id = created.body.booking._id;
    await authDriver(request(app).patch(`/api/bookings/${id}/accept`)).expect(200);

    const res = await authDriver(
      request(app).patch(`/api/bookings/${id}/payment`).send({ amount: 500 })
    );
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/destination/i);
  });

  it("records the collected cash and completes the ride on that total", async () => {
    const id = await rideToReached();
    const before = await Booking.findById(id).lean();
    expect(before.estimatedFare).toBeGreaterThan(0);

    const paid = await authDriver(
      request(app).patch(`/api/bookings/${id}/payment`).send({ amount: 5500 })
    );
    expect(paid.status).toBe(200);
    expect(paid.body.success).toBe(true);

    const stored = await Booking.findById(id).lean();
    expect(stored.collectedAmount).toBe(5500);
    expect(stored.paymentStatus).toBe("Paid");

    const done = await authDriver(
      request(app).patch(`/api/bookings/${id}/complete`)
    );
    expect(done.status).toBe(200);

    const finished = await Booking.findById(id).lean();
    expect(finished.bookingStatus).toBe("Completed");
    // Total fare comes from the driver's payment input, not the estimate.
    expect(finished.finalFare).toBe(5500);
  });

  it("falls back to the estimate when completing without a payment input", async () => {
    const id = await rideToReached();
    const before = await Booking.findById(id).lean();

    const done = await authDriver(
      request(app).patch(`/api/bookings/${id}/complete`)
    );
    expect(done.status).toBe(200);

    const finished = await Booking.findById(id).lean();
    expect(finished.finalFare).toBe(before.estimatedFare);
  });
});
