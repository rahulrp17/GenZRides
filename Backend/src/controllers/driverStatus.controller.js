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

    const completionRate =
      driverStatusService.getCompletionRate(driver);

    const cancellationRate =
      driverStatusService.getCancellationRate(driver);

    // You can replace these values later with actual
    // accepted/rejected request counts.
    const acceptanceRate =
      driverStatusService.getAcceptanceRate(
        driver.completedTrips,
        driver.cancelledTrips
      );

    res.status(200).json({
      success: true,
      data: {
        totalTrips: driver.totalTrips,
        completedTrips: driver.completedTrips,
        cancelledTrips: driver.cancelledTrips,

        completionRate,
        cancellationRate,
        acceptanceRate,

        rating: driver.rating,
        totalRatings: driver.totalRatings,

        totalDistance: driver.totalDistance,

        totalEarnings: driver.totalEarnings,
        totalTips: driver.totalTips,

        todayEarnings: driver.todayEarnings,
        weekEarnings: driver.weekEarnings,
        monthEarnings: driver.monthEarnings,

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