import DriverProfile from "../models/DriverProfile.js";
import DriverWallet from "../models/DriverWallet.js";
import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import User from "../models/User.js";
import { notifyUser } from "./notification.service.js";

/* ===========================================================
   CREATE DRIVER PROFILE
=========================================================== */

export const createDriverProfile = async (userId, data) => {
  // Check if profile already exists
  const existingProfile = await DriverProfile.findOne({
    user: userId,
  });

  if (existingProfile) {
    throw new Error("Driver profile already exists.");
  }

  // Validate vehicle type
  const vehicle = await Vehicle.findById(data.vehicleType);

  if (!vehicle) {
    throw new Error("Selected vehicle type not found.");
  }

  // Prevent duplicate Aadhaar — allow re-registration if previous was Rejected or Pending
  const aadhaarExists = await DriverProfile.findOne({
    aadhaarNumber: data.aadhaarNumber.trim(),
  });

  if (aadhaarExists) {
    if (aadhaarExists.approvalStatus === "Approved") {
      throw new Error("Aadhaar number already registered.");
    }
    // Rejected or Pending — clean up old profile and allow re-registration
    await DriverWallet.deleteOne({ driver: aadhaarExists._id });
    await DriverProfile.deleteOne({ _id: aadhaarExists._id });
  }

  // Prevent duplicate License — allow overwrite if not Approved
  const licenseExists = await DriverProfile.findOne({
    licenseNumber: data.licenseNumber.trim(),
  });

  if (licenseExists) {
    if (licenseExists.approvalStatus === "Approved") {
      throw new Error("License number already registered.");
    }
    await DriverWallet.deleteOne({ driver: licenseExists._id });
    await DriverProfile.deleteOne({ _id: licenseExists._id });
  }

  // Prevent duplicate Vehicle Number — allow overwrite if not Approved
  const vehicleExists = await DriverProfile.findOne({
    vehicleNumber: data.vehicleNumber.trim().toUpperCase(),
  });

  if (vehicleExists) {
    if (vehicleExists.approvalStatus === "Approved") {
      throw new Error("Vehicle number already registered.");
    }
    await DriverWallet.deleteOne({ driver: vehicleExists._id });
    await DriverProfile.deleteOne({ _id: vehicleExists._id });
  }

  // Create Driver Profile
  const driver = await DriverProfile.create({
    user: userId,

    aadhaarNumber: data.aadhaarNumber.trim(),
    licenseNumber: data.licenseNumber.trim(),

    vehicleType: vehicle._id,

    vehicleBrand: data.vehicleBrand.trim(),
    vehicleModel: data.vehicleModel.trim(),
    vehicleColor: data.vehicleColor.trim(),

    vehicleYear: data.vehicleYear,

    vehicleNumber: data.vehicleNumber.trim().toUpperCase(),

    seats: data.seats || vehicle.seats,

    documents: {
      profilePhoto: data.documents?.profilePhoto || "",
      drivingLicense: data.documents?.drivingLicense || "",
      aadhaarFront: data.documents?.aadhaarFront || "",
      aadhaarBack: data.documents?.aadhaarBack || "",
      rcBook: data.documents?.rcBook || "",
      insurance: data.documents?.insurance || "",
      pollutionCertificate:
        data.documents?.pollutionCertificate || "",
      vehicleImages:
        data.documents?.vehicleImages || [],
    },
  });

  // Create Wallet Automatically
  await DriverWallet.create({
    driver: driver._id,
    balance: 0,
    lifetimeEarnings: 0,
    totalWithdrawn: 0,
    transactions: [],
  });

  // Notify all admins so the pending review shows up in real time
  // (DB notification + socket event; logged-in admins also get a
  // browser push via the existing PushListener).
  try {
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    const driverUser = await User.findById(userId).select("name").lean();
    await Promise.all(
      admins.map((admin) =>
        notifyUser({
          user: admin._id,
          title: "New Driver Registration",
          message: `${driverUser?.name || "A new driver"} submitted documents for approval.`,
          type: "System",
          data: { driverId: driver._id },
        })
      )
    );
  } catch {
    // Admin notification is best-effort; registration must succeed.
  }

  // Return complete profile
  return await DriverProfile.findById(driver._id)
    .populate("user", "-password -refreshToken")
    .populate(
      "vehicleType",
      "name image seats luggage oneWayBaseFare roundTripBaseFare oneWayBaseKm roundTripBaseKm oneWayPerKm roundTripPerKm"
    );
};

/* ===========================================================
   GET DRIVER PROFILE
=========================================================== */

export const getDriverProfile = async (userId) => {
  const profile = await DriverProfile.findOne({
    user: userId,
  })
    .populate("user", "-password -refreshToken")
    .populate("vehicleType");

  if (!profile) {
    throw new Error("Driver profile not found.");
  }

  return profile;
};

/* ===========================================================
   UPDATE DRIVER PROFILE
=========================================================== */

export const updateDriverProfile = async (userId, data) => {
  const profile = await DriverProfile.findOne({
    user: userId,
  });

  if (!profile) {
    throw new Error("Driver profile not found.");
  }

  /* ==========================================
     Vehicle Type Change
  ========================================== */

  if (data.vehicleType) {
    const vehicle = await Vehicle.findById(data.vehicleType);

    if (!vehicle) {
      throw new Error("Vehicle type not found.");
    }

    profile.vehicleType = vehicle._id;

    if (!data.seats) {
      profile.seats = vehicle.seats;
    }
  }

  /* ==========================================
     Duplicate Checks
  ========================================== */

  if (
    data.vehicleNumber &&
    data.vehicleNumber.toUpperCase() !== profile.vehicleNumber
  ) {
    const exists = await DriverProfile.findOne({
      vehicleNumber: data.vehicleNumber.toUpperCase(),
      _id: { $ne: profile._id },
    });

    if (exists) {
      throw new Error("Vehicle number already exists.");
    }

    profile.vehicleNumber = data.vehicleNumber
      .trim()
      .toUpperCase();
  }

  if (
    data.licenseNumber &&
    data.licenseNumber !== profile.licenseNumber
  ) {
    const exists = await DriverProfile.findOne({
      licenseNumber: data.licenseNumber,
      _id: { $ne: profile._id },
    });

    if (exists) {
      throw new Error("License number already exists.");
    }

    profile.licenseNumber = data.licenseNumber.trim();
  }

  if (
    data.aadhaarNumber &&
    data.aadhaarNumber !== profile.aadhaarNumber
  ) {
    const exists = await DriverProfile.findOne({
      aadhaarNumber: data.aadhaarNumber,
      _id: { $ne: profile._id },
    });

    if (exists) {
      throw new Error("Aadhaar number already exists.");
    }

    profile.aadhaarNumber = data.aadhaarNumber.trim();
  }

  /* ==========================================
     Basic Fields
  ========================================== */

  const fields = [
    "vehicleBrand",
    "vehicleModel",
    "vehicleColor",
    "vehicleYear",
    "seats",
  ];

  fields.forEach((field) => {
    if (data[field] !== undefined) {
      profile[field] = data[field];
    }
  });

  /* ==========================================
     Documents
  ========================================== */

  if (data.documents) {
    profile.documents = {
      ...profile.documents.toObject(),
      ...data.documents,
    };

    // Any document update requires reverification
    profile.documents.documentVerification = "Pending";
    profile.documents.rejectionReason = "";
  }

  await profile.save();

  return await DriverProfile.findById(profile._id)
    .populate("user", "-password -refreshToken")
    .populate("vehicleType");
};

/* ===========================================================
   GET DRIVER BY USER ID
=========================================================== */

export const getDriverByUserId = async (userId) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  })
    .populate("user", "-password -refreshToken")
    .populate("vehicleType");

  if (!driver) {
    throw new Error("Driver profile not found.");
  }

  return driver;
};

/* ===========================================================
   GO ONLINE
=========================================================== */

export const goOnline = async (userId) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  });

  if (!driver) {
    throw new Error("Driver profile not found.");
  }

  // Driver must be approved
  if (driver.approvalStatus !== "Approved") {
    throw new Error(
      "Your account is waiting for admin approval."
    );
  }

  // Driver cannot go online while on another ride
  if (driver.currentRide) {
    driver.isOnline = true;
    driver.isAvailable = false;
  } else {
    driver.isOnline = true;
    driver.isAvailable = true;
  }

  await driver.save();

  return {
    success: true,
    message: "Driver is now online.",
    driver,
  };
};

/* ===========================================================
   GO OFFLINE
=========================================================== */

export const goOffline = async (userId) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  });

  if (!driver) {
    throw new Error("Driver profile not found.");
  }

  // Cannot go offline during an active ride
  if (driver.currentRide) {
    throw new Error(
      "You cannot go offline while a ride is in progress."
    );
  }

  driver.isOnline = false;
  driver.isAvailable = false;

  await driver.save();

  return {
    success: true,
    message: "Driver is now offline.",
    driver,
  };
};

/* ===========================================================
   UPDATE LIVE LOCATION
=========================================================== */

export const updateLocation = async (
  userId,
  latitude,
  longitude
) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  });

  if (!driver) {
    throw new Error("Driver profile not found.");
  }

  if (!driver.isOnline) {
    throw new Error(
      "Driver must be online to update location."
    );
  }

  // Validate coordinates
  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Invalid GPS coordinates.");
  }

  driver.currentLocation = {
    type: "Point",
    coordinates: [
      Number(longitude),
      Number(latitude),
    ],
  };

  await driver.save();

  return {
    success: true,
    message: "Location updated successfully.",
    location: driver.currentLocation,
  };
};

/* ===========================================================
   GET DRIVER WALLET
=========================================================== */

export const getWallet = async (userId) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  let wallet = await DriverWallet.findOne({
    driver: driver._id,
  });

  // Auto-create wallet if missing
  if (!wallet) {
    wallet = await DriverWallet.create({
      driver: driver._id,
      balance: 0,
      lifetimeEarnings: 0,
      totalWithdrawn: 0,
      transactions: [],
    });
  }

  return {
    driver: {
      id: driver._id,
      totalTrips: driver.totalTrips,
      rating: driver.rating,
    },

    wallet: {
      balance: wallet.balance,
      lifetimeEarnings: wallet.lifetimeEarnings,
      totalWithdrawn: wallet.totalWithdrawn,
      pendingWithdrawal: wallet.pendingWithdrawal,
      totalTips: driver.totalTips,
    },
  };
};

/* ===========================================================
   WALLET TRANSACTIONS
=========================================================== */

export const getWalletTransactions = async (
  userId,
  page = 1,
  limit = 20
) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  let wallet = await DriverWallet.findOne({
    driver: driver._id,
  });

  if (!wallet) {
    wallet = await DriverWallet.create({
      driver: driver._id,
    });
  }

  // Perf: DB-level pagination via WalletTransaction collection instead of loading unbounded embedded array
  const WalletTransaction = (await import("../models/WalletTransaction.js")).default;
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    WalletTransaction.find({ driver: driver._id })
      .populate("booking", "pickup drop finalFare bookingStatus completedAt paymentMethod")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    WalletTransaction.countDocuments({ driver: driver._id }),
  ]);

  // Fallback: if collection empty but embedded array has data (legacy), paginate embedded
  let finalTx = transactions;
  let finalTotal = total;
  if (total === 0 && wallet.transactions?.length) {
    const sorted = [...wallet.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    finalTx = sorted.slice(skip, skip + limit);
    finalTotal = wallet.transactions.length;
  }

  return {
    wallet: {
      balance: wallet.balance,
      lifetimeEarnings: wallet.lifetimeEarnings,
      totalWithdrawn: wallet.totalWithdrawn,
      pendingWithdrawal: wallet.pendingWithdrawal,
    },

    pagination: {
      page,
      limit,
      totalTransactions: finalTotal,
      totalPages: Math.ceil(finalTotal / limit),
    },

    transactions: finalTx,
  };
};

/* ===========================================================
   WALLET SUMMARY
=========================================================== */

export const getWalletSummary = async (
  userId
) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  const wallet = await DriverWallet.findOne({
    driver: driver._id,
  });

  if (!wallet) {
    throw new Error("Wallet not found.");
  }

  // Perf: aggregate via WalletTransaction collection instead of loading embedded array
  const WalletTransaction = (await import("../models/WalletTransaction.js")).default;
  const agg = await WalletTransaction.aggregate([
    { $match: { driver: driver._id } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);

  const byType = Object.fromEntries(agg.map((r) => [r._id, r.total]));
  // Fallback to embedded if collection empty
  let summary;
  if (agg.length) {
    summary = {
      rideIncome: byType.Ride || 0,
      tips: byType.Tip || 0,
      bonus: byType.Bonus || 0,
      adjustment: byType.Adjustment || 0,
      withdrawal: byType.Withdrawal || 0,
    };
  } else if (wallet.transactions?.length) {
    summary = { rideIncome: 0, tips: 0, bonus: 0, adjustment: 0, withdrawal: 0 };
    wallet.transactions.forEach((t) => {
      switch (t.type) {
        case "Ride": summary.rideIncome += t.amount; break;
        case "Tip": summary.tips += t.amount; break;
        case "Bonus": summary.bonus += t.amount; break;
        case "Adjustment": summary.adjustment += t.amount; break;
        case "Withdrawal": summary.withdrawal += t.amount; break;
      }
    });
  } else {
    summary = { rideIncome: 0, tips: 0, bonus: 0, adjustment: 0, withdrawal: 0 };
  }

  return {
    balance: wallet.balance,
    lifetimeEarnings: wallet.lifetimeEarnings,
    totalWithdrawn: wallet.totalWithdrawn,
    pendingWithdrawal: wallet.pendingWithdrawal,
    summary,
  };
};

/* ===========================================================
   GET CURRENT BOOKING
=========================================================== */

export const getCurrentBooking = async (userId) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (!driver.currentRide) {
    return null;
  }

  const booking = await Booking.findById(driver.currentRide)
    .populate(
      "customer",
      "name phone email profileImage"
    )
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name phone profileImage",
      },
    });

  if (!booking) {
    driver.currentRide = null;
    driver.isAvailable = true;
    await driver.save();

    return null;
  }

  return booking;
};

/* ===========================================================
   GET RIDE HISTORY
=========================================================== */

export const getRideHistory = async (
  userId,
  page = 1,
  limit = 10
) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  const total = await Booking.countDocuments({
    driver: driver._id,
    bookingStatus: "Completed",
  });

  const rides = await Booking.find({
    driver: driver._id,
    bookingStatus: "Completed",
  })
    .populate(
      "customer",
      "name phone profileImage"
    )
    .sort({
      completedAt: -1,
    })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    pagination: {
      page,
      limit,
      totalRecords: total,
      totalPages: Math.ceil(total / limit),
    },

    rides,
  };
};

/* ===========================================================
   GET TODAY RIDES
=========================================================== */

export const getTodayRides = async (userId) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await Booking.find({
    driver: driver._id,
    bookingStatus: "Completed",
    completedAt: {
      $gte: today,
    },
  })
    .populate(
      "customer",
      "name phone profileImage"
    )
    .sort({
      completedAt: -1,
    })
    .lean();
};

/* ===========================================================
   GET UPCOMING BOOKINGS
=========================================================== */

export const getUpcomingBookings = async (
  userId
) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  return await Booking.find({
    driver: driver._id,
    bookingStatus: {
      $in: [
        "Accepted",
        "On The Way",
        "Arrived",
        "Started",
      ],
    },
  })
    .populate(
      "customer",
      "name phone profileImage"
    )
    .sort({
      pickupDateTime: 1,
    })
    .lean();
};

/* ===========================================================
   DRIVER EARNINGS
=========================================================== */

export const getDriverEarnings = async (userId) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  const wallet = await DriverWallet.findOne({
    driver: driver._id,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const week = new Date();
  week.setDate(week.getDate() - 7);

  const month = new Date();
  month.setMonth(month.getMonth() - 1);

  const agg = await Booking.aggregate([
    { $match: { driver: driver._id, bookingStatus: "Completed" } },
    {
      $group: {
        _id: null,
        todayEarnings: {
          $sum: { $cond: [{ $gte: ["$completedAt", today] }, "$finalFare", 0] },
        },
        weekEarnings: {
          $sum: { $cond: [{ $gte: ["$completedAt", week] }, "$finalFare", 0] },
        },
        monthEarnings: {
          $sum: { $cond: [{ $gte: ["$completedAt", month] }, "$finalFare", 0] },
        },
      },
    },
  ]);

  const {
    todayEarnings = 0,
    weekEarnings = 0,
    monthEarnings = 0,
  } = agg[0] || {};

  return {
    wallet: {
      balance: wallet?.balance || 0,
      lifetimeEarnings: wallet?.lifetimeEarnings || 0,
      totalWithdrawn: wallet?.totalWithdrawn || 0,
      pendingWithdrawal: wallet?.pendingWithdrawal || 0,
    },

    earnings: {
      today: todayEarnings,
      thisWeek: weekEarnings,
      thisMonth: monthEarnings,
      total: driver.totalEarnings,
      tips: driver.totalTips,
    },
  };
};

/* ===========================================================
   DRIVER DASHBOARD
=========================================================== */

export const getDriverDashboard = async (userId) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  })
    .populate("vehicleType")
    .populate("user", "name phone profileImage");

  if (!driver) {
    throw new Error("Driver not found.");
  }

  const wallet = await DriverWallet.findOne({
    driver: driver._id,
  });

  const currentRide = driver.currentRide
    ? await Booking.findById(driver.currentRide)
        .populate(
          "customer",
          "name phone profileImage"
        )
    : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTrips = await Booking.countDocuments({
    driver: driver._id,
    bookingStatus: "Completed",
    completedAt: {
      $gte: today,
    },
  });

  const totalBookings = await Booking.countDocuments({
    driver: driver._id,
  });

  const completedBookings =
    await Booking.countDocuments({
      driver: driver._id,
      bookingStatus: "Completed",
    });

  const cancelledBookings =
    await Booking.countDocuments({
      driver: driver._id,
      bookingStatus: "Cancelled",
    });

  const completionRate =
    totalBookings === 0
      ? 0
      : Number(
          (
            (completedBookings /
              totalBookings) *
            100
          ).toFixed(2)
        );

  return {
    profile: {
      id: driver._id,
      name: driver.user.name,
      phone: driver.user.phone,
      profileImage:
        driver.user.profileImage,

      rating: driver.rating,
      totalRatings:
        driver.totalRatings,

      approvalStatus:
        driver.approvalStatus,

      isOnline: driver.isOnline,
      isAvailable:
        driver.isAvailable,
    },

    vehicle: driver.vehicleType,

    wallet: {
      balance: wallet?.balance || 0,
      lifetimeEarnings:
        wallet?.lifetimeEarnings || 0,
      pendingWithdrawal:
        wallet?.pendingWithdrawal || 0,
    },

    currentRide,

    statistics: {
      totalTrips: driver.totalTrips,
      completedTrips:
        driver.completedTrips,
      cancelledTrips:
        driver.cancelledTrips,

      todayTrips,

      totalDistance:
        driver.totalDistance,

      totalEarnings:
        driver.totalEarnings,

      totalTips:
        driver.totalTips,

      todayEarnings:
        driver.todayEarnings,

      weekEarnings:
        driver.weekEarnings,

      monthEarnings:
        driver.monthEarnings,

      completionRate,
    },
  };
};

/* ===========================================================
   DRIVER STATISTICS
=========================================================== */

export const getDriverStatistics = async (
  userId
) => {
  const driver =
    await DriverProfile.findOne({
      user: userId,
    });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  const totalForRate = (driver.completedTrips || 0) + (driver.cancelledTrips || 0);
  const completionRate =
    totalForRate === 0
      ? 0
      : Number(
          ((driver.completedTrips / totalForRate) * 100).toFixed(2)
        );

  return {
    rating: driver.rating,
    totalRatings:
      driver.totalRatings,

    totalTrips:
      driver.totalTrips,

    completedTrips:
      driver.completedTrips,

    cancelledTrips:
      driver.cancelledTrips,

    totalDistance:
      driver.totalDistance,

    totalEarnings:
      driver.totalEarnings,

    totalTips:
      driver.totalTips,

    todayEarnings:
      driver.todayEarnings,

    weekEarnings:
      driver.weekEarnings,

    monthEarnings:
      driver.monthEarnings,

    completionRate,

    online: driver.isOnline,

    available:
      driver.isAvailable,
  };
};