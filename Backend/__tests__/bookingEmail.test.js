import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import Booking from "../src/models/Booking.js";
import bcrypt from "bcryptjs";

let mongoServer;
let testVehicle;
let adminToken;
let customerToken;

const tripPayload = (overrides = {}) => ({
  pickup: { address: "Trichy, Tamil Nadu", latitude: 10.79, longitude: 78.7 },
  drop: { address: "Chennai, Tamil Nadu", latitude: 13.08, longitude: 80.27 },
  pickupDateTime: new Date(Date.now() + 2 * 86400000).toISOString(),
  tripType: "One Way",
  days: 1,
  vehicleType: testVehicle._id.toString(),
  paymentMethod: "Cash",
  customerNotes: "",
  ...overrides,
});

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  process.env.GOOGLE_ROUTES_MOCK_KM = "100";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

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

  const hashedPassword = await bcrypt.hash("Password123", 10);
  await User.create({
    name: "Mail Admin",
    email: "mailadmin@test.com",
    phone: "9850000001",
    password: hashedPassword,
    role: "admin",
  });
  await User.create({
    name: "Ragul Pant",
    email: "ragul.pant.real@example.com",
    phone: "9850000002",
    password: hashedPassword,
    role: "customer",
  });

  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "mailadmin@test.com", password: "Password123" });
  adminToken = adminLogin.body.accessToken;

  const custLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "ragul.pant.real@example.com", password: "Password123" });
  customerToken = custLogin.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
});

describe("Authenticated bookings never carry guest contact", () => {
  it("drops smuggled guest fields on POST /bookings and keeps the account email", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${customerToken}`)
      .send(
        tripPayload({
          guestName: "Intruder",
          guestEmail: "intruder@evil.example.com",
          guestPhone: "9111111111",
        })
      );

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const stored = await Booking.findById(res.body.booking._id).lean();
    expect(stored.guestName).toBeNull();
    expect(stored.guestEmail).toBeNull();
    expect(stored.guestPhone).toBeNull();

    // Admin surfaces the real account email, never a guest address.
    const listed = await request(app)
      .get("/api/admin/bookings?scope=registered")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(listed.status).toBe(200);
    const shown = listed.body.bookings.find(
      (b) => b._id.toString() === res.body.booking._id.toString()
    );
    expect(shown.customer.email).toBe("ragul.pant.real@example.com");
  });

  it("stores a normal logged-in booking with no guest snapshot at all", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${customerToken}`)
      .send(tripPayload());

    expect(res.status).toBe(201);
    const stored = await Booking.findById(res.body.booking._id).lean();
    expect(stored.guestName).toBeNull();
    expect(stored.guestEmail).toBeNull();
    expect(stored.guestPhone).toBeNull();
  });

  it("still snapshots guest contact for genuinely unauthenticated bookings", async () => {
    const res = await request(app)
      .post("/api/bookings/guest")
      .send({
        ...tripPayload(),
        guestName: "Guest User",
        guestEmail: "guest.user@example.com",
        guestPhone: "9840000003",
      });

    expect(res.status).toBe(201);
    const stored = await Booking.findById(res.body.booking._id).lean();
    expect(stored.guestEmail).toBe("guest.user@example.com");
    expect(stored.guestPhone).toBe("9840000003");
  });
});
