import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateParams } from "../middleware/validate.middleware.js";
import { bookingIdParamSchema } from "../validators/common.validator.js";
import { downloadInvoice } from "../controllers/invoice.controller.js";

const router = express.Router();

router.get(
  "/:bookingId",
  authenticate,
  authorize("customer", "driver", "admin"),
  validateParams(bookingIdParamSchema),
  downloadInvoice
);

export default router;
