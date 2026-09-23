import mongoose from "mongoose";

/* ===========================================================
   VISITOR — temporary guest intent, NOT a booking.
   "Book Now" stores the guest's trip + contact here only (no
   Booking document, no dispatch, no driver visibility). The
   visitor converts into a real instant booking when the guest
   presses "Confirm Booking" (POST /bookings/guest/confirm), or
   expires 10 minutes after creation. Retained afterwards so the
   admin Visitors page keeps a full audit trail (no TTL delete).
=========================================================== */

const visitorLocationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const visitorSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: true,
      trim: true,
    },

    guestEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    guestPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    pickup: {
      type: visitorLocationSchema,
      required: true,
    },

    drop: {
      type: visitorLocationSchema,
      required: true,
    },

    pickupDateTime: {
      type: Date,
      required: true,
    },

    tripType: {
      type: String,
      enum: ["One Way", "Round Trip", "Airport Pickup", "Airport Drop"],
      default: "One Way",
    },

    days: {
      type: Number,
      default: 1,
      min: 1,
    },

    returnDateTime: {
      type: Date,
      default: null,
    },

    vehicleType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    customerNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Expired", "Cancelled"],
      default: "Pending",
      index: true,
    },

    // Short human-friendly handle shown in the confirm modal
    // (e.g. "VST-8K2QXA").
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Set exactly once when the visit converts to a booking.
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    // Confirm window: 10 minutes from creation.
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

visitorSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Visitor", visitorSchema);
