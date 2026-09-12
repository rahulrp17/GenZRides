import * as driverService from "../services/driver.service.js";
import * as walletService from "../services/wallet.service.js";


/* ===========================================================
   CREATE DRIVER PROFILE
=========================================================== */

export const createProfile = async (
  req,
  res
) => {
  try {
    const profile =
      await driverService.createDriverProfile(
        req.user._id,
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Driver profile created successfully.",
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===========================================================
   GET PROFILE
=========================================================== */

export const getProfile = async (req, res) => {
  try {
    const profile = await driverService.getDriverProfile(req.user._id);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   UPDATE PROFILE
=========================================================== */

export const updateProfile = async (req, res) => {
  try {
    const profile = await driverService.updateDriverProfile(
      req.user._id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   GO ONLINE
=========================================================== */

export const goOnline = async (req, res) => {
  try {
    const driver = await driverService.goOnline(req.user._id);

    res.status(200).json({
      success: true,
      message: "Driver is now online.",
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
   GO OFFLINE
=========================================================== */

export const goOffline = async (req, res) => {
  try {
    const driver = await driverService.goOffline(req.user._id);

    res.status(200).json({
      success: true,
      message: "Driver is now offline.",
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
   UPDATE LOCATION
=========================================================== */

export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const driver = await driverService.updateLocation(
      req.user._id,
      latitude,
      longitude
    );

    res.status(200).json({
      success: true,
      message: "Location updated.",
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
   CURRENT BOOKING
=========================================================== */

export const getCurrentBooking = async (req, res) => {
  try {
    const booking = await driverService.getCurrentBooking(req.user._id);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   RIDE HISTORY
=========================================================== */

export const getRideHistory = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const rides = await driverService.getRideHistory(
      req.user._id,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: rides,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
/* ===========================================================
   DRIVER WALLET
=========================================================== */

export const getWallet = async (
  req,
  res
) => {
  try {
    const wallet =
      await driverService.getWallet(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   WALLET HISTORY
=========================================================== */

export const getWalletTransactions = async (
  req,
  res
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const transactions =
      await driverService.getWalletTransactions(
        req.user._id,
        page,
        limit
      );

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   EARNINGS
=========================================================== */

export const getEarnings = async (req, res) => {
  try {
    const earnings = await driverService.getDriverEarnings(req.user._id);

    res.status(200).json({
      success: true,
      data: earnings,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   DASHBOARD
=========================================================== */

export const getDashboard = async (req, res) => {
  try {
    const dashboard = await driverService.getDriverDashboard(req.user._id);

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   REQUEST WITHDRAWAL
=========================================================== */
export const requestWithdrawal = async (
  req,
  res
) => {
  try {
    const request =
      await walletService.requestWithdrawal(
        req.user._id,
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Withdrawal request submitted.",
      data: request,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===========================================================
// WALLET SUMMARY
// ============================================================ */

export const getWalletSummary = async (
  req,
  res
) => {
  try {
    const summary =
      await driverService.getWalletSummary(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   TODAY RIDES
=========================================================== */

export const getTodayRides = async (
  req,
  res
) => {
  try {
    const rides =
      await driverService.getTodayRides(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: rides,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===========================================================
   UPCOMING BOOKINGS
=========================================================== */
export const getUpcomingBookings =
  async (req, res) => {
    try {
      const bookings =
        await driverService.getUpcomingBookings(
          req.user._id
        );

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

/* ===========================================================
   DRIVER STATISTICS
=========================================================== */

export const getStatistics = async (
  req,
  res
) => {
  try {
    const statistics =
      await driverService.getDriverStatistics(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};