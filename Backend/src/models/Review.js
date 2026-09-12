import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    /* ==========================================
       BOOKING
    ========================================== */

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true,
    },

    /* ==========================================
       CUSTOMER
    ========================================== */

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ==========================================
       DRIVER
    ========================================== */

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriverProfile",
      required: true,
      index: true,
    },

    /* ==========================================
       RATING
    ========================================== */

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    /* ==========================================
       REVIEW
    ========================================== */

    review: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    /* ==========================================
       MODERATION
    ========================================== */

    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },

    hiddenReason: {
      type: String,
      default: null,
      trim: true,
    },

    hiddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    hiddenAt: {
      type: Date,
      default: null,
    },

    /* ==========================================
       ADMIN REPLY (Optional)
    ========================================== */

    adminReply: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================
   INDEXES
========================================== */

reviewSchema.index({
  driver: 1,
  createdAt: -1,
});

export default mongoose.model("Review", reviewSchema);