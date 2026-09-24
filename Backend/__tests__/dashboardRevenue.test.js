import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Booking from "../src/models/Booking.js";
import { invalidateCache } from "../src/config/redis.js";
import bcrypt from "bcryptjs";

let mongoServer;
let adminToken;
let customerId;
let vehicleId;

const bookingDoc = (overrides = {}) => ({
  customer: customerId,
  pickup: { address: "A", latitude: 10.79, longitude: 78.7 },
  drop: { address: "B", latitude: 13.08, longitude: 80.27 },
  pickupDateTime: new Date(Date.now() + 86400000),
  tripType: "One Way",
  days: 1,
  vehicleType: vehicleId,
  distance: 10,
  estimatedFare: 1000,
  paymentMethod: "Cash",
  bookingStatus: "Pending",
  approvalStatus: "Approved",
  ...overrides,
});

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashedPassword = await bcrypt.hash("Password123", 10);
  await User.create({
    name: "Revenue Admin",
    email: "revadmin@test.com",
    phone: "9860000001",
    password: hashedPassword,
    role: "admin",
  });
  const customer = await User.create({
    name: "Revenue Customer",
    email: "revcust@test.com",
    phone: "9860000002",
    password: hashedPassword,
    role: "customer",
  });
  customerId = customer._id;
  vehicleId = new mongoose.Types.ObjectId();

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "revadmin@test.com", password: "Password123" });
  adminToken = login.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
  // Dashboard stats are cached (30s) — drop the cache so each test reads
  // the documents it seeded, exactly like production invalidation does.
  await invalidateCache("dashboard:stats");
});

describe("Dashboard accepted-revenue stats", () => {
  it("counts only assigned, non-cancelled, non-rejected rides with finalFare ?? estimate", async () => {
    const driverId = new mongoose.Types.ObjectId();
    await Booking.create([
      // Instant, accepted, estimate only → counts, revenue 1000.
      bookingDoc({
        guestName: "G1",
        guestEmail: "g1@test.com",
        guestPhone: "9810000001",
        driver: driverId,
        bookingStatus: "Accepted",
        estimatedFare: 1000,
        finalFare: 0,
      }),
      // Instant, started, final fare known → counts, revenue 2500.
      bookingDoc({
        guestName: "G2",
        guestEmail: "g2@test.com",
        guestPhone: "9810000002",
        driver: driverId,
        bookingStatus: "Started",
        estimatedFare: 2000,
        finalFare: 2500,
      }),
      // Instant, never assigned → excluded everywhere.
      bookingDoc({
        guestName: "G3",
        guestEmail: "g3@test.com",
        guestPhone: "9810000003",
        driver: null,
        bookingStatus: "Pending",
        approvalStatus: "Pending Approval",
        estimatedFare: 9999,
      }),
      // Instant, assigned but cancelled → excluded.
      bookingDoc({
        guestName: "G4",
        guestEmail: "g4@test.com",
        guestPhone: "9810000004",
        driver: driverId,
        bookingStatus: "Cancelled",
        estimatedFare: 9999,
      }),
      // Instant, rejected → excluded.
      bookingDoc({
        guestName: "G5",
        guestEmail: "g5@test.com",
        guestPhone: "9810000005",
        driver: null,
        bookingStatus: "Pending",
        approvalStatus: "Rejected",
        estimatedFare: 9999,
      }),
      // Registered, accepted → customer revenue 500.
      bookingDoc({
        driver: driverId,
        bookingStatus: "Accepted",
        estimatedFare: 500,
        finalFare: 0,
      }),
      // Registered, pending → excluded.
      bookingDoc({
        driver: null,
        bookingStatus: "Pending",
        estimatedFare: 9999,
      }),
    ]);

    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const stats = res.body.stats;
    expect(stats.instantBookersCount).toBe(5);
    expect(stats.instantAccepted).toBe(2);
    expect(stats.instantAcceptedRevenue).toBe(3500);
    expect(stats.customerAccepted).toBe(1);
    expect(stats.customerAcceptedRevenue).toBe(500);
    // Pending split: G3 (pending) + G5 (pending, rejected) vs R2 (pending).
    expect(stats.instantPending).toBe(2);
    expect(stats.customerPending).toBe(1);
  });

  it("reports zeros when nothing is assigned", async () => {
    await Booking.create(
      bookingDoc({ driver: null, bookingStatus: "Pending" })
    );

    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.stats.instantAccepted).toBe(0);
    expect(res.body.stats.instantAcceptedRevenue).toBe(0);
    expect(res.body.stats.customerAccepted).toBe(0);
    expect(res.body.stats.customerAcceptedRevenue).toBe(0);
  });
});
