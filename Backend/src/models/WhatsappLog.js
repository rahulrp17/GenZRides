import mongoose from "mongoose";

// Idempotency ledger for admin WhatsApp booking alerts.
// Same partial-unique policy as EmailLog — only `sent` is unique so
// transient Meta API failures can be retried.
const whatsappLogSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    to: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["sent", "failed", "skipped"],
      default: "sent",
      index: true,
    },

    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

whatsappLogSchema.index(
  { booking: 1 },
  { unique: true, partialFilterExpression: { status: "sent" } }
);

export default mongoose.model("WhatsappLog", whatsappLogSchema);
