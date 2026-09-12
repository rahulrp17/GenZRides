import http from "http";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import { initializeSocket } from "../src/socket/index.js";
import { io as IoClient } from "socket.io-client";
import User from "../src/models/User.js";
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
