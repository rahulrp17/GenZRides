import express from "express";
import { estimateFare } from "../controllers/fare.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { fareEstimateSchema } from "../validators/common.validator.js";
import { guestSearchLimiter } from "../config/redisRateLimiter.js";

const router = express.Router();

// Public guest estimate (no JWT; same controller/service/validation)
router.post(
  "/guest/estimate",
  guestSearchLimiter,
  validate(fareEstimateSchema),
  estimateFare
);

router.post(
  "/estimate",
  authenticate,
  validate(fareEstimateSchema),
  estimateFare
);

export default router;
