import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import DriverProfile from "../src/models/DriverProfile.js";
import Booking from "../src/models/Booking.js";
import bcrypt from "bcryptjs";
import {
  dispatchBooking,
  findEligibleDrivers,
  acceptBooking,
} from "../src/services/dispatch.service.js";

let mongoServer;
let sedanVehicle;
let suvVehicle;
let innovaVehicle;
let sedanDriver;
let suvDriver;
let innovaDriver;
let farSedanDriver;
let pendingSedanDriver;
let rejectedSedanDriver;
let pendingSedanUser;
let rejectedSedanUser;
let sedanUser;
let customerRef;
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
  customerRef = customer;
  sedanUser = await mkUser("Sedan Driver", "sedandriver@test.com", "9876543241", "driver");
  const suvUser = await mkUser("Suv Driver", "suvdriver@test.com", "9876543242", "driver");
  const innovaUser = await mkUser("Innova Driver", "innovadriver@test.com", "9876543243", "driver");
  const farSedanUser = await mkUser("Far Sedan Driver", "farsedan@test.com", "9876543244", "driver");
  pendingSedanUser = await mkUser("Pending Sedan", "pendingsedan@test.com", "9876543245", "driver");
  rejectedSedanUser = await mkUser("Rejected Sedan", "rejectedsedan@test.com", "9876543246", "driver");

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

  const mkProfile = (user, vehicle, aadhaar, license, number, location, approval = "Approved") =>
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
      approvalStatus: approval,
      isOnline: true,
      isAvailable: true,
      currentLocation: location || point(80.2, 13.0),
    });
  sedanDriver = await mkProfile(sedanUser, sedanVehicle, "111111111111", "DL1111111111", "KA01AA1111");
  suvDriver = await mkProfile(suvUser, suvVehicle, "222222222222", "DL2222222222", "KA01AA2222");
  innovaDriver = await mkProfile(innovaUser, innovaVehicle, "333333333333", "DL3333333333", "KA01AA3333");
  // Same cab type but ~1500 km away (and one with no GPS fix at all):
  // distance must NOT exclude them.
  farSedanDriver = await mkProfile(farSedanUser, sedanVehicle, "444444444444", "DL4444444444", "KA01AA4444", point(77.2, 28.6));
  pendingSedanDriver = await mkProfile(pendingSedanUser, sedanVehicle, "555555555555", "DL5555555555", "KA01AA5555", undefined, "Pending");
  rejectedSedanDriver = await mkProfile(rejectedSedanUser, sedanVehicle, "666666666666", "DL6666666666", "KA01AA6666", undefined, "Rejected");

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
  it("findEligibleDrivers returns only matching-type drivers", async () => {
    const drivers = await findEligibleDrivers(sedanVehicle._id);
    const ids = drivers.map((d) => String(d._id));
    expect(ids).toContain(String(sedanDriver._id));
    expect(ids).not.toContain(String(suvDriver._id));
    expect(ids).not.toContain(String(innovaDriver._id));
  });

  it("distance does not exclude: far-away same-type driver is included", async () => {
    const drivers = await findEligibleDrivers(sedanVehicle._id);
    const ids = drivers.map((d) => String(d._id));
    expect(ids).toContain(String(farSedanDriver._id));
  });

  it("dispatchBooking queues only the sedan drivers for a sedan booking", async () => {
    const result = await dispatchBooking(sedanBooking._id, 13.0, 80.2);
    expect(result.success).toBe(true);
    const queued = result.booking.driverQueue.map(String);
    expect(queued).toContain(String(sedanDriver._id));
    expect(queued).toContain(String(farSedanDriver._id));
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

  it("approval gates eligibility: pending and rejected are excluded", async () => {
    const drivers = await findEligibleDrivers(sedanVehicle._id);
    const ids = drivers.map((d) => String(d._id));
    expect(ids).not.toContain(String(pendingSedanDriver._id));
    expect(ids).not.toContain(String(rejectedSedanDriver._id));
  });

  it("only verified drivers can accept; pending and rejected cannot", async () => {
    const mkSedanBooking = () =>
      Booking.create({
        customer: customerRef._id,
        pickup: loc("Pickup"),
        drop: loc("Drop"),
        pickupDateTime: new Date(),
        vehicleType: sedanVehicle._id,
        bookingStatus: "Pending",
      });

    // Approved control: accepts fine.
    const b0 = await mkSedanBooking();
    const accepted = await acceptBooking(b0._id, sedanUser._id);
    expect(accepted.booking.bookingStatus).toBe("Accepted");

    const b1 = await mkSedanBooking();
    await expect(acceptBooking(b1._id, pendingSedanUser._id)).rejects.toThrow(/not approved/i);

    const b2 = await mkSedanBooking();
    await expect(acceptBooking(b2._id, rejectedSedanUser._id)).rejects.toThrow(/not approved|rejected/i);
  });
});
