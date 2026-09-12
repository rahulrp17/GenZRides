import * as dispatchService from "../services/dispatch.service.js";

/* ===========================================================
   DISPATCH BOOKING
=========================================================== */

export const dispatchBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;

    const result = await dispatchService.dispatchBooking(
      bookingId,
      latitude,
      longitude
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   ACCEPT BOOKING
=========================================================== */

export const acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await dispatchService.acceptBooking(
      bookingId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Booking accepted successfully.",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   REJECT BOOKING
=========================================================== */

export const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await dispatchService.rejectBooking(
      bookingId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Booking rejected.",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   NEXT DRIVER
=========================================================== */

export const sendToNextDriver = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result =
      await dispatchService.sendToNextDriver(
        bookingId
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   DRIVER TIMEOUT
=========================================================== */

export const handleDriverTimeout = async (
  req,
  res
) => {
  try {
    const { bookingId } = req.params;

    const result =
      await dispatchService.handleDriverTimeout(
        bookingId
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};