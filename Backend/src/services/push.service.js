import PushSubscription from "../models/PushSubscription.js";
import User from "../models/User.js";

/* ===========================================================
   WEB PUSH (browser push notifications)
   Delivers booking/status notifications through the Push API to
   the app's service worker, so driver/customer alerts appear even
   when the tab is hidden or closed. Best-effort everywhere:
   missing VAPID keys, missing `web-push`, no subscriptions, or
   delivery failures never break the caller (Socket.IO + the
   persisted in-app notification remain the primary channel).
=========================================================== */

let webPush = null;
let pushEnabled = false;

const initPush = async () => {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } =
    process.env;

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return false;
  }

  try {
    const mod = await import("web-push");
    webPush = mod.default || mod;

    webPush.setVapidDetails(
      VAPID_SUBJECT || "mailto:support@genzrides.com",
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    pushEnabled = true;
    return true;
  } catch {
    return false;
  }
};

export const isPushEnabled = async () => {
  if (pushEnabled && webPush) {
    return true;
  }

  return await initPush();
};

export const getVapidPublicKey = () =>
  process.env.VAPID_PUBLIC_KEY || null;

/* ===========================================================
   SAVE SUBSCRIPTION (opt-in from the Notifications page)
=========================================================== */

export const saveSubscription = async (
  userId,
  { endpoint, keys, userAgent }
) => {
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error("Invalid push subscription.");
  }

  return await PushSubscription.findOneAndUpdate(
    { endpoint },
    {
      user: userId,
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      userAgent: userAgent || null,
    },
    {
      new: true,
      upsert: true,
    }
  );
};

/* ===========================================================
   REMOVE SUBSCRIPTION (opt-out; endpoint optional = remove all)
=========================================================== */

export const removeSubscription = async (userId, endpoint) => {
  const query = { user: userId };

  if (endpoint) {
    query.endpoint = endpoint;
  }

  await PushSubscription.deleteMany(query);

  return true;
};

/* ===========================================================
   SEND TO USER
=========================================================== */

const detailsUrlFor = (role, bookingId) => {
  if (!bookingId) {
    return "/";
  }

  if (role === "driver") {
    return `/driver/bookings/${bookingId}`;
  }

  if (role === "admin") {
    return `/admin/bookings/${bookingId}`;
  }

  return `/customer/bookings/${bookingId}`;
};

export const sendPushToUser = async (
  userId,
  { title, body, bookingId = null } = {}
) => {
  try {
    if (!(await isPushEnabled())) {
      return false;
    }

    const subscriptions = await PushSubscription.find({
      user: userId,
    }).lean();

    if (!subscriptions.length) {
      return false;
    }

    let role = "customer";

    try {
      const user = await User.findById(userId)
        .select("role")
        .lean();

      if (user?.role) {
        role = user.role;
      }
    } catch {
      // Role lookup is best-effort; default deep-link still works.
    }

    const payload = JSON.stringify({
      title: title || "GenZRides",
      body: body || "",
      url: detailsUrlFor(
        role,
        bookingId ? String(bookingId) : null
      ),
      bookingId: bookingId ? String(bookingId) : null,
    });

    const deadIds = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            payload
          );
        } catch (err) {
          // Expired/unsubscribed endpoint — prune it.
          if (
            err?.statusCode === 404 ||
            err?.statusCode === 410
          ) {
            deadIds.push(sub._id);
          }
        }
      })
    );

    if (deadIds.length) {
      await PushSubscription.deleteMany({
        _id: { $in: deadIds },
      });
    }

    return true;
  } catch {
    return false;
  }
};
