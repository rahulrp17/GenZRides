import crypto from "crypto";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import { notifyUser } from "../services/notification.service.js";
import { getRedisClient } from "../config/redis.js";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

const verifyWebhookSignature = (rawBody, signature) => {
  if (!WEBHOOK_SECRET) {
    console.error("RAZORPAY_WEBHOOK_SECRET not configured");
    return false;
  }
  if (typeof signature !== "string" || signature.length === 0) {
    return false;
  }
  // Razorpay sends the HMAC as a hex digest; compare against the hex form.
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const provided = Buffer.from(signature, "utf8");

  // Length check first to avoid a throwing timingSafeEqual on unequal lengths.
  if (provided.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(provided, expectedBuf);
};

const checkIdempotency = async (eventId) => {
  if (!eventId) return false;
  try {
    const redis = getRedisClient();
    const key = `webhook:idempotency:${eventId}`;
    // Atomic SET with NX: returns "OK" only if the key did not already exist.
    const result = await redis.set(key, "1", "EX", 86400, "NX");
    return result !== "OK"; // true => already processed
  } catch {
    return false; // If Redis unavailable, process anyway (handlers are idempotent)
  }
};

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).json({ success: false, message: "Missing signature" });
    }

    const rawBody = req.body.toString("utf8");

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("Invalid webhook signature");
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    const event = JSON.parse(rawBody);

    // Idempotency check
    const eventId = event.id;
    if (await checkIdempotency(eventId)) {
      return res.status(200).json({ success: true, message: "Already processed" });
    }

    switch (event.event) {
      case "payment.captured": {
        const paymentEntity = event.payload.payment.entity;
        await handlePaymentCaptured(paymentEntity);
        break;
      }
      case "payment.failed": {
        const paymentEntity = event.payload.payment.entity;
        await handlePaymentFailed(paymentEntity);
        break;
      }
      case "refund.created": {
        const refundEntity = event.payload.refund.entity;
        await handleRefundCreated(refundEntity);
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};

const handlePaymentCaptured = async (paymentEntity) => {
  const order_id = paymentEntity.order_id;

  const payment = await Payment.findOne({ razorpayOrderId: order_id });
  if (!payment) {
    console.error("Payment not found for order:", order_id);
    return;
  }

  if (payment.status === "Paid") return; // Idempotent: already processed

  payment.razorpayPaymentId = paymentEntity.id;
  payment.status = "Paid";
  payment.verified = true;
  payment.paidAt = new Date(paymentEntity.created_at * 1000);
  payment.method = paymentEntity.method || "Unknown";
  await payment.save();

  const booking = await Booking.findById(payment.booking);
  if (booking && booking.paymentStatus !== "Paid") {
    booking.paymentStatus = "Paid";
    await booking.save();

    await notifyUser({
      user: booking.customer,
      title: "Payment Confirmed",
      message: `Payment of ₹${payment.amount / 100} confirmed.`,
      type: "Payment",
      booking: booking._id,
    });
  }
};

const handlePaymentFailed = async (paymentEntity) => {
  const order_id = paymentEntity.order_id;

  const payment = await Payment.findOne({ razorpayOrderId: order_id });
  if (!payment) return;

  if (payment.status === "Failed") return; // Idempotent

  payment.status = "Failed";
  payment.failureReason = paymentEntity.error_description || "Payment failed";
  await payment.save();

  const booking = await Booking.findById(payment.booking);
  if (booking && booking.paymentStatus !== "Failed") {
    booking.paymentStatus = "Failed";
    await booking.save();
  }
};

const handleRefundCreated = async (refundEntity) => {
  const payment = await Payment.findOne({ razorpayPaymentId: refundEntity.payment_id });
  if (!payment) return;

  if (payment.status === "Refunded") return; // Idempotent

  payment.status = "Refunded";
  payment.refundAmount = refundEntity.amount / 100;
  payment.refundedAt = new Date(refundEntity.created_at * 1000);
  await payment.save();

  const booking = await Booking.findById(payment.booking);
  if (booking && booking.paymentStatus !== "Refunded") {
    booking.paymentStatus = "Refunded";
    await booking.save();
  }
};
