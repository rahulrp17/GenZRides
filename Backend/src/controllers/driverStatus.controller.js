import * as driverStatusService from "../services/driverStatus.service.js";
import DriverProfile from "../models/DriverProfile.js";

/* ===========================================================
   TOGGLE ONLINE / OFFLINE
=========================================================== */

export const toggleOnlineStatus = async (
  req,
  res
) => {
  try {
    const { isOnline } = req.body;

    if (typeof isOnline !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isOnline must be true or false.",
      });
    }

    const driver =
      await driverStatusService.updateDriverStatus(
        req.user._id,
        isOnline
      );

    res.status(200).json({
      success: true,
      message: isOnline
        ? "Driver is now online."
        : "Driver is now offline.",
      data: driver,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   DRIVER PERFORMANCE
=========================================================== */

export const getDriverPerformance = async (
  req,
  res
) => {
  try {
    const driver = await DriverProfile.findOne({
      user: req.user._id,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    // Live rates from Bookings + live period earnings — same helpers as
    // dashboard/statistics so every surface agrees. Never read the
    // today/week/month profile counters (write-only, never reset).
    const rates = await driverStatusService.getDriverRates(driver._id);
    const period = await driverStatusService.getDriverPeriodEarnings(driver._id);

    res.status(200).json({
      success: true,
      data: {
        totalTrips: rates.totalTrips,
        completedTrips: rates.completedTrips,
        cancelledTrips: rates.cancelledTrips,

        completionRate: rates.completionRate,
        cancellationRate: rates.cancellationRate,
        acceptanceRate: rates.acceptanceRate,

        rating: driver.rating,
        totalRatings: driver.totalRatings,

        totalDistance: driver.totalDistance,

        totalEarnings: driver.totalEarnings,
        totalTips: driver.totalTips,

        todayEarnings: period.today,
        weekEarnings: period.week,
        monthEarnings: period.month,

        isOnline: driver.isOnline,
        isAvailable: driver.isAvailable,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};