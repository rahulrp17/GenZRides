import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    image: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: null,
      trim: true,
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },

    luggage: {
      type: Number,
      default: 2,
      min: 0,
    },

    // ── Trip-type-specific base fare ──────────────────────────
    // Minimum charge for the trip. The base fare is always added
    // on top of the distance-based charge.
    oneWayBaseFare: {
      type: Number,
      required: true,
      min: 0,
    },
    roundTripBaseFare: {
      type: Number,
      required: true,
      min: 0,
    },

    // ── Trip-type-specific base (included) km ─────────────────
    // Kilometers covered by the base fare. Distance beyond this
    // is charged at the per-km rate. 0 = full distance is charged.
    oneWayBaseKm: {
      type: Number,
      default: 0,
      min: 0,
    },
    roundTripBaseKm: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Trip-type-specific per-km rates ───────────────────────
    oneWayPerKm: {
      type: Number,
      required: true,
      min: 0,
    },
    roundTripPerKm: {
      type: Number,
      required: true,
      min: 0,
    },

    waitingChargePerMinute: {
      type: Number,
      default: 0,
      min: 0,
    },

    driverAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Per-vehicle high-distance driver bata override (₹/day past the
    // policy threshold). Null/0/absent falls back to the fare policy
    // default in FARE_CONFIG.driverBataHighDistance.
    driverBataHighDistance: {
      type: Number,
      default: null,
      min: 0,
    },

    nightCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumDistance: {
      type: Number,
      default: 1,
      min: 1,
    },

    isAC: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

vehicleSchema.index({
  isActive: 1,
});

export default mongoose.model(
  "Vehicle",
  vehicleSchema
);