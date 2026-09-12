import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";
import { bookingIdParamSchema } from "../validators/common.validator.js";
import { rateDriverSchema } from "../validators/rating.validator.js";
import { rateDriver } from "../controllers/rating.controller.js";

const router = express.Router();

router.post(
  "/:bookingId",
  authenticate,
  validateParams(bookingIdParamSchema),
  validate(rateDriverSchema),
  rateDriver
);

export default router;
