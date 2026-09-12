import express from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
  goOnline,
  goOffline,
  updateLocation,
  getCurrentBooking,
  getRideHistory,
  getTodayRides,
  getUpcomingBookings,
  getEarnings,
  getDashboard,
  getStatistics,
  getWallet,
  getWalletSummary,
  getWalletTransactions,
  requestWithdrawal,
} from "../controllers/driver.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import { paginationQuerySchema } from "../validators/common.validator.js";
import {
  createProfileSchema,
  updateLocationSchema,
  requestWithdrawalSchema,
  updateProfileSchema,
} from "../validators/driver.validator.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("driver"));

// Profile
router.post("/profile", validate(createProfileSchema), createProfile);
router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileSchema), updateProfile);

// Status
router.put("/online", goOnline);
router.put("/offline", goOffline);

// Location
router.put("/location", validate(updateLocationSchema), updateLocation);

// Booking
router.get("/current-booking", getCurrentBooking);
router.get("/history", validateQuery(paginationQuerySchema), getRideHistory);
router.get("/history/today", validateQuery(paginationQuerySchema), getTodayRides);
router.get("/upcoming", getUpcomingBookings);

// Earnings
router.get("/earnings", getEarnings);

// Wallet
router.get("/wallet", getWallet);
router.get("/wallet/summary", getWalletSummary);
router.get("/wallet/history", validateQuery(paginationQuerySchema), getWalletTransactions);
router.post("/wallet/withdrawal", validate(requestWithdrawalSchema), requestWithdrawal);

// Dashboard
router.get("/dashboard", getDashboard);
router.get("/statistics", getStatistics);

export default router;
