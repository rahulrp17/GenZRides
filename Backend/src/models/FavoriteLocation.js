import mongoose from "mongoose";

const favoriteLocationSchema = new mongoose.Schema(
  {
    /* ==========================================
       USER
    ========================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ==========================================
       LABEL
    ========================================== */

    label: {
      type: String,
      enum: ["Home", "Work", "Other"],
      required: true,
    },

    // Used only when label = Other
    nickname: {
      type: String,
      default: null,
      trim: true,
      maxlength: 50,
    },

    /* ==========================================
       ADDRESS
    ========================================== */

    address: {
      type: String,
      required: true,
      trim: true,
    },

    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    /* ==========================================
       GEO LOCATION
    ========================================== */

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    /* ==========================================
       DEFAULT LOCATION
    ========================================== */

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================
   INDEXES
========================================== */

// Geo queries
favoriteLocationSchema.index({
  location: "2dsphere",
});

// Prevent duplicate Home/Work labels per user
favoriteLocationSchema.index(
  {
    user: 1,
    label: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      label: {
        $in: ["Home", "Work"],
      },
    },
  }
);

export default mongoose.model(
  "FavoriteLocation",
  favoriteLocationSchema
);