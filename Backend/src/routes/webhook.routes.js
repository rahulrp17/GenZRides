import express from "express";
import { handleRazorpayWebhook } from "../controllers/webhook.controller.js";
import {
  verifyWhatsappWebhook,
  handleWhatsappWebhook,
} from "../controllers/whatsappWebhook.controller.js";

const router = express.Router();

router.post("/razorpay", handleRazorpayWebhook);

// Meta WhatsApp webhook (admin quick actions on booking alerts).
router.get("/whatsapp", verifyWhatsappWebhook);
router.post("/whatsapp", handleWhatsappWebhook);

export default router;
