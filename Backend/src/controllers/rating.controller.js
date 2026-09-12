import * as ratingService from "../services/rating.service.js";

export const rateDriver = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, review } = req.body;

    const result = await ratingService.rateDriver(
      bookingId,
      req.user._id,
      rating,
      review
    );

    res.status(200).json({
      success: true,
      message: "Driver rated successfully.",
      booking: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};