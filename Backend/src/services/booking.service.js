import bcrypt from "bcryptjs";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import DriverProfile from "../models/DriverProfile.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Visitor from "../models/Visitor.js";
import { notifyAdminOfBooking } from "./whatsapp.service.js";
import { notifyAdminOfBookingEmail } from "./email.service.js";

import { getRoute } from "./googleMaps.service.js";
import { calculateFare } from "./fare.service.js";

import { notifyUser } from "./notification.service.js";

import {
  creditWallet,
  tipDriver,
} from "./wallet.service.js";

// Lazy auto-dispatch to matching vehicle-type drivers only (Sedan→Sedan, SUV→SUV, Innova→Innova)
const tryAutoDispatch = async (booking) => {
  try {
    const { dispatchBooking } = await import("./dispatch.service.js");
    const res = await dispatchBooking(booking._id, booking.pickup.latitude, booking.pickup.longitude);
    console.log(`[auto-dispatch] booking=${booking._id} vehicle=${booking.vehicleType} result=${res?.success ? "dispatched" : res?.message}`);
  } catch (e) {
    console.log(`[auto-dispatch] booking=${booking?._id} skip: ${e?.message}`);
  }
};

import { updateDriverStats } from "./driverStatus.service.js";
import { withTransaction } from "../config/transaction.js";

/* ===========================================================
   CREATE BOOKING
=========================================================== */

export const createBooking = async (
  customerId,
  bookingData,
  options = {}
) => {
  // Guest snapshots are accepted ONLY from the guest pipeline
  // (createGuestBooking → allowGuestSnapshot: true). Authenticated
  // bookings must never create/store guest contact data, even if a
  // caller smuggles guest fields into the request body.
  const { allowGuestSnapshot = false } = options;

  const {
    pickup,
    drop,
    pickupDateTime,
    tripType = "One Way",
    days = 1,
    vehicleType,
    paymentMethod = "Cash",
    customerNotes = "",
    // Guest snapshot — when present (guest flow) these are stored atomically
    // so the admin email sees the guest's real contact, not the placeholder
    // `guest-<phone>@guest.letsgocab.local` account email.
    guestName = null,
    guestEmail = null,
    guestPhone = null,
    // Admin approval gate. Instant (guest) bookings are created
    // "Pending Approval" and stay hidden from drivers until verified.
    // Registered customer bookings default to "Approved".
    approvalStatus = "Approved",
  } = bookingData;

  const guestSnapshot = allowGuestSnapshot
    ? {
        ...(guestName ? { guestName: String(guestName).trim() } : {}),
        ...(guestEmail ? { guestEmail: String(guestEmail).trim().toLowerCase() } : {}),
        ...(guestPhone ? { guestPhone: String(guestPhone).trim() } : {}),
      }
    : {};

  /* ===========================
     VALIDATION
  =========================== */

  if (!pickup || !drop) {
    throw new Error(
      "Pickup and Drop are required."
    );
  }

  if (
    pickup.latitude == null ||
    pickup.longitude == null ||
    drop.latitude == null ||
    drop.longitude == null
  ) {
    throw new Error(
      "Pickup and Drop coordinates are required."
    );
  }

  /* ===========================
     ROUTE
  =========================== */

  const route = await getRoute(
    pickup,
    drop
  );

  const {
    distance,
    duration,
    polyline,
  } = route;

  /* ===========================
     FARE
  =========================== */

  const fare =
    await calculateFare({
      vehicleId: vehicleType,
      distance,
      pickupDateTime,
      tripType,
      days,
      // Round-trip Bengaluru minimum (250 vs 300 km/day) resolves from
      // the drop address; empty matches nothing and keeps standard rules.
      destinationCity: drop?.address || "",
    });

  /* ===========================
     CREATE BOOKING
  =========================== */

  const booking =
    await Booking.create({
      customer: customerId,

      pickup,
      drop,

      pickupDateTime,

      tripType,
      days,

      vehicleType,

      distance,
      duration,
      routePolyline: polyline,

      estimatedFare:
        fare.estimatedFare,

      paymentMethod,

      customerNotes,

      // Snapshot guest contact only for the guest pipeline. The
      // authenticated flow always leaves these null, so admin emails and
      // dashboards resolve the customer's real account email via
      // `getBookingEmailFields` → User. A placeholder guest address can
      // never be created or stored on a logged-in booking.
      ...guestSnapshot,

      bookingStatus: "Pending",

      approvalStatus,

      paymentStatus:
        paymentMethod === "Cash"
          ? "Pending"
          : "Pending",
    });

  /* ===========================
     NOTIFY CUSTOMER
  =========================== */

  await notifyUser({
    user: customerId,
    title: "Booking Created",
    message:
      "Your booking has been created successfully. Waiting for a driver to accept.",
    type: "Booking",
    booking: booking._id,
  });

  /* ===========================
     NOTIFY ADMINS
  =========================== */

  const admins = await User.find({ role: "admin" }).select("_id");
  for (const admin of admins) {
    await notifyUser({
      user: admin._id,
      title: "New Booking",
      message: `New booking from ${pickup.address || "N/A"} to ${drop.address || "N/A"} (${booking.vehicleType}).`,
      type: "Booking",
      booking: booking._id,
    });
  }

  /* ===========================
     RETURN
  =========================== */

  const populatedBooking =
    await Booking.findById(
      booking._id
    )
      .populate(
        "customer",
        "name phone profileImage"
      )
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
      })
      .populate("vehicleType");

  /* ===========================
      ADMIN WHATSAPP ALERT (guest + logged-in)
      Best-effort: failures never break booking creation,
      duplicates are suppressed per booking.
      Fire-and-forget so Confirm → Waiting is instant (email/WhatsApp
      may take 1-10s via Brevo/Resend/SMTP; must not block response).
  =========================== */

  notifyAdminOfBooking(populatedBooking).catch(() => {});
  notifyAdminOfBookingEmail(populatedBooking).catch(() => {});

  // VERBOSE: Auto-dispatch to matching vehicle-type drivers only
  // Sedan→Sedan, SUV→SUV, Innova→Innova (via dispatch.service findEligibleDrivers vehicleType filter)
  // Admin still gets all bookings via emitToAdmins in booking.controller; this dispatch is driver-only.
  // Best-effort: never breaks booking creation.
  // Approval gate: bookings awaiting admin verification are never
  // dispatched — the verify endpoint dispatches after approving.
  if (approvalStatus === "Approved") {
    tryAutoDispatch(populatedBooking).catch(() => {});
  }

  return {
    success: true,
    message:
      "Booking created successfully. Waiting for a driver to accept.",

    booking: populatedBooking,
  };
};

/* ===========================================================
   CREATE GUEST BOOKING (no JWT)
   Reuses the standard booking pipeline so guest bookings appear
   in Admin dashboards with the identical status, notification
   and WhatsApp flow as logged-in bookings — except dispatch:
   instant bookings are created "Pending Approval" and stay
   hidden from drivers until an admin verifies them.
=========================================================== */

const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

export const createGuestBooking = async (guestData) => {
  const {
    pickup,
    drop,
    pickupDateTime,
    tripType = "One Way",
    days = 1,
    returnDateTime,
    vehicleType,
    customerNotes = "",
    guestName,
    guestEmail,
    guestPhone,
  } = guestData;

  /* ===========================
     FIND-OR-PROVISION GUEST CUSTOMER
     Phone is the identity key, so repeat guests (same phone, any
     email) always succeed. The provided contact details are
     snapshotted on the booking itself. A fresh User record uses
     the given email when free, otherwise a unique placeholder —
     the real address is never lost (see guestEmail on Booking).
  =========================== */

  const cleanEmail = guestEmail.trim().toLowerCase();

  let customer = await User.findOne({ phone: guestPhone });

  if (customer) {
    if (customer.role !== "customer") {
      throw new Error(
        "This phone number is registered with a different account type."
      );
    }
    if (customer.isBlocked) {
      throw new Error("Your account has been blocked.");
    }
  } else {
    // NEVER claim the guest's real email on the account. Guest accounts use a
    // phone-keyed placeholder so the real address stays free for a proper
    // registration later, repeat guests always succeed, and the admin dashboard
    // can separate "Instant Bookers" from registered customers cleanly.
    // The real address typed by the guest is snapshotted on the booking itself
    // (see guestEmail on Booking), never lost.
    const recordEmail = `guest-${guestPhone}@guest.letsgocab.local`;

    // Random unusable password: guest accounts cannot log in with it.
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    customer = await User.create({
      name: guestName.trim(),
      email: recordEmail,
      phone: guestPhone,
      password: hashedPassword,
      role: "customer",
      isVerified: false,
    });
  }

  /* ===========================
     ROUND-TRIP DAYS FROM RETURN DATE
  =========================== */

  let effectiveDays = days;
  if (tripType === "Round Trip" && returnDateTime) {
    const diffMs =
      new Date(returnDateTime).getTime() -
      new Date(pickupDateTime).getTime();
    if (diffMs <= 0) {
      throw new Error("Return date must be after pickup date.");
    }
    effectiveDays = Math.max(
      1,
      Math.ceil(diffMs / (24 * 60 * 60 * 1000))
    );
  }

  /* ===========================
     DUPLICATE-SUBMISSION PROTECTION
     Same customer + same route + same pickup minute + created
     within the window + still active => replay, not a new booking.
  =========================== */

  const pickupMinute = new Date(pickupDateTime);
  pickupMinute.setSeconds(0, 0);

  const recentDuplicate = await Booking.findOne({
    customer: customer._id,
    bookingStatus: {
      $in: ["Pending", "Accepted", "On The Way", "Arrived"],
    },
    "pickup.address": pickup.address,
    "drop.address": drop.address,
    pickupDateTime: {
      $gte: pickupMinute,
      $lt: new Date(pickupMinute.getTime() + 60 * 1000),
    },
    createdAt: {
      $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS),
    },
  })
    .populate("customer", "name phone profileImage")
    .populate("vehicleType")
    .populate({
      path: "driver",
      populate: [
        { path: "user", select: "name phone profileImage" },
        { path: "vehicleType" },
      ],
    });

  if (recentDuplicate) {
    return {
      success: true,
      message:
        "Booking already received. Waiting for a driver to accept.",
      booking: recentDuplicate,
      duplicate: true,
      isGuest: true,
    };
  }

  /* ===========================
      STANDARD PIPELINE (same as logged-in flow)
      Guest snapshot is stored atomically with the booking so the admin
      email (sent inside createBooking) sees the real guest contact
      (guestEmail/phone) rather than the placeholder account email. This
      fixes production where most guest bookings appeared to send with
      `guest-...@guest.letsgocab.local` instead of the guest's actual
      email — perceived as "email not sent".
  =========================== */

  const result = await createBooking(customer._id, {
    pickup,
    drop,
    pickupDateTime,
    tripType,
    days: effectiveDays,
    vehicleType,
    paymentMethod: "Cash",
    customerNotes,
    guestName: guestName.trim(),
    guestEmail: cleanEmail,
    guestPhone,
    // Instant bookings wait for admin verification before dispatch.
    approvalStatus: "Pending Approval",
  }, { allowGuestSnapshot: true });

return {
    ...result,
    duplicate: false,
    isGuest: true,
  };
};

/* ===========================================================
   GUEST VISIT ("Book Now") — temporary intent, NOT a booking.
   Stores the guest's trip + contact as a Visitor only: no
   Booking document, no dispatch, no driver visibility. The
   visit converts into a real instant booking on confirm, or
   expires 10 minutes after creation.
========================================================== */

const VISIT_TTL_MS = 10 * 60 * 1000;

const makeVisitorReference = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "";
  const bytes = crypto.randomBytes(6);
  for (const b of bytes) ref += chars[b % chars.length];
  return `VST-${ref}`;
};

export const sweepExpiredVisitors = async () => {
  const res = await Visitor.updateMany(
    { status: "Pending", expiresAt: { $lte: new Date() } },
    { $set: { status: "Expired" } }
  );
  return res.modifiedCount ?? 0;
};

export const createVisit = async (visitData) => {
  const {
    pickup,
    drop,
    pickupDateTime,
    tripType = "One Way",
    days = 1,
    returnDateTime = null,
    vehicleType,
    customerNotes = "",
    guestName,
    guestEmail,
    guestPhone,
  } = visitData;

  await sweepExpiredVisitors();

  const vehicle = await Vehicle.findById(vehicleType);
  if (!vehicle || vehicle.isActive === false) {
    throw new Error("Selected vehicle type is not available.");
  }

  let effectiveDays = days;
  if (tripType === "Round Trip" && returnDateTime) {
    const diffMs =
      new Date(returnDateTime).getTime() -
      new Date(pickupDateTime).getTime();
    if (diffMs <= 0) {
      throw new Error("Return date must be after pickup date.");
    }
    effectiveDays = Math.max(
      1,
      Math.ceil(diffMs / (24 * 60 * 60 * 1000))
    );
  }

  let reference = makeVisitorReference();
  for (let i = 0; i < 3; i++) {
    const clash = await Visitor.findOne({ reference })
      .select("_id")
      .lean();
    if (!clash) break;
    reference = makeVisitorReference();
  }

  const visitor = await Visitor.create({
    guestName: guestName.trim(),
    guestEmail: guestEmail.trim().toLowerCase(),
    guestPhone: guestPhone.trim(),
    pickup,
    drop,
    pickupDateTime,
    tripType,
    days: effectiveDays,
    returnDateTime: returnDateTime || null,
    vehicleType: vehicle._id,
    customerNotes: (customerNotes || "").trim(),
    status: "Pending",
    reference,
    expiresAt: new Date(Date.now() + VISIT_TTL_MS),
  });

  const populated = await Visitor.findById(visitor._id)
    .populate("vehicleType", "name image seats")
    .lean();

  return {
    success: true,
    message: "Trip reserved for 10 minutes. Confirm to book your cab.",
    visitor: populated,
  };
};

/* ===========================================================
   GUEST CONFIRM — converts a pending visit into a real instant
   booking ("Pending Approval", hidden from drivers until an
   admin verifies it). Idempotent: confirming twice returns the
   same booking instead of creating a second one.
========================================================== */

export const confirmVisit = async (visitorId) => {
  await sweepExpiredVisitors();

  const visitor = await Visitor.findById(visitorId);

  if (!visitor) {
    throw Object.assign(new Error("Visit not found or expired."), {
      code: 404,
    });
  }

  if (visitor.status === "Confirmed" && visitor.bookingId) {
    const existing = await Booking.findById(visitor.bookingId)
      .populate("customer", "name phone profileImage")
      .populate("vehicleType");
    if (existing) {
      return {
        success: true,
        message: "Booking already confirmed.",
        booking: existing,
        duplicate: true,
        isGuest: true,
        visitorId: visitor._id,
      };
    }
  }

  if (visitor.status !== "Pending") {
    throw Object.assign(
      new Error(
        visitor.status === "Expired"
          ? "This trip hold expired. Please start a new booking."
          : "This visit can no longer be confirmed."
      ),
      { code: 410 }
    );
  }

  if (visitor.expiresAt <= new Date()) {
    visitor.status = "Expired";
    await visitor.save();
    throw Object.assign(
      new Error("This trip hold expired. Please start a new booking."),
      { code: 410 }
    );
  }

  // Atomic claim: exactly one confirm wins a visit, even under retry.
  const claimed = await Visitor.findOneAndUpdate(
    {
      _id: visitor._id,
      status: "Pending",
      expiresAt: { $gt: new Date() },
    },
    { $set: { status: "Confirmed" } },
    { new: true }
  );

  if (!claimed) {
    throw Object.assign(
      new Error("This trip hold expired. Please start a new booking."),
      { code: 410 }
    );
  }

  const result = await createGuestBooking({
    pickup: {
      address: visitor.pickup.address,
      latitude: visitor.pickup.latitude,
      longitude: visitor.pickup.longitude,
    },
    drop: {
      address: visitor.drop.address,
      latitude: visitor.drop.latitude,
      longitude: visitor.drop.longitude,
    },
    pickupDateTime: new Date(visitor.pickupDateTime).toISOString(),
    tripType: visitor.tripType,
    days: visitor.days,
    vehicleType: visitor.vehicleType.toString(),
    customerNotes: visitor.customerNotes || "",
    guestName: visitor.guestName,
    guestEmail: visitor.guestEmail,
    guestPhone: visitor.guestPhone,
  });

  claimed.bookingId = result.booking._id;
  await claimed.save();

  return {
    ...result,
    visitorId: claimed._id,
  };
};

/* ===========================================================
   GUEST BOOKING LOOKUP
   A guest has no account, so the booking reference (last 8 of the
   _id) plus the guest's phone number is the identity proof. The
   backend is the source of truth — localStorage on the client is
   only a convenience key that auto-fills these two values.
=========================================================== */

export const lookupGuestBooking = async (ref, phone) => {
  const cleanPhone = String(phone).trim();
  const cleanRef = String(ref).trim().replace(/^#/, "").toLowerCase();

  if (!cleanRef || cleanRef.length < 6) {
    throw new Error("Booking reference is invalid.");
  }

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanRef);

  const query = isObjectId
    ? { _id: cleanRef }
    : {
        $expr: {
          $regexMatch: {
            input: { $toString: "$_id" },
            regex: `${cleanRef.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          },
        },
      };

  const booking = await Booking.findOne(query)
    .populate("vehicleType", "name image")
    .populate({
      path: "driver",
      select: "user vehicleBrand vehicleModel vehicleNumber vehicleColor vehicleType",
      populate: [
        { path: "user", select: "name phone" },
        { path: "vehicleType", select: "name" },
      ],
    })
    .lean();

  if (!booking || !booking.guestPhone) {
    throw Object.assign(new Error("Booking not found."), { code: 404 });
  }

  if (booking.guestPhone !== cleanPhone) {
    throw Object.assign(new Error("Booking reference and phone don't match."), {
      code: 404,
    });
  }

  return {
    _id: booking._id,
    ref: String(booking._id).slice(-8).toUpperCase(),
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    bookingStatus: booking.bookingStatus,
    approvalStatus: booking.approvalStatus || "Approved",
    pickup: booking.pickup,
    drop: booking.drop,
    pickupDateTime: booking.pickupDateTime,
    tripType: booking.tripType || "One Way",
    days: booking.days || 1,
    vehicleType: booking.vehicleType?.name || "—",
    estimatedFare: booking.estimatedFare,
    finalFare: booking.finalFare || booking.estimatedFare,
    distance: booking.distance,
    duration: booking.duration,
    paymentMethod: booking.paymentMethod || "Cash",
    paymentStatus: booking.paymentStatus || "Pending",
    driver: booking.driver
      ? {
          name: booking.driver.user?.name,
          phone: booking.driver.user?.phone,
          vehicleBrand: booking.driver.vehicleBrand,
          vehicleModel: booking.driver.vehicleModel,
          vehicleNumber: booking.driver.vehicleNumber,
          vehicleColor: booking.driver.vehicleColor,
          vehicleType: booking.driver.vehicleType?.name,
        }
      : null,
    cancelledBy: booking.cancelledBy,
    cancelledAt: booking.cancelledAt,
    cancelReason: booking.cancelReason,
    createdAt: booking.createdAt,
  };
};

/* ===========================================================
   GUEST BOOKING CANCEL
   Same guard logic as the customer cancel, but the phone number
   (snapshotted on the booking) stands in for the JWT session.
=========================================================== */

export const guestCancelBooking = async (
  bookingId,
  phone,
  cancelReason = "No reason provided"
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking || !booking.guestPhone) {
    throw Object.assign(new Error("Booking not found."), { code: 404 });
  }

  if (booking.guestPhone !== String(phone).trim()) {
    throw new Error("Unauthorized.");
  }

  if (booking.bookingStatus === "Completed") {
    throw new Error("Completed ride cannot be cancelled.");
  }

  if (booking.bookingStatus === "Cancelled") {
    throw new Error("Booking already cancelled.");
  }

  /* ==========================================
      UPDATE BOOKING
  ========================================== */

  booking.bookingStatus = "Cancelled";
  booking.cancelledAt = new Date();
  booking.cancelReason = cancelReason;
  booking.cancelledBy = "Customer";
  booking.driverRequestStatus = "Rejected";
  booking.driverQueue = [];
  booking.currentDriverIndex = 0;
  booking.requestExpiresAt = null;

  await booking.save();

  /* ==========================================
      RELEASE DRIVER
  ========================================== */

  if (booking.driver) {
    const driver = await DriverProfile.findById(booking.driver);

    if (driver) {
      driver.currentRide = null;
      driver.isAvailable = driver.isOnline;
      driver.totalTrips += 1;
      driver.cancelledTrips += 1;

      await driver.save();

      // Notify driver
      await notifyUser({
        user: driver.user,
        title: "Booking Cancelled",
        message: "The guest cancelled the booking.",
        type: "Booking",
        booking: booking._id,
      });
    }
  }

  /* ==========================================
      NOTIFY CUSTOMER (guest account)
  ========================================== */

  await notifyUser({
    user: booking.customer,
    title: "Booking Cancelled",
    message: "Your booking has been cancelled successfully.",
    type: "Booking",
    booking: booking._id,
  });

  const updatedBooking = await Booking.findById(booking._id)
    .populate("vehicleType", "name image")
    .populate({
      path: "driver",
      select: "user vehicleBrand vehicleModel vehicleNumber vehicleColor vehicleType",
      populate: [
        { path: "user", select: "name phone" },
        { path: "vehicleType", select: "name" },
      ],
    });

  return {
    success: true,
    message: "Booking cancelled successfully.",
    booking: updatedBooking,
  };
};

/* ===========================================================
   CUSTOMER BOOKINGS
=========================================================== */

export const getMyBookings = async (
  customerId,
  { page = 1, limit = 12, status } = {}
) => {
  const skip = (page - 1) * limit;

  const query = { customer: customerId };
  if (status) query.bookingStatus = status;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate({
        path: "driver",
        populate: [
          {
            path: "user",
            select: "name phone profileImage",
          },
          {
            path: "vehicleType",
          },
        ],
      })
      .populate("vehicleType")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments(query),
  ]);

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    bookings,
  };
};

/* ===========================================================
   BOOKING DETAILS
=========================================================== */

export const getBookingById = async (
  bookingId,
  user
) => {
  const booking =
    await Booking.findById(
      bookingId
    )
      .populate(
        "customer",
        "name phone profileImage"
      )
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
    })
    .populate("vehicleType")
    .lean();

  if (!booking) {
    throw new Error(
      "Booking not found."
    );
  }

  // Authorization: only the customer, assigned driver, or an admin may view.
  if (user && user.role !== "admin") {
    const isCustomer =
      booking.customer &&
      booking.customer._id.toString() === user._id.toString();
    let isDriver = false;
    if (user.role === "driver") {
      if (booking.driver) {
        // Assigned driver can always view
        const driverProfile = await DriverProfile.findOne({ user: user._id });
        isDriver =
          driverProfile &&
          booking.driver._id.toString() === driverProfile._id.toString();
      } else if (booking.bookingStatus === "Pending") {
        // Any approved driver can view pending (unassigned) bookings
        isDriver = true;
      }
    }
    if (!isCustomer && !isDriver) {
      throw new Error("You are not authorized to view this booking.");
    }
  }

  return {
    success: true,
    booking,
  };
};

/* ===========================================================
   CANCEL BOOKING
=========================================================== */

export const cancelBooking = async (
  bookingId,
  user,
  cancelReason = "No reason provided"
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // Only customer can cancel
  if (
    booking.customer.toString() !==
    user._id.toString()
  ) {
    throw new Error("Unauthorized.");
  }

  // Cannot cancel completed ride
  if (
    booking.bookingStatus === "Completed"
  ) {
    throw new Error(
      "Completed ride cannot be cancelled."
    );
  }

  // Already cancelled
  if (
    booking.bookingStatus === "Cancelled"
  ) {
    throw new Error(
      "Booking already cancelled."
    );
  }

  /* ==========================================
      UPDATE BOOKING
  ========================================== */

  booking.bookingStatus = "Cancelled";

  booking.cancelledAt = new Date();

  booking.cancelReason = cancelReason;

  booking.cancelledBy = "Customer";

  booking.driverRequestStatus = "Rejected";

  booking.driverQueue = [];

  booking.currentDriverIndex = 0;

  booking.requestExpiresAt = null;

  await booking.save();

  /* ==========================================
      RELEASE DRIVER
  ========================================== */

  if (booking.driver) {
    const driver =
      await DriverProfile.findById(
        booking.driver
      );

    if (driver) {
      driver.currentRide = null;

      driver.isAvailable =
        driver.isOnline;

      driver.totalTrips += 1;
      driver.cancelledTrips += 1;

      await driver.save();

      // Notify driver
      await notifyUser({
        user: driver.user,
        title: "Booking Cancelled",
        message:
          "The customer cancelled the booking.",
        type: "Booking",
        booking: booking._id,
      });
    }
  }

  /* ==========================================
      NOTIFY CUSTOMER
  ========================================== */

  await notifyUser({
    user: booking.customer,
    title: "Booking Cancelled",
    message:
      "Your booking has been cancelled successfully.",
    type: "Booking",
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
      "Booking cancelled successfully.",
    booking: updatedBooking,
  };
};

/* ===========================================================
   DRIVER CANCEL BOOKING (Accepted / On The Way / Arrived → Cancelled)
   Max 3 driver-initiated cancellations per calendar day.
   =========================================================== */

export const driverCancelBooking = async (
  bookingId,
  driverUserId,
  cancelReason = "No reason provided"
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (!booking.driver) {
    throw new Error("Driver is not assigned.");
  }

  const driver = await DriverProfile.findOne({
    user: driverUserId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (
    booking.driver.toString() !==
    driver._id.toString()
  ) {
    throw new Error(
      "This booking is not assigned to you."
    );
  }

  // Terminal states cannot be cancelled
  if (booking.bookingStatus === "Completed") {
    throw new Error(
      "Completed ride cannot be cancelled."
    );
  }

  if (booking.bookingStatus === "Cancelled") {
    throw new Error(
      "Booking already cancelled."
    );
  }

  // Cancel is allowed only before the ride starts
  if (
    !["Accepted", "On The Way", "Arrived"].includes(
      booking.bookingStatus
    )
  ) {
    throw new Error(
      "Ride already started and cannot be cancelled."
    );
  }

  // Daily limit: max 3 driver-initiated cancellations per calendar day
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCancellations = await Booking.countDocuments({
    driver: driver._id,
    cancelledBy: "Driver",
    cancelledAt: { $gte: startOfDay },
  });

  if (todayCancellations >= 3) {
    throw new Error(
      "Daily cancellation limit reached (3 per day)."
    );
  }

  /* ==========================================
      UPDATE BOOKING
  ========================================== */

  booking.bookingStatus = "Cancelled";

  booking.cancelledAt = new Date();

  booking.cancelReason = cancelReason;

  booking.cancelledBy = "Driver";

  booking.driverRequestStatus = "Rejected";

  booking.driverQueue = [];

  booking.currentDriverIndex = 0;

  booking.requestExpiresAt = null;

  await booking.save();

  /* ==========================================
      RELEASE DRIVER
  ========================================== */

  driver.currentRide = null;

  driver.isAvailable = driver.isOnline;

  driver.totalTrips += 1;
  driver.cancelledTrips += 1;

  await driver.save();

  /* ==========================================
      NOTIFY CUSTOMER
  ========================================== */

  await notifyUser({
    user: booking.customer,
    title: "Driver Cancelled Ride",
    message: `Your driver cancelled the ride. Reason: ${cancelReason}`,
    type: "Booking",
    booking: booking._id,
  });

  /* ==========================================
      NOTIFY DRIVER
  ========================================== */

  await notifyUser({
    user: driver.user,
    title: "Ride Cancelled",
    message: "You cancelled the ride successfully.",
    type: "Booking",
    booking: booking._id,
  });

  /* ==========================================
      RETURN UPDATED BOOKING
  ========================================== */

  const updatedBooking = await Booking.findById(
    booking._id
  )
    .populate("customer", "name phone profileImage")
    .populate("vehicleType")
    .populate({
      path: "driver",
      populate: [
        {
          path: "user",
          select: "name phone profileImage",
        },
        {
          path: "vehicleType",
        },
      ],
    });

  return {
    success: true,
    message: "Ride cancelled successfully.",
    booking: updatedBooking,
  };
};

/* ===========================================================
   DRIVER REACHED PICKUP (Accepted → On The Way)
   =========================================================== */

export const reachPickup = async (
  bookingId,
  driverUserId
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (!booking.driver) {
    throw new Error("Driver is not assigned.");
  }

  if (booking.bookingStatus !== "Accepted") {
    throw new Error(
      "Ride is not ready for arrival."
    );
  }

  const driver = await DriverProfile.findOne({
    user: driverUserId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (
    booking.driver.toString() !==
    driver._id.toString()
  ) {
    throw new Error(
      "This booking is not assigned to you."
    );
  }

  booking.bookingStatus = "On The Way";
  booking.onTheWayAt = new Date();

  await booking.save();

  await notifyUser({
    user: booking.customer,
    title: "Driver On The Way",
    message:
      "Your driver is on the way to the pickup location.",
    type: "Ride",
    booking: booking._id,
  });

  return {
    success: true,
    message: "Driver is on the way.",
    booking,
  };
};

/* ===========================================================
   DRIVER ARRIVED AT PICKUP (On The Way → Arrived)
   =========================================================== */

export const markArrived = async (
  bookingId,
  driverUserId
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (!booking.driver) {
    throw new Error("Driver is not assigned.");
  }

  if (booking.bookingStatus !== "On The Way") {
    throw new Error(
      "Driver has not started the trip yet."
    );
  }

  const driver = await DriverProfile.findOne({
    user: driverUserId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (
    booking.driver.toString() !==
    driver._id.toString()
  ) {
    throw new Error(
      "This booking is not assigned to you."
    );
  }

  booking.bookingStatus = "Arrived";
  booking.arrivedAt = new Date();

  await booking.save();

  await notifyUser({
    user: booking.customer,
    title: "Driver Arrived",
    message:
      "Your driver has arrived at the pickup location.",
    type: "Ride",
    booking: booking._id,
  });

  return {
    success: true,
    message: "Driver has arrived.",
    booking,
  };
};

/* ===========================================================
   START RIDE
=========================================================== */

export const startRide = async (
  bookingId,
  driverUserId
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (!booking.driver) {
    throw new Error("Driver not assigned.");
  }

  if (!["On The Way", "Arrived"].includes(booking.bookingStatus)) {
    throw new Error(
      "Driver has not reached the pickup location."
    );
  }

  const driver = await DriverProfile.findOne({
    user: driverUserId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (
    booking.driver.toString() !==
    driver._id.toString()
  ) {
    throw new Error(
      "This booking is not assigned to you."
    );
  }

  /* ===========================
     UPDATE BOOKING
  =========================== */

  booking.bookingStatus = "Started";

  booking.startedAt = new Date();

  await booking.save();

  /* ===========================
     CUSTOMER NOTIFICATION
  =========================== */

  await notifyUser({
    user: booking.customer,
    title: "Ride Started",
    message:
      "Your trip has started. Have a safe journey!",
    type: "Ride",
    booking: booking._id,
  });

  return {
    success: true,
    message: "Ride started successfully.",
    booking,
  };
};

/* ===========================================================
   REACHED DESTINATION (Started → Reached)
=========================================================== */

export const reachDestination = async (
  bookingId,
  driverUserId
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (!booking.driver) {
    throw new Error("Driver is not assigned.");
  }

  if (booking.bookingStatus !== "Started") {
    throw new Error(
      "Ride has not started yet."
    );
  }

  const driver = await DriverProfile.findOne({
    user: driverUserId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (
    booking.driver.toString() !==
    driver._id.toString()
  ) {
    throw new Error(
      "This booking is not assigned to you."
    );
  }

  booking.bookingStatus = "Reached";

  booking.reachedAt = new Date();

  await booking.save();

  await notifyUser({
    user: booking.customer,
    title: "Reached Destination",
    message:
      "Your driver has reached the destination. Please verify payment.",
    type: "Ride",
    booking: booking._id,
  });

  return {
    success: true,
    message: "Destination reached successfully.",
    booking,
  };
};

/* ===========================================================
   UPDATE PAYMENT STATUS (after reaching destination)
=========================================================== */

export const updatePaymentStatus = async (
  bookingId,
  driverUserId,
  amount
) => {
  if (amount == null || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    throw new Error(
      "Collected amount must be greater than zero."
    );
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (!booking.driver) {
    throw new Error("Driver is not assigned.");
  }

  if (booking.bookingStatus !== "Reached") {
    throw new Error(
      "Payment can only be collected after reaching the destination."
    );
  }

  const driver = await DriverProfile.findOne({
    user: driverUserId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (
    booking.driver.toString() !==
    driver._id.toString()
  ) {
    throw new Error(
      "This booking is not assigned to you."
    );
  }

  booking.collectedAmount = Number(amount);
  booking.paymentStatus = "Paid";

  await booking.save();

  await notifyUser({
    user: booking.customer,
    title: "Payment Successful",
    message: `Payment of ₹${booking.collectedAmount} was collected.`,
    type: "Payment",
    booking: booking._id,
    data: {
      amount: booking.collectedAmount,
    },
  });

  return {
    success: true,
    message: `Payment of ₹${booking.collectedAmount} recorded.`,
    booking,
  };
};

/* ===========================================================
   COMPLETE RIDE
=========================================================== */

export const completeRide = async (
  bookingId,
  driverUserId
) => {
  let booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (!booking.driver) {
    throw new Error("Driver not assigned.");
  }

  if (!["Started", "Reached"].includes(booking.bookingStatus)) {
    throw new Error(
      "Ride has not started yet."
    );
  }

  const driver = await DriverProfile.findOne({
    user: driverUserId,
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (
    booking.driver.toString() !==
    driver._id.toString()
  ) {
    throw new Error(
      "This booking is not assigned to you."
    );
  }

  /* ==========================================
      ATOMIC, TRANSACTIONAL COMPLETION
      Runs the booking status change and the driver
      wallet credit inside one MongoDB transaction
      (when the deployment is a replica set). The
      findOneAndUpdate guard also prevents
      concurrent/duplicate completion from crediting
      the wallet twice on standalone MongoDB.
  ========================================== */

  // Total fare comes from the driver's payment input when present
  // (cash actually collected); otherwise the booking-time estimate.
  const finalizedFare =
    booking.collectedAmount > 0
      ? booking.collectedAmount
      : booking.finalFare || booking.estimatedFare;

  const result = await withTransaction(async (session) => {
    const completed = await Booking.findOneAndUpdate(
      { _id: booking._id, bookingStatus: { $in: ["Started", "Reached"] } },
      {
        bookingStatus: "Completed",
        completedAt: new Date(),
        finalFare: finalizedFare,
        driverQueue: [],
        currentDriverIndex: 0,
        requestExpiresAt: null,
        paymentStatus:
          booking.paymentMethod === "Cash"
            ? "Paid"
            : booking.paymentStatus,
      },
      { new: true, ...(session ? { session } : {}) }
    );

    if (!completed) return { skipped: true };

    await creditWallet(
      driver._id,
      completed.finalFare,
      completed._id,
      "Ride Earnings",
      session
    );

    return { completed };
  });

  if (result.skipped) {
    const refreshed = await Booking.findById(booking._id);
    if (!refreshed) throw new Error("Booking not found.");
    if (refreshed.bookingStatus === "Completed") {
      throw new Error("Booking already completed.");
    }
    throw new Error("Ride has not started yet.");
  }

  booking = result.completed;

  /* ==========================================
      UPDATE DRIVER
  ========================================== */

  driver.currentRide = null;

  // VERBOSE: Trip completed -> driver auto back to online/available (busy->free)
  // If driver was busy (isAvailable false), now becomes available if still online.
  // This satisfies "if trip completed automatically the status changed to online".
  if (!driver.isOnline) {
    driver.isOnline = true;
    console.log(`[driver-auto-online] trip completed, forcing isOnline true for driver ${driver._id}`);
  }
  driver.isAvailable = driver.isOnline;

  await driver.save();
  console.log(`[driver-trip-completed] driver=${driver._id} isOnline=${driver.isOnline} isAvailable=${driver.isAvailable} currentRide cleared`);

  /* ==========================================
      UPDATE DRIVER STATISTICS
  ========================================== */

  await updateDriverStats(
    driver._id,
    booking
  );

  /* ==========================================
      CUSTOMER NOTIFICATIONS
  ========================================== */

  await notifyUser({
    user: booking.customer,
    title: "Ride Completed",
    message:
      "Your ride has been completed successfully.",
    type: "Ride",
    booking: booking._id,
  });

  if (
    booking.paymentStatus === "Paid"
  ) {
    await notifyUser({
      user: booking.customer,
      title: "Payment Successful",
      message: `Payment of ₹${booking.finalFare} was successful.`,
      type: "Payment",
      booking: booking._id,
      data: {
        amount: booking.finalFare,
      },
    });
  }

  /* ==========================================
      DRIVER NOTIFICATION
  ========================================== */

  await notifyUser({
    user: driver.user,
    title: "Ride Completed",
    message: `You earned ₹${booking.finalFare} from this trip.`,
    type: "Wallet",
    booking: booking._id,
    data: {
      amount: booking.finalFare,
    },
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
      "Ride completed successfully.",
    booking: updatedBooking,
  };
};

/* ===========================================================
   AVAILABLE BOOKINGS
=========================================================== */

export const getAvailableBookings = async (
  { limit = 50, driverUserId = null, scope = null } = {}
) => {
  // A driver only sees bookings for their own cab type
  // (SUV drivers → SUV bookings, Sedan → Sedan, etc.).
  const query = {
    bookingStatus: "Pending",
    driver: null,
    // Approval gate: instant bookings stay hidden from every driver
    // until an admin verifies them. Legacy documents predate
    // approvalStatus (null = Approved).
    approvalStatus: { $in: [null, "Approved"] },
  };

  // Feed scoping: "instant" = guest bookings, "customer" = registered.
  if (scope === "instant") {
    query.guestName = { $ne: null };
  } else if (scope === "customer") {
    query.guestName = null;
  }

  if (driverUserId) {
    const driverProfile = await DriverProfile.findOne({
      user: driverUserId,
    }).select("vehicleType");

    // A driver must never see another cab type's bookings. If their own
    // cab type is not set yet, show nothing — never everything (otherwise
    // a Sedan driver would see SUV/Innova requests in their feed).
    if (!driverProfile?.vehicleType) {
      return {
        success: true,
        total: 0,
        bookings: [],
      };
    }

    query.vehicleType = driverProfile.vehicleType;

    // Reject ≠ Cancel: a rejected request stays open for other drivers
    // (routed via the dispatch queue), but it is never shown again to
    // the driver who rejected it.
    query.rejectedDrivers = { $ne: driverProfile._id };
  }

  const bookings = await Booking.find(query)
    .populate(
      "customer",
      "name phone profileImage"
    )
    .populate("vehicleType")
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .lean();

  return {
    success: true,
    total: bookings.length,
    bookings,
  };
};

/* ===========================================================
   TIP DRIVER
=========================================================== */

export const getMyDriverBookings = async (
  driverUserId,
  { page = 1, limit = 12 } = {}
) => {
  const driver = await DriverProfile.findOne({
    user: driverUserId,
  }).select("_id");

  if (!driver) {
    throw new Error("Driver not found.");
  }

  const skip = (page - 1) * limit;
  const query = { driver: driver._id };

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate("customer", "name phone profileImage")
      .populate("vehicleType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments(query),
  ]);

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    bookings,
  };
};

export const addDriverTip = async (
  bookingId,
  customerId,
  amount
) => {
  /* ===========================
     VALIDATION
  =========================== */

  if (!amount || amount <= 0) {
    throw new Error("Invalid tip amount.");
  }

  const booking = await Booking.findById(
    bookingId
  );

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (
    booking.customer.toString() !==
    customerId.toString()
  ) {
    throw new Error("Unauthorized.");
  }

  if (
    booking.bookingStatus !==
    "Completed"
  ) {
    throw new Error(
      "Ride must be completed before tipping."
    );
  }

  if (!booking.driver) {
    throw new Error(
      "Driver not assigned."
    );
  }

  /* ===========================
     UPDATE BOOKING
  =========================== */

  booking.tipAmount += amount;

  await booking.save();

  /* ===========================
     CREDIT DRIVER TIP
  =========================== */

  await tipDriver(
    booking.driver,
    booking._id,
    amount
  );

  /* ===========================
     GET DRIVER
  =========================== */

  const driver =
    await DriverProfile.findById(
      booking.driver
    ).populate(
      "user",
      "name"
    );

  /* ===========================
     CUSTOMER NOTIFICATION
  =========================== */

  await notifyUser({
    user: booking.customer,
    title: "Tip Sent",
    message: `You tipped ₹${amount} to your driver.`,
    type: "Payment",
    booking: booking._id,
    data: {
      amount,
    },
  });

  /* ===========================
     DRIVER NOTIFICATION
     (tipDriver() already creates this,
     so remove this block if you already
     send it inside wallet.service.js)
  =========================== */

  // await notifyUser({
  //   user: driver.user._id,
  //   title: "Tip Received",
  //   message: `You received a ₹${amount} tip.`,
  //   type: "Wallet",
  //   booking: booking._id,
  //   data: {
  //     amount,
  //   },
  // });

  /* ===========================
     RETURN
  =========================== */

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
        populate: {
          path: "user",
          select:
            "name phone profileImage",
        },
      });

  return {
    success: true,
    message:
      "Tip added successfully.",
    booking: updatedBooking,
  };
};


