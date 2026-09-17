import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import DriverProfile from "../models/DriverProfile.js";
import Booking from "../models/Booking.js";
import { addUser, removeUser } from "./users.js";
import { updateRideStatus } from "../services/ride.service.js";
import { acceptBooking, rejectBooking } from "../services/dispatch.service.js";
import { getETA } from "../services/googleMaps.service.js";

let io;

const SOCKET_TIMEOUT = 30000;
const driverLocationLast = new Map(); // driverUserId -> timestamp ms

export const initializeSocket = (server) => {
  const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6,
    connectTimeout: 20000,
    perMessageDeflate: { threshold: 1024 },
  });

  // Multi-instance support: when Redis is configured, fan out Socket.IO
  // events across instances via the Redis adapter. Loaded lazily so a
  // missing optional dependency does not crash the server (single-instance
  // mode remains fully functional).
  if (process.env.REDIS_HOST) {
    const failLoud = (label, err) => {
      if (process.env.NODE_ENV === "production") {
        console.error(`FATAL: ${label} - Redis adapter is required in production:`, err?.message || err);
        process.exit(1);
      }
      console.warn(`${label}:`, err?.message || err);
    };

    import("@socket.io/redis-adapter")
      .then(async ({ createAdapter }) => {
        try {
          const { getRedisClient, isRedisConnected } = await import("../config/redis.js");
          if (!isRedisConnected()) {
            console.warn("Socket.IO Redis adapter skipped: Redis not connected");
            return;
          }
          const redis = getRedisClient();
          const pubClient = redis.duplicate();
          const subClient = redis.duplicate();
          // Attach error handlers to duplicate clients to prevent unhandled errors
          pubClient.on("error", () => {});
          subClient.on("error", () => {});
          io.adapter(createAdapter(pubClient, subClient));
          console.log("Socket.IO Redis adapter enabled");
        } catch (err) {
          failLoud("Socket.IO Redis adapter setup failed", err);
        }
      })
      .catch((err) => failLoud("Socket.IO Redis adapter not enabled", err));
  }

  // JWT authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Cached user lookup (60s TTL via Redis withCache, falls back to DB)
      let user = null;
      try {
        const { withCache } = await import("../config/redis.js");
        user = await withCache(`user:${decoded.id}`, 60, async () => {
          return await User.findById(decoded.id).select("-password").lean();
        });
        // lean loses methods, but we only need fields; rehydrate minimal
        if (user && !user._id) user._id = decoded.id;
      } catch {
        user = await User.findById(decoded.id).select("-password");
      }
      if (!user) {
        return next(new Error("User not found"));
      }
      if (user.isBlocked) {
        return next(new Error("Account blocked"));
      }

      socket.user = {
        _id: user._id.toString(),
        role: user.role,
        name: user.name,
      };

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("Socket Connected:", socket.id, "User:", socket.user._id, "Role:", socket.user.role);

    // Register user
    addUser(socket.user._id, socket.id);

    // Join a room named after the user ID so we can emit directly to users
    socket.join(socket.user._id);

    // Admins also join the ops room for booking lifecycle fan-out
    // (new bookings, status changes) feeding the live admin queues.
    if (socket.user.role === "admin") {
      socket.join("admins");
    }

    // VERBOSE: Driver auto-online on entering website.
    // As soon as an approved driver connects (page load), mark isOnline=true
    // and isAvailable = !currentRide. Only offline (busy) when on trip
    // (currentRide exists). No manual toggle needed.
    if (socket.user.role === "driver") {
      try {
        const driver = await DriverProfile.findOne({ user: socket.user._id });
        // Approval gates the app: only verified drivers go online.
        if (driver && driver.approvalStatus === "Approved") {
          // If driver already has an active ride (Accepted/On The Way/Arrived/Started/Reached), keep busy
          let hasActiveRide = !!driver.currentRide;
          if (hasActiveRide) {
            try {
              const active = await Booking.findById(driver.currentRide).select("bookingStatus").lean();
              if (!active || ["Completed", "Cancelled"].includes(active.bookingStatus)) {
                hasActiveRide = false;
                // Stale currentRide cleanup
                driver.currentRide = null;
              }
            } catch { hasActiveRide = !!driver.currentRide; }
          }
          const wasOnline = driver.isOnline;
          const wasAvailable = driver.isAvailable;
          driver.isOnline = true;
          driver.isAvailable = !hasActiveRide;
          await driver.save();
          console.log(`[driver-auto-online] user=${socket.user._id} driver=${driver._id} wasOnline=${wasOnline}->true hasActiveRide=${hasActiveRide} isAvailable=${wasAvailable}->${driver.isAvailable}`);
        } else if (driver) {
          console.log(`[driver-auto-online] skipped - not approved status=${driver.approvalStatus}`);
        }
      } catch (err) {
        console.error("[driver-auto-online] error", err?.message);
      }
    }

    // Set socket timeout
    const timeout = setTimeout(() => {
      socket.disconnect(true);
    }, SOCKET_TIMEOUT);

    socket.on("pong", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        socket.disconnect(true);
      }, SOCKET_TIMEOUT);
    });

    // Driver online (explicit emit from frontend) - verbose, trip-aware
    socket.on("driver-online", async () => {
      try {
        if (socket.user.role !== "driver") return;
        const driver = await DriverProfile.findOne({ user: socket.user._id });
        if (!driver) return;
        if (driver.approvalStatus !== "Approved") {
          console.log(`[driver-online] skipped not approved ${driver.approvalStatus}`);
          return;
        }
        // Re-validate hasActiveRide same as on connect
        let hasActiveRide = !!driver.currentRide;
        if (hasActiveRide) {
          try {
            const active = await Booking.findById(driver.currentRide).select("bookingStatus").lean();
            if (!active || ["Completed", "Cancelled"].includes(active.bookingStatus)) hasActiveRide = false;
          } catch { /* keep */ }
        }
        driver.isOnline = true;
        driver.isAvailable = !hasActiveRide;
        await driver.save();
        console.log(`[driver-online] user=${socket.user._id} hasActiveRide=${hasActiveRide} isAvailable=${driver.isAvailable}`);
      } catch (err) {
        console.error(err);
      }
    });

    // Driver offline (manual) - blocked when on active trip; verbose
    socket.on("driver-offline", async () => {
      try {
        if (socket.user.role !== "driver") return;
        const driver = await DriverProfile.findOne({ user: socket.user._id });
        if (!driver) return;
        if (driver.currentRide) {
          console.log(`[driver-offline] blocked - on trip currentRide=${driver.currentRide}`);
          socket.emit("error", { message: "You cannot go offline while a ride is in progress." });
          return;
        }
        driver.isOnline = false;
        driver.isAvailable = false;
        await driver.save();
        console.log(`[driver-offline] user=${socket.user._id} now offline`);
      } catch (err) {
        console.error(err);
      }
    });

    // Driver live location (throttled 1/sec to avoid DB/Google quota blow)
    socket.on("driver-location", async ({ bookingId, latitude, longitude }) => {
      try {
        if (socket.user.role !== "driver") return;

        const now = Date.now();
        const last = driverLocationLast.get(socket.user._id) || 0;
        if (now - last < 1000) return;
        driverLocationLast.set(socket.user._id, now);

        if (typeof latitude !== "number" || typeof longitude !== "number") return;
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return;

        const driver = await DriverProfile.findOne({ user: socket.user._id });
        if (!driver || driver.approvalStatus !== "Approved" || !driver.isOnline) return;

        const booking = await Booking.findById(bookingId);
        if (!booking || !booking.driver || booking.driver.toString() !== driver._id.toString()) return;

        driver.currentLocation = { type: "Point", coordinates: [longitude, latitude] };
        await driver.save();

        // 1. Emit the raw location IMMEDIATELY — it must never be gated behind
        //    the Google ETA call (a failure/there/timeout there used to swallow
        //    the whole update, so the customer never saw the driver).
        io.to(bookingId).emit("driver-location-updated", {
          bookingId,
          latitude,
          longitude,
        });

        // 2. Best-effort ETA follow-up (non-blocking). Failure only drops ETA.
        const destination = booking.bookingStatus === "Started" ? booking.drop : booking.pickup;
        getETA(
          { latitude, longitude },
          { latitude: destination.latitude, longitude: destination.longitude }
        )
          .then((eta) => {
            const distanceKm = (eta.distance / 1000).toFixed(1);
            const durationMin = Math.ceil(eta.duration / 60);
            io.to(bookingId).emit("driver-location-updated", {
              bookingId,
              latitude,
              longitude,
              eta: {
                distance: `${distanceKm} km`,
                duration: `${durationMin} mins`,
                distanceMeters: eta.distance,
                durationSeconds: eta.duration,
              },
            });
          })
          .catch(() => {
            // ETA unavailable — the live location was already delivered above.
          });
      } catch (err) {
        console.error(err);
      }
    });

    // Join booking room
    socket.on("join-booking", async (bookingId) => {
      try {
        if (typeof bookingId !== "string" || bookingId.length !== 24) return;

        const booking = await Booking.findById(bookingId);
        if (!booking) return;

        const userId = socket.user._id;
        const isCustomer = booking.customer.toString() === userId;
        const isDriver = booking.driver && booking.driver.toString() === userId;

        if (!isCustomer && !isDriver && socket.user.role !== "admin") return;

        socket.join(bookingId);
      } catch (err) {
        console.error(err);
      }
    });

    // Driver accept booking
    socket.on("accept-booking", async ({ bookingId }) => {
      try {
        if (socket.user.role !== "driver") return;

        const result = await acceptBooking(bookingId, socket.user._id);
        socket.emit("booking-accepted-success", result);

        // Driver joins the booking room for real-time status updates
        socket.join(bookingId);

        // Emit to the booking room (for anyone who joined it)
        io.to(bookingId).emit("booking-updated", result.booking);

        // Also emit directly to the customer by user ID, in case they
        // haven't joined the booking room yet (e.g. still on the
        // BookRide waiting screen).
        const customerId = result.booking.customer?._id?.toString() || result.booking.customer?.toString();
        if (customerId) {
          io.to(customerId).emit("booking-updated", result.booking);
        }

        // Fan out to the admin ops room for the live booking queues.
        io.to("admins").emit("booking-updated", result.booking);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // Driver reject booking
    socket.on("reject-booking", async ({ bookingId }) => {
      try {
        if (socket.user.role !== "driver") return;

        await rejectBooking(bookingId, socket.user._id);
        socket.emit("booking-rejected");
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // Ride status updates (driver only)
    const handleRideStatus = async (status, { bookingId }) => {
      try {
        if (socket.user.role !== "driver") return;

        const booking = await updateRideStatus(bookingId, socket.user._id, status);
        io.to(bookingId).emit("ride-status-updated", booking);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    };

    socket.on("ride-accepted", (data) => handleRideStatus("Accepted", data));
    socket.on("ride-started", (data) => handleRideStatus("Started", data));
    socket.on("ride-on-the-way", (data) => handleRideStatus("On The Way", data));
    socket.on("ride-completed", (data) => handleRideStatus("Completed", data));
    socket.on("driver-arrived", (data) => handleRideStatus("Arrived", data));

    // Disconnect
    // VERBOSE: Do NOT force driver offline on disconnect/browser close.
    // Driver stays online (auto-online on next connect) and only becomes
    // busy (isAvailable=false) when actually on a trip (currentRide set).
    // Trip completion (booking.service completeRide) flips back to online/available.
    // This allows web-push to still reach the driver even when the tab is closed
    // and dispatch (isOnline+isAvailable check) to keep matching until trip starts.
    socket.on("disconnect", async () => {
      try {
        clearTimeout(timeout);

        if (socket.user?.role === "driver") {
          console.log(`[driver-disconnect] user=${socket.user._id} kept online (not forced offline)`);
          // Intentionally NOT setting isOnline/isAvailable false here.
          // Driver will be marked available/unavailable via trip lifecycle.
        }

        removeUser(socket.id);
        console.log("Socket Disconnected:", socket.id);
      } catch (error) {
        console.error(error);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized.");
  return io;
};
