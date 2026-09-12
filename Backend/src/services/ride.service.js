import Booking from "../models/Booking.js";
import DriverProfile from "../models/DriverProfile.js";

// Canonical booking status lifecycle. A status may only move to one of the
// states listed for its current value. This prevents illegal jumps such as
// Pending -> Completed or re-completing an already-completed ride.
const STATUS_TRANSITIONS = {
  Pending: ["Accepted", "Cancelled"],
  Accepted: ["On The Way", "Arrived", "Cancelled"],
  "On The Way": ["Arrived", "Started", "Cancelled"],
  Arrived: ["Started", "Cancelled"],
  Started: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

const TIMESTAMP_FIELD = {
  Accepted: "acceptedAt",
  "On The Way": "onTheWayAt",
  Arrived: "arrivedAt",
  Started: "startedAt",
  Completed: "completedAt",
  Cancelled: "cancelledAt",
};

export const updateRideStatus = async (bookingId, driverUserId, status) => {
  if (!STATUS_TRANSITIONS[status]) {
    throw new Error(`Invalid ride status: ${status}`);
  }

  const booking = await Booking.findById(bookingId)
    .populate({ path: "driver", populate: { path: "user", select: "_id" } })
    .lean();

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // Authorization: only the assigned driver may push status updates.
  if (booking.driver && booking.driver.user) {
    const ownerUserId = booking.driver.user._id?.toString();
    if (ownerUserId && ownerUserId !== driverUserId.toString()) {
      throw new Error("Unauthorized driver.");
    }
  }

  const fromStatus = booking.bookingStatus;
  const allowed = STATUS_TRANSITIONS[fromStatus] || [];
  if (!allowed.includes(status)) {
    throw new Error(
      `Cannot transition booking from ${fromStatus} to ${status}.`
    );
  }

  // Completion is finalized through the canonical completion path so the driver
  // wallet is credited and driver stats updated (the socket path must not bypass
  // the ledger). completeRide is itself atomic + idempotent.
  if (status === "Completed") {
    const { completeRide } = await import("./booking.service.js");
    return await completeRide(bookingId, driverUserId);
  }

  const update = { bookingStatus: status };
  const tsField = TIMESTAMP_FIELD[status];
  if (tsField) update[tsField] = new Date();

  const updated = await Booking.findOneAndUpdate(
    { _id: bookingId, bookingStatus: fromStatus },
    update,
    { new: true }
  );

  if (!updated) {
    throw new Error("Ride status update failed.");
  }

  return updated;
};
