import * as bookingService from "../services/booking.service.js";
import * as dispatchService from "../services/dispatch.service.js";
import { emitToAdmins } from "../services/notification.service.js";
import { getIO } from "../socket/index.js";

/* ===========================================================
   CREATE BOOKING
=========================================================== */

export const createBooking = async (req, res) => {
  try {
    const result = await bookingService.createBooking(
      req.user._id,
      req.body
    );

    // Live admin queue: a new request just entered.
    emitToAdmins("new-booking", result.booking);
    emitToAdmins("admin-counts-updated", null);

    res.status(201).json(result);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   CREATE GUEST BOOKING (no JWT)
=========================================================== */

export const createGuestBooking = async (req, res) => {
  try {
    const result = await bookingService.createGuestBooking(req.body);

    // Live admin queue: a new guest request just entered.
    emitToAdmins("new-booking", result.booking);

    res.status(201).json(result);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   GUEST VISIT (no JWT) — "Book Now" stores a temporary hold only
========================================================== */

export const createVisit = async (req, res) => {
  try {
    const result = await bookingService.createVisit(req.body);

    // Live admin queue: a new visitor hold just entered.
    emitToAdmins("visitor-created", result.visitor);

    res.status(201).json(result);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   GUEST CONFIRM (no JWT) — visit converts to an instant booking
========================================================== */

export const confirmVisit = async (req, res) => {
  try {
    const result = await bookingService.confirmVisit(req.body.visitorId);

    // The visit converted — admins see the hold update plus the new
    // pending-verification instant booking in their live queues.
    emitToAdmins("visitor-updated", {
      visitorId: result.visitorId,
      bookingId: result.booking?._id,
    });
    emitToAdmins("new-booking", result.booking);
    emitToAdmins("instant-booking-pending", result.booking);
    emitToAdmins("admin-counts-updated", null);

    res.status(201).json(result);
  } catch (error) {
    console.error(error);

    const status =
      error.code === 404 ? 404 : error.code === 410 ? 410 : 400;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   GUEST BOOKING LOOKUP (no JWT; ref + phone as identity proof)
=========================================================== */

export const lookupGuestBooking = async (req, res) => {
  try {
    const result = await bookingService.lookupGuestBooking(
      req.body.ref,
      req.body.phone
    );

    res.status(200).json({ success: true, booking: result });
  } catch (error) {
    console.error(error);

    res.status(error.code === 404 ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   GUEST BOOKING CANCEL (no JWT; phone-verified)
=========================================================== */

export const guestCancelBooking = async (req, res) => {
  try {
    const result = await bookingService.guestCancelBooking(
      req.params.id,
      req.body.phone,
      req.body.cancelReason
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(error.code === 404 ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   MY BOOKINGS
   =========================================================== */

export const getMyBookings = async (req, res) => {
  try {
    const result =
      await bookingService.getMyBookings(
        req.user._id,
        req.query
      );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   BOOKING DETAILS
=========================================================== */

export const getBookingById = async (
  req,
  res
) => {
  try {
    const result =
      await bookingService.getBookingById(
        req.params.id,
        req.user
      );

    res.status(200).json(result);
  } catch (error) {
    const isAuthError = /unauthor|not authorized|forbidden/i.test(error.message);
    res.status(isAuthError ? 403 : 404).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   CANCEL BOOKING
=========================================================== */

export const cancelBooking = async (
  req,
  res
) => {
  try {
      const result =
        await bookingService.cancelBooking(
          req.params.id,
          req.user,
          req.body.cancelReason
        );

      try {
        const io = getIO();
        io.to(req.params.id).emit("ride-status-updated", result.booking);
        emitToAdmins("ride-status-updated", result.booking);
        emitToAdmins("admin-counts-updated", null);
      } catch (_) {}

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   DRIVER CANCEL BOOKING
=========================================================== */

export const driverCancelBooking = async (
  req,
  res
) => {
  try {
      const result =
        await bookingService.driverCancelBooking(
          req.params.id,
          req.user._id,
          req.body.cancelReason
        );

      try {
        const io = getIO();
        io.to(req.params.id).emit("ride-status-updated", result.booking);
        emitToAdmins("ride-status-updated", result.booking);
        emitToAdmins("admin-counts-updated", null);
      } catch (_) {}

    res.status(200).json(result);
  } catch (error) {
    const isLimitError = /Daily cancellation limit/i.test(error.message);
    res.status(isLimitError ? 429 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   DRIVER ACCEPT BOOKING (via dispatch)
   =========================================================== */

export const acceptBooking = async (
  req,
  res
) => {
  try {
    const result =
      await dispatchService.acceptBooking(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      message:
        "Booking accepted successfully.",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   DRIVER REACHED PICKUP
=========================================================== */

export const reachPickup = async (
  req,
  res
) => {
  try {
    const result =
      await bookingService.reachPickup(
        req.params.id,
        req.user._id
      );

    // Emit socket event so customer and admin receive real-time updates
    try {
      const io = getIO();
      io.to(req.params.id).emit("ride-status-updated", result.booking);
      emitToAdmins("ride-status-updated", result.booking);
    } catch (_) { /* socket not initialized */ }

    res.status(200).json({
      success: true,
      message: "Driver reached pickup.",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   DRIVER ARRIVED AT PICKUP
=========================================================== */

export const markArrived = async (
  req,
  res
) => {
  try {
    const result =
      await bookingService.markArrived(
        req.params.id,
        req.user._id
      );

    try {
      const io = getIO();
      io.to(req.params.id).emit("ride-status-updated", result.booking);
      emitToAdmins("ride-status-updated", result.booking);
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: "Driver has arrived.",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   START RIDE
=========================================================== */

export const startRide = async (
  req,
  res
) => {
  try {
    const result =
      await bookingService.startRide(
        req.params.id,
        req.user._id
      );

    try {
      const io = getIO();
      io.to(req.params.id).emit("ride-status-updated", result.booking);
      emitToAdmins("ride-status-updated", result.booking);
    } catch (_) {}

    res.status(200).json({
      success: true,
      message:
        "Ride started successfully.",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   REACHED DESTINATION
=========================================================== */

export const reachDestination = async (
  req,
  res
) => {
  try {
    const result =
      await bookingService.reachDestination(
        req.params.id,
        req.user._id
      );

    try {
      const io = getIO();
      io.to(req.params.id).emit("ride-status-updated", result.booking);
      emitToAdmins("ride-status-updated", result.booking);
    } catch (_) {}

    res.status(200).json({
      success: true,
      message:
        "Destination reached successfully.",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   UPDATE PAYMENT STATUS (driver verifies after reaching)
=========================================================== */

export const updatePaymentStatus = async (
  req,
  res
) => {
  try {
    const result =
      await bookingService.updatePaymentStatus(
        req.params.id,
        req.user._id,
        req.body.paymentStatus
      );

    try {
      const io = getIO();
      io.to(req.params.id).emit("ride-status-updated", result.booking);
      emitToAdmins("ride-status-updated", result.booking);
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: `Payment marked as ${req.body.paymentStatus.toLowerCase()}.`,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   COMPLETE RIDE
   =========================================================== */

export const completeRide = async (
  req,
  res
) => {
  try {
    const result =
      await bookingService.completeRide(
        req.params.id,
        req.user._id
      );

    try {
      const io = getIO();
      io.to(req.params.id).emit("ride-status-updated", result.booking);
      emitToAdmins("ride-status-updated", result.booking);
    } catch (_) {}

    res.status(200).json({
      success: true,
      message:
        "Ride completed successfully.",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   AVAILABLE BOOKINGS
=========================================================== */

export const getMyDriverBookings = async (req, res) => {
  try {
    const result = await bookingService.getMyDriverBookings(
      req.user._id,
      {
        page: Number(req.query.page) || 1,
        limit: Math.min(Number(req.query.limit) || 12, 100),
      }
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAvailableBookings =
  async (req, res) => {
    try {
      // Filtered by the calling driver's cab type inside the service.
      // `scope=instant|customer` splits the feed; unverified instant
      // bookings are always excluded by the approval gate.
      const result =
        await bookingService.getAvailableBookings({
          driverUserId: req.user?._id,
          scope: req.query.scope || null,
          limit: Math.min(Number(req.query.limit) || 50, 100),
        });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/* ===========================================================
   ADD DRIVER TIP
=========================================================== */

export const addDriverTip = async (
  req,
  res
) => {
  try {
    const result =
      await bookingService.addDriverTip(
        req.params.id,
        req.user._id,
        Number(req.body.amount)
      );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};