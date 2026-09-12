import Booking from "../models/Booking.js";
import DriverProfile from "../models/DriverProfile.js";

export const rateDriver = async (
  bookingId,
  customerId,
  rating,
  review
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.customer.toString() !== customerId.toString()) {
    throw new Error("Unauthorized.");
  }

  if (booking.bookingStatus !== "Completed") {
    throw new Error("Ride is not completed.");
  }

  if (booking.rating) {
    throw new Error("You already rated this ride.");
  }

  booking.rating = rating;
  booking.review = review;

  await booking.save();

  const driver = await DriverProfile.findById(
    booking.driver
  );

  if (!driver) {
    throw new Error("Driver not found.");
  }

  const newAverage =
    (
      driver.rating * driver.totalRatings +
      rating
    ) /
    (driver.totalRatings + 1);

  driver.rating = Number(newAverage.toFixed(1));

  driver.totalRatings += 1;

  await driver.save();

  return booking;
};