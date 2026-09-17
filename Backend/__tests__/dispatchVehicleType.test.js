import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import DriverProfile from "../src/models/DriverProfile.js";
import Booking from "../src/models/Booking.js";
import bcrypt from "bcryptjs";
import {
  dispatchBooking,
  findNearbyDrivers,
} from "../src/services/dispatch.service.js";

let mongoServer;
let sedanVehicle;
let suvVehicle;
let innovaVehicle;
let sedanDriver;
let suvDriver;
let innovaDriver;
let sedanBooking;
let innovaBooking;

const point = (lng, lat) => ({ type: "Point", coordinates: [lng, lat] });
const loc = (address) => ({ address, latitude: 13.0, longitude: 80.2 });

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  // $near requires the 2dsphere index — build it explicitly (autoIndex
  // can lag on ephemeral test databases).
  await DriverProfile.syncIndexes();

  const hashedPassword = await bcrypt.hash("Password123", 10);
  const mkUser = (name, email, phone, role) =>
    User.create({ name, email, phone, password: hashedPassword, role });

  const customer = await mkUser("Dispatch Cust", "dispatchcust@test.com", "9876543240", "customer");
  const sedanUser = await mkUser("Sedan Driver", "sedandriver@test.com", "9876543241", "driver");
  const suvUser = await mkUser("Suv Driver", "suvdriver@test.com", "9876543242", "driver");
  const innovaUser = await mkUser("Innova Driver", "innovadriver@test.com", "9876543243", "driver");

  const mkVehicle = (name) =>
    Vehicle.create({
      name,
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
  sedanVehicle = await mkVehicle("Sedan");
  suvVehicle = await mkVehicle("SUV");
  innovaVehicle = await mkVehicle("Innova");

  const mkProfile = (user, vehicle, aadhaar, license, number) =>
    DriverProfile.create({
      user: user._id,
      aadhaarNumber: aadhaar,
      licenseNumber: license,
      vehicleType: vehicle._id,
      vehicleBrand: "Test",
      vehicleModel: "Model",
      vehicleColor: "White",
      vehicleYear: 2022,
      vehicleNumber: number,
      approvalStatus: "Approved",
      isOnline: true,
      isAvailable: true,
      currentLocation: point(80.2, 13.0),
    });
  sedanDriver = await mkProfile(sedanUser, sedanVehicle, "111111111111", "DL1111111111", "KA01AA1111");
  suvDriver = await mkProfile(suvUser, suvVehicle, "222222222222", "DL2222222222", "KA01AA2222");
  innovaDriver = await mkProfile(innovaUser, innovaVehicle, "333333333333", "DL3333333333", "KA01AA3333");

  sedanBooking = await Booking.create({
    customer: customer._id,
    pickup: loc("Pickup"),
    drop: loc("Drop"),
    pickupDateTime: new Date(),
    vehicleType: sedanVehicle._id,
    bookingStatus: "Pending",
  });

  innovaBooking = await Booking.create({
    customer: customer._id,
    pickup: loc("Pickup"),
    drop: loc("Drop"),
    pickupDateTime: new Date(),
    vehicleType: innovaVehicle._id,
    bookingStatus: "Pending",
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Dispatch vehicle-type targeting", () => {
  it("findNearbyDrivers returns only matching-type drivers", async () => {
    const drivers = await findNearbyDrivers(13.0, 80.2, 5000, sedanVehicle._id);
    const ids = drivers.map((d) => String(d._id));
    expect(ids).toContain(String(sedanDriver._id));
    expect(ids).not.toContain(String(suvDriver._id));
    expect(ids).not.toContain(String(innovaDriver._id));
  });

  it("dispatchBooking queues only the sedan driver for a sedan booking", async () => {
    const result = await dispatchBooking(sedanBooking._id, 13.0, 80.2);
    expect(result.success).toBe(true);
    const queued = result.booking.driverQueue.map(String);
    expect(queued).toContain(String(sedanDriver._id));
    expect(queued).not.toContain(String(suvDriver._id));
    expect(queued).not.toContain(String(innovaDriver._id));
  });

  it("dispatchBooking queues only the innova driver for an innova booking", async () => {
    const result = await dispatchBooking(innovaBooking._id, 13.0, 80.2);
    expect(result.success).toBe(true);
    const queued = result.booking.driverQueue.map(String);
    expect(queued).toContain(String(innovaDriver._id));
    expect(queued).not.toContain(String(sedanDriver._id));
    expect(queued).not.toContain(String(suvDriver._id));
  });
});
