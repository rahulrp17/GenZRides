import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import DriverProfile from "../models/DriverProfile.js";

/* ===========================================================
   CREATE REVIEW
=========================================================== */

export const createReview = async (
  bookingId,
  customerId,
  data
) => {
  const { rating, review = "" } = data;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (
    booking.customer.toString() !==
    customerId.toString()
  ) {
    throw new Error("Unauthorized.");
  }

  if (booking.bookingStatus !== "Completed") {
    throw new Error(
      "You can review only completed rides."
    );
  }

  const exists = await Review.findOne({
    booking: bookingId,
  });

  if (exists) {
    throw new Error(
      "Review already submitted."
    );
  }

  const newReview = await Review.create({
    booking: booking._id,
    customer: customerId,
    driver: booking.driver,
    rating,
    review,
  });

  /* =====================================
     UPDATE DRIVER AVERAGE RATING
  ===================================== */

  const agg = await Review.aggregate([
    { $match: { driver: booking.driver } },
    { $group: { _id: null, avg: { $avg: "$rating" } } },
  ]);
  const average = agg[0]?.avg || rating;

  await DriverProfile.findByIdAndUpdate(
    booking.driver,
    {
      rating: Number(average.toFixed(1)),
    }
  );

  return await Review.findById(newReview._id)
    .populate("customer", "name")
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name",
      },
    })
    .populate("booking");
};

/* ===========================================================
   GET MY REVIEWS
=========================================================== */

export const getMyReviews = async (
  customerId,
  { page = 1, limit = 20 } = {}
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({
      customer: customerId,
      isHidden: false,
    })
      .populate({
        path: "driver",
        populate: {
          path: "user",
          select: "name profileImage",
        },
      })
      .populate("booking", "bookingStatus pickup drop finalFare")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ customer: customerId, isHidden: false }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* ===========================================================
   DRIVER REVIEWS
=========================================================== */

export const getDriverReviews = async (
  userIdOrDriverId,
  { page = 1, limit = 20 } = {}
) => {
  const driverProfile = await DriverProfile.findOne({
    user: userIdOrDriverId,
  }).lean();
  const driverId = driverProfile ? driverProfile._id : userIdOrDriverId;

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({
      driver: driverId,
      isHidden: false,
    })
      .populate("customer", "name profileImage")
      .populate("booking", "bookingStatus pickup drop finalFare")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ driver: driverId, isHidden: false }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};