import mongoose from "mongoose";

const withdrawalRequestSchema = new mongoose.Schema(
  {
    /* ==========================================
       DRIVER
    ========================================== */

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriverProfile",
      required: true,
      index: true,
    },

    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriverWallet",
      required: true,
    },

    /* ==========================================
       AMOUNT
    ========================================== */

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    /* ==========================================
       BANK DETAILS
    ========================================== */

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    accountHolder: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    /* ==========================================
       STATUS
    ========================================== */

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Processing",
      ],
      default: "Pending",
      index: true,
    },

    /* ==========================================
       ADMIN REMARKS
    ========================================== */

    remarks: {
      type: String,
      default: null,
      trim: true,
    },

    /* ==========================================
       PAYMENT DETAILS
    ========================================== */

    transactionId: {
      type: String,
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: [
        "Bank Transfer",
        "UPI",
        "Cash",
      ],
      default: "Bank Transfer",
    },

    /* ==========================================
       ADMIN
    ========================================== */

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* ==========================================
       TIMESTAMPS
    ========================================== */

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
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

withdrawalRequestSchema.index({
  driver: 1,
  status: 1,
});

export default mongoose.model(
  "WithdrawalRequest",
  withdrawalRequestSchema
);