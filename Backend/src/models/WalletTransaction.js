import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
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
      index: true,
    },
    type: {
      type: String,
      enum: ["Ride", "Tip", "Bonus", "Adjustment", "Withdrawal", "Refund"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      default: 0,
    },
    balanceAfter: {
      type: Number,
      default: 0,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Completed",
    },
    referenceId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

walletTransactionSchema.index({ driver: 1, createdAt: -1 });
walletTransactionSchema.index({ wallet: 1, createdAt: -1 });
walletTransactionSchema.index({ type: 1, createdAt: -1 });
walletTransactionSchema.index({ booking: 1 });
// Idempotency: prevents duplicate wallet credits/tips for the same reference
// (e.g. concurrent completion or double client calls). Sparseness allows
// transactions without a reference id to coexist.
walletTransactionSchema.index(
  { driver: 1, referenceId: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model("WalletTransaction", walletTransactionSchema);
