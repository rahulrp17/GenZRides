import * as reviewService from "../services/review.service.js";

/* ===========================================================
   CREATE REVIEW
=========================================================== */

export const createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview(
      req.params.bookingId,
      req.user._id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   MY REVIEWS (CUSTOMER)
=========================================================== */

export const getMyReviews = async (req, res) => {
  try {
    const { reviews, pagination } = await reviewService.getMyReviews(
      req.user._id,
      req.query
    );

    res.status(200).json({
      success: true,
      ...pagination,
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   DRIVER REVIEWS
=========================================================== */

export const getDriverReviews = async (req, res) => {
  try {
    const { reviews, pagination } =
      await reviewService.getDriverReviews(
        req.user._id,
        req.query
      );

    res.status(200).json({
      success: true,
      ...pagination,
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};