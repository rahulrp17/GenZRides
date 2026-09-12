import express from "express";
import {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  blockCustomer,
  unblockCustomer,
  deleteCustomer,
  getDrivers,
  getPendingDrivers,
  getApprovedDrivers,
  getRejectedDriver,
  getDriverById,
  approveDriver,
  rejectDriver,
  blockDriver,
  unblockDriver,
  deleteDriver,
  getWithdrawalRequests,
  approveWithdrawal,
  rejectWithdrawal,
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  uploadVehicleImage,
  enableVehicle,
  disableVehicle,
  deleteVehicle,
  getBookings,
  getBookingById,
  assignDriver,
  cancelBooking,
  completeBooking,
  getAllReviews,
  hideReview,
  unhideReview,
  deleteReview,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import { validate, validateParams, validateQuery } from "../middleware/validate.middleware.js";
import { paginationQuerySchema } from "../validators/common.validator.js";
import {
  createVehicleSchema,
  updateVehicleSchema,
  idParamSchema,
  assignDriverSchema,
  rejectWithdrawalSchema,
  rejectDriverSchema,
  rejectBookingSchema,
  cancelBookingSchema,
} from "../validators/admin.validator.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

// Dashboard
router.get("/dashboard", getDashboardStats);

// Customers
router.get("/customers", validateQuery(paginationQuerySchema), getCustomers);
router.get("/customers/:id", validateParams(idParamSchema), getCustomerById);
router.patch("/customers/:id/block", validateParams(idParamSchema), blockCustomer);
router.patch("/customers/:id/unblock", validateParams(idParamSchema), unblockCustomer);
router.delete("/customers/:id", validateParams(idParamSchema), deleteCustomer);

// Drivers
router.get("/drivers", validateQuery(paginationQuerySchema), getDrivers);
router.get("/drivers/pending", getPendingDrivers);
router.get("/drivers/approved", getApprovedDrivers);
router.get("/drivers/rejected", getRejectedDriver);
router.get("/drivers/:id", validateParams(idParamSchema), getDriverById);
router.patch("/drivers/:id/approve", validateParams(idParamSchema), approveDriver);
router.patch("/drivers/:id/reject", validateParams(idParamSchema), validate(rejectDriverSchema), rejectDriver);
router.patch("/drivers/:id/block", validateParams(idParamSchema), blockDriver);
router.patch("/drivers/:id/unblock", validateParams(idParamSchema), unblockDriver);
router.delete("/drivers/:id", validateParams(idParamSchema), deleteDriver);

// Vehicles
router.get("/vehicles", getVehicles);
router.post("/vehicles/upload-image", uploadSingle("image"), uploadVehicleImage);
router.get("/vehicles/:id", validateParams(idParamSchema), getVehicleById);
router.post("/vehicles", validate(createVehicleSchema), createVehicle);
router.put("/vehicles/:id", validateParams(idParamSchema), validate(updateVehicleSchema), updateVehicle);
router.patch("/vehicles/:id/enable", validateParams(idParamSchema), enableVehicle);
router.patch("/vehicles/:id/disable", validateParams(idParamSchema), disableVehicle);
router.delete("/vehicles/:id", validateParams(idParamSchema), deleteVehicle);

// Bookings
router.get("/bookings", validateQuery(paginationQuerySchema), getBookings);
router.get("/bookings/:id", validateParams(idParamSchema), getBookingById);
router.patch("/bookings/:id/assign-driver", validateParams(idParamSchema), validate(assignDriverSchema), assignDriver);
router.patch("/bookings/:id/cancel", validateParams(idParamSchema), validate(cancelBookingSchema), cancelBooking);
router.patch("/bookings/:id/complete", validateParams(idParamSchema), completeBooking);

// Withdrawals
router.get("/withdrawals", getWithdrawalRequests);
router.patch("/withdrawals/:id/approve", validateParams(idParamSchema), approveWithdrawal);
router.patch("/withdrawals/:id/reject", validateParams(idParamSchema), validate(rejectWithdrawalSchema), rejectWithdrawal);

// Reviews
router.get("/reviews", validateQuery(paginationQuerySchema), getAllReviews);
router.patch("/reviews/:id/hide", validateParams(idParamSchema), hideReview);
router.patch("/reviews/:id/unhide", validateParams(idParamSchema), unhideReview);
router.delete("/reviews/:id", validateParams(idParamSchema), deleteReview);

export default router;
