import "dotenv/config";

import mongoose from "mongoose";
import { initializeSocket } from "./socket/index.js";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { envValidator } from "./middleware/security.middleware.js";
import { getRedisClient, isRedisConnected, closeRedis } from "./config/redis.js";

/* ===========================================================
   VALIDATE ENVIRONMENT
=========================================================== */

envValidator();

/* ===========================================================
   CONNECT DATABASE
=========================================================== */

await connectDB();

/* ===========================================================
   CONNECT REDIS (optional, fail gracefully)
   Lazy — only connects when first command is issued. Rate
   limiters and socket adapter will trigger connection when
   needed. If Redis is unavailable the app falls back to
   in-memory rate limiting (single-instance mode).
=========================================================== */

if (process.env.REDIS_HOST) {
  try {
    getRedisClient();
  } catch {
    // Redis client creation failed — will degrade gracefully.
  }
}

/* ===========================================================
   CREATE HTTP SERVER
=========================================================== */

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

/* ===========================================================
   INITIALIZE SOCKET.IO
=========================================================== */

const io = initializeSocket(server);

/* ===========================================================
   START SERVER
=========================================================== */

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Redis: ${isRedisConnected() ? "connected" : "not connected (using in-memory fallback)"}`);
});

/* ===========================================================
   GRACEFUL SHUTDOWN
=========================================================== */

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Safety net: force-exit if graceful shutdown stalls.
  const forceTimer = setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);

  // 1. Stop Socket.IO — disconnects WebSocket clients, stops accepting new
  //    socket connections.
  try {
    await new Promise((resolve) => io.close(resolve));
    console.log("Socket.IO closed.");
  } catch (err) {
    console.error("Error closing Socket.IO:", err);
  }

  // 2. Stop accepting new HTTP connections, then drain existing requests.
  try {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    console.log("HTTP server closed.");
  } catch (err) {
    console.error("Error closing HTTP server:", err);
  }

  // 3. Close Redis (optional in dev; no-op if never connected).
  try {
    await closeRedis();
    console.log("Redis connection closed.");
  } catch (err) {
    // Redis may not be connected
  }

  // 4. Close MongoDB using the current async connection API.
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
  }

  clearTimeout(forceTimer);
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});
