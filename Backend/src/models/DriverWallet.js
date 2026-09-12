import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Ride", "Tip", "Bonus", "Adjustment", "Withdrawal", "Refund"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
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

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
);

const driverWalletSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriverProfile",
      required: true,
      unique: true,
      index: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    lifetimeEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingWithdrawal: {
      type: Number,
      default: 0,
    },
    
    transactions: {
      type: [transactionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

/* ==========================================
   INDEXES
========================================== */

/* ==========================================
   VIRTUAL
========================================== */

driverWalletSchema.virtual("totalTransactions").get(function () {
  return this.transactions.length;
});

/* ==========================================
   INCLUDE VIRTUALS
========================================== */

driverWalletSchema.set("toJSON", {
  virtuals: true,
});

driverWalletSchema.set("toObject", {
  virtuals: true,
});

export default mongoose.model("DriverWallet", driverWalletSchema);
