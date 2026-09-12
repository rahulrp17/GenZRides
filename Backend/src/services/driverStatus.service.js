import DriverProfile from "../models/DriverProfile.js";

/* ===========================================================
   UPDATE DRIVER STATUS
=========================================================== */

export const updateDriverStatus = async (userId, isOnline) => {
  const driver = await DriverProfile.findOne({
    user: userId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (driver.approvalStatus !== "Approved") {
    throw new Error("Driver is not approved by admin.");
  }

  driver.isOnline = isOnline;

  if (!isOnline) {
    driver.isAvailable = false;
  } else {
    driver.isAvailable = true;
  }

  await driver.save();

  return driver;
};

/* ===========================================================
   UPDATE DRIVER STATS
=========================================================== */

export const updateDriverStats = async (driverId, booking) => {
  const driver = await DriverProfile.findById(driverId);

  if (!driver) return;

  const fare = booking.finalFare || 0;
  const distance = booking.distance || 0;

  driver.totalTrips += 1;
  driver.completedTrips += 1;

  driver.totalEarnings += fare;
  driver.totalDistance += distance;

  const today = new Date();
  const bookingDate = new Date(booking.completedAt || new Date());

  // Today
  if (today.toDateString() === bookingDate.toDateString()) {
    driver.todayEarnings += fare;
  }

  // Week
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  if (bookingDate >= weekAgo) {
    driver.weekEarnings += fare;
  }

  // Month
  if (
    bookingDate.getMonth() === today.getMonth() &&
    bookingDate.getFullYear() === today.getFullYear()
  ) {
    driver.monthEarnings += fare;
  }

  await driver.save();

  return driver;
};

/* ===========================================================
   COMPLETION RATE
=========================================================== */

export const getCompletionRate = (driver) => {
  const total = driver.completedTrips + driver.cancelledTrips;

  if (total === 0) return 0;

  return Number(((driver.completedTrips / total) * 100).toFixed(1));
};

/* ===========================================================
   CANCELLATION RATE
=========================================================== */

export const getCancellationRate = (driver) => {
  const total = driver.completedTrips + driver.cancelledTrips;

  if (total === 0) return 0;

  return Number(((driver.cancelledTrips / total) * 100).toFixed(1));
};

/* ===========================================================
   ACCEPTANCE RATE
=========================================================== */

export const getAcceptanceRate = (completedTrips, cancelledTrips) => {
  const total = completedTrips + cancelledTrips;

  if (total === 0) return 0;

  return Number(((completedTrips / total) * 100).toFixed(1));
};
