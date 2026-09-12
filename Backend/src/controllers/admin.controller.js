import * as adminService from "../services/admin.service.js";
import { getIO } from "../socket/index.js";
import { uploadImage } from "../services/upload.service.js";

/* ===========================================================
   DASHBOARD
=========================================================== */

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully.",
      stats,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   CUSTOMER MANAGEMENT
=========================================================== */

/**
 * GET ALL CUSTOMERS
 */
export const getCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const customers = await adminService.getCustomers(
      Number(page),
      Number(limit),
      search
    );

    res.status(200).json({
      success: true,
      message: "Customers fetched successfully.",
      ...customers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET CUSTOMER BY ID
 */
export const getCustomerById = async (req, res) => {
  try {
    const customer =
      await adminService.getCustomerById(req.params.id);

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error(error);

    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * BLOCK CUSTOMER
 */
export const blockCustomer = async (req, res) => {
  try {
    const customer =
      await adminService.blockCustomer(req.params.id);

    res.status(200).json({
      success: true,
      message: "Customer blocked successfully.",
      customer,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UNBLOCK CUSTOMER
 */
export const unblockCustomer = async (req, res) => {
  try {
    const customer =
      await adminService.unblockCustomer(req.params.id);

    res.status(200).json({
      success: true,
      message: "Customer unblocked successfully.",
      customer,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE CUSTOMER
 */
export const deleteCustomer = async (req, res) => {
  try {
    await adminService.deleteCustomer(req.params.id);

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   DRIVER MANAGEMENT
=========================================================== */

/**
 * GET ALL DRIVERS
 */
export const getDrivers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const drivers = await adminService.getDrivers(
      Number(page),
      Number(limit),
      search
    );

    res.status(200).json({
      success: true,
      message: "Drivers fetched successfully.",
      ...drivers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET PENDING DRIVERS
 */
export const getPendingDrivers = async (req, res) => {
  try {
    const drivers =
      await adminService.getPendingDrivers();

    res.status(200).json({
      success: true,
      message: "Pending drivers fetched successfully.",
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET APPROVED DRIVERS
 */
export const getApprovedDrivers = async (req, res) => {
  try {
    const drivers =
      await adminService.getApprovedDrivers();

    res.status(200).json({
      success: true,
      message: "Approved drivers fetched successfully.",
      drivers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET REJECTED DRIVERS
 */
export const getRejectedDriver = async (req, res) => {
  try {
    const drivers =
      await adminService.getRejectedDrivers();

    res.status(200).json({
      success: true,
      message: "Rejected drivers fetched successfully.",
      drivers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET DRIVER BY ID
 */
export const getDriverById = async (req, res) => {
  try {
    const driver =
      await adminService.getDriverById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Driver details fetched successfully.",
      driver,
    });
  } catch (error) {
    console.error(error);

    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * APPROVE DRIVER
 */
export const approveDriver = async (req, res) => {
  try {
    const driver =
      await adminService.approveDriver(req.params.id);

    res.status(200).json({
      success: true,
      message: "Driver approved successfully.",
      driver,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * REJECT DRIVER
 */
export const rejectDriver = async (req, res) => {
  try {
    const driver =
      await adminService.rejectDriver(req.params.id);

    res.status(200).json({
      success: true,
      message: "Driver rejected successfully.",
      driver,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET WITHDRAWAL REQUESTS
 */

export const getWithdrawalRequests = async (
  req,
  res
) => {
  try {
    const requests =
      await adminService.getWithdrawalRequests();

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * APPROVE WITHDRAWAL REQUEST
 */ 
export const approveWithdrawal = async (
  req,
  res
) => {
  try {
    const request =
      await adminService.approveWithdrawal(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Withdrawal approved successfully.",
      data: request,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * REJECT WITHDRAWAL REQUEST
 */ 
export const rejectWithdrawal = async (
  req,
  res
) => {
  try {
    const request =
      await adminService.rejectWithdrawalRequest(
        req.params.id,
        req.body.remarks
      );

    res.status(200).json({
      success: true,
      message:
        "Withdrawal rejected.",
      data: request,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * BLOCK DRIVER
 */
export const blockDriver = async (req, res) => {
  try {
    const driver =
      await adminService.blockDriver(req.params.id);

    res.status(200).json({
      success: true,
      message: "Driver blocked successfully.",
      driver,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UNBLOCK DRIVER
 */
export const unblockDriver = async (req, res) => {
  try {
    const driver =
      await adminService.unblockDriver(req.params.id);

    res.status(200).json({
      success: true,
      message: "Driver unblocked successfully.",
      driver,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE DRIVER
 */
export const deleteDriver = async (req, res) => {
  try {
    await adminService.deleteDriver(req.params.id);

    res.status(200).json({
      success: true,
      message: "Driver deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   VEHICLE MANAGEMENT
=========================================================== */

/**
 * GET ALL VEHICLES
 */
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await adminService.getVehicles();

    res.status(200).json({
      success: true,
      message: "Vehicles fetched successfully.",
      vehicles,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET VEHICLE BY ID
 */
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await adminService.getVehicleById(req.params.id);

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * CREATE VEHICLE
 */
export const createVehicle = async (req, res) => {
  try {
    const vehicle = await adminService.createVehicle(req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully.",
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE VEHICLE
 */
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await adminService.updateVehicle(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully.",
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPLOAD VEHICLE IMAGE
 * Reuses the shared multer + Cloudinary upload pipeline. Returns a URL
 * the caller stores via create/update vehicle (Vehicle.image).
 */
export const uploadVehicleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded.",
      });
    }

    const result = await uploadImage(
      req.file.buffer,
      "cab-booking/vehicles"
    );

    res.status(200).json({
      success: true,
      message: "Vehicle image uploaded successfully.",
      url: result.secure_url || result.url,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ENABLE VEHICLE
 */
export const enableVehicle = async (req, res) => {
  try {
    const vehicle = await adminService.enableVehicle(req.params.id);

    res.status(200).json({
      success: true,
      message: "Vehicle enabled successfully.",
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DISABLE VEHICLE
 */
export const disableVehicle = async (req, res) => {
  try {
    const vehicle = await adminService.disableVehicle(req.params.id);

    res.status(200).json({
      success: true,
      message: "Vehicle disabled successfully.",
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE VEHICLE
 */
export const deleteVehicle = async (req, res) => {
  try {
    await adminService.deleteVehicle(req.params.id);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   BOOKING MANAGEMENT
=========================================================== */

/**
 * GET BOOKINGS
 */
export const getBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = "",
    } = req.query;

    const bookings = await adminService.getBookings(
      Number(page),
      Number(limit),
      status
    );

    res.status(200).json({
      success: true,
      ...bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET BOOKING BY ID
 */
export const getBookingById = async (req, res) => {
  try {
    const booking = await adminService.getBookingById(req.params.id);

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ASSIGN DRIVER
 */
export const assignDriver = async (req, res) => {
  try {
    const booking = await adminService.assignDriver(
      req.params.id,
      req.body.driverId
    );

    try {
      const io = getIO();
      io.to(req.params.id).emit("booking-updated", booking);
      io.to("admins").emit("booking-updated", booking);
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: "Driver assigned successfully.",
      booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * CANCEL BOOKING
 */
export const cancelBooking = async (req, res) => {
  try {
    const booking = await adminService.cancelBooking(
      req.params.id,
      req.body.reason
    );

    try {
      const io = getIO();
      io.to(req.params.id).emit("ride-status-updated", booking);
      io.to("admins").emit("ride-status-updated", booking);
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * COMPLETE BOOKING
 */
export const completeBooking = async (req, res) => {
  try {
    const booking = await adminService.completeBooking(req.params.id);

    try {
      const io = getIO();
      io.to(req.params.id).emit("ride-status-updated", booking);
      io.to("admins").emit("ride-status-updated", booking);
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: "Booking completed successfully.",
      booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET ALL REVIEWS
 */
export const getAllReviews = async (
  req,
  res
) => {
  try {
    const {
      page = 1,
      limit = 10,
      rating,
      driver,
      customer,
      hidden,
    } = req.query;

    const data =
      await adminService.getAllReviews(
        Number(page),
        Number(limit),
        {
          rating,
          driver,
          customer,
          hidden,
        }
      );

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * HIDE REVIEW
 */
export const hideReview = async (
  req,
  res
) => {
  try {
    const review =
      await adminService.hideReview(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Review hidden successfully.",
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UNHIDE REVIEW
 */
export const unhideReview = async (
  req,
  res
) => {
  try {
    const review =
      await adminService.unhideReview(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Review is now visible.",
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE REVIEW
 */
export const deleteReview = async (
  req,
  res
) => {
  try {
    const result =
      await adminService.deleteReview(
        req.params.id
      );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};