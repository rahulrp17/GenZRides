import mongoose from "mongoose";

// Dedupe ledger for inbound admin WhatsApp actions. Meta retries webhook
// deliveries, so the same message id must never verify/cancel twice.
// Documents auto-expire after 7 days (actions are one-shot by nature).
const whatsappInboundSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    from: {
      type: String,
      required: true,
      trim: true,
    },

    action: {
      type: String,
      enum: ["verify", "cancel", "status", "help", "ignored"],
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

whatsappInboundSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model("WhatsappInbound", whatsappInboundSchema);
