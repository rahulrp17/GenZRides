import mongoose from "mongoose";

// One document per browser/device subscription (Web Push / Push API).
// Created when the user enables browser notifications on the
// Notifications page; removed on opt-out or when the push service
// reports the subscription as expired (404/410).
const pushSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    endpoint: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    keys: {
      p256dh: {
        type: String,
        required: true,
      },

      auth: {
        type: String,
        required: true,
      },
    },

    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

pushSubscriptionSchema.index({ user: 1, endpoint: 1 });

export default mongoose.model(
  "PushSubscription",
  pushSubscriptionSchema
);
