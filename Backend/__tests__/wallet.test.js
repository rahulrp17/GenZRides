import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import DriverProfile from "../src/models/DriverProfile.js";
import DriverWallet from "../src/models/DriverWallet.js";
import WalletTransaction from "../src/models/WalletTransaction.js";
import bcrypt from "bcryptjs";

let mongoServer;
let driverToken;
let testDriverProfile;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashedPassword = await bcrypt.hash("Password123", 10);

  const driverUser = await User.create({
    name: "Test Driver",
    email: "walletdriver@test.com",
    phone: "9876543220",
    password: hashedPassword,
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
  });

  testDriverProfile = await DriverProfile.create({
    user: driverUser._id,
    aadhaarNumber: "123456789013",
    licenseNumber: "DL9876543210",
    vehicleType: vehicle._id,
    vehicleBrand: "Honda",
    vehicleModel: "City",
    vehicleColor: "Black",
    vehicleYear: 2023,
    vehicleNumber: "KA01CD5678",
    approvalStatus: "Approved",
  });

  await DriverWallet.create({
    driver: testDriverProfile._id,
    balance: 5000,
    lifetimeEarnings: 5000,
    totalWithdrawn: 0,
  });

  const driverLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "walletdriver@test.com", password: "Password123" });
  driverToken = driverLogin.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Wallet Endpoints", () => {
  describe("GET /api/drivers/wallet", () => {
    it("should return wallet data", async () => {
      const res = await request(app)
        .get("/api/drivers/wallet")
        .set("Authorization", `Bearer ${driverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.wallet.balance).toBe(5000);
    });
  });

  describe("Wallet Transaction Model", () => {
    it("should create a wallet transaction", async () => {
      const wallet = await DriverWallet.findOne({ driver: testDriverProfile._id });

      const tx = await WalletTransaction.create({
        driver: testDriverProfile._id,
        wallet: wallet._id,
        type: "Ride",
        amount: 500,
        balanceBefore: 5000,
        balanceAfter: 5500,
        description: "Test ride",
        status: "Completed",
      });

      expect(tx._id).toBeDefined();
      expect(tx.amount).toBe(500);
      expect(tx.type).toBe("Ride");
    });

    it("should query transactions by driver", async () => {
      const txs = await WalletTransaction.find({ driver: testDriverProfile._id });
      expect(txs.length).toBeGreaterThan(0);
    });
  });
});
