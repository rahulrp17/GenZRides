import Booking from "../models/Booking.js";

/* ===========================================================
   CUSTOMER RIDE HISTORY
=========================================================== */

export const getRideHistory = async (
  userId,
  {
    page = 1,
    limit = 10,
    status = "",
    search = "",
    from = "",
    to = "",
    sort = "newest",
  }
) => {
  page = Number(page);
  limit = Number(limit);

  const query = {
    customer: userId,
  };

  /* ===========================
     STATUS FILTER
  ========================== */

  if (status) {
    query.bookingStatus = status;
  }

  /* ===========================
     SEARCH PICKUP / DROP
  ========================== */

  if (search) {
    query.$or = [
      {
        "pickup.address": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "drop.address": {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  /* ===========================
     DATE FILTER
  ========================== */

  if (from || to) {
    query.pickupDateTime = {};

    if (from) {
      query.pickupDateTime.$gte = new Date(from);
    }

    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      query.pickupDateTime.$lte = endDate;
    }
  }

  /* ===========================
     SORTING
  ========================== */

  const sortOption =
    sort === "oldest"
      ? { pickupDateTime: 1 }
      : { pickupDateTime: -1 };

  const skip = (page - 1) * limit;

  /* ===========================
     GET BOOKINGS
  ========================== */

  const rides = await Booking.find(query)
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name phone profileImage",
      },
    })
    .populate("customer", "name phone")
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Booking.countDocuments(query);

  /* ===========================
     SUMMARY
  ========================== */

  const completed = await Booking.countDocuments({
    customer: userId,
    bookingStatus: "Completed",
  });

  const cancelled = await Booking.countDocuments({
    customer: userId,
    bookingStatus: "Cancelled",
  });

  const totalSpentResult = await Booking.aggregate([
    {
      $match: {
        customer: userId,
        bookingStatus: "Completed",
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$finalFare",
        },
      },
    },
  ]);

  const totalSpent =
    totalSpentResult.length > 0
      ? totalSpentResult[0].total
      : 0;

  return {
    rides,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    },

    summary: {
      totalRides: total,
      completedRides: completed,
      cancelledRides: cancelled,
      totalSpent,
    },
  };
};