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
let testVehicle;
let adminToken;
let customerToken;
let driverOneToken;
let driverTwoToken;
let driverOneProfileId;
let driverTwoProfileId;

const login = async (email) => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "Password123" });
  return res.body.accessToken;
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  process.env.GOOGLE_ROUTES_MOCK_KM = "100";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashedPassword = await bcrypt.hash("Password123", 10);

  await User.create({
    name: "Reject Admin",
    email: "rejectadmin@test.com",
    phone: "9880000001",
    password: hashedPassword,
    role: "admin",
  });

  await User.create({
    name: "Reject Customer",
    email: "rejectcust@test.com",
    phone: "9880000002",
    password: hashedPassword,
    role: "customer",
  });

  const driverOneUser = await User.create({
    name: "Reject Driver One",
    email: "rejectdriver1@test.com",
    phone: "9880000003",
    password: hashedPassword,
    role: "driver",
  });

  const driverTwoUser = await User.create({
    name: "Reject Driver Two",
    email: "rejectdriver2@test.com",
    phone: "9880000004",
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

  // Start offline so creation-time auto-dispatch finds nobody; the test
  // brings both online and dispatches explicitly for a deterministic queue.
  const profileOne = await DriverProfile.create({
    user: driverOneUser._id,
    aadhaarNumber: "988000000011",
    licenseNumber: "RJDL00000001",
    vehicleType: testVehicle._id,
    vehicleBrand: "Maruti",
    vehicleModel: "Dzire",
    vehicleColor: "White",
    vehicleYear: 2022,
    vehicleNumber: "TN98RJ0001",
    approvalStatus: "Approved",
    isOnline: false,
    isAvailable: true,
    currentLocation: { type: "Point", coordinates: [80.27, 13.08] },
  });

  const profileTwo = await DriverProfile.create({
    user: driverTwoUser._id,
    aadhaarNumber: "988000000022",
    licenseNumber: "RJDL00000002",
    vehicleType: testVehicle._id,
    vehicleBrand: "Hyundai",
    vehicleModel: "Xcent",
    vehicleColor: "Silver",
    vehicleYear: 2021,
    vehicleNumber: "TN98RJ0002",
    approvalStatus: "Approved",
    isOnline: false,
    isAvailable: true,
    currentLocation: { type: "Point", coordinates: [80.27, 13.08] },
  });

  driverOneProfileId = profileOne._id.toString();
  driverTwoProfileId = profileTwo._id.toString();

  adminToken = await login("rejectadmin@test.com");
  customerToken = await login("rejectcust@test.com");
  driverOneToken = await login("rejectdriver1@test.com");
  driverTwoToken = await login("rejectdriver2@test.com");
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
  await DriverProfile.updateMany(
    {},
    { $set: { currentRide: null, isOnline: false, isAvailable: true } }
  );
});

const auth = (token) => ({ Authorization: `Bearer ${token}` });

// Builds one Pending booking with a two-driver dispatch queue and returns
// the booking plus the queue order as driver user tokens.
async function buildQueuedBooking() {
  const created = await request(app)
    .post("/api/bookings")
    .set(auth(customerToken))
    .send({
      pickup: { address: "Trichy, Tamil Nadu", latitude: 10.79, longitude: 78.7 },
      drop: { address: "Chennai, Tamil Nadu", latitude: 13.08, longitude: 80.27 },
      pickupDateTime: new Date(Date.now() + 2 * 86400000).toISOString(),
      tripType: "One Way",
      days: 1,
      vehicleType: testVehicle._id.toString(),
      paymentMethod: "Cash",
    });
  expect(created.status).toBe(201);
  const bookingId = created.body.booking._id;

  await DriverProfile.updateMany({}, { $set: { isOnline: true } });

  const dispatched = await request(app)
    .post(`/api/dispatch/${bookingId}`)
    .set(auth(adminToken))
    .send({ latitude: 10.79, longitude: 78.7 });
  expect(dispatched.status).toBe(200);
  expect(dispatched.body.success).toBe(true);

  const queued = await Booking.findById(bookingId).lean();
  expect(queued.driverQueue).toHaveLength(2);
  const firstProfile = queued.driverQueue[0].toString();
  const firstToken =
    firstProfile === driverOneProfileId ? driverOneToken : driverTwoToken;
  const secondToken =
    firstProfile === driverOneProfileId ? driverTwoToken : driverOneToken;
  return { bookingId, firstToken, secondToken };
}

describe("Driver Reject is not Driver Cancel", () => {
  it("reject keeps the ride open (Pending, unassigned, no cancel policy)", async () => {
    const { bookingId, firstToken } = await buildQueuedBooking();

    const res = await request(app)
      .patch(`/api/dispatch/${bookingId}/reject`)
      .set(auth(firstToken));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const booking = await Booking.findById(bookingId).lean();
    // Still a live request — nothing about cancellation was applied.
    expect(booking.bookingStatus).toBe("Pending");
    expect(booking.driver).toBeNull();
    expect(booking.cancelledBy).toBeNull();
    expect(booking.cancelledAt).toBeNull();
    // Routed onward to the next driver in the queue.
    expect(booking.driverRequestStatus).toBe("Waiting");
    expect(booking.rejectedDrivers.map(String)).toHaveLength(1);
  });

  it("hides the rejected request from that driver only; next driver still sees and accepts it", async () => {
    const { bookingId, firstToken, secondToken } = await buildQueuedBooking();

    await request(app)
      .patch(`/api/dispatch/${bookingId}/reject`)
      .set(auth(firstToken))
      .expect(200);

    for (const scope of ["", "?scope=customer", "?scope=instant"]) {
      const mine = await request(app)
        .get(`/api/bookings/available${scope}`)
        .set(auth(firstToken));
      expect(mine.status).toBe(200);
      expect(mine.body.bookings.map((b) => b._id.toString())).not.toContain(
        bookingId.toString()
      );
    }

    const other = await request(app)
      .get("/api/bookings/available?scope=customer")
      .set(auth(secondToken));
    expect(
      other.body.bookings.map((b) => b._id.toString())
    ).toContain(bookingId.toString());

    const accept = await request(app)
      .patch(`/api/bookings/${bookingId}/accept`)
      .set(auth(secondToken));
    expect(accept.status).toBe(200);
  });

  it("blocks accept by the rejecting driver, while driver-cancel still works separately", async () => {
    const { bookingId, firstToken, secondToken } = await buildQueuedBooking();

    await request(app)
      .patch(`/api/dispatch/${bookingId}/reject`)
      .set(auth(firstToken))
      .expect(200);

    const blocked = await request(app)
      .patch(`/api/bookings/${bookingId}/accept`)
      .set(auth(firstToken));
    expect(blocked.status).toBe(400);
    expect(blocked.body.message).toMatch(/reject/i);

    // The cancel policy is untouched: another driver accepts, then cancels
    // under the normal driver-cancel rules.
    await request(app)
      .patch(`/api/bookings/${bookingId}/accept`)
      .set(auth(secondToken))
      .expect(200);

    const cancelled = await request(app)
      .patch(`/api/bookings/${bookingId}/driver-cancel`)
      .set(auth(secondToken))
      .send({ cancelReason: "Reject-flow check" });
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.booking.bookingStatus).toBe("Cancelled");
    expect(cancelled.body.booking.cancelledBy).toBe("Driver");
  });
});
