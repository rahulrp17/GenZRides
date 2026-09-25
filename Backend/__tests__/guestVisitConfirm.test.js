import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Vehicle from "../src/models/Vehicle.js";
import DriverProfile from "../src/models/DriverProfile.js";
import Booking from "../src/models/Booking.js";
import Visitor from "../src/models/Visitor.js";
import bcrypt from "bcryptjs";

let mongoServer;
let testVehicle;
let adminToken;
let driverToken;
let driverProfileId;

const trip = (overrides = {}) => ({
  pickup: { address: "Trichy, Tamil Nadu", latitude: 10.79, longitude: 78.7 },
  drop: { address: "Chennai, Tamil Nadu", latitude: 13.08, longitude: 80.27 },
  pickupDateTime: new Date(Date.now() + 2 * 86400000).toISOString(),
  tripType: "One Way",
  days: 1,
  vehicleType: testVehicle._id.toString(),
  customerNotes: "",
  ...overrides,
});

const guest = (phone, overrides = {}) => ({
  guestName: "Kavin M",
  guestEmail: "kavin@example.com",
  guestPhone: phone,
  ...overrides,
});

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  // Offline route stub so bookings run end-to-end without network.
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
    name: "Admin",
    email: "visitadmin@test.com",
    phone: "9876500001",
    password: hashedPassword,
    role: "admin",
  });

  const driverUser = await User.create({
    name: "Visit Driver",
    email: "visitdriver@test.com",
    phone: "9876500002",
    password: hashedPassword,
    role: "driver",
  });

  const profile = await DriverProfile.create({
    user: driverUser._id,
    aadhaarNumber: "123456789012",
    licenseNumber: "DL1234567890",
    vehicleType: testVehicle._id,
    vehicleBrand: "Maruti",
    vehicleModel: "Dzire",
    vehicleColor: "White",
    vehicleYear: 2022,
    vehicleNumber: "TN01AB1234",
    approvalStatus: "Approved",
    isOnline: true,
    isAvailable: true,
    currentLocation: { type: "Point", coordinates: [80.27, 13.08] },
  });
  driverProfileId = profile._id;

  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "visitadmin@test.com", password: "Password123" });
  adminToken = adminLogin.body.accessToken;

  const driverLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "visitdriver@test.com", password: "Password123" });
  driverToken = driverLogin.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
  await Visitor.deleteMany({});
  await User.deleteMany({ email: /@guest\.letsgocab\.local$/ });
});

const authAdmin = (req) => req.set("Authorization", `Bearer ${adminToken}`);
const authDriver = (req) => req.set("Authorization", `Bearer ${driverToken}`);

async function visitAndConfirm(phone) {
  const visit = await request(app)
    .post("/api/bookings/guest/visit")
    .send({ ...trip(), ...guest(phone) });
  expect(visit.status).toBe(201);
  const confirm = await request(app)
    .post("/api/bookings/guest/confirm")
    .send({ visitorId: visit.body.visitor._id });
  expect(confirm.status).toBe(201);
  return { visit: visit.body.visitor, booking: confirm.body.booking };
}

describe("Guest visit (Book Now holds, no booking yet)", () => {
  it("stores a temporary visitor only — no Booking, no dispatch", async () => {
    const res = await request(app)
      .post("/api/bookings/guest/visit")
      .send({ ...trip(), ...guest("9811111111") });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.visitor.status).toBe("Pending");
    expect(res.body.visitor.reference).toMatch(/^VST-/);
    expect(res.body.visitor.bookingId).toBeNull();
    expect(new Date(res.body.visitor.expiresAt).getTime()).toBeGreaterThan(Date.now());

    // No booking was created from a mere hold.
    expect(await Booking.countDocuments()).toBe(0);
    const stored = await Visitor.findById(res.body.visitor._id).lean();
    expect(stored.guestPhone).toBe("9811111111");
    expect(stored.vehicleType.toString()).toBe(testVehicle._id.toString());
  });

  it("rejects invalid guest contact with 400", async () => {
    const res = await request(app)
      .post("/api/bookings/guest/visit")
      .send({ ...trip(), ...guest("12345") });
    expect(res.status).toBe(400);
    expect(await Visitor.countDocuments()).toBe(0);
  });

  it("rejects an unknown vehicle type", async () => {
    const res = await request(app)
      .post("/api/bookings/guest/visit")
      .send({
        ...trip({ vehicleType: new mongoose.Types.ObjectId().toString() }),
        ...guest("9811111112"),
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/vehicle/i);
  });
});

describe("Guest confirm (hold converts to a pending-approval booking)", () => {
  it("creates a Pending Approval booking linked to the visit", async () => {
    const { visit, booking } = await visitAndConfirm("9822222222");

    expect(booking.approvalStatus).toBe("Pending Approval");
    expect(booking.bookingStatus).toBe("Pending");
    expect(booking.driver).toBeNull();
    expect(booking.guestPhone).toBe("9822222222");

    const stored = await Visitor.findById(visit._id).lean();
    expect(stored.status).toBe("Confirmed");
    expect(stored.bookingId.toString()).toBe(booking._id.toString());
  });

  it("is idempotent — confirming twice returns the same booking", async () => {
    const visitRes = await request(app)
      .post("/api/bookings/guest/visit")
      .send({ ...trip(), ...guest("9833333333") });
    const visitorId = visitRes.body.visitor._id;

    const first = await request(app)
      .post("/api/bookings/guest/confirm")
      .send({ visitorId });
    const second = await request(app)
      .post("/api/bookings/guest/confirm")
      .send({ visitorId });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.duplicate).toBe(true);
    expect(second.body.booking._id.toString()).toBe(
      first.body.booking._id.toString()
    );
    expect(await Booking.countDocuments()).toBe(1);
  });

  it("rejects unknown visits with 404 and expired visits with 410", async () => {
    const missing = await request(app)
      .post("/api/bookings/guest/confirm")
      .send({ visitorId: new mongoose.Types.ObjectId().toString() });
    expect(missing.status).toBe(404);

    const visitRes = await request(app)
      .post("/api/bookings/guest/visit")
      .send({ ...trip(), ...guest("9844444444") });
    const visitorId = visitRes.body.visitor._id;
    await Visitor.findByIdAndUpdate(visitorId, {
      $set: { expiresAt: new Date(Date.now() - 1000) },
    });

    const expired = await request(app)
      .post("/api/bookings/guest/confirm")
      .send({ visitorId });
    expect(expired.status).toBe(410);
    expect(await Booking.countDocuments()).toBe(0);
  });
});

describe("Approval gate (hidden until verified)", () => {
  it("hides unverified instant bookings from every driver feed scope", async () => {
    await visitAndConfirm("9855555555");

    for (const scope of [undefined, "instant", "customer"]) {
      const qs = scope ? `?scope=${scope}` : "";
      const res = await authDriver(
        request(app).get(`/api/bookings/available${qs}`)
      );
      expect(res.status).toBe(200);
      expect(res.body.bookings).toHaveLength(0);
    }
  });

  it("blocks direct driver accept and admin assign while unverified", async () => {
    const { booking } = await visitAndConfirm("9866666666");

    const accept = await authDriver(
      request(app).patch(`/api/bookings/${booking._id}/accept`)
    );
    expect(accept.status).toBe(400);
    expect(accept.body.message).toMatch(/approval/i);

    const assign = await authAdmin(
      request(app)
        .patch(`/api/admin/bookings/${booking._id}/assign-driver`)
        .send({ driverId: driverProfileId.toString() })
    );
    expect(assign.status).toBe(400);
    expect(assign.body.message).toMatch(/verify/i);
  });

  it("verify approves + reveals the booking to the instant feed (idempotent)", async () => {
    const { booking } = await visitAndConfirm("9877777777");

    const verify = await authAdmin(
      request(app).patch(`/api/admin/instant-bookings/${booking._id}/verify`)
    );
    expect(verify.status).toBe(200);
    expect(verify.body.success).toBe(true);
    expect(verify.body.booking.approvalStatus).toBe("Approved");

    const again = await authAdmin(
      request(app).patch(`/api/admin/instant-bookings/${booking._id}/verify`)
    );
    expect(again.status).toBe(200);
    expect(again.body.already).toBe(true);

    // Online Sedan driver now sees it under the instant scope only.
    const instant = await authDriver(
      request(app).get("/api/bookings/available?scope=instant")
    );
    expect(instant.body.bookings.map((b) => b._id.toString())).toContain(
      booking._id.toString()
    );
    const customer = await authDriver(
      request(app).get("/api/bookings/available?scope=customer")
    );
    expect(
      customer.body.bookings.map((b) => b._id.toString())
    ).not.toContain(booking._id.toString());
  });

  it("reject hides the booking and is idempotent", async () => {
    const { booking } = await visitAndConfirm("9888888888");

    const reject = await authAdmin(
      request(app)
        .patch(`/api/admin/instant-bookings/${booking._id}/reject`)
        .send({ reason: "Test rejection" })
    );
    expect(reject.status).toBe(200);
    expect(reject.body.booking.approvalStatus).toBe("Rejected");

    const again = await authAdmin(
      request(app)
        .patch(`/api/admin/instant-bookings/${booking._id}/reject`)
        .send({ reason: "Test rejection" })
    );
    expect(again.body.already).toBe(true);

    const feed = await authDriver(
      request(app).get("/api/bookings/available?scope=instant")
    );
    expect(
      feed.body.bookings.map((b) => b._id.toString())
    ).not.toContain(booking._id.toString());

    const accept = await authDriver(
      request(app).patch(`/api/bookings/${booking._id}/accept`)
    );
    expect(accept.status).toBe(400);
  });

  it("accept after verify works and surfaces in my-driver-bookings", async () => {
    const { booking } = await visitAndConfirm("9899999999");
    await authAdmin(
      request(app).patch(`/api/admin/instant-bookings/${booking._id}/verify`)
    );

    const accept = await authDriver(
      request(app).patch(`/api/bookings/${booking._id}/accept`)
    );
    expect(accept.status).toBe(200);

    const mine = await authDriver(
      request(app).get("/api/bookings/my-driver-bookings")
    );
    expect(mine.status).toBe(200);
    expect(mine.body.bookings.map((b) => b._id.toString())).toContain(
      booking._id.toString()
    );
  });
});

describe("Admin queues (instant feeds, visitors, counts, scope)", () => {
  it("lists pending instant requests and all instant bookings", async () => {
    const { booking } = await visitAndConfirm("9800000001");

    const requests = await authAdmin(
      request(app).get("/api/admin/instant-bookings/requests")
    );
    expect(requests.status).toBe(200);
    expect(requests.body.bookings.map((b) => b._id.toString())).toContain(
      booking._id.toString()
    );

    const all = await authAdmin(
      request(app).get("/api/admin/instant-bookings")
    );
    expect(all.body.bookings.map((b) => b._id.toString())).toContain(
      booking._id.toString()
    );

    // Verified bookings leave the requests queue but stay in the feed.
    await authAdmin(
      request(app).patch(`/api/admin/instant-bookings/${booking._id}/verify`)
    );
    const after = await authAdmin(
      request(app).get("/api/admin/instant-bookings/requests")
    );
    expect(
      after.body.bookings.map((b) => b._id.toString())
    ).not.toContain(booking._id.toString());
  });

  it("exposes live sidebar counts for both queues", async () => {
    await visitAndConfirm("9800000002");

    const counts = await authAdmin(request(app).get("/api/admin/counts"));
    expect(counts.status).toBe(200);
    expect(counts.body.counts.pendingInstantRequests).toBe(1);
    expect(counts.body.counts.pendingCustomerRequests).toBe(0);
  });

  it("lists visitors including unconfirmed holds", async () => {
    await request(app)
      .post("/api/bookings/guest/visit")
      .send({ ...trip(), ...guest("9800000003") });

    const res = await authAdmin(request(app).get("/api/admin/visitors"));
    expect(res.status).toBe(200);
    expect(res.body.visitors).toHaveLength(1);
    expect(res.body.visitors[0].status).toBe("Pending");
    expect(res.body.visitors[0].reference).toMatch(/^VST-/);
  });

  it("scopes the unified bookings feed into guest vs registered", async () => {
    await visitAndConfirm("9800000004");

    const guestFeed = await authAdmin(
      request(app).get("/api/admin/bookings?scope=guest")
    );
    expect(
      guestFeed.body.bookings.map((b) => b._id.toString())
    ).toHaveLength(1);

    const registeredFeed = await authAdmin(
      request(app).get("/api/admin/bookings?scope=registered")
    );
    expect(registeredFeed.body.bookings).toHaveLength(0);
  });

  it("keeps the compat guest endpoint on Pending Approval + hidden", async () => {
    const res = await request(app)
      .post("/api/bookings/guest")
      .send({
        ...trip(),
        ...guest("9800000005"),
        paymentMethod: "Cash",
      });
    expect(res.status).toBe(201);
    expect(res.body.booking.approvalStatus).toBe("Pending Approval");

    const feed = await authDriver(
      request(app).get("/api/bookings/available?scope=instant")
    );
    expect(
      feed.body.bookings.map((b) => b._id.toString())
    ).not.toContain(res.body.booking._id.toString());
  });
});

describe("Admin visitor deletion", () => {
  it("deletes an abandoned hold so it leaves the visitors feed", async () => {
    const visit = await request(app)
      .post("/api/bookings/guest/visit")
      .send({ ...trip(), ...guest("9812345678") });
    expect(visit.status).toBe(201);
    const visitorId = visit.body.visitor._id;

    const listed = await authAdmin(request(app).get("/api/admin/visitors"));
    expect(
      listed.body.visitors.map((v) => v._id.toString())
    ).toContain(visitorId.toString());

    const del = await authAdmin(
      request(app).delete(`/api/admin/visitors/${visitorId}`)
    );
    expect(del.status).toBe(200);
    expect(del.body.success).toBe(true);

    const after = await authAdmin(request(app).get("/api/admin/visitors"));
    expect(
      after.body.visitors.map((v) => v._id.toString())
    ).not.toContain(visitorId.toString());
    expect(await Visitor.findById(visitorId).lean()).toBeNull();
  });

  it("returns 404 for an unknown visitor and 403 without admin auth", async () => {
    const missing = await authAdmin(
      request(app).delete(
        `/api/admin/visitors/${new mongoose.Types.ObjectId().toString()}`
      )
    );
    expect(missing.status).toBe(404);

    const visit = await request(app)
      .post("/api/bookings/guest/visit")
      .send({ ...trip(), ...guest("9812345679") });
    const noAuth = await request(app).delete(
      `/api/admin/visitors/${visit.body.visitor._id}`
    );
    expect(noAuth.status).toBe(401);
  });
});
