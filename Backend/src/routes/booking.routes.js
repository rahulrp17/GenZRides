import express from "express";
import {
  createBooking,
  createGuestBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  driverCancelBooking,
  acceptBooking,
  reachPickup,
  markArrived,
  startRide,
  reachDestination,
  updatePaymentStatus,
  completeRide,
  getAvailableBookings,
  addDriverTip,
} from "../controllers/booking.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, validateParams, validateQuery } from "../middleware/validate.middleware.js";
import { paginationQuerySchema } from "../validators/common.validator.js";
import {
  createBookingSchema,
  guestCreateBookingSchema,
  cancelBookingSchema,
  driverCancelBookingSchema,
  updatePaymentSchema,
  addTipSchema,
  bookingIdSchema,
} from "../validators/booking.validator.js";
import { guestBookingLimiter } from "../config/redisRateLimiter.js";

const router = express.Router();

// Public guest booking (no JWT; strict per-IP rate limit + validation)
router.post("/guest", guestBookingLimiter, validate(guestCreateBookingSchema), createGuestBooking);

// Customer routes
router.post("/", authenticate, authorize("customer"), validate(createBookingSchema), createBooking);
router.get("/my-bookings", authenticate, authorize("customer"), validateQuery(paginationQuerySchema), getMyBookings);
router.get("/available", authenticate, authorize("driver"), validateQuery(paginationQuerySchema), getAvailableBookings);
router.get("/:id", authenticate, validateParams(bookingIdSchema), getBookingById);
router.patch("/:id/cancel", authenticate, authorize("customer"), validateParams(bookingIdSchema), validate(cancelBookingSchema), cancelBooking);
router.post("/:id/tip", authenticate, authorize("customer"), validateParams(bookingIdSchema), validate(addTipSchema), addDriverTip);

// Driver routes
router.patch("/:id/accept", authenticate, authorize("driver"), validateParams(bookingIdSchema), acceptBooking);
router.patch("/:id/driver-cancel", authenticate, authorize("driver"), validateParams(bookingIdSchema), validate(driverCancelBookingSchema), driverCancelBooking);
router.patch("/:id/reached", authenticate, authorize("driver"), validateParams(bookingIdSchema), reachPickup);
router.patch("/:id/arrived", authenticate, authorize("driver"), validateParams(bookingIdSchema), markArrived);
router.patch("/:id/start", authenticate, authorize("driver"), validateParams(bookingIdSchema), startRide);
router.patch("/:id/reach-destination", authenticate, authorize("driver"), validateParams(bookingIdSchema), reachDestination);
router.patch("/:id/payment", authenticate, authorize("driver"), validateParams(bookingIdSchema), validate(updatePaymentSchema), updatePaymentStatus);
router.patch("/:id/complete", authenticate, authorize("driver"), validateParams(bookingIdSchema), completeRide);

export default router;
