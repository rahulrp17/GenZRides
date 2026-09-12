import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    /* ==========================================
       USER
    ========================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ==========================================
       CONTENT
    ========================================== */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    /* ==========================================
       TYPE
    ========================================== */

    type: {
      type: String,
      enum: [
        "Booking",
        "Ride",
        "Payment",
        "Wallet",
        "Review",
        "Withdrawal",
        "Promotion",
        "System",
      ],
      default: "System",
      index: true,
    },

    /* ==========================================
       RELATED DATA
    ========================================== */

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* ==========================================
       STATUS
    ========================================== */

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================
   INDEXES
========================================== */

notificationSchema.index({
  user: 1,
  isRead: 1,
});

notificationSchema.index({
  user: 1,
  createdAt: -1,
});

notificationSchema.index({
  createdAt: -1,
});

// TTL: auto-expire after 90 days to prevent unbounded growth
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

export default mongoose.model(
  "Notification",
  notificationSchema
);