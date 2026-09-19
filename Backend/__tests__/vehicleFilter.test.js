import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import DriverProfile from "../src/models/DriverProfile.js";
import Booking from "../src/models/Booking.js";
import {
  findEligibleDrivers,
  acceptBooking,
  dispatchBooking,
} from "../src/services/dispatch.service.js";
import { assignDriver } from "../src/services/admin.service.js";
import { getAvailableBookings } from "../src/services/booking.service.js";

let mongoServer;
let suvVehicle;
let sedanVehicle;
let suvDriverUser;
let sedanDriverUser;
let noTypeDriverUser;
let customer;
let suvBooking;
let sedanBooking;
let danglingTypeBooking;

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

  // Booking whose vehicleType ref is dangling (the vehicle was deleted):
  // populate() resolves it to null and dispatch must NOT fan out to every
  // driver as if there were no type.
  danglingTypeBooking = await Booking.create({
    customer: customer._id,
    pickup: point,
    drop: point,
    pickupDateTime: new Date(Date.now() + 86400000),
    vehicleType: new mongoose.Types.ObjectId(),
    bookingStatus: "Pending",
  });

  // Legacy driver row with NO cab type (pre-validation data). Simulated via
  // insertOne (bypasses mongoose schema) because current schema requires it —
  // such a driver must never see every booking type in the available feed.
  noTypeDriverUser = await User.create({
    name: "No Type Driver",
    email: "notype@test.com",
    phone: "9876543293",
    password: "Password123",
    role: "driver",
  });

  await DriverProfile.collection.insertOne({
    user: noTypeDriverUser._id,
    ...baseProfile,
    aadhaarNumber: "333333333333",
    licenseNumber: "NTDL0000001",
    vehicleNumber: "TN01NT0001",
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Vehicle-type dispatch filtering", () => {
  it("findEligibleDrivers returns only drivers of the requested cab type", async () => {
    const suvDrivers = await findEligibleDrivers(suvVehicle._id);
    expect(suvDrivers.length).toBe(1);
    expect(suvDrivers[0].vehicleType._id.toString()).toBe(
      suvVehicle._id.toString()
    );

    const sedanDrivers = await findEligibleDrivers(sedanVehicle._id);
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

  it("dispatchBooking never fans out a booking with a dangling cab type", async () => {
    const result = await dispatchBooking(
      danglingTypeBooking._id,
      danglingTypeBooking.pickup.latitude,
      danglingTypeBooking.pickup.longitude
    );

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/no vehicle type/i);

    const after = await Booking.findById(danglingTypeBooking._id);
    expect(after.driverQueue.length).toBe(0);
  });

  it("getAvailableBookings shows nothing to a driver with no cab type", async () => {
    const result = await getAvailableBookings({
      driverUserId: noTypeDriverUser._id,
    });

    expect(result.total).toBe(0);
    expect(result.bookings).toEqual([]);
  });
});
