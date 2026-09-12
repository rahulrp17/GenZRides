import express from "express";
import {
  createReview,
  getMyReviews,
  getDriverReviews,
} from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";
import { bookingIdParamSchema } from "../validators/common.validator.js";
import { createReviewSchema } from "../validators/review.validator.js";

const router = express.Router();

router.post(
  "/:bookingId",
  authenticate,
  authorize("customer"),
  validateParams(bookingIdParamSchema),
  validate(createReviewSchema),
  createReview
);
router.get("/my", authenticate, authorize("customer"), getMyReviews);
router.get("/driver", authenticate, authorize("driver"), getDriverReviews);

export default router;
