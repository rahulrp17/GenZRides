import mongoose from "mongoose";

// Idempotency ledger for admin booking alert emails.
// Only one `sent` record per booking — `failed`/`skipped` never block a
// retry. A partial unique index enforces the sent deduplication at the DB
// level while allowing transient failures to be retried (critical for prod
// where SMTP can flap). Without this, a single SMTP timeout would create a
// `failed` log with `unique:true` that permanently blocks that booking's
// retry (duplicate-key 11000 on the next `sent` attempt).
const emailLogSchema = new mongoose.Schema(
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

// One `sent` per booking; `failed`/`skipped` never block retries.
emailLogSchema.index(
  { booking: 1 },
  { unique: true, partialFilterExpression: { status: "sent" } }
);

export default mongoose.model("EmailLog", emailLogSchema);
