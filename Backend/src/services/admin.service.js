import User from "../models/User.js";
import DriverProfile from "../models/DriverProfile.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import DriverWallet from "../models/DriverWallet.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import Review from "../models/Review.js";
import { creditWallet } from "./wallet.service.js";
import { notifyUser } from "./notification.service.js";
import { updateDriverStats } from "./driverStatus.service.js";
import { withCache, invalidateCache } from "../config/redis.js";


/* ===========================================================
   DASHBOARD
=========================================================== */

export const getDashboardStats = async () => {
  return await withCache("dashboard:stats", 30, async () => {
  const [
    totalCustomers,
    totalDrivers,
    totalVehicles,
    totalBookings,
    pendingDrivers,
    approvedDrivers,
    rejectedDrivers,
    onlineDrivers,
    availableDrivers,
    pendingBookings,
    completedBookings,
    cancelledBookings,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "driver" }),
    Vehicle.countDocuments(),
    Booking.countDocuments(),
    DriverProfile.countDocuments({ approvalStatus: "Pending" }),
    DriverProfile.countDocuments({ approvalStatus: "Approved" }),
    DriverProfile.countDocuments({ approvalStatus: "Rejected" }),
    DriverProfile.countDocuments({ isOnline: true }),
    DriverProfile.countDocuments({ isAvailable: true }),
    Booking.countDocuments({ bookingStatus: "Pending" }),
    Booking.countDocuments({ bookingStatus: "Completed" }),
    Booking.countDocuments({ bookingStatus: "Cancelled" }),
  ]);

  const revenue = await Booking.aggregate([
    {
      $match: {
        bookingStatus: "Completed",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$finalFare",
        },
      },
    },
  ]);

  /* ── Revenue by trip type ────────────────────────────────── */
  const revenueByTripType = await Booking.aggregate([
    { $match: { bookingStatus: "Completed" } },
    {
      $group: {
        _id: "$tripType",
        revenue: { $sum: "$finalFare" },
        count: { $sum: 1 },
      },
    },
  ]);

  const oneWayRevenue = revenueByTripType.find((r) => r._id === "One Way");
  const roundTripRevenue = revenueByTripType.find((r) => r._id === "Round Trip");

  /* ── Bookings by trip type ───────────────────────────────── */
  const bookingsByTripType = await Booking.aggregate([
    {
      $group: {
        _id: "$tripType",
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$bookingStatus", "Completed"] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$bookingStatus", "Pending"] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ["$bookingStatus", "Cancelled"] }, 1, 0] },
        },
      },
    },
  ]);

  const oneWayBookings = bookingsByTripType.find((r) => r._id === "One Way") || { total: 0, completed: 0, pending: 0, cancelled: 0 };
  const roundTripBookings = bookingsByTripType.find((r) => r._id === "Round Trip") || { total: 0, completed: 0, pending: 0, cancelled: 0 };

  /* ── Weekly bookings (last 7 days) by trip type ──────────── */
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const weeklyBookings = await Booking.aggregate([
    { $match: { createdAt: { $gte: weekAgo } } },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          tripType: "$tripType",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.day": 1 } },
  ]);

  // Build 7-day array with day labels
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = dayLabels[d.getDay()];
    const oneWay = weeklyBookings.find((w) => w._id.day === dateStr && w._id.tripType === "One Way");
    const roundTrip = weeklyBookings.find((w) => w._id.day === dateStr && w._id.tripType === "Round Trip");
    weeklyData.push({
      day: dayName,
      date: dateStr,
      oneWay: oneWay?.count || 0,
      roundTrip: roundTrip?.count || 0,
    });
  }

  return {
    totalCustomers,
    totalDrivers,
    totalVehicles,
    totalBookings,

    pendingDrivers,
    approvedDrivers,
    rejectedDrivers,

    onlineDrivers,
    availableDrivers,

    pendingBookings,
    completedBookings,
    cancelledBookings,

    totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,

    oneWayRevenue: oneWayRevenue?.revenue || 0,
    roundTripRevenue: roundTripRevenue?.revenue || 0,
    oneWayBookings: oneWayBookings.total,
    roundTripBookings: roundTripBookings.total,
    oneWayCompleted: oneWayBookings.completed,
    roundTripCompleted: roundTripBookings.completed,
    oneWayPending: oneWayBookings.pending,
    roundTripPending: roundTripBookings.pending,
    oneWayCancelled: oneWayBookings.cancelled,
    roundTripCancelled: roundTripBookings.cancelled,

    weeklyData,
  };
  });
};

/* ===========================================================
   CUSTOMER MANAGEMENT
=========================================================== */

export const getCustomers = async (page = 1, limit = 10, search = "") => {
  const skip = (page - 1) * limit;

  const query = {
    role: "customer",
  };

  if (search && search.trim()) {
    query.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const [customers, total] = await Promise.all([
    User.find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    customers,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

export const getCustomerById = async (customerId) => {
  const customer = await User.findOne({
    _id: customerId,
    role: "customer",
  }).select("-password -refreshToken");

  if (!customer) {
    throw new Error("Customer not found.");
  }

  return customer;
};

export const blockCustomer = async (customerId) => {
  const customer = await User.findOneAndUpdate(
    {
      _id: customerId,
      role: "customer",
    },
    {
      isBlocked: true,
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  if (!customer) {
    throw new Error("Customer not found.");
  }

  return customer;
};

export const unblockCustomer = async (customerId) => {
  const customer = await User.findOneAndUpdate(
    {
      _id: customerId,
      role: "customer",
    },
    {
      isBlocked: false,
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  if (!customer) {
    throw new Error("Customer not found.");
  }

  return customer;
};

export const deleteCustomer = async (customerId) => {
  const customer = await User.findOneAndDelete({
    _id: customerId,
    role: "customer",
  });

  if (!customer) {
    throw new Error("Customer not found.");
  }

  return true;
};

/* ===========================================================
   DRIVER MANAGEMENT
=========================================================== */

export const getDrivers = async (page = 1, limit = 10, search = "") => {
  const skip = (page - 1) * limit;

  const query = {
    role: "driver",
  };

  if (search && search.trim()) {
    query.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const [drivers, total] = await Promise.all([
    User.find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  const driverUserIds = drivers.map((d) => d._id);

  const driverProfiles = await DriverProfile.find({
    user: { $in: driverUserIds },
  })
    .populate("vehicleType")
    .lean();

  const profileMap = new Map(
    driverProfiles.map((p) => [p.user.toString(), p])
  );

  const result = drivers.map((driver) => ({
    user: driver,
    profile: profileMap.get(driver._id.toString()) || null,
  }));

  return {
    drivers: result,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

/* ================= Pending Drivers ================= */

export const getPendingDrivers = async () => {
  return await DriverProfile.find({
    approvalStatus: "Pending",
  })
    .populate("user", "name email phone profileImage")
    .populate("vehicleType")
    .lean();
};

/* ================= Approved Drivers ================= */

export const getApprovedDrivers = async () => {
  return await DriverProfile.find({
    approvalStatus: "Approved",
  })
    .populate("user", "name email phone profileImage")
    .populate("vehicleType")
    .lean();
};

/* ================= Rejected Drivers ================= */

export const getRejectedDrivers = async () => {
  return await DriverProfile.find({
    approvalStatus: "Rejected",
  })
    .populate("user", "name email phone profileImage")
    .populate("vehicleType")
    .lean();
};

/* ================= Driver Details ================= */

export const getDriverById = async (driverId) => {
  const profile = await DriverProfile.findById(driverId)
    .populate("user", "-password -refreshToken")
    .populate("vehicleType")
    .lean();

  if (!profile) {
    throw new Error("Driver not found.");
  }

  return profile;
};

/* ================= Approve Driver ================= */

export const approveDriver = async (driverId) => {
  const driver = await DriverProfile.findByIdAndUpdate(
    driverId,
    {
      approvalStatus: "Approved",
    },
    {
      new: true,
    },
  )
    .populate("user", "name email phone profileImage")
    .populate("vehicleType")
    .lean();

  if (!driver) {
    throw new Error("Driver not found.");
  }

  /* =====================================
      COPY PROFILE PHOTO TO USER
  ===================================== */
  if (driver.documents?.profilePhoto && !driver.user?.profileImage) {
    await User.findByIdAndUpdate(driver.user._id, {
      profileImage: driver.documents.profilePhoto,
    });
  }

  /* =====================================
      CREATE DRIVER WALLET
  ===================================== */

  const walletExists = await DriverWallet.findOne({
    driver: driver._id,
  });

  if (!walletExists) {
    await DriverWallet.create({
      driver: driver._id,
      balance: 0,
      lifetimeEarnings: 0,
      totalWithdrawn: 0,
      transactions: [],
    });
  }

  return driver;
};

/* ================= Reject Driver ================= */

export const rejectDriver = async (
  driverId,
  reason = "Documents verification failed.",
) => {
  const driver = await DriverProfile.findById(driverId);

  if (!driver) {
    throw new Error("Driver not found.");
  }

  driver.approvalStatus = "Rejected";
  driver.documents.documentVerification = "Rejected";
  driver.documents.rejectionReason = reason;
  driver.isAvailable = false;
  driver.isOnline = false;

  await driver.save();

  return await DriverProfile.findById(driverId)
    .populate("user", "name email phone")
    .populate("vehicleType")
    .lean();
};

/* ================= Block Driver ================= */

export const blockDriver = async (driverId) => {
  const profile = await DriverProfile.findById(driverId);

  if (!profile) {
    throw new Error("Driver not found.");
  }

  const user = await User.findByIdAndUpdate(
    profile.user,
    {
      isBlocked: true,
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  return user;
};

/* ================= Unblock Driver ================= */

export const unblockDriver = async (driverId) => {
  const profile = await DriverProfile.findById(driverId);

  if (!profile) {
    throw new Error("Driver not found.");
  }

  const user = await User.findByIdAndUpdate(
    profile.user,
    {
      isBlocked: false,
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  return user;
};

/* ================= Delete Driver ================= */

export const deleteDriver = async (driverId) => {
  const profile = await DriverProfile.findById(driverId);

  if (!profile) {
    throw new Error("Driver not found.");
  }

  await User.findByIdAndDelete(profile.user);

  await DriverProfile.findByIdAndDelete(driverId);

  return true;
};

/* ===========================================================
   VEHICLE MANAGEMENT
=========================================================== */

export const getVehicles = async () => {
  return await withCache("vehicles:admin:all", 60, async () => {
    return await Vehicle.find().sort({ createdAt: -1 }).lean();
  });
};

export const getVehicleById = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  return vehicle;
};

export const createVehicle = async (data) => {
  const existing = await Vehicle.findOne({
    name: data.name,
  });

  if (existing) {
    throw new Error("Vehicle already exists.");
  }

  const v = await Vehicle.create(data);
  await invalidateCache("vehicles:*");
  await invalidateCache("dashboard:*");
  return v;
};

export const updateVehicle = async (vehicleId, data) => {
  const vehicle = await Vehicle.findByIdAndUpdate(vehicleId, data, {
    new: true,
    runValidators: true,
  });

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  await invalidateCache("vehicles:*");
  return vehicle;
};

export const enableVehicle = async (vehicleId) => {
  const vehicle = await Vehicle.findByIdAndUpdate(
    vehicleId,
    {
      isActive: true,
    },
    {
      new: true,
    },
  );

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  await invalidateCache("vehicles:*");
  return vehicle;
};

export const disableVehicle = async (vehicleId) => {
  const vehicle = await Vehicle.findByIdAndUpdate(
    vehicleId,
    {
      isActive: false,
    },
    {
      new: true,
    },
  );

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  await invalidateCache("vehicles:*");
  return vehicle;
};

export const deleteVehicle = async (vehicleId) => {
  const vehicle = await Vehicle.findByIdAndDelete(vehicleId);
  await invalidateCache("vehicles:*");

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  return true;
};

/* ===========================================================
   BOOKING MANAGEMENT
=========================================================== */

export const getBookings = async (page = 1, limit = 10, status = "", vehicleType = "") => {
  const skip = (page - 1) * limit;

  const query = {};

  if (status) {
    query.bookingStatus = status;
  }

  if (vehicleType) {
    query.vehicleType = vehicleType;
  }

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate("customer", "name phone email")
      .populate("vehicleType")
      .populate({
        path: "driver",
        populate: {
          path: "user",
          select: "name phone",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Booking.countDocuments(query),
  ]);

  return {
    bookings,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

export const getBookingById = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate("customer", "name phone email")
    .populate("vehicleType")
    .populate({
      path: "driver",
      populate: [
        {
          path: "user",
          select: "name phone",
        },
        {
          path: "vehicleType",
        },
      ],
    });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  return booking;
};

export const assignDriver = async (bookingId, driverId) => {
  const driver = await DriverProfile.findById(driverId).populate(
    "vehicleType"
  );

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (driver.approvalStatus !== "Approved") {
    throw new Error("Driver is not approved.");
  }

  if (!driver.isOnline) {
    throw new Error("Driver is not online.");
  }

  const targetBooking = await Booking.findById(bookingId).populate(
    "vehicleType",
    "name"
  );

  if (!targetBooking) {
    throw new Error("Booking not found.");
  }

  // Vehicle-type guard: a booking must only go to a driver whose registered
  // cab type matches (SUV → SUV drivers, Sedan → Sedan, etc.).
  if (targetBooking.vehicleType) {
    const requiredTypeId = targetBooking.vehicleType._id
      ? targetBooking.vehicleType._id.toString()
      : targetBooking.vehicleType.toString();

    const driverTypeId = driver.vehicleType?._id
      ? driver.vehicleType._id.toString()
      : driver.vehicleType?.toString();

    if (driverTypeId !== requiredTypeId) {
      throw new Error(
        `This booking requires a ${targetBooking.vehicleType.name || "matching"} vehicle.`
      );
    }
  }

  // Atomic, guarded assignment: only a booking with no driver can be assigned,
  // preventing an admin from overwriting an in-progress assignment.
  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, driver: null },
    {
      driver: driver._id,
      bookingStatus: "Accepted",
      driverAssignedAt: new Date(),
      acceptedAt: new Date(),
      driverRequestStatus: "Accepted",
      requestExpiresAt: null,
    },
    {
      new: true,
    },
  )
    .populate("customer", "name phone")
    .populate("vehicleType")
    .populate({
      path: "driver",
      populate: [
        {
          path: "user",
          select: "name phone",
        },
        {
          path: "vehicleType",
        },
      ],
    });

  if (!booking) {
    throw new Error("Booking not found or already assigned.");
  }

  driver.currentRide = booking._id;
  driver.isAvailable = false;
  await driver.save();

  return booking;
};

export const cancelBooking = async (
  bookingId,
  cancelReason = "Cancelled by admin"
) => {
  // Guard: cannot cancel a completed/cancelled ride.
  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, bookingStatus: { $nin: ["Completed", "Cancelled"] } },
    {
      bookingStatus: "Cancelled",
      cancelledAt: new Date(),
      cancelReason,
      cancelledBy: "Admin",
      driverRequestStatus: "Rejected",
      driverQueue: [],
      currentDriverIndex: 0,
      requestExpiresAt: null,
    },
    {
      new: true,
    },
  );

  if (!booking) {
    throw new Error("Booking not found or cannot be cancelled.");
  }

  // Release the assigned driver so available bookings return
  if (booking.driver) {
    const driver = await DriverProfile.findById(booking.driver);
    if (driver) {
      driver.currentRide = null;
      driver.isAvailable = driver.isOnline;
      driver.totalTrips += 1;
      driver.cancelledTrips += 1;
      await driver.save();

      await notifyUser({
        user: driver.user,
        title: "Booking Cancelled",
        message: `Admin cancelled booking #${booking._id.toString().slice(-6).toUpperCase()}. Reason: ${cancelReason}`,
        type: "Booking",
        booking: booking._id,
      });
    }
  }

  await notifyUser({
    user: booking.customer,
    title: "Booking Cancelled",
    message: `Admin cancelled your booking. Reason: ${cancelReason}`,
    type: "Booking",
    booking: booking._id,
  });

  return booking;
};

export const completeBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.bookingStatus === "Completed") {
    return booking;
  }

  // Atomic transition; idempotent. Also credits the driver wallet via the
  // unique (driver, bookingId) index so the ledger stays consistent with the
  // REST completion path (no silent double-credit or missed credit).
  const finalized = await Booking.findOneAndUpdate(
    { _id: bookingId, bookingStatus: { $ne: "Completed" } },
    {
      bookingStatus: "Completed",
      completedAt: new Date(),
      finalFare: booking.finalFare || booking.estimatedFare,
      paymentStatus:
        booking.paymentMethod === "Cash" ? "Paid" : booking.paymentStatus,
    },
    { new: true },
  );

  if (!finalized) {
    throw new Error("Booking cannot be completed.");
  }

  if (finalized.driver) {
    try {
      await creditWallet(
        finalized.driver,
        finalized.finalFare || finalized.estimatedFare,
        finalized._id
      );
    } catch (err) {
      // Duplicate credit (already completed once) is idempotent — ignore.
      if (err && err.code !== 11000) throw err;
    }

    // Mirror the REST completion path: release the driver, update lifetime
    // stats and notify both parties so dashboards stay consistent.
    const driver = await DriverProfile.findById(finalized.driver);
    if (driver) {
      driver.currentRide = null;
      driver.isAvailable = driver.isOnline;
      await driver.save();

      await updateDriverStats(driver._id, finalized);

      await notifyUser({
        user: driver.user,
        title: "Ride Completed",
        message: `Trip #${finalized._id.toString().slice(-6).toUpperCase()} marked completed by admin.`,
        type: "Ride",
        booking: finalized._id,
      });
    }
  }

  await notifyUser({
    user: finalized.customer,
    title: "Ride Completed",
    message: "Your ride has been completed successfully.",
    type: "Ride",
    booking: finalized._id,
  });

  if (finalized.paymentStatus === "Paid") {
    await notifyUser({
      user: finalized.customer,
      title: "Payment Successful",
      message: `Payment of ₹${finalized.finalFare} was successful.`,
      type: "Payment",
      booking: finalized._id,
      data: {
        amount: finalized.finalFare,
      },
    });
  }

  return finalized;
};

/* ===========================================================
   WITHDRAWAL REQUEST MANAGEMENT
=========================================================== */
export const getWithdrawalRequests = async () => {
  return await WithdrawalRequest.find()
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name phone",
      },
    })
    .sort({
      createdAt: -1,
    })
    .lean();
};

/* ===========================================================
   APPROVE WITHDRAWAL REQUEST
=========================================================== */

export const approveWithdrawal = async (requestId) => {
  const request = await WithdrawalRequest.findById(requestId);

  if (!request) {
    throw new Error("Withdrawal request not found.");
  }

  if (request.status !== "Pending") {
    throw new Error("Already processed.");
  }

  const wallet = await DriverWallet.findById(request.wallet);

  if (!wallet) {
    throw new Error("Wallet not found.");
  }

  if (wallet.balance < request.amount) {
    throw new Error("Insufficient wallet balance.");
  }

  wallet.balance -= request.amount;

  wallet.totalWithdrawn += request.amount;

  wallet.transactions.push({
    type: "Withdrawal",
    amount: request.amount,
    description: "Bank Withdrawal",
  });

  await wallet.save();

  request.status = "Approved";
  request.approvedAt = new Date();

  await request.save();

  return request;
};

/* ===========================================================
   REJECT WITHDRAWAL REQUEST
=========================================================== */

export const rejectWithdrawalRequest = async (requestId, remarks = "") => {
  const request = await WithdrawalRequest.findById(requestId);

  if (!request) {
    throw new Error("Withdrawal request not found.");
  }

  if (request.status !== "Pending") {
    throw new Error("Already processed.");
  }

  request.status = "Rejected";
  request.remarks = remarks;
  request.rejectedAt = new Date();

  await request.save();

  return request;
};

/* ===========================================================
   REVIEW MANAGEMENT
=========================================================== */

export const getAllReviews = async (
  page = 1,
  limit = 10,
  filters = {}
) => {
  const query = {};

  if (filters.rating) {
    query.rating = Number(filters.rating);
  }

  if (filters.driver) {
    query.driver = filters.driver;
  }

  if (filters.customer) {
    query.customer = filters.customer;
  }

  if (filters.hidden !== undefined) {
    query.isHidden = filters.hidden === "true";
  }

  const total = await Review.countDocuments(query);

  const reviews = await Review.find(query)
    .populate("customer", "name phone")
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name phone",
      },
    })
    .populate("booking")
    .sort({
      createdAt: -1,
    })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    reviews,
  };
};

/* ===========================================================
   HIDE REVIEW
=========================================================== */

export const hideReview = async (
  reviewId
) => {
  const review =
    await Review.findById(reviewId);

  if (!review) {
    throw new Error("Review not found.");
  }

  review.isHidden = true;

  await review.save();

  return review;
};

/* ===========================================================
   UNHIDE REVIEW
=========================================================== */

export const unhideReview = async (
  reviewId
) => {
  const review =
    await Review.findById(reviewId);

  if (!review) {
    throw new Error("Review not found.");
  }

  review.isHidden = false;

  await review.save();

  return review;
};

/* ===========================================================
   DELETE REVIEW
=========================================================== */
export const deleteReview = async (
  reviewId
) => {
  const review =
    await Review.findById(reviewId);

  if (!review) {
    throw new Error("Review not found.");
  }

  await review.deleteOne();

  return {
    message:
      "Review deleted successfully.",
  };
};