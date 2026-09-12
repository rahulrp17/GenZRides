import express from "express";
import mongoose from "mongoose";
import { isRedisConnected } from "./config/redis.js";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  paymentLimiter,
  dispatchLimiter,
} from "./config/redisRateLimiter.js";

import bookingRoutes from "./routes/booking.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import authRoutes from "./routes/auth.routes.js";
import fareRoutes from "./routes/fare.routes.js";
import driverRoutes from "./routes/driver.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import driverUploadRoutes from "./routes/driverUpload.routes.js";
import driverStatusRoutes from "./routes/driverStatus.routes.js";
import favoriteLocationRoutes from "./routes/favoriteLocation.routes.js";
import historyRoutes from "./routes/history.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import googleMapsRoutes from "./routes/googleMaps.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import dispatchRoutes from "./routes/dispatch.routes.js";
import { sanitizeInput, requestTimeout } from "./middleware/security.middleware.js";

const app = express();

// Trust the first upstream proxy (Render/Nginx/Heroku) so req.ip reflects
// the real client IP. Value 1 (not `true`) prevents trivial IP spoofing
// while fixing shared-bucket 429s where every client appeared as one IP.
app.set("trust proxy", 1);

/* ===========================================================
   SECURITY HEADERS
=========================================================== */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

/* ===========================================================
   COMPRESSION
=========================================================== */

app.use(compression({ threshold: 1024, filter: (req, res) => {
  if (req.headers['x-no-compression']) return false;
  return compression.filter(req, res);
}}));

/* ===========================================================
   CORS
=========================================================== */

const configuredOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : []),
].filter(Boolean);

// In production we must not fall back to localhost origins; an explicit
// CLIENT_URL (and/or ALLOWED_ORIGINS) is required. Development/test keep
// the local dev servers as a convenience.
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? configuredOrigins
    : [...configuredOrigins, "http://localhost:5173", "http://localhost:3000"];

if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
  throw new Error(
    "CORS misconfiguration: CLIENT_URL (or ALLOWED_ORIGINS) must be set in production."
  );
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header (server-to-server, mobile, health
      // checks) are permitted; browser requests must match an allowed origin.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ===========================================================
   WEBHOOK ROUTES (raw body before JSON parsing)
=========================================================== */

app.use("/api/webhooks", express.raw({ type: "application/json" }), webhookRoutes);

/* ===========================================================
   BODY PARSING
=========================================================== */

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

/* ===========================================================
   INPUT SANITIZATION
=========================================================== */

app.use(sanitizeInput);

/* ===========================================================
   REQUEST LOGGING
=========================================================== */

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "combined"));
}

/* ===========================================================
    RATE LIMITING
=========================================================== */

app.use(generalLimiter);

/* ===========================================================
    REQUEST TIMEOUT (defense against hung upstreams)
=========================================================== */

app.use(requestTimeout(30000));

/* ===========================================================
   HEALTH CHECK
=========================================================== */

app.get("/health", async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbHealthy = dbState === 1;

  const redisHealthy = isRedisConnected();

  const healthy = dbHealthy;
  res.status(healthy ? 200 : 503).json({
    success: healthy,
    message: healthy ? "Server is healthy" : "Server degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: dbHealthy ? "connected" : "disconnected",
      redis: redisHealthy ? "connected" : "disconnected",
    },
  });
});

/* ===========================================================
   API ROUTES
=========================================================== */

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/fares", fareRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentLimiter, paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uploads", uploadLimiter, uploadRoutes);
app.use("/api/driver-uploads", uploadLimiter, driverUploadRoutes);
app.use("/api/driver-status", driverStatusRoutes);
app.use("/api/favorites", favoriteLocationRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dispatch", dispatchLimiter, dispatchRoutes);
app.use("/api/maps", googleMapsRoutes);

/* ===========================================================
   ROOT
=========================================================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GenZRides API Running",
  });
});

/* ===========================================================
   404 HANDLER
=========================================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* ===========================================================
   CENTRALIZED ERROR HANDLER
=========================================================== */

app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;

  // Always log the full error (with stack) server-side for diagnostics.
  console.error("Unhandled Error:", err && err.stack ? err.stack : err);

  // In production, client errors (4xx) are preserved because they are the
  // caller's responsibility (validation/business rules) and leak no internals.
  // Server errors (5xx) are returned as generic to avoid leaking implementation
  // details (stack traces, DB errors, schema, etc.). Detailed info stays in logs.
  const isServerError = statusCode >= 500;
  const message =
    process.env.NODE_ENV === "production" && isServerError
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app;
