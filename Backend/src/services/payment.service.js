import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import { notifyUser } from "./notification.service.js";

const PAYMENT_TIMEOUT = 15000;

export const createOrder = async (bookingId, customerId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found.");
  if (booking.customer.toString() !== customerId.toString()) throw new Error("Unauthorized.");
  if (booking.paymentStatus === "Paid") throw new Error("Booking already paid.");

  const options = {
    amount: Math.round(booking.estimatedFare * 100),
    currency: "INR",
    receipt: `booking_${booking._id}`,
    notes: { bookingId: booking._id.toString(), customerId: customerId.toString() },
  };

  const order = await Promise.race([
    razorpay.orders.create(options),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Razorpay timeout")), PAYMENT_TIMEOUT)),
  ]);

  await Payment.create({
    booking: booking._id,
    customer: booking.customer,
    driver: booking.driver,
    razorpayOrderId: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    status: "Created",
    notes: order.notes,
  });

  return order;
};

export const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new Error("Missing payment verification parameters.");
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error("Payment gateway not configured.");

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest();

  const provided = Buffer.from(razorpay_signature, "utf8");
  if (provided.length !== generatedSignature.length || !crypto.timingSafeEqual(provided, generatedSignature)) {
    throw new Error("Invalid payment signature.");
  }

  // Atomic, idempotent transition: only the first verification moves the
  // payment to "Paid". Concurrent/duplicate verifications are no-ops.
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id, status: { $ne: "Paid" } },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "Paid",
      verified: true,
      paidAt: new Date(),
    },
    { new: true }
  );

  if (!payment) {
    const existing = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (existing && existing.status === "Paid") {
      const booking = await Booking.findById(existing.booking);
      return { success: true, payment: existing, booking, alreadyVerified: true };
    }
    throw new Error("Payment not found.");
  }

  const booking = await Booking.findById(payment.booking);
  if (booking && booking.paymentStatus !== "Paid") {
    booking.paymentStatus = "Paid";
    await booking.save();
  }

  return { success: true, payment, booking };
};

export const getPaymentHistory = async (customerId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find({ customer: customerId })
      .populate("booking", "bookingStatus finalFare pickup drop createdAt paymentMethod")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments({ customer: customerId }),
  ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPaymentById = async (paymentId, user) => {
  const payment = await Payment.findById(paymentId)
    .populate("booking")
    .populate("customer", "name email phone")
    .populate({ path: "driver", populate: { path: "user", select: "name phone" } })
    .lean();

  if (!payment) throw new Error("Payment not found.");

  // Authorization: only the paying customer or an admin may view.
  if (user && user.role !== "admin") {
    if (!payment.customer || payment.customer._id.toString() !== user._id.toString()) {
      throw new Error("You are not authorized to view this payment.");
    }
  }
  return payment;
};

export const refundPayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("Payment not found.");
  if (payment.status !== "Paid") throw new Error("Only paid transactions can be refunded.");

  const refund = await Promise.race([
    razorpay.payments.refund(payment.razorpayPaymentId),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Razorpay refund timeout")), PAYMENT_TIMEOUT)),
  ]);

  payment.status = "Refunded";
  payment.refundedAt = new Date();
  await payment.save();

  const booking = await Booking.findById(payment.booking);
  if (booking) {
    booking.paymentStatus = "Refunded";
    await booking.save();
  }

  return refund;
};
