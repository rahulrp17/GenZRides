import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import bcrypt from "bcryptjs";

let mongoServer;
let adminToken;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashedPassword = await bcrypt.hash("Password123", 10);

  await User.create({
    name: "Admin User",
    email: "admin@test.com",
    phone: "9876543240",
    password: hashedPassword,
    role: "admin",
  });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "Password123" });
  adminToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Admin Endpoints", () => {
  describe("Authorization", () => {
    it("should reject non-admin accessing admin routes", async () => {
      const custHashed = await bcrypt.hash("Password123", 10);
      const customer = await User.create({
        name: "Cust",
        email: "c@test.com",
        phone: "9876543241",
        password: custHashed,
        role: "customer",
      });

      const custLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: "c@test.com", password: "Password123" });

      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${custLogin.body.accessToken}`);

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated access", async () => {
      const res = await request(app).get("/api/admin/dashboard");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/admin/dashboard", () => {
    it("should return dashboard stats for admin", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Vehicle image handling", () => {
    const baseVehicle = {
      name: "Test Sedan",
      seats: 4,
      luggage: 2,
      oneWayBaseFare: 100,
      roundTripBaseFare: 100,
      oneWayBaseKm: 0,
      roundTripBaseKm: 0,
      oneWayPerKm: 12,
      roundTripPerKm: 12,
      waitingChargePerMinute: 2,
      driverAllowance: 0,
      nightCharge: 0,
      minimumDistance: 1,
    };

    it("should persist an image URL on create and update", async () => {
      const created = await request(app)
        .post("/api/admin/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...baseVehicle, image: "https://example.com/sedan.jpg" });

      expect(created.status).toBe(201);
      expect(created.body.vehicle.image).toBe("https://example.com/sedan.jpg");

      const updated = await request(app)
        .put(`/api/admin/vehicles/${created.body.vehicle._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ image: "https://example.com/sedan-v2.jpg" });

      expect(updated.status).toBe(200);
      expect(updated.body.vehicle.image).toBe(
        "https://example.com/sedan-v2.jpg"
      );
    });

    it("should persist a high-distance bata override and clear it with null", async () => {
      const created = await request(app)
        .post("/api/admin/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...baseVehicle, name: "Bata Hatch", driverBataHighDistance: 750 });

      expect(created.status).toBe(201);
      expect(created.body.vehicle.driverBataHighDistance).toBe(750);

      const cleared = await request(app)
        .put(`/api/admin/vehicles/${created.body.vehicle._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ driverBataHighDistance: null });

      expect(cleared.status).toBe(200);
      expect(cleared.body.vehicle.driverBataHighDistance).toBeNull();
    });

    it("should reject upload-image without a file", async () => {
      const res = await request(app)
        .post("/api/admin/vehicles/upload-image")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject upload-image for non-admins", async () => {
      const res = await request(app).post("/api/admin/vehicles/upload-image");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/admin/bookings search", () => {
    // NOTE: the file-level beforeEach wipe demonstrably leaves bookings
    // behind between tests, so each seed starts with an explicit cleanup.
    let tag = 0;
    const seedPair = async () => {
      tag += 1;
      const Vehicle = (await import("../src/models/Vehicle.js")).default;
      const Booking = (await import("../src/models/Booking.js")).default;
      await Booking.deleteMany({});
      const hashed = await bcrypt.hash("Password123", 10);
      const customer = await User.create({
        name: `Search Customer ${tag}`,
        email: `searchcust${tag}@test.com`,
        phone: `98765432${String(tag).padStart(2, "0")}`,
        password: hashed,
        role: "customer",
      });
      const vehicle = await Vehicle.create({
        name: `Search Sedan ${tag}`,
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
      const mk = (pickup, drop) =>
        Booking.create({
          customer: customer._id,
          pickup: { address: pickup, latitude: 13.0, longitude: 80.2 },
          drop: { address: drop, latitude: 9.9, longitude: 78.1 },
          pickupDateTime: new Date(Date.now() + 86400000),
          vehicleType: vehicle._id,
          bookingStatus: "Pending",
        });
      const b1 = await mk("Trichy Airport, Trichy", "Chennai Central");
      await mk("Madurai Temple", "Rameshwaram Beach");
      return { customer, b1 };
    };

    const search = (q) =>
      request(app)
        .get("/api/admin/bookings")
        .query({ search: q })
        .set("Authorization", `Bearer ${adminToken}`);

    it("matches pickup addresses case-insensitively + partially", async () => {
      await seedPair();
      const res = await search("trichy");
      expect(res.status).toBe(200);
      expect(res.body.bookings.length).toBe(1);
      expect(res.body.bookings[0].pickup.address).toMatch(/Trichy/);
    });

    it("matches drop addresses", async () => {
      await seedPair();
      const res = await search("RAMESHWARAM");
      expect(res.status).toBe(200);
      expect(res.body.bookings.length).toBe(1);
    });

    it("matches customer name and email", async () => {
      const { customer } = await seedPair();
      const byName = await search(customer.name.toLowerCase());
      expect(byName.body.bookings.length).toBe(2);
      const byEmail = await search(customer.email);
      expect(byEmail.body.bookings.length).toBe(2);
    });

    it("matches full booking ID", async () => {
      const { b1 } = await seedPair();
      const res = await search(String(b1._id));
      expect(res.status).toBe(200);
      expect(res.body.bookings.some((b) => b._id === String(b1._id))).toBe(true);
    });

    it("matches displayed '#LAST6' booking ID with hash prefix", async () => {
      const { b1 } = await seedPair();
      const shortId = `#${String(b1._id).slice(-6).toUpperCase()}`;
      const res = await search(shortId);
      expect(res.status).toBe(200);
      expect(res.body.bookings.some((b) => b._id === String(b1._id))).toBe(true);
    });

    it("matches lowercase partial ID without hash", async () => {
      const { b1 } = await seedPair();
      const res = await search(String(b1._id).slice(-6).toLowerCase());
      expect(res.status).toBe(200);
      expect(res.body.bookings.some((b) => b._id === String(b1._id))).toBe(true);
    });

    it("matches trip types with or without spaces", async () => {
      tag += 1;
      const Vehicle = (await import("../src/models/Vehicle.js")).default;
      const Booking = (await import("../src/models/Booking.js")).default;
      await Booking.deleteMany({});
      const hashed = await bcrypt.hash("Password123", 10);
      const customer = await User.create({
        name: `Trip Customer ${tag}`,
        email: `tripcust${tag}@test.com`,
        phone: `98865432${String(tag).padStart(2, "0")}`,
        password: hashed,
        role: "customer",
      });
      const vehicle = await Vehicle.create({
        name: `Trip Sedan ${tag}`,
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
      const base = {
        customer: customer._id,
        pickup: { address: "Trip Pickup Point", latitude: 13.0, longitude: 80.2 },
        drop: { address: "Trip Drop Point", latitude: 9.9, longitude: 78.1 },
        pickupDateTime: new Date(Date.now() + 86400000),
        vehicleType: vehicle._id,
        bookingStatus: "Pending",
      };
      await Booking.create({ ...base, tripType: "One Way" });
      await Booking.create({ ...base, tripType: "Round Trip" });
      await Booking.create({ ...base, tripType: "Airport Drop" });

      const one = await search("oneway");
      expect(one.status).toBe(200);
      expect(one.body.bookings.length).toBe(1);
      expect(one.body.bookings[0].tripType).toBe("One Way");

      const round = await search("round trip");
      expect(round.status).toBe(200);
      expect(round.body.bookings.length).toBe(1);
      expect(round.body.bookings[0].tripType).toBe("Round Trip");

      const air = await search("airport");
      expect(air.status).toBe(200);
      expect(air.body.bookings.length).toBe(1);
      expect(air.body.bookings[0].tripType).toBe("Airport Drop");
    });

    it("returns empty for non-matching text", async () => {
      await seedPair();
      const res = await search("zzz-no-such-place-zzz");
      expect(res.status).toBe(200);
      expect(res.body.bookings.length).toBe(0);
    });
  });

  describe("GET /api/admin/instant-customers", () => {
    // NOTE: same pattern as the bookings search describe — bookings from other
    // describe blocks survive between tests, so each seed cleans up first.
    let tag = 0;
    const seed = async () => {
      tag += 1;
      const Vehicle = (await import("../src/models/Vehicle.js")).default;
      const Booking = (await import("../src/models/Booking.js")).default;
      await Booking.deleteMany({});
      const hashed = await bcrypt.hash("Password123", 10);
      const customer = await User.create({
        name: `Guest Host ${tag}`,
        email: `guesthost${tag}@test.com`,
        phone: `97965432${String(tag).padStart(2, "0")}`,
        password: hashed,
        role: "customer",
      });
      const vehicle = await Vehicle.create({
        name: `Instant Sedan ${tag}`,
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
      const mk = async (guestName, guestPhone, pickupAddr, dropAddr) =>
        Booking.create({
          customer: customer._id,
          guestName,
          guestEmail: `${guestName.toLowerCase()}@guest.test`,
          guestPhone,
          pickup: { address: pickupAddr, latitude: 13.0, longitude: 80.2 },
          drop: { address: dropAddr, latitude: 9.9, longitude: 78.1 },
          pickupDateTime: new Date(Date.now() + 86400000),
          vehicleType: vehicle._id,
          bookingStatus: "Pending",
          estimatedFare: 1200,
          distance: 100,
          duration: 150,
        });
      // Logged-in (non-guest) booking must NOT appear in this feed.
      await Booking.create({
        customer: customer._id,
        pickup: { address: "Registered Pickup", latitude: 13.0, longitude: 80.2 },
        drop: { address: "Registered Drop", latitude: 9.9, longitude: 78.1 },
        pickupDateTime: new Date(Date.now() + 86400000),
        vehicleType: vehicle._id,
        bookingStatus: "Pending",
      });
      return mk;
    };

    const list = (params = {}) =>
      request(app)
        .get("/api/admin/instant-customers")
        .query(params)
        .set("Authorization", `Bearer ${adminToken}`);

    it("requires admin authentication", async () => {
      const res = await request(app).get("/api/admin/instant-customers");
      expect(res.status).toBe(401);
    });

    it("returns only guest bookings, latest first", async () => {
      const mk = await seed();
      const older = await mk("Kavi", "9896543001", "Trichy Airport, Trichy", "Chennai Central");
      const newer = await mk("Priya", "9896543002", "Madurai Temple", "Rameshwaram Beach");

      const res = await list();
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.total).toBe(2);
      expect(res.body.guests.length).toBe(2);
      // Newest first — "Priya" was created after "Kavi".
      expect(res.body.guests[0]._id).toBe(String(newer._id));
      expect(res.body.guests[1]._id).toBe(String(older._id));
    });

    it("searches by guest name case-insensitively", async () => {
      const mk = await seed();
      await mk("Kavitha", "9896543010", "Trichy Airport, Trichy", "Chennai Central");
      await mk("Priya", "9896543011", "Madurai Temple", "Rameshwaram Beach");

      const res = await list({ search: "kavitha" });
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.guests[0].guestName).toBe("Kavitha");
    });

    it("searches by guest phone", async () => {
      const mk = await seed();
      await mk("Kavitha", "9896543020", "Trichy Airport, Trichy", "Chennai Central");
      await mk("Priya", "9896543021", "Madurai Temple", "Rameshwaram Beach");

      const res = await list({ search: "3021" });
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.guests[0].guestPhone).toBe("9896543021");
    });

    it("searches by pickup/drop route text", async () => {
      const mk = await seed();
      await mk("Kavitha", "9896543030", "Trichy Airport, Trichy", "Chennai Central");
      await mk("Priya", "9896543031", "Madurai Temple", "Rameshwaram Beach");

      const res = await list({ search: "madurai" });
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.guests[0].pickup.address).toMatch(/Madurai/);
    });

    it("paginates results", async () => {
      const mk = await seed();
      for (let i = 0; i < 5; i += 1) {
        await mk(`Pager Guest ${i}`, `97965430${i}`, `Pickup ${i}`, `Drop ${i}`);
      }

      const page1 = await list({ page: 1, limit: 2 });
      expect(page1.body.guests.length).toBe(2);
      expect(page1.body.total).toBe(5);
      expect(page1.body.totalPages).toBe(3);
      expect(page1.body.page).toBe(1);

      const page3 = await list({ page: 3, limit: 2 });
      expect(page3.body.guests.length).toBe(1);
    });

    it("filters by booking status", async () => {
      const mk = await seed();
      const Booking = (await import("../src/models/Booking.js")).default;
      await mk("Stu Kavitha", "9896543040", "Trichy Airport, Trichy", "Chennai Central");
      const cancelled = await mk(
        "Stu Priya",
        "9896543041",
        "Madurai Temple",
        "Rameshwaram Beach"
      );
      await Booking.findByIdAndUpdate(cancelled._id, {
        bookingStatus: "Cancelled",
      });

      const pending = await list({ status: "Pending" });
      expect(pending.status).toBe(200);
      expect(pending.body.total).toBe(1);
      expect(pending.body.guests[0].guestName).toBe("Stu Kavitha");

      const cancelledRes = await list({ status: "Cancelled" });
      expect(cancelledRes.body.total).toBe(1);
      expect(cancelledRes.body.guests[0].guestName).toBe("Stu Priya");
    });

    it("filters by vehicle type", async () => {
      const mk = await seed();
      const Vehicle = (await import("../src/models/Vehicle.js")).default;
      const Booking = (await import("../src/models/Booking.js")).default;
      const suv = await Vehicle.create({
        name: "Instant SUV Filter",
        seats: 7,
        oneWayBaseFare: 200,
        roundTripBaseFare: 200,
        oneWayBaseKm: 0,
        roundTripBaseKm: 0,
        oneWayPerKm: 16,
        roundTripPerKm: 16,
        minimumDistance: 1,
        isActive: true,
      });
      const sedanBooking = await mk(
        "VK Kavitha",
        "9896543050",
        "Trichy Airport, Trichy",
        "Chennai Central"
      );
      const suvBooking = await Booking.create({
        customer: sedanBooking.customer,
        guestName: "VK Priya",
        guestEmail: "vkpriya@guest.test",
        guestPhone: "9896543051",
        pickup: { address: "Madurai Temple", latitude: 9.9, longitude: 78.1 },
        drop: { address: "Rameshwaram Beach", latitude: 9.3, longitude: 79.3 },
        pickupDateTime: new Date(Date.now() + 86400000),
        vehicleType: suv._id,
        bookingStatus: "Pending",
        estimatedFare: 2500,
        distance: 180,
        duration: 210,
      });

      const sedan = await list({ vehicleType: String(sedanBooking.vehicleType) });
      expect(sedan.status).toBe(200);
      expect(sedan.body.total).toBe(1);
      expect(sedan.body.guests[0].guestName).toBe("VK Kavitha");

      const suvRes = await list({ vehicleType: String(suv._id) });
      expect(suvRes.body.total).toBe(1);
      expect(suvRes.body.guests[0].guestName).toBe("VK Priya");
    });

    it("combines status + search", async () => {
      const mk = await seed();
      const Booking = (await import("../src/models/Booking.js")).default;
      const cancelled = await mk(
        "Comb Raksha",
        "9896543060",
        "Trichy Airport, Trichy",
        "Chennai Central"
      );
      await mk("Comb Meena", "9896543061", "Madurai Temple", "Rameshwaram Beach");
      await Booking.findByIdAndUpdate(cancelled._id, {
        bookingStatus: "Cancelled",
      });

      const res = await list({ status: "Cancelled", search: "raksha" });
      expect(res.body.total).toBe(1);
      expect(res.body.guests[0].guestName).toBe("Comb Raksha");
    });
  });

  describe("PATCH /api/admin/drivers/:id/approve", () => {
    it("approving a driver verifies docs too (all-Approved together)", async () => {
      const Vehicle = (await import("../src/models/Vehicle.js")).default;
      const DriverProfile = (await import("../src/models/DriverProfile.js")).default;

      const vehicle = await Vehicle.create({
        name: "Approve Sedan",
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
      const hashed = await bcrypt.hash("Password123", 10);
      const driverUser = await User.create({
        name: "Approve Driver",
        email: "approvedriver@test.com",
        phone: "9876543299",
        password: hashed,
        role: "driver",
      });
      const profile = await DriverProfile.create({
        user: driverUser._id,
        aadhaarNumber: "999999999991",
        licenseNumber: "DLAPPROVE001",
        vehicleType: vehicle._id,
        vehicleBrand: "Test",
        vehicleModel: "Model",
        vehicleColor: "White",
        vehicleYear: 2022,
        vehicleNumber: "KA01AP0001",
        approvalStatus: "Pending",
      });

      const res = await request(app)
        .patch(`/api/admin/drivers/${profile._id}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.driver.approvalStatus).toBe("Approved");
      expect(res.body.driver.documents?.documentVerification).toBe("Verified");
    });
  });
});
