import axios from "axios";
import Vehicle from "../models/Vehicle.js";
import WhatsappLog from "../models/WhatsappLog.js";

const GRAPH_API_VERSION = "v21.0";
const REQUEST_TIMEOUT = 10000;

const getConfig = () => ({
  token: process.env.WHATSAPP_TOKEN || "",
  phoneNumberId: (process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim(),
  businessNumber: (process.env.WHATSAPP_BUSINESS_NUMBER || "").trim(),
  templateName: (process.env.WHATSAPP_TEMPLATE_NAME || "premium_booking_invoice").trim(),
  templateLang: (process.env.WHATSAPP_TEMPLATE_LANG || "en").trim(),
});

// Meta requires full international format (digits only, e.g. 91934830199).
// A bare 10-digit Indian mobile is the common misconfiguration —
// normalize it instead of letting every alert fail.
export const normalizeRecipient = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
  return digits;
};

// Safe for logs: never prints the full number or the token.
export const maskPhone = (digits) => {
  const d = String(digits || "");
  if (d.length < 4) return "***";
  return `${d.slice(0, 2)}***${d.slice(-2)}`;
};

// Extract only the useful Meta error fields — never headers/auth.
const sanitizeMetaError = (err) => {
  const data = err?.response?.data;
  return {
    httpStatus: err?.response?.status || null,
    code: data?.error?.code ?? null,
    subcode: data?.error?.error_subcode ?? null,
    type: data?.error?.type || null,
    message: data?.error?.message || err?.message || "Unknown WhatsApp error",
  };
};

// One-line structured form for WhatsappLog so a failed booking alert can
// be diagnosed from the DB alone (code/subcode pinpoint template,
// permission, and dev-mode/test-number blocks — the plain message does not).
const formatMetaError = (safe) =>
  `Meta error http=${safe.httpStatus ?? "?"} code=${safe.code ?? "?"} subcode=${safe.subcode ?? "?"} type=${safe.type || "?"}: ${safe.message}`;

// Injectable transport (default: Meta Cloud API). Tests inject a fake
// sender which receives the full Meta payload and returns
// { sent, messageId } or throws.
const metaPost = async (phoneNumberId, token, payload) => {
  const { data } = await axios.post(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: REQUEST_TIMEOUT,
    }
  );

  return { sent: true, messageId: data?.messages?.[0]?.id || null };
};

export const sendTextMessage = async (
  to,
  text,
  sender = null,
  config = getConfig()
) => {
  const { token, phoneNumberId } = config;

  if (!token || !phoneNumberId) {
    return { sent: false, skipped: "whatsapp-not-configured" };
  }

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };

  if (sender) {
    return sender(payload);
  }

  return metaPost(phoneNumberId, token, payload);
};

// Approved template send for business-initiated alerts (works with no
// open 24h window). `params` maps to {{1}}..{{n}} in template body order.
export const sendTemplateMessage = async (
  to,
  params,
  sender = null,
  config = getConfig(),
  template = null
) => {
  const { token, phoneNumberId } = config;
  const tpl = template || {
    name: config.templateName,
    language: config.templateLang,
  };

  if (!token || !phoneNumberId || !tpl?.name) {
    return { sent: false, skipped: "whatsapp-not-configured" };
  }

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: tpl.name,
      language: { code: tpl.language || "en" },
      components: [
        {
          type: "body",
          parameters: (params || []).map((p) => ({
            type: "text",
            text: String(p ?? ""),
          })),
        },
      ],
    },
  };

  if (sender) {
    return sender(payload);
  }

  return metaPost(phoneNumberId, token, payload);
};

const getBookingAlertFields = async (booking) => {
  const customer = booking.customer || {};
  let vehicleName = "N/A";
  try {
    if (booking.vehicleType) {
      const vehicleId =
        booking.vehicleType._id || booking.vehicleType;
      const vehicle = await Vehicle.findById(vehicleId).select("name").lean();
      if (vehicle?.name) vehicleName = vehicle.name;
    }
  } catch {
    // Vehicle lookup is best-effort; the alert must still go out.
  }

  const pickupTime = booking.pickupDateTime
    ? new Date(booking.pickupDateTime).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return {
    ref: booking._id.toString().slice(-8).toUpperCase(),
    name: customer.name || "Guest",
    phone: customer.phone || "N/A",
    pickup: booking.pickup?.address || "N/A",
    drop: booking.drop?.address || "N/A",
    when: `${pickupTime} (${booking.tripType || "One Way"})`,
    vehicle: vehicleName,
    fare: String(booking.estimatedFare ?? 0),
    status: booking.bookingStatus || "Pending",
  };
};

const buildBookingAlert = async (booking) => {
  const f = await getBookingAlertFields(booking);

  // Invoice-style alert (mirrors the approved `premium_booking_invoice`
  // template below). WhatsApp renders *bold* in both template and text
  // messages, so the fallback looks identical to the template.
  const lines = [
    "🧾 *New Booking Alert*🚨 ✅",
    "________________________________",
    `🔖 *Booking ID:* #${f.ref}`,
    `👤 *Name:* ${f.name}`,
    `📞 *Phone:* ${f.phone}`,
    "_______________________",
    `📍 *Pickup:* ${f.pickup}`,
    `🏁 *Drop:* ${f.drop}`,
    `🗓️ *When:* ${f.when}`,
    "_______________________",
    `🚗 *Vehicle:* ${f.vehicle}`,
    `💰 *Est. Fare:* ₹${f.fare} (Cash)`,
    `⏳ *Status:* ${f.status}`,
    "________________________________",
    "_Pay Cash to driver for Tolls & permits at actuals. Please assign a driver._",
  ];

  return lines.join("\n");
};

// Premium invoice template — create EXACTLY this in the Meta dashboard
// (WhatsApp Manager → Message Templates → Create, category UTILITY,
// language EN) with name `premium_booking_invoice`, then set
// WHATSAPP_TEMPLATE_NAME to match. Parameter order {{1}}..{{8}} must stay
// in sync with buildBookingTemplateParams below.
//
// HEADER (static text): 🚕 New Ride Booked!
// BODY:
// 🧾 *New Booking Received* ✅
//
// 🔖 *Booking ID:* #{{1}}
// 👤 *Name:* {{2}}
// 📞 *Phone:* {{3}}
//
// 📍 *Pickup:* {{4}}
// 🏁 *Drop:* {{5}}
// 🗓️ *When:* {{6}}
//
// 🚗 *Vehicle:* {{7}}
// 💰 *Est. Fare:* ₹{{8}} (Cash)
//
// _Tolls & permits at actuals. Please assign a driver._
// FOOTER (static text): GenZRides • Instant Booking Alert
export const PREMIUM_BOOKING_TEMPLATE = {
  name: "premium_booking_invoice",
  category: "UTILITY",
  language: "en",
  header: "🚕 New Ride Booked!",
  footer: "GenZRides • Instant Booking Alert",
};

// Must match the approved template body parameter order exactly:
// {{1}}=ref {{2}}=name {{3}}=phone {{4}}=pickup {{5}}=drop
// {{6}}=when {{7}}=vehicle {{8}}=fare
export const buildBookingTemplateParams = async (booking) => {
  const f = await getBookingAlertFields(booking);
  return [f.ref, f.name, f.phone, f.pickup, f.drop, f.when, f.vehicle, f.fare];
};

// Returns true when this worker won the race and recorded the send.
// See email.service.js — delete stale `failed` first for old `unique:true` DBs.
const markAlertSent = async (bookingId, to) => {
  try {
    await WhatsappLog.deleteMany({ booking: bookingId, status: "failed" });
  } catch {}
  try {
    await WhatsappLog.create({
      booking: bookingId,
      to: to || "invalid",
      status: "sent",
    });
    return true;
  } catch (err) {
    if (err?.code === 11000) {
      return false;
    }
    throw err;
  }
};

const recordWhatsappFailure = async (bookingId, to, error) => {
  try {
    await WhatsappLog.findOneAndUpdate(
      { booking: bookingId, status: "failed" },
      { to: to || "invalid", status: "failed", error: error || "Unknown WhatsApp error" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch {
    try {
      await WhatsappLog.create({ booking: bookingId, to: to || "invalid", status: "failed", error });
    } catch (err) {
      if (err?.code !== 11000) console.warn(`[whatsapp] failed to record failure for ${bookingId}: ${err.message}`);
    }
  }
};

/* ===========================================================
   ADMIN BOOKING ALERT (guest + logged-in bookings)
   - Credentials come from process.env only (never the frontend).
   - Template-first (works with no open window), text fallback.
   - Deduped per booking via WhatsappLog unique index.
   - NEVER throws: booking creation must succeed even if WhatsApp fails.
=========================================================== */

export const notifyAdminOfBooking = async (booking, sender = null) => {
  const ref = booking?._id?.toString().slice(-8).toUpperCase() || "unknown";
  try {
    if (!booking?._id) return { sent: false, skipped: "no-booking" };

    const existingSent = await WhatsappLog.findOne({
      booking: booking._id,
      status: "sent",
    }).lean();
    if (existingSent) {
      return { sent: false, skipped: "duplicate" };
    }

    const { token, phoneNumberId, businessNumber } = getConfig();
    const missing = [
      !token && "WHATSAPP_TOKEN",
      !phoneNumberId && "WHATSAPP_PHONE_NUMBER_ID",
      !businessNumber && "WHATSAPP_BUSINESS_NUMBER",
    ].filter(Boolean);
    if (missing.length > 0) {
      console.warn(
        `[whatsapp] booking ${ref}: skipped, missing env: ${missing.join(", ")}`
      );
      return { sent: false, skipped: "whatsapp-not-configured" };
    }

    const to = normalizeRecipient(businessNumber);
    if (!/^\d{11,15}$/.test(to)) {
      console.error(
        `[whatsapp] booking ${ref}: invalid admin number format (${maskPhone(to)}). ` +
          `Set WHATSAPP_BUSINESS_NUMBER to full international digits, e.g. 91934830199.`
      );
      await recordWhatsappFailure(booking._id, to || "invalid", "Invalid admin WhatsApp number format");
      return { sent: false, skipped: "send-failed" };
    }

    const { templateName, templateLang } = getConfig();

    // Path 1: approved template (delivers with no open 24h window).
    try {
      console.log(
        `[whatsapp] booking ${ref}: sending template '${templateName}' via ${GRAPH_API_VERSION}/${phoneNumberId} to ${maskPhone(to)}`
      );
      const params = await buildBookingTemplateParams(booking);
      const result = await sendTemplateMessage(to, params, sender);
      if (result?.skipped === "whatsapp-not-configured") {
        return { sent: false, skipped: "whatsapp-not-configured" };
      }
      await markAlertSent(booking._id, to);
      console.log(
        `[whatsapp] booking ${ref}: template sent to ${maskPhone(to)} (id=${result?.messageId || "n/a"})`
      );
      return { sent: true, via: "template", messageId: result?.messageId || null };
    } catch (err) {
      const safe = sanitizeMetaError(err);
      console.warn(
        `[whatsapp] booking ${ref}: template send failed, falling back to text:`,
        JSON.stringify(safe)
      );
      // Common cause: unverified test sender number / app in dev mode, or
      // the template name/language not matching an approved template.
      // (Meta dashboard → WhatsApp → API Setup / Message Templates.)
    }

    // Path 2: free-form text fallback (delivers inside an open 24h window).
    const text = await buildBookingAlert(booking);

    let result;
    try {
      console.log(
        `[whatsapp] booking ${ref}: sending text via ${GRAPH_API_VERSION}/${phoneNumberId} to ${maskPhone(to)}`
      );
      result = await sendTextMessage(to, text, sender);
    } catch (err) {
      const safe = sanitizeMetaError(err);
      console.error(
        `[whatsapp] booking ${ref}: Meta API error`,
        JSON.stringify(safe)
      );
      await recordWhatsappFailure(booking._id, to || "invalid", formatMetaError(safe));
      return { sent: false, skipped: "send-failed", detail: safe };
    }

    if (result?.skipped === "whatsapp-not-configured") {
      return { sent: false, skipped: "whatsapp-not-configured" };
    }

    // Unique index swallows races: a duplicate insert means another
    // worker already sent this alert.
    const logged = await markAlertSent(booking._id, to);
    if (!logged) {
      return { sent: false, skipped: "duplicate" };
    }

    console.log(
      `[whatsapp] booking ${ref}: text sent to ${maskPhone(to)} (id=${result?.messageId || "n/a"})`
    );
    return { sent: true, via: "text", messageId: result?.messageId || null };
  } catch (err) {
    console.error(`[whatsapp] booking ${ref}: unexpected error:`, err.message);
    return { sent: false, skipped: "error" };
  }
};
