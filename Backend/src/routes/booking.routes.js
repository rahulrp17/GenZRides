import express from "express";
import {
  createBooking,
  createGuestBooking,
  createVisit,
  confirmVisit,
  lookupGuestBooking,
  guestCancelBooking,
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
  getMyDriverBookings,
  addDriverTip,
} from "../controllers/booking.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, validateParams, validateQuery } from "../middleware/validate.middleware.js";
import { paginationQuerySchema } from "../validators/common.validator.js";
import {
  createBookingSchema,
  guestCreateBookingSchema,
  guestVisitSchema,
  guestConfirmSchema,
  guestLookupSchema,
  guestCancelSchema,
  cancelBookingSchema,
  driverCancelBookingSchema,
  updatePaymentSchema,
  addTipSchema,
  bookingIdSchema,
} from "../validators/booking.validator.js";
import { guestBookingLimiter } from "../config/redisRateLimiter.js";

const router = express.Router();

// Public guest booking (no JWT; strict per-IP rate limit + validation)
// "Book Now" stores a temporary visitor hold only; "Confirm Booking"
// converts the hold into a real instant booking awaiting verification.
router.post("/guest", guestBookingLimiter, validate(guestCreateBookingSchema), createGuestBooking);
router.post("/guest/visit", guestBookingLimiter, validate(guestVisitSchema), createVisit);
router.post("/guest/confirm", guestBookingLimiter, validate(guestConfirmSchema), confirmVisit);

// Public guest self-service (no JWT): ref + phone prove ownership.
router.post("/guest/lookup", guestBookingLimiter, validate(guestLookupSchema), lookupGuestBooking);
router.patch("/guest/:id/cancel", guestBookingLimiter, validateParams(bookingIdSchema), validate(guestCancelSchema), guestCancelBooking);

// Customer routes
router.post("/", authenticate, authorize("customer"), validate(createBookingSchema), createBooking);
router.get("/my-bookings", authenticate, authorize("customer"), validateQuery(paginationQuerySchema), getMyBookings);
router.get("/available", authenticate, authorize("driver"), validateQuery(paginationQuerySchema), getAvailableBookings);
// Named before "/:id" so the id validator never swallows it.
router.get("/my-driver-bookings", authenticate, authorize("driver"), validateQuery(paginationQuerySchema), getMyDriverBookings);
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
