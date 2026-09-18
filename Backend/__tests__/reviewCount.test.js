import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import DriverProfile from "../src/models/DriverProfile.js";
import Booking from "../src/models/Booking.js";
import { createReview } from "../src/services/review.service.js";

let mongoServer;
let customer;
let driverProfile;
let vehicle;
const bookings = [];

const loc = (address) => ({ address, latitude: 13.0, longitude: 80.2 });

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  customer = await User.create({
    name: "Review Cust",
    email: "reviewcust@test.com",
    phone: "9876543310",
    password: "Password123",
    role: "customer",
  });
  const driverUser = await User.create({
    name: "Review Driver",
    email: "reviewdriver@test.com",
    phone: "9876543311",
    password: "Password123",
    role: "driver",
  });
  vehicle = await Vehicle.create({
    name: "Review Sedan",
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
  driverProfile = await DriverProfile.create({
    user: driverUser._id,
    aadhaarNumber: "777777777777",
    licenseNumber: "DLREV0000001",
    vehicleType: vehicle._id,
    vehicleBrand: "Test",
    vehicleModel: "Model",
    vehicleColor: "White",
    vehicleYear: 2022,
    vehicleNumber: "KA01RV0001",
    approvalStatus: "Approved",
    isOnline: true,
    isAvailable: true,
  });

  for (let i = 0; i < 2; i++) {
    bookings.push(
      await Booking.create({
        customer: customer._id,
        driver: driverProfile._id,
        pickup: loc("Pickup"),
        drop: loc("Drop"),
        pickupDateTime: new Date(),
        vehicleType: vehicle._id,
        bookingStatus: "Completed",
        completedAt: new Date(),
      })
    );
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("customer reviews count driver totalRatings", () => {
  it("first review sets count 1 and the given rating", async () => {
    await createReview(bookings[0]._id, customer._id, { rating: 5, review: "Great" });
    const d = await DriverProfile.findById(driverProfile._id).lean();
    expect(d.totalRatings).toBe(1);
    expect(d.rating).toBe(5);
  });

  it("booking carries the submitted rating (UI submitted-state)", async () => {
    const Booking = (await import("../src/models/Booking.js")).default;
    const b = await Booking.findById(bookings[0]._id).lean();
    expect(b.rating).toBe(5);
    expect(b.review).toBe("Great");
  });

  it("second review increments count and averages", async () => {
    await createReview(bookings[1]._id, customer._id, { rating: 3, review: "OK" });
    const d = await DriverProfile.findById(driverProfile._id).lean();
    expect(d.totalRatings).toBe(2);
    expect(d.rating).toBe(4);
  });
});
