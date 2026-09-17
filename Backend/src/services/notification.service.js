import { getIO } from "../socket/index.js";
import {
  getSocketId,
} from "../socket/users.js";
import Notification from "../models/Notification.js";
/* ===========================================================
   SEND RIDE REQUEST TO DRIVER
=========================================================== */

export const sendRideRequest = async (
  driverUserId,
  booking
) => {
  // Persist first so the ride request ALWAYS lands in the driver's bell
  // list — even if the socket emit below finds no connected tab. Done via
  // createNotification directly (NOT notifyUser) so no second
  // "notification" socket event fires — the ride-request toast stays the
  // single realtime alert and nothing double-rings.
  try {
    const route = booking?.pickup?.address && booking?.drop?.address
      ? `${booking.pickup.address} → ${booking.drop.address}`
      : "New ride request";
    await createNotification({
      user: driverUserId,
      title: "New ride request",
      message: `${route}${booking?.estimatedFare ? ` · ₹${booking.estimatedFare}` : ""}`,
      type: "Ride",
      booking: booking?._id || booking || null,
    });
  } catch {
    // persistence must never block dispatch
  }

  let io;

  try {
    io = getIO();
  } catch {
    return false;
  }

  if (!io) {
    return false;
  }

  // Emit to the driver's user room so every connected tab/device gets it
  // (the single-socket lookup below only reports reachability).
  io.to(driverUserId.toString()).emit(
    "ride-request",
    booking
  );

  // VERBOSE: Also push via Web Push so driver gets it when offline/closed.
  // Best-effort, never breaks socket delivery.
  try {
    const { sendPushToUser } = await import("./push.service.js");
    const route = booking?.pickup?.address && booking?.drop?.address
      ? `${booking.pickup.address} → ${booking.drop.address}`
      : "New ride request";
    await sendPushToUser(driverUserId, {
      title: "New ride request",
      body: `${route}${booking?.estimatedFare ? ` · ₹${booking.estimatedFare}` : ""}`,
      bookingId: booking?._id || booking,
    });
    if (process.env.VERBOSE === "true") console.log(`[push] ride-request pushed to ${driverUserId}`);
  } catch (e) {
    if (process.env.VERBOSE === "true") console.log(`[push] ride-request push failed`, e?.message);
  }

  return !!getSocketId(driverUserId);
};

/* ===========================================================
   NOTIFY CUSTOMER
=========================================================== */

export const notifyCustomer = async (
  customerUserId,
  event,
  data
) => {
  let io;

  try {
    io = getIO();
  } catch {
    return false;
  }

  if (!io) {
    return false;
  }

  io.to(customerUserId.toString()).emit(
    event,
    data
  );

  return !!getSocketId(customerUserId);
};

/* ===========================================================
   NOTIFY DRIVER
=========================================================== */

export const notifyDriver = async (
  driverUserId,
  event,
  data
) => {
  let io;

  try {
    io = getIO();
  } catch {
    return false;
  }

  if (!io) {
    return false;
  }

  io.to(driverUserId.toString()).emit(
    event,
    data
  );

  return !!getSocketId(driverUserId);
};

/* ===========================================================
   DRIVER LOCATION UPDATE
=========================================================== */

export const sendDriverLocation = async (
  customerUserId,
  location
) => {
  let io;

  try {
    io = getIO();
  } catch {
    return false;
  }

  if (!io) {
    return false;
  }

  io.to(customerUserId.toString()).emit(
    "driver-location",
    location
  );

  return !!getSocketId(customerUserId);
};

/* ===========================================================
   BOOKING ACCEPTED
=========================================================== */

export const bookingAccepted = async (
  customerUserId,
  booking
) => {
  return await notifyCustomer(
    customerUserId,
    "booking-accepted",
    booking
  );
};

/* ===========================================================
   BOOKING CANCELLED
=========================================================== */

export const bookingCancelled = async (
  customerUserId,
  booking
) => {
  return await notifyCustomer(
    customerUserId,
    "booking-cancelled",
    booking
  );
};

/* ===========================================================
   DRIVER ARRIVED
=========================================================== */

export const driverArrived = async (
  customerUserId,
  booking
) => {
  return await notifyCustomer(
    customerUserId,
    "driver-arrived",
    booking
  );
};

/* ===========================================================
   RIDE STARTED
=========================================================== */

export const rideStarted = async (
  customerUserId,
  booking
) => {
  return await notifyCustomer(
    customerUserId,
    "ride-started",
    booking
  );
};

/* ===========================================================
   RIDE COMPLETED
=========================================================== */

export const rideCompleted = async (
  customerUserId,
  booking
) => {
  return await notifyCustomer(
    customerUserId,
    "ride-completed",
    booking
  );
};

/* ===========================================================
   PAYMENT SUCCESS
=========================================================== */

export const paymentSuccess = async (
  customerUserId,
  payment
) => {
  return await notifyCustomer(
    customerUserId,
    "payment-success",
    payment
  );
};

/* ===========================================================
   PAYMENT FAILED
=========================================================== */

export const paymentFailed = async (
  customerUserId,
  payment
) => {
  return await notifyCustomer(
    customerUserId,
    "payment-failed",
    payment
  );
};


/* ===========================================================
   CREATE NOTIFICATION
=========================================================== */

export const createNotification = async ({
  user,
  title,
  message,
  type = "System",
  booking = null,
  data = {},
}) => {
  const notification = await Notification.create({
    user,
    title,
    message,
    type,
    booking,
    data,
  });

  return notification;
};

/* ===========================================================
   SEND REAL-TIME NOTIFICATION
=========================================================== */

export const sendRealtimeNotification = async (
  userId,
  notification
) => {
  let io;
  try {
    io = getIO();
  } catch {
    // Realtime layer not initialized yet (server starting up / worker without
    // a Socket.IO server). The persistent DB notification is still created, so
    // this must not break the caller.
    return false;
  }
  if (!io) return false;

  // User room (every connected tab/device), not a single socket id.
  io.to(userId.toString()).emit(
    "notification",
    notification
  );

  return !!getSocketId(userId);
};

/* ===========================================================
   FAN-OUT TO ADMINS (live ops queues)
   Admin dashboards never join individual booking rooms, so booking
   lifecycle events are also fanned out to the "admins" room
   (joined on socket connect by role). Best-effort: never throws.
=========================================================== */

export const emitToAdmins = (event, payload) => {
  let io;

  try {
    io = getIO();
  } catch {
    return false;
  }

  if (!io) {
    return false;
  }

  try {
    io.to("admins").emit(event, payload);
    return true;
  } catch {
    return false;
  }
};

/* ===========================================================
   CREATE + SEND
=========================================================== */

export const notifyUser = async ({
  user,
  title,
  message,
  type = "System",
  booking = null,
  data = {},
}) => {
  const notification =
    await createNotification({
      user,
      title,
      message,
      type,
      booking,
      data,
    });

  await sendRealtimeNotification(
    user,
    notification
  );

  // Best-effort browser push (Web Push to the service worker) so the alert
  // also appears when the tab is hidden or closed. Never breaks the caller:
  // without VAPID keys, without a subscription, or on delivery failure this
  // is a silent no-op (Socket.IO + the persisted notification remain).
  try {
    const { sendPushToUser } = await import(
      "./push.service.js"
    );

    await sendPushToUser(user, {
      title,
      message,
      bookingId: booking?._id || booking || null,
    });
  } catch {
    // ignore — realtime + in-app notification already delivered
  }

  return notification;
};

/* ===========================================================
   GET USER NOTIFICATIONS
=========================================================== */

export const getNotifications = async (
  userId,
  page = 1,
  limit = 50
) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ user: userId })
      .populate("booking", "bookingStatus pickup drop finalFare")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ user: userId }),
  ]);

  return {
    notifications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/* ===========================================================
   UNREAD COUNT
=========================================================== */

export const getUnreadCount = async (
  userId
) => {
  return await Notification.countDocuments({
    user: userId,
    isRead: false,
  });
};

/* ===========================================================
   MARK AS READ
=========================================================== */

export const markAsRead = async (
  notificationId,
  userId
) => {
  return await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      user: userId,
    },
    {
      isRead: true,
    },
    {
      new: true,
    }
  );
};

/* ===========================================================
   MARK ALL AS READ
=========================================================== */

export const markAllAsRead = async (
  userId
) => {
  await Notification.updateMany(
    {
      user: userId,
      isRead: false,
    },
    {
      isRead: true,
    }
  );

  return true;
};

/* ===========================================================
   DELETE NOTIFICATION
=========================================================== */

export const deleteNotification = async (
  notificationId,
  userId
) => {
  return await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });
};