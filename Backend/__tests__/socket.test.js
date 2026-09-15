import http from "http";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import { initializeSocket } from "../src/socket/index.js";
import { io as IoClient } from "socket.io-client";
import User from "../src/models/User.js";
import DriverProfile from "../src/models/DriverProfile.js";
import Booking from "../src/models/Booking.js";
import Vehicle from "../src/models/Vehicle.js";
import bcrypt from "bcryptjs";

let mongoServer;
let server;
let httpServer;
let port;
let validToken;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hashed = await bcrypt.hash("Password123", 10);
  await User.create({
    name: "Socket User",
    email: "socket@test.com",
    phone: "9876543277",
    password: hashed,
    role: "customer",
  });

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "socket@test.com", password: "Password123" });
  validToken = login.body.accessToken;
});

afterAll(async () => {
  if (server) server.close();
  if (httpServer) await new Promise((r) => httpServer.close(r));
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

const connect = (token) =>
  new Promise((resolve) => {
    const client = IoClient(`http://localhost:${port}`, {
      auth: token ? { token } : {},
      transports: ["websocket"],
      forceNew: true,
    });
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      client.disconnect();
      resolve(result);
    };
    client.on("connect", () => done({ connected: true }));
    client.on("connect_error", (err) => done({ connected: false, error: err.message }));
    setTimeout(() => done({ connected: false, error: "timeout" }), 8000);
  });

describe("Socket.IO authorization", () => {
  it("rejects connections without a token", async () => {
    httpServer = http.createServer(app);
    server = initializeSocket(httpServer);
    await new Promise((r) => httpServer.listen(0, r));
    port = httpServer.address().port;

    const result = await connect(null);
    expect(result.connected).toBe(false);
  });

  it("rejects connections with an invalid token", async () => {
    const result = await connect("not-a-real-token");
    expect(result.connected).toBe(false);
  });

  it("accepts connections with a valid token", async () => {
    const result = await connect(validToken);
    expect(result.connected).toBe(true);
  });
});

describe("Socket.IO driver live location broadcast", () => {
  let driverToken;
  let bookingId;
  let srv;
  let httpSrv;
  let srvPort;
  let customerClient;
  let driverClient;

  beforeAll(async () => {
    process.env.GOOGLE_MAPS_API_KEY = "";

    const hashed = await bcrypt.hash("Password123", 10);
    const driverUser = await User.create({
      name: "Socket Driver",
      email: "socketdriver@test.com",
      phone: "9876543299",
      password: hashed,
      role: "driver",
    });

    const vehicle = await Vehicle.create({
      name: "Test Compact",
      seats: 4,
      oneWayBaseFare: 50,
      roundTripBaseFare: 60,
      oneWayPerKm: 10,
      roundTripPerKm: 12,
      isActive: true,
    });

    const driverProfile = await DriverProfile.create({
      user: driverUser._id,
      aadhaarNumber: "123456789012",
      licenseNumber: "SOCTEST1234",
      vehicleType: vehicle._id,
      vehicleBrand: "Test",
      vehicleModel: "Compact",
      vehicleYear: 2022,
      vehicleNumber: "TN01AB1234",
      vehicleColor: "White",
      approvalStatus: "Approved",
      isOnline: true,
    });

    const driverLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "socketdriver@test.com", password: "Password123" });
    driverToken = driverLogin.body.accessToken;

    const customer = await User.findOne({ email: "socket@test.com" });
    const booking = await Booking.create({
      customer: customer._id,
      driver: driverProfile._id,
      vehicleType: vehicle._id,
      bookingStatus: "Accepted",
      driverRequestStatus: "Accepted",
      pickupDateTime: new Date(),
      pickup: { address: "Test Pickup", latitude: 9.9252, longitude: 78.1198 },
      drop: { address: "Test Drop", latitude: 9.9252, longitude: 78.1198 },
    });
    bookingId = booking._id.toString();

    httpSrv = http.createServer(app);
    srv = initializeSocket(httpSrv);
    await new Promise((r) => httpSrv.listen(0, r));
    srvPort = httpSrv.address().port;
  });

  afterAll(async () => {
    customerClient?.disconnect();
    driverClient?.disconnect();
    if (srv) await new Promise((r) => srv.close(r));
    if (httpSrv) await new Promise((r) => httpSrv.close(r));
  });

  it("broadcasts the driver's real coordinates to the customer's booking room even when ETA fails", async () => {
    const received = [];

    customerClient = IoClient(`http://localhost:${srvPort}`, {
      auth: { token: validToken },
      transports: ["websocket"],
      forceNew: true,
    });
    await new Promise((resolve, reject) => {
      customerClient.once("connect", resolve);
      customerClient.once("connect_error", reject);
    });

    driverClient = IoClient(`http://localhost:${srvPort}`, {
      auth: { token: driverToken },
      transports: ["websocket"],
      forceNew: true,
    });
    await new Promise((resolve, reject) => {
      driverClient.once("connect", resolve);
      driverClient.once("connect_error", reject);
    });

    customerClient.on("driver-location-updated", (data) => received.push(data));
    const roomJoined = new Promise((resolve) => {
      customerClient.emit("join-booking", bookingId);
      driverClient.once("booking-updated", resolve);
      setTimeout(resolve, 200);
    });
    await roomJoined;

    // Give the async join-booking handler time to join the customer to the room,
    // and the driver auto-online handler time to commit isOnline=true.
    await new Promise((r) => setTimeout(r, 500));

    driverClient.emit("driver-location", {
      bookingId,
      latitude: 9.9412,
      longitude: 78.1294,
    });

    const deadline = Date.now() + 8000;
    while (received.length === 0 && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 100));
    }

    expect(received.length).toBeGreaterThan(0);
    expect(received[0].bookingId).toBe(bookingId);
    expect(received[0].latitude).toBeCloseTo(9.9412, 4);
    expect(received[0].longitude).toBeCloseTo(78.1294, 4);

    // Location must arrive regardless of ETA → with the key wiped, getETA always
    // fails, so receiving ANY event proves the broadcast no longer depends on it.
  });
});
