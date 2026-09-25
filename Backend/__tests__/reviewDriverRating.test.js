import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import DriverProfile from "../src/models/DriverProfile.js";
import Booking from "../src/models/Booking.js";
import Review from "../src/models/Review.js";
import { createReview } from "../src/services/review.service.js";

let mongoServer;
let customer;
let driverProfile;
let vehicle;

const loc = (address) => ({ address, latitude: 13.0, longitude: 80.2 });

const makeBooking = () =>
  Booking.create({
    customer: customer._id,
    driver: driverProfile._id,
    pickup: loc("Pickup"),
    drop: loc("Drop"),
    pickupDateTime: new Date(),
    vehicleType: vehicle._id,
    bookingStatus: "Completed",
    completedAt: new Date(),
  });

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  customer = await User.create({
    name: "DriverRate Cust",
    email: "driverrate@test.com",
    phone: "9876543320",
    password: "Password123",
    role: "customer",
  });
  const driverUser = await User.create({
    name: "DriverRate Driver",
    email: "driverratedriver@test.com",
    phone: "9876543321",
    password: "Password123",
    role: "driver",
  });
  vehicle = await Vehicle.create({
    name: "Rate Sedan",
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
    aadhaarNumber: "888888888888",
    licenseNumber: "DLDRV0000001",
    vehicleType: vehicle._id,
    vehicleBrand: "Test",
    vehicleModel: "Model",
    vehicleColor: "White",
    vehicleYear: 2022,
    vehicleNumber: "KA01DR0001",
    approvalStatus: "Approved",
    isOnline: true,
    isAvailable: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("review driverRating", () => {
  it("stores overall + driver ratings separately", async () => {
    const booking = await makeBooking();
    const created = await createReview(booking._id, customer._id, {
      rating: 4,
      driverRating: 5,
      review: "Good trip, great driver",
    });
    expect(created.rating).toBe(4);
    expect(created.driverRating).toBe(5);

    const stored = await Review.findById(created._id).lean();
    expect(stored.rating).toBe(4);
    expect(stored.driverRating).toBe(5);

    const stamped = await Booking.findById(booking._id).lean();
    expect(stamped.rating).toBe(4);
  });

  it("scores the driver average on driverRating, not the overall rating", async () => {
    const booking = await makeBooking();
    await createReview(booking._id, customer._id, {
      rating: 2,
      driverRating: 3,
      review: "Late pickup but polite driver",
    });
    const d = await DriverProfile.findById(driverProfile._id).lean();
    expect(d.totalRatings).toBe(2);
    // (5 + 3) / 2 — driver scores, not (4 + 2) / 2
    expect(d.rating).toBe(4);
  });

  it("falls back to overall rating when driverRating is omitted", async () => {
    const booking = await makeBooking();
    const created = await createReview(booking._id, customer._id, {
      rating: 5,
      review: "Legacy-style review",
    });
    expect(created.driverRating).toBeNull();
    const d = await DriverProfile.findById(driverProfile._id).lean();
    expect(d.totalRatings).toBe(3);
    // (5 + 3 + 5) / 3
    expect(d.rating).toBeCloseTo(13 / 3, 1);
  });
});
