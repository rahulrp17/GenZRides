import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
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

const bookingSchema = new mongoose.Schema(
  {
    /* ==========================
       CUSTOMER & DRIVER
    ========================== */

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriverProfile",
      default: null,
      index: true,
    },

    driverQueue: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DriverProfile",
      },
    ],

    currentDriverIndex: {
      type: Number,
      default: 0,
      min: 0,
    },

    requestExpiresAt: {
      type: Date,
      default: null,
    },

    driverRequestStatus: {
      type: String,
      enum: ["Waiting", "Accepted", "Rejected", "Expired", "Timeout"],
      default: "Waiting",
    },

    /* ==========================
       LOCATIONS
    ========================== */

    pickup: {
      type: locationSchema,
      required: true,
    },

    drop: {
      type: locationSchema,
      required: true,
    },

    /* ==========================
       TRIP
    ========================== */

    pickupDateTime: {
      type: Date,
      required: true,
      index: true,
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

    // If you use Vehicle collection
    vehicleType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    /* ==========================
       ROUTE
    ========================== */

    distance: {
      type: Number,
      default: 0,
      min: 0,
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    routePolyline: {
      type: String,
      default: null,
    },

    /* ==========================
       FARE
    ========================== */

    estimatedFare: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalFare: {
      type: Number,
      default: 0,
      min: 0,
    },

    tipAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Online"],
      default: "Cash",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Unpaid", "Failed", "Refunded"],
      default: "Pending",
    },

    /* ==========================
       REVIEW
    ========================== */

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    review: {
      type: String,
      default: null,
      trim: true,
    },

    /* ==========================
       BOOKING STATUS
    ========================== */

    bookingStatus: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "On The Way",
        "Arrived",
        "Started",
        "Reached",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },

    cancelReason: {
      type: String,
      default: null,
      trim: true,
    },

    cancelledBy: {
      type: String,
      enum: ["Customer", "Driver", "Admin"],
      default: null,
    },

    rejectedDrivers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DriverProfile",
      },
    ],

    dispatchAttempts: {
      type: Number,
      default: 0,
    },

    /* ==========================
       TIMESTAMPS
    ========================== */

    driverAssignedAt: {
      type: Date,
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    onTheWayAt: {
      type: Date,
      default: null,
    },

    arrivedAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    reachedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    /* ==========================
       NOTES
    ========================== */

    customerNotes: {
      type: String,
      default: null,
      trim: true,
    },

    /* ==========================
       GUEST CONTACT SNAPSHOT
       What the guest typed at booking time (guest bookings only).
       The linked customer account is keyed by phone; this snapshot
       preserves the exact contact details per booking.
    ========================== */

    guestName: {
      type: String,
      default: null,
      trim: true,
    },

    guestEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },

    guestPhone: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

/* ==========================
   INDEXES
========================== */

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ driver: 1, bookingStatus: 1 });
// Perf: getAvailableBookings filter + sort
bookingSchema.index({ bookingStatus: 1, vehicleType: 1, driver: 1, createdAt: -1 });
// Perf: daily driver cancel count
bookingSchema.index({ driver: 1, cancelledBy: 1, cancelledAt: 1 });
// Perf: admin history regex fallback + pickup/drop text search
bookingSchema.index({ "pickup.address": "text", "drop.address": "text" });
bookingSchema.index({ createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);
