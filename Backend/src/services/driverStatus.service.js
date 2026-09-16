import DriverProfile from "../models/DriverProfile.js";
import Booking from "../models/Booking.js";

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
   PERIOD EARNINGS (LIVE FROM BOOKINGS)
   The today/week/month counters on DriverProfile are write-only
   accumulators (updateDriverStats only ever +=, nothing resets them),
   so they must NEVER be read for display. This aggregation over
   Completed bookings is the source of truth. Day boundary is IST
   midnight (business timezone), not server-local midnight.
=========================================================== */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const istMidnightUtc = () =>
  new Date(Math.floor((Date.now() + IST_OFFSET_MS) / DAY_MS) * DAY_MS - IST_OFFSET_MS);

export { istMidnightUtc };

export const getDriverPeriodEarnings = async (driverId) => {
  const today = istMidnightUtc();

  const week = new Date();
  week.setDate(week.getDate() - 7);

  const month = new Date();
  month.setMonth(month.getMonth() - 1);

  const agg = await Booking.aggregate([
    { $match: { driver: driverId, bookingStatus: "Completed" } },
    {
      $group: {
        _id: null,
        today: {
          $sum: { $cond: [{ $gte: ["$completedAt", today] }, "$finalFare", 0] },
        },
        week: {
          $sum: { $cond: [{ $gte: ["$completedAt", week] }, "$finalFare", 0] },
        },
        month: {
          $sum: { $cond: [{ $gte: ["$completedAt", month] }, "$finalFare", 0] },
        },
      },
    },
  ]);

  const { today: todayEarnings = 0, week: weekEarnings = 0, month: monthEarnings = 0 } =
    agg[0] || {};

  return { today: todayEarnings, week: weekEarnings, month: monthEarnings };
};

/* ===========================================================
   RATES (LIVE FROM BOOKINGS — SINGLE FORMULA EVERYWHERE)
   completion   = completed / decided (completed + cancelled)
   cancellation = cancelled / decided
   acceptance   = accepted offers / all offers (accepted + rejected).
   Offers come from dispatch: assignment sets booking.driver,
   rejection pushes to booking.rejectedDrivers.
=========================================================== */

const pct = (n, d) => (d === 0 ? 0 : Number(((n / d) * 100).toFixed(1)));

export const getDriverRates = async (driverId) => {
  const [completed, cancelled, accepted, rejected] = await Promise.all([
    Booking.countDocuments({ driver: driverId, bookingStatus: "Completed" }),
    Booking.countDocuments({ driver: driverId, bookingStatus: "Cancelled" }),
    Booking.countDocuments({ driver: driverId }),
    Booking.countDocuments({ rejectedDrivers: driverId }),
  ]);

  const decided = completed + cancelled;
  const offers = accepted + rejected;

  return {
    totalTrips: decided,
    completedTrips: completed,
    cancelledTrips: cancelled,
    completionRate: pct(completed, decided),
    cancellationRate: pct(cancelled, decided),
    acceptanceRate: pct(accepted, offers),
  };
};

/* ===========================================================
   COMPLETION RATE (LEGACY — kept for compatibility, prefer
   getDriverRates which uses live Booking counts)
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
   ACCEPTANCE RATE (LEGACY — this is NOT true offer acceptance,
   it mirrors completion. Prefer getDriverRates().acceptanceRate
   which uses real dispatch offer data.)
=========================================================== */

export const getAcceptanceRate = (completedTrips, cancelledTrips) => {
  const total = completedTrips + cancelledTrips;

  if (total === 0) return 0;

  return Number(((completedTrips / total) * 100).toFixed(1));
};
