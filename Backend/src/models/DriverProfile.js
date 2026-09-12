import mongoose from "mongoose";

const driverProfileSchema = new mongoose.Schema(
  {
    /* ===============================
       USER ACCOUNT
    =============================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    /* ===============================
       PERSONAL DETAILS
    =============================== */

    aadhaarNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{12}$/, "Invalid Aadhaar Number"],
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    /* ===============================
       VEHICLE DETAILS
    =============================== */

    vehicleType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },

    vehicleBrand: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleColor: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleYear: {
      type: Number,
      required: true,
      min: 1990,
      max: new Date().getFullYear() + 1,
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{4}$/,
        "Invalid Vehicle Number",
      ],
    },

    seats: {
      type: Number,
      default: 4,
      min: 1,
      max: 10,
    },

    /* ===============================
       DRIVER STATUS
    =============================== */

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },

    isAvailable: {
      type: Boolean,
      default: false,
      index: true,
    },

    currentRide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    /* ===============================
       LIVE LOCATION
    =============================== */

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0], // [longitude, latitude]
      },
    },

    /* ===============================
       DRIVER STATISTICS
    =============================== */

    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },

    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalTrips: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedTrips: {
      type: Number,
      default: 0,
      min: 0,
    },

    cancelledTrips: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDistance: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    todayEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    weekEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    monthEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalTips: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ===============================
       DOCUMENTS
    =============================== */

    documents: {
      profilePhoto: {
        type: String,
        default: null,
      },

      drivingLicense: {
        type: String,
        default: null,
      },

      aadhaarFront: {
        type: String,
        default: null,
      },

      aadhaarBack: {
        type: String,
        default: null,
      },

      rcBook: {
        type: String,
        default: null,
      },

      insurance: {
        type: String,
        default: null,
      },

      pollutionCertificate: {
        type: String,
        default: null,
      },

      vehicleImages: [
        {
          type: String,
        },
      ],

      documentVerification: {
        type: String,
        enum: ["Pending", "Verified", "Rejected"],
        default: "Pending",
      },

      rejectionReason: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ==========================================
   GEO INDEX
========================================== */

driverProfileSchema.index({
  currentLocation: "2dsphere",
});

/* ==========================================
   OTHER INDEXES
========================================== */

driverProfileSchema.index({
  isOnline: 1,
  isAvailable: 1,
});
// Perf: dispatch filter (vehicleType + approval + online/available + geo)
driverProfileSchema.index({
  vehicleType: 1,
  approvalStatus: 1,
  isOnline: 1,
  isAvailable: 1,
});

/* ==========================================
   VIRTUAL: COMPLETION RATE
========================================== */

driverProfileSchema.virtual("completionRate").get(function () {
  const total =
    this.completedTrips + this.cancelledTrips;

  if (total === 0) return 0;

  return Number(
    ((this.completedTrips / total) * 100).toFixed(1)
  );
});

/* ==========================================
   VIRTUAL: CANCELLATION RATE
========================================== */

driverProfileSchema.virtual("cancellationRate").get(function () {
  const total =
    this.completedTrips + this.cancelledTrips;

  if (total === 0) return 0;

  return Number(
    ((this.cancelledTrips / total) * 100).toFixed(1)
  );
});

export default mongoose.model(
  "DriverProfile",
  driverProfileSchema
);