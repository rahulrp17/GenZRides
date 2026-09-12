import * as paymentService from "../services/payment.service.js";

/* ===========================================================
   CREATE ORDER
=========================================================== */

export const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const order = await paymentService.createOrder(
      bookingId,
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   VERIFY PAYMENT
=========================================================== */

export const verifyPayment = async (req, res) => {
  try {
    const result = await paymentService.verifyPayment(req.body);

    res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
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
   PAYMENT HISTORY
=========================================================== */

export const getPaymentHistory = async (req, res) => {
  try {
    const { payments, pagination } =
      await paymentService.getPaymentHistory(
        req.user._id,
        req.query
      );

    res.status(200).json({
      success: true,
      ...pagination,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   PAYMENT DETAILS
=========================================================== */

export const getPaymentById = async (req, res) => {
  try {
    const payment =
      await paymentService.getPaymentById(
        req.params.id,
        req.user
      );

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   REFUND PAYMENT
=========================================================== */

export const refundPayment = async (req, res) => {
  try {
    const refund =
      await paymentService.refundPayment(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully.",
      refund,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};