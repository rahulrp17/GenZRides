import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateParams } from "../middleware/validate.middleware.js";
import { bookingIdParamSchema } from "../validators/common.validator.js";

import {
  dispatchBooking,
  acceptBooking,
  rejectBooking,
  sendToNextDriver,
  handleDriverTimeout,
} from "../controllers/dispatch.controller.js";

const router = express.Router();

router.post(
  "/:bookingId",
  authenticate,
  authorize("admin"),
  validateParams(bookingIdParamSchema),
  dispatchBooking
);

router.patch(
  "/:bookingId/accept",
  authenticate,
  authorize("driver"),
  validateParams(bookingIdParamSchema),
  acceptBooking
);

router.patch(
  "/:bookingId/reject",
  authenticate,
  authorize("driver"),
  validateParams(bookingIdParamSchema),
  rejectBooking
);

router.patch(
  "/:bookingId/next",
  authenticate,
  authorize("admin"),
  validateParams(bookingIdParamSchema),
  sendToNextDriver
);

router.patch(
  "/:bookingId/timeout",
  authenticate,
  authorize("admin"),
  validateParams(bookingIdParamSchema),
  handleDriverTimeout
);

export default router;
