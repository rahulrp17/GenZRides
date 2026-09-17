import Booking from "../models/Booking.js";
import DriverProfile from "../models/DriverProfile.js";

import { notifyUser } from "./notification.service.js";
import { sendRideRequest } from "./notification.service.js";

/* ===========================================================
   FIND ELIGIBLE DRIVERS (NO DISTANCE FILTER)
   Business rule: a booking reaches EVERY online + available driver
   whose registered cab type matches — wherever they are. Proximity
   is intentionally NOT a criterion (outstation/intercity trips need
   non-local drivers too). Most-recently-active drivers are offered first.
=========================================================== */

export const findEligibleDrivers = async (
  vehicleTypeId = null
) => {
  // Vehicle-type filter: a booking must only reach drivers whose registered
  // cab type matches the customer's chosen vehicleType
  // (Sedan → Sedan, SUV → SUV, Innova → Innova, etc.).
  const query = {
    // Only verified (approved) drivers are eligible.
    approvalStatus: "Approved",
    isOnline: true,
    isAvailable: true,
  };

  if (vehicleTypeId) {
    query.vehicleType = vehicleTypeId;
  }

  const drivers = await DriverProfile.find(query)
    .populate("user", "name phone profileImage")
    .populate("vehicleType")
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();

  // VERBOSE: log vehicle-type routing result
  if (process.env.VERBOSE === "true" || process.env.NODE_ENV !== "production") {
    const typeStr = vehicleTypeId ? String(vehicleTypeId) : "ANY";
    console.log(`[findEligibleDrivers] vehicleType=${typeStr} found=${drivers.length} drivers=${drivers.map(d=>`${d.user?.name||d._id}:${d.vehicleType?.name}`).join(",")}`);
  }

  return drivers;
};

/* ===========================================================
   DISPATCH BOOKING
=========================================================== */

export const dispatchBooking = async (
  bookingId,
  latitude,
  longitude
) => {
  const booking = await Booking.findById(bookingId).populate(
    "vehicleType",
    "name"
  );

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // Already assigned
  if (booking.driver) {
    throw new Error(
      "Driver has already been assigned."
    );
  }

  // Prevent duplicate dispatch
  if (
    booking.driverQueue &&
    booking.driverQueue.length > 0
  ) {
    return {
      success: false,
      message:
        "Booking has already been dispatched.",
    };
  }

  // Only drivers whose registered cab type matches the booking's
  // vehicleType are eligible — never send an SUV booking to a Sedan
  // driver (or any other cross-type assignment). No distance filter:
  // every matching online driver is offered, wherever they are.
  const nearbyDrivers =
    await findEligibleDrivers(
      booking.vehicleType?._id || booking.vehicleType
    );

  if (!nearbyDrivers.length) {
    const cabType = booking.vehicleType?.name || "requested";
    // Customer/guest will see Pending → Waiting state via polling/socket; no error push.
    // Admin can assign manually from booking-requests.
    return {
      success: false,
      message:
        `No online ${cabType} drivers available right now.`,
    };
  }

  booking.driverQueue =
    nearbyDrivers.map(
      (driver) => driver._id
    );

  booking.currentDriverIndex = 0;

  booking.driverRequestStatus =
    "Waiting";

  booking.requestExpiresAt =
    new Date(
      Date.now() + 15000
    ); // 15 seconds

  await booking.save();

  const firstDriver =
    nearbyDrivers[0];

  const populatedBooking =
    await Booking.findById(
      booking._id
    )
      .populate(
        "customer",
        "name phone profileImage"
      )
      .populate("vehicleType")
      .populate({
        path: "driver",
        populate: {
          path: "user",
          select:
            "name phone profileImage",
        },
      });

  await sendRideRequest(
    firstDriver.user._id.toString(),
    populatedBooking
  );

  return {
    success: true,
    message:
      "Ride request sent to nearby drivers.",

    booking: populatedBooking,

    firstDriver,

    totalDrivers:
      nearbyDrivers.length,
  };
};


/* ===========================================================
   GET CURRENT DRIVER
=========================================================== */

export const getCurrentDriver = async (booking) => {
  if (!booking.driverQueue?.length) {
    return null;
  }

  if (
    booking.currentDriverIndex >=
    booking.driverQueue.length
  ) {
    return null;
  }

  return await DriverProfile.findById(
    booking.driverQueue[
      booking.currentDriverIndex
    ]
  )
    .populate(
      "user",
      "name phone email profileImage"
    )
    .populate("vehicleType");
};

/* ===========================================================
   SEND TO NEXT DRIVER
=========================================================== */

export const sendToNextDriver = async (
  bookingId
) => {
  const booking =
    await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // Already accepted
  if (
    booking.driverRequestStatus ===
    "Accepted"
  ) {
    return {
      success: false,
      message:
        "Booking already accepted.",
    };
  }

  // Move queue
  booking.currentDriverIndex += 1;

  // Queue finished
  if (
    booking.currentDriverIndex >=
    booking.driverQueue.length
  ) {
    booking.driverRequestStatus =
      "Rejected";

    booking.requestExpiresAt = null;

    await booking.save();

    await notifyUser({
      user: booking.customer,
      title: "No Drivers Available",
      message:
        "All nearby drivers rejected your booking. Please try again.",
      type: "Booking",
      booking: booking._id,
    });

    return {
      success: false,
      message:
        "No more drivers available.",
    };
  }

  booking.driverRequestStatus =
    "Waiting";

  booking.requestExpiresAt =
    new Date(
      Date.now() + 15000
    );

  await booking.save();

  const nextDriver =
    await getCurrentDriver(booking);

  if (!nextDriver) {
    return {
      success: false,
      message:
        "Next driver not found.",
    };
  }

  const populatedBooking =
    await Booking.findById(
      booking._id
    )
      .populate(
        "customer",
        "name phone profileImage"
      )
      .populate("vehicleType")
      .populate({
        path: "driver",
        populate: {
          path: "user",
          select:
            "name phone profileImage",
        },
      });

  await sendRideRequest(
    nextDriver.user._id.toString(),
    populatedBooking
  );

  return {
    success: true,
    message:
      "Ride request sent to next driver.",

    booking: populatedBooking,

    driver: nextDriver,

    remainingDrivers:
      booking.driverQueue.length -
      booking.currentDriverIndex -
      1,
  };
};


/* ===========================================================
   DRIVER REJECT BOOKING
=========================================================== */

export const rejectBooking = async (
  bookingId,
  driverUserId,
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  const driver = await DriverProfile.findOne({
    user: driverUserId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  // Already accepted by another driver
  if (booking.driverRequestStatus === "Accepted") {
    throw new Error("Booking already accepted.");
  }

  // Save rejected driver
  if (
    !booking.rejectedDrivers.some(
      (id) => id.toString() === driver._id.toString(),
    )
  ) {
    booking.rejectedDrivers.push(driver._id);
  }

  booking.driverRequestStatus = "Rejected";
  booking.requestExpiresAt = null;

  await booking.save();

  // Notify rejected driver
  await notifyUser({
    user: driver.user,
    title: "Booking Rejected",
    message: "You rejected the ride request.",
    type: "Ride",
    booking: booking._id,
  });

  // Dispatch next driver
  return await sendToNextDriver(booking._id);
};

/* ===========================================================
   DRIVER REQUEST TIMEOUT
=========================================================== */

export const handleDriverTimeout = async (
  bookingId,
) => {
  const booking = await Booking.findById(
    bookingId,
  );

  if (!booking) {
    return;
  }

  // Ignore if already accepted
  if (
    booking.driverRequestStatus ===
    "Accepted"
  ) {
    return;
  }

  // Ignore cancelled booking
  if (
    booking.bookingStatus ===
    "Cancelled"
  ) {
    return;
  }

  // Timer not expired yet
  if (
    booking.requestExpiresAt &&
    booking.requestExpiresAt > new Date()
  ) {
    return;
  }

  booking.driverRequestStatus = "Timeout";
  booking.requestExpiresAt = null;

  await booking.save();

  // Notify customer
  await notifyUser({
    user: booking.customer,
    title: "Searching Another Driver",
    message:
      "The current driver didn't respond. Looking for another nearby driver.",
    type: "Booking",
    booking: booking._id,
  });

  // Continue dispatch
  return await sendToNextDriver(
    booking._id,
  );
};

/* ===========================================================
   DRIVER ACCEPT BOOKING
=========================================================== */

export const acceptBooking = async (
  bookingId,
  driverUserId
) => {
  const booking = await Booking.findById(bookingId).populate(
    "vehicleType",
    "name"
  );

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // Already accepted
  if (booking.driver) {
    throw new Error(
      "Booking has already been accepted."
    );
  }

  const driver = await DriverProfile.findOne({
    user: driverUserId,
  })
    .populate("user", "name phone profileImage")
    .populate("vehicleType");

  if (!driver) {
    throw new Error("Driver not found.");
  }

  // Driver must be approved
  if (driver.approvalStatus !== "Approved") {
    throw new Error("Driver is not approved.");
  }

  // Driver must be online
  if (!driver.isOnline) {
    throw new Error("Driver is offline.");
  }

  // Driver must be available
  if (!driver.isAvailable) {
    throw new Error(
      "Driver is already on another ride."
    );
  }

  // Vehicle-type guard: a driver may only accept bookings for their own
  // cab type (SUV bookings → SUV drivers only, Sedan → Sedan, etc.).
  // This also blocks direct accepts on bookings created without dispatch.
  if (booking.vehicleType) {
    const requiredTypeId = booking.vehicleType._id
      ? booking.vehicleType._id.toString()
      : booking.vehicleType.toString();

    const driverTypeId = driver.vehicleType?._id
      ? driver.vehicleType._id.toString()
      : driver.vehicleType?.toString();

    if (driverTypeId !== requiredTypeId) {
      throw new Error(
        `This booking requires a ${booking.vehicleType.name || "matching"} vehicle.`
      );
    }
  }

  // Only the current driver in the queue may accept — unless the booking was
  // created without dispatch (no queue), in which case any approved driver may
  // accept directly.
  const hasQueue =
    booking.driverQueue &&
    booking.driverQueue.length > 0;

  if (hasQueue) {
    const currentDriverId =
      booking.driverQueue[
        booking.currentDriverIndex
      ];

    if (
      !currentDriverId ||
      currentDriverId.toString() !==
        driver._id.toString()
    ) {
      throw new Error(
        "This ride request is not assigned to you."
      );
    }
  }

  /* ==========================================
      ATOMIC ACCEPT
      Prevents two drivers (or two concurrent
      requests from the same driver) from
      accepting the same booking.
  ========================================== */

  // Build the atomic guard. When the booking was created without dispatch
  // (no driverQueue), any approved driver may accept — the only guard is that
  // the booking is still unassigned.
  const atomicGuard = hasQueue
    ? {
        _id: booking._id,
        driver: null,
        driverRequestStatus: "Waiting",
        [`driverQueue.${booking.currentDriverIndex}`]: driver._id,
      }
    : {
        _id: booking._id,
        driver: null,
        bookingStatus: "Pending",
      };

  const accepted = await Booking.findOneAndUpdate(
    atomicGuard,
    {
      driver: driver._id,
      bookingStatus: "Accepted",
      driverRequestStatus: "Accepted",
      driverAssignedAt: new Date(),
      acceptedAt: new Date(),
      requestExpiresAt: null,
    },
    { new: true }
  );

  if (!accepted) {
    const refreshed = await Booking.findById(booking._id);
    if (!refreshed) throw new Error("Booking not found.");
    if (refreshed.driver) throw new Error("Booking has already been accepted.");
    if (refreshed.driverRequestStatus !== "Waiting") {
      throw new Error("This ride request is no longer available.");
    }
    throw new Error("Booking has already been accepted.");
  }

  /* ==========================================
      UPDATE DRIVER
  ========================================== */

  driver.currentRide = booking._id;

  driver.isAvailable = false;

  await driver.save();

  /* ==========================================
      CUSTOMER NOTIFICATION
  ========================================== */

  await notifyUser({
    user: booking.customer,
    title: "Driver Assigned",
    message: `${driver.user.name} has accepted your booking.`,
    type: "Ride",
    booking: booking._id,
    data: {
      driver: driver.user.name,
      vehicle:
        driver.vehicleType?.name,
    },
  });

  /* ==========================================
      DRIVER NOTIFICATION
  ========================================== */

  await notifyUser({
    user: driver.user._id,
    title: "Ride Accepted",
    message:
      "You successfully accepted the booking.",
    type: "Ride",
    booking: booking._id,
  });

  /* ==========================================
      RETURN UPDATED BOOKING
  ========================================== */

  const updatedBooking =
    await Booking.findById(
      booking._id
    )
      .populate(
        "customer",
        "name phone profileImage"
      )
      .populate("vehicleType")
      .populate({
        path: "driver",
        populate: [
          {
            path: "user",
            select:
              "name phone profileImage",
          },
          {
            path: "vehicleType",
          },
        ],
      });

  return {
    success: true,
    message:
      "Booking accepted successfully.",

    booking: updatedBooking,
  };
};