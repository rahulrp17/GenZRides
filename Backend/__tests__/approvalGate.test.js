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
let adminToken;
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

  await User.create({
    name: "Gate Admin",
    email: "gateadmin@test.com",
    phone: "9820000001",
    password: hashedPassword,
    role: "admin",
  });

  await User.create({
    name: "Gate Customer",
    email: "gatecust@test.com",
    phone: "9820000002",
    password: hashedPassword,
    role: "customer",
  });

  const driverUser = await User.create({
    name: "Gate Driver",
    email: "gatedriver@test.com",
    phone: "9820000003",
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
    aadhaarNumber: "982000000011",
    licenseNumber: "GTDL00000001",
    vehicleType: testVehicle._id,
    vehicleBrand: "Maruti",
    vehicleModel: "Dzire",
    vehicleColor: "White",
    vehicleYear: 2022,
    vehicleNumber: "TN98GT0001",
    approvalStatus: "Approved",
    isOnline: true,
    isAvailable: true,
    currentLocation: { type: "Point", coordinates: [80.27, 13.08] },
  });

  const login = async (email) => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "Password123" });
    return res.body.accessToken;
  };
  adminToken = await login("gateadmin@test.com");
  customerToken = await login("gatecust@test.com");
  driverToken = await login("gatedriver@test.com");
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
});

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe("registered booking approval gate", () => {
  it("holds registered bookings at Pending Approval, hidden from drivers", async () => {
    const created = await request(app)
      .post("/api/bookings")
      .set(auth(customerToken))
      .send(tripPayload());
    expect(created.status).toBe(201);
    const id = created.body.booking._id;

    const stored = await Booking.findById(id).lean();
    expect(stored.approvalStatus).toBe("Pending Approval");
    expect(stored.driver || null).toBeNull();

    // Driver cannot accept an unapproved booking.
    const accept = await request(app)
      .patch(`/api/bookings/${id}/accept`)
      .set(auth(driverToken));
    expect(accept.status).toBe(400);

    // …and it never appears in the driver feed.
    const feed = await request(app)
      .get("/api/bookings/available?scope=customer")
      .set(auth(driverToken));
    expect(feed.status).toBe(200);
    expect(
      (feed.body.bookings || []).some((b) => String(b._id) === String(id))
    ).toBe(false);
  });

  it("releases the booking to drivers once an admin approves", async () => {
    const created = await request(app)
      .post("/api/bookings")
      .set(auth(customerToken))
      .send(tripPayload());
    const id = created.body.booking._id;

    const approved = await request(app)
      .patch(`/api/admin/bookings/${id}/approve`)
      .set(auth(adminToken));
    expect(approved.status).toBe(200);

    const stored = await Booking.findById(id).lean();
    expect(stored.approvalStatus).toBe("Approved");

    const accept = await request(app)
      .patch(`/api/bookings/${id}/accept`)
      .set(auth(driverToken));
    expect(accept.status).toBe(200);
  });
});
