import mongoose from "mongoose";

// Idempotency ledger for admin WhatsApp booking alerts.
// One document per booking (unique index) so retries / duplicate
// submissions can never send the same alert twice.
const whatsappLogSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true,
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

export default mongoose.model("WhatsappLog", whatsappLogSchema);
