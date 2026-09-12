import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import DriverProfile from "../src/models/DriverProfile.js";
import Booking from "../src/models/Booking.js";
import {
  findNearbyDrivers,
  acceptBooking,
} from "../src/services/dispatch.service.js";
import { assignDriver } from "../src/services/admin.service.js";
import { getAvailableBookings } from "../src/services/booking.service.js";

let mongoServer;
let suvVehicle;
let sedanVehicle;
let suvDriverUser;
let sedanDriverUser;
let customer;
let suvBooking;
let sedanBooking;

const point = { address: "Test Point", latitude: 13.08, longitude: 80.27 };

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET =
    "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  suvVehicle = await Vehicle.create({
    name: "SUV",
    seats: 6,
    oneWayBaseFare: 200,
    roundTripBaseFare: 200,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 18,
    roundTripPerKm: 18,
    minimumDistance: 1,
    isActive: true,
  });

  sedanVehicle = await Vehicle.create({
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

  customer = await User.create({
    name: "Filter Customer",
    email: "filtercust@test.com",
    phone: "9876543290",
    password: "Password123",
    role: "customer",
  });

  suvDriverUser = await User.create({
    name: "SUV Driver",
    email: "suvdriver@test.com",
    phone: "9876543291",
    password: "Password123",
    role: "driver",
  });

  sedanDriverUser = await User.create({
    name: "Sedan Driver",
    email: "sedandriver@test.com",
    phone: "9876543292",
    password: "Password123",
    role: "driver",
  });

  const baseProfile = {
    vehicleBrand: "Test",
    vehicleModel: "Model",
    vehicleColor: "White",
    vehicleYear: 2022,
    approvalStatus: "Approved",
    isOnline: true,
    isAvailable: true,
    currentLocation: { type: "Point", coordinates: [80.27, 13.08] },
  };

  await DriverProfile.create({
    ...baseProfile,
    user: suvDriverUser._id,
    aadhaarNumber: "111111111111",
    licenseNumber: "SUVDL0000001",
    vehicleType: suvVehicle._id,
    vehicleNumber: "TN01SV0001",
  });

  await DriverProfile.create({
    ...baseProfile,
    user: sedanDriverUser._id,
    aadhaarNumber: "222222222222",
    licenseNumber: "SEDDL0000001",
    vehicleType: sedanVehicle._id,
    vehicleNumber: "TN01SD0001",
  });

  // Geo queries need the 2dsphere index to exist before running.
  await DriverProfile.syncIndexes();

  suvBooking = await Booking.create({
    customer: customer._id,
    pickup: point,
    drop: point,
    pickupDateTime: new Date(Date.now() + 86400000),
    vehicleType: suvVehicle._id,
    bookingStatus: "Pending",
  });

  sedanBooking = await Booking.create({
    customer: customer._id,
    pickup: point,
    drop: point,
    pickupDateTime: new Date(Date.now() + 86400000),
    vehicleType: sedanVehicle._id,
    bookingStatus: "Pending",
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Vehicle-type dispatch filtering", () => {
  it("findNearbyDrivers returns only drivers of the requested cab type", async () => {
    const suvDrivers = await findNearbyDrivers(
      13.08,
      80.27,
      5000,
      suvVehicle._id
    );
    expect(suvDrivers.length).toBe(1);
    expect(suvDrivers[0].vehicleType._id.toString()).toBe(
      suvVehicle._id.toString()
    );

    const sedanDrivers = await findNearbyDrivers(
      13.08,
      80.27,
      5000,
      sedanVehicle._id
    );
    expect(sedanDrivers.length).toBe(1);
    expect(sedanDrivers[0].vehicleType._id.toString()).toBe(
      sedanVehicle._id.toString()
    );
  });

  it("acceptBooking rejects a cross-type accept", async () => {
    await expect(
      acceptBooking(suvBooking._id, sedanDriverUser._id)
    ).rejects.toThrow(/requires a SUV vehicle/);
  });

  it("assignDriver rejects a cross-type admin assignment", async () => {
    const sedanProfile = await DriverProfile.findOne({
      user: sedanDriverUser._id,
    });

    await expect(
      assignDriver(suvBooking._id, sedanProfile._id)
    ).rejects.toThrow(/requires a SUV vehicle/);
  });

  it("getAvailableBookings shows a driver only their own cab type", async () => {
    const forSedan = await getAvailableBookings({
      driverUserId: sedanDriverUser._id,
    });

    expect(
      forSedan.bookings.every(
        (b) =>
          (b.vehicleType._id || b.vehicleType).toString() ===
          sedanVehicle._id.toString()
      )
    ).toBe(true);
    expect(
      forSedan.bookings.some(
        (b) =>
          (b.vehicleType._id || b.vehicleType).toString() ===
          suvVehicle._id.toString()
      )
    ).toBe(false);
  });
});
