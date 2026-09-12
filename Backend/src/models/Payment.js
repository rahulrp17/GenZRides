import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    /* ===============================
       BOOKING
    =============================== */

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriverProfile",
      default: null,
      index: true,
    },

    /* ===============================
       PAYMENT GATEWAY
    =============================== */

    gateway: {
      type: String,
      enum: ["Razorpay"],
      default: "Razorpay",
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
      trim: true,
    },

    razorpaySignature: {
      type: String,
      default: null,
      trim: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    /* ===============================
       PAYMENT DETAILS
    =============================== */

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    method: {
      type: String,
      enum: [
        "UPI",
        "Card",
        "NetBanking",
        "Wallet",
        "Cash",
        "Unknown",
      ],
      default: "Unknown",
    },

    status: {
      type: String,
      enum: [
        "Created",
        "Paid",
        "Failed",
        "Refunded",
      ],
      default: "Created",
      index: true,
    },

    /* ===============================
       REFUND
    =============================== */

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ===============================
       RECEIPT
    =============================== */

    receipt: {
      type: String,
      default: null,
      trim: true,
    },

    transactionReference: {
      type: String,
      default: null,
    },

    /* ===============================
       FAILURE
    =============================== */

    failureReason: {
      type: String,
      default: null,
    },

    /* ===============================
       TIMESTAMPS
    =============================== */

    paidAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    /* ===============================
       EXTRA NOTES
    =============================== */

    notes: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/* ===============================
   INDEXES
=============================== */

paymentSchema.index({
  booking: 1,
  customer: 1,
});

export default mongoose.model(
  "Payment",
  paymentSchema
);