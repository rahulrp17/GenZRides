import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import { createOrderSchema, verifyPaymentSchema } from "../validators/payment.validator.js";
import {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentById,
  refundPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", authenticate, authorize("customer"), validate(createOrderSchema), createOrder);
router.post("/verify", authenticate, authorize("customer"), validate(verifyPaymentSchema), verifyPayment);
router.get("/history", authenticate, authorize("customer"), getPaymentHistory);
router.get("/:id", authenticate, validateParams(idParamSchema), getPaymentById);
router.post("/refund/:id", authenticate, authorize("admin"), validateParams(idParamSchema), refundPayment);

export default router;
