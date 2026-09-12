import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import DriverProfile from "../src/models/DriverProfile.js";
import Booking from "../src/models/Booking.js";
import DriverWallet from "../src/models/DriverWallet.js";
import WalletTransaction from "../src/models/WalletTransaction.js";
import { completeRide } from "../src/services/booking.service.js";
import { creditWallet } from "../src/services/wallet.service.js";
import bcrypt from "bcryptjs";

let mongoServer;
let customerA, customerB, driverUser, driver, vehicle;

const login = async (email) => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "Password123" });
  return res.body.accessToken;
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashed = await bcrypt.hash("Password123", 10);
  customerA = await User.create({
    name: "Customer A",
    email: "a@test.com",
    phone: "9876543210",
    password: hashed,
    role: "customer",
  });
  customerB = await User.create({
    name: "Customer B",
    email: "b@test.com",
    phone: "9876543211",
    password: hashed,
    role: "customer",
  });
  driverUser = await User.create({
    name: "Driver",
    email: "d@test.com",
    phone: "9876543212",
    password: hashed,
    role: "driver",
  });
  vehicle = await Vehicle.create({
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
  driver = await DriverProfile.create({
    user: driverUser._id,
    aadhaarNumber: "123456789021",
    licenseNumber: "DL1234567821",
    vehicleType: vehicle._id,
    vehicleBrand: "Maruti",
    vehicleModel: "Dzire",
    vehicleColor: "White",
    vehicleYear: 2022,
    vehicleNumber: "TN01AB1299",
    approvalStatus: "Approved",
    isOnline: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await DriverWallet.deleteMany({});
  await WalletTransaction.deleteMany({});
});

describe("IDOR protection", () => {
  it("prevents customer B from reading customer A's booking", async () => {
    const booking = await Booking.create({
      customer: customerA._id,
      driver: driver._id,
      pickup: { address: "A", latitude: 13, longitude: 80 },
      drop: { address: "B", latitude: 14, longitude: 81 },
      pickupDateTime: new Date(Date.now() + 86400000),
      tripType: "One Way",
      days: 1,
      vehicleType: vehicle._id,
      paymentMethod: "Cash",
      bookingStatus: "Completed",
      estimatedFare: 500,
    });

    const tokenB = await login("b@test.com");
    const res = await request(app)
      .get(`/api/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });

  it("prevents customer B from reading customer A's invoice", async () => {
    const booking = await Booking.create({
      customer: customerA._id,
      driver: driver._id,
      pickup: { address: "A", latitude: 13, longitude: 80 },
      drop: { address: "B", latitude: 14, longitude: 81 },
      pickupDateTime: new Date(Date.now() + 86400000),
      tripType: "One Way",
      days: 1,
      vehicleType: vehicle._id,
      paymentMethod: "Cash",
      bookingStatus: "Completed",
      estimatedFare: 500,
    });

    const tokenB = await login("b@test.com");
    const res = await request(app)
      .get(`/api/invoice/${booking._id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });
});

describe("Route validation", () => {
  it("rejects an invalid MongoDB id param with 400", async () => {
    const tokenA = await login("a@test.com");
    const res = await request(app)
      .get("/api/bookings/not-a-valid-id")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(400);
  });

  it("rejects an invalid :type param on driver upload", async () => {
    const tokenD = await login("d@test.com");
    const res = await request(app)
      .post("/api/driver-uploads/badtype")
      .set("Authorization", `Bearer ${tokenD}`);
    expect(res.status).toBe(400);
  });
});

describe("Duplicate completion / wallet credit", () => {
  it("does not credit the driver wallet twice on sequential double completion", async () => {
    const booking = await Booking.create({
      customer: customerA._id,
      driver: driver._id,
      pickup: { address: "A", latitude: 13, longitude: 80 },
      drop: { address: "B", latitude: 14, longitude: 81 },
      pickupDateTime: new Date(Date.now() + 86400000),
      tripType: "One Way",
      days: 1,
      vehicleType: vehicle._id,
      paymentMethod: "Cash",
      bookingStatus: "Started",
      estimatedFare: 1000,
    });

    await completeRide(booking._id.toString(), driverUser._id.toString());
    await expect(
      completeRide(booking._id.toString(), driverUser._id.toString())
    ).rejects.toThrow();

    const wallet = await DriverWallet.findOne({ driver: driver._id });
    expect(wallet.balance).toBe(1000);

    const txCount = await WalletTransaction.countDocuments({
      driver: driver._id,
      referenceId: booking._id.toString(),
    });
    expect(txCount).toBe(1);
  });

  it("does not double-credit on concurrent duplicate completion", async () => {
    const booking = await Booking.create({
      customer: customerA._id,
      driver: driver._id,
      pickup: { address: "A", latitude: 13, longitude: 80 },
      drop: { address: "B", latitude: 14, longitude: 81 },
      pickupDateTime: new Date(Date.now() + 86400000),
      tripType: "One Way",
      days: 1,
      vehicleType: vehicle._id,
      paymentMethod: "Cash",
      bookingStatus: "Started",
      estimatedFare: 1000,
    });

    const id = booking._id.toString();
    const did = driverUser._id.toString();

    // Fire both completions concurrently — exactly one must succeed
    const [result1, result2] = await Promise.allSettled([
      completeRide(id, did),
      completeRide(id, did),
    ]);

    const succeeded = [result1, result2].filter((r) => r.status === "fulfilled");
    expect(succeeded.length).toBe(1);

    const wallet = await DriverWallet.findOne({ driver: driver._id });
    expect(wallet.balance).toBe(1000);

    const txCount = await WalletTransaction.countDocuments({
      driver: driver._id,
      referenceId: booking._id.toString(),
    });
    expect(txCount).toBe(1);
  });

  it("rolls back the duplicate creditWallet and keeps the balance unchanged", async () => {
    const bookingRef = new mongoose.Types.ObjectId();
    await creditWallet(driver._id, 500, bookingRef);
    await creditWallet(driver._id, 500, bookingRef);

    const wallet = await DriverWallet.findOne({ driver: driver._id });
    expect(wallet.balance).toBe(500);

    const txCount = await WalletTransaction.countDocuments({
      driver: driver._id,
      referenceId: bookingRef.toString(),
    });
    expect(txCount).toBe(1);
  });

  it("credits multiple different bookings independently", async () => {
    const ref1 = new mongoose.Types.ObjectId();
    const ref2 = new mongoose.Types.ObjectId();

    await creditWallet(driver._id, 300, ref1);
    await creditWallet(driver._id, 700, ref2);

    const wallet = await DriverWallet.findOne({ driver: driver._id });
    expect(wallet.balance).toBe(1000);
    expect(wallet.lifetimeEarnings).toBe(1000);
  });
});
