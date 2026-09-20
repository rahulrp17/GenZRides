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

const guestPayload = (overrides = {}) => ({
  pickup: { address: "Trichy, Tamil Nadu", latitude: 10.79, longitude: 78.7 },
  drop: { address: "Chennai, Tamil Nadu", latitude: 13.08, longitude: 80.27 },
  pickupDateTime: new Date(Date.now() + 2 * 86400000).toISOString(),
  tripType: "One Way",
  days: 1,
  vehicleType: testVehicle._id.toString(),
  paymentMethod: "Cash",
  customerNotes: "",
  guestName: "Kavin M",
  guestEmail: "kavin@example.com",
  guestPhone: "9876543200",
  ...overrides,
});

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  // Offline route stub so guest bookings run end-to-end without network.
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

  const adminHash = await bcrypt.hash("AdminPass123!", 10);
  await User.create({
    name: "Admin",
    email: "admin@test.com",
    phone: "9876500000",
    password: adminHash,
    role: "admin",
  });

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "AdminPass123!" });
  adminToken = login.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
  await User.deleteMany({ email: /@guest\.letsgocab\.local$/ });
  await User.deleteMany({ email: "kavin@example.com", role: "customer" });
});

describe("Guest repeat bookings & admin separation", () => {
  it("lets the same guest book twice — placeholder account, real email snapshotted, no errors", async () => {
    const first = await request(app).post("/api/bookings/guest").send(guestPayload());
    expect(first.status).toBe(201);
    expect(first.body.success).toBe(true);
    expect(first.body.duplicate).toBeFalsy();
    expect(first.body.booking.guestEmail).toBe("kavin@example.com");

    // Same guest, different trip — must succeed again (no "already exists").
    const second = await request(app)
      .post("/api/bookings/guest")
      .send(guestPayload({ drop: { address: "Coimbatore, Tamil Nadu", latitude: 11.01, longitude: 76.96 } }));
    expect(second.status).toBe(201);
    expect(second.body.success).toBe(true);
    expect(second.body.booking.guestEmail).toBe("kavin@example.com");

    // Only ONE placeholder account was provisioned, and it never claims the
    // guest's real email — the real address lives on the booking snapshot.
    const guestUsers = await User.find({ phone: "9876543200", role: "customer" });
    expect(guestUsers).toHaveLength(1);
    expect(guestUsers[0].email).toMatch(/^guest-9876543200@guest\.letsgocab\.local$/);

    const bookings = await Booking.find({ guestName: { $ne: null } });
    expect(bookings).toHaveLength(2);
  });

  it("upgrades a guest placeholder when the same phone registers (no already-exists error)", async () => {
    await request(app).post("/api/bookings/guest").send(guestPayload());
    expect(await User.countDocuments({ email: /@guest\.letsgocab\.local$/ })).toBe(1);

    const res = await request(app).post("/api/auth/register").send({
      name: "Kavin Murugan",
      email: "kavin@example.com",
      phone: "9876543200",
      password: "StrongPass123!",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).not.toMatch(/already exists/i);

    const upgraded = await User.findOne({ phone: "9876543200", role: "customer" });
    expect(upgraded.email).toBe("kavin@example.com");
    expect(upgraded.email).not.toMatch(/guest\.letsgocab\.local/);
    // Placeholder count back to zero — the account became a real member.
    expect(await User.countDocuments({ email: /@guest\.letsgocab\.local$/ })).toBe(0);
  });

  it("keeps guest accounts out of Manage Customers but surfaces them as Instant Bookers", async () => {
    await request(app).post("/api/bookings/guest").send(guestPayload());

    // Customers list excludes the guest placeholder; real registered customers
    // still appear (re-seed one below to prove the filter is not a blanket hide).
    const registered = await User.create({
      name: "Arun",
      email: "arun@example.com",
      phone: "9876543215",
      password: "$2b$10$abcdefghijklmnopqrstuv",
      role: "customer",
    });

    const customers = await request(app)
      .get("/api/admin/customers")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(customers.status).toBe(200);
    const emails = customers.body.customers.map((c) => c.email);
    expect(emails).not.toContain("guest-9876543200@guest.letsgocab.local");
    expect(emails).toContain("arun@example.com");
    await User.deleteOne({ _id: registered._id });

    const dash = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(dash.status).toBe(200);
    const stats = dash.body.stats;
    expect(stats.instantBookers).toHaveLength(1);
    expect(stats.instantBookers[0].guestName).toBe("Kavin M");
    expect(stats.instantBookers[0].guestEmail).toBe("kavin@example.com");
    expect(stats.instantBookers[0].guestPhone).toBe("9876543200");
    expect(stats.instantBookers[0].vehicleType.name).toBe("Sedan");
    expect(stats.instantBookersCount).toBe(1);
    // Guests are NOT counted as platform customers.
    expect(stats.totalCustomers).toBe(0);
  });
});

describe("Guest booking self-service (lookup + cancel via backend)", () => {
  async function createGuestBooking(payload = {}) {
    const res = await request(app)
      .post("/api/bookings/guest")
      .send(guestPayload(payload));
    expect(res.status).toBe(201);
    return res.body.booking;
  }

  it("looks up a guest booking by ref + phone and returns sanitized details", async () => {
    const booking = await createGuestBooking();

    const res = await request(app)
      .post("/api/bookings/guest/lookup")
      .send({ ref: String(booking._id).slice(-8).toUpperCase(), phone: "9876543200" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking._id).toBe(booking._id.toString());
    expect(res.body.booking.ref).toBe(String(booking._id).slice(-8).toUpperCase());
    expect(res.body.booking.guestName).toBe("Kavin M");
    expect(res.body.booking.guestPhone).toBe("9876543200");
    expect(res.body.booking.bookingStatus).toBe("Pending");
    expect(res.body.booking.vehicleType).toBe("Sedan");
    expect(res.body.booking.pickup.address).toContain("Trichy");
    expect(res.body.booking.drop.address).toContain("Chennai");
  });

  it("rejects lookup when the phone does not match the booking ref", async () => {
    const booking = await createGuestBooking();

    const res = await request(app)
      .post("/api/bookings/guest/lookup")
      .send({ ref: String(booking._id).slice(-8).toUpperCase(), phone: "9123456780" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/don't match/i);
  });

  it("cancels a guest booking with the correct phone (backend is source of truth)", async () => {
    const booking = await createGuestBooking();

    const res = await request(app)
      .patch(`/api/bookings/guest/${booking._id}/cancel`)
      .send({ phone: "9876543200", cancelReason: "Changed plans" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingStatus).toBe("Cancelled");
    expect(res.body.booking.cancelledBy).toBe("Customer");

    const inDb = await Booking.findById(booking._id);
    expect(inDb.bookingStatus).toBe("Cancelled");
    expect(inDb.cancelReason).toBe("Changed plans");
  });

  it("refuses guest cancel with a wrong phone and cannot cancel twice", async () => {
    const booking = await createGuestBooking();

    const wrongPhone = await request(app)
      .patch(`/api/bookings/guest/${booking._id}/cancel`)
      .send({ phone: "9123456780" });
    expect(wrongPhone.status).toBe(400);

    const ok = await request(app)
      .patch(`/api/bookings/guest/${booking._id}/cancel`)
      .send({ phone: "9876543200" });
    expect(ok.status).toBe(200);

    const again = await request(app)
      .patch(`/api/bookings/guest/${booking._id}/cancel`)
      .send({ phone: "9876543200" });
    expect(again.status).toBe(400);
    expect(again.body.message).toMatch(/already cancelled/i);
  });
});