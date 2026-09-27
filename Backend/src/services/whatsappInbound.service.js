import crypto from "crypto";
import Booking from "../models/Booking.js";
import WhatsappInbound from "../models/WhatsappInbound.js";
import {
  getConfig,
  normalizeRecipient,
  maskPhone,
  sendTextMessage,
} from "./whatsapp.service.js";
import {
  verifyInstantBooking,
  approveBooking,
  cancelBooking,
} from "./admin.service.js";
import { emitToAdmins } from "./notification.service.js";

/* ===========================================================
   INBOUND ADMIN WHATSAPP ACTIONS
   The booking alert carries Verify / Cancel quick replies (plus a
   View deep link). Taps and typed commands arrive on the webhook;
   this module parses them, guards the sender, and runs the action —
   so the admin never has to open the dashboard.
   ========================================================== */

// Meta signs webhook bodies when WHATSAPP_APP_SECRET is set:
// header "X-Hub-Signature-256: sha256=<hex>". Mirror of the razorpay
// verifier style used in webhook.controller.js.
export const verifyMetaSignature = (rawBody, signature, appSecret) => {
  if (!appSecret) return true; // not configured — accept, warn at the edge
  if (typeof signature !== "string" || !signature.startsWith("sha256=")) {
    return false;
  }
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(typeof rawBody === "string" ? rawBody : Buffer.from(rawBody || ""))
    .digest("hex");
  const a = Buffer.from(`sha256=${expected}`, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

// Only the configured admin number may trigger booking actions.
// Everything else is ignored (logged, masked).
export const isAdminSender = (from, config = getConfig()) => {
  const sender = normalizeRecipient(from);
  const admin = normalizeRecipient(config.businessNumber || "");
  return !!sender && !!admin && sender === admin;
};

// Pull inbound messages out of a Meta webhook payload. Handles quick
// replies (type "button"), interactive replies, and plain text. Status
// receipts ("statuses") carry no message and are skipped.
export const parseIncomingMessages = (payload) => {
  const out = [];
  const entries = payload?.entry || [];
  for (const entry of entries) {
    for (const change of entry?.changes || []) {
      const value = change?.value || {};
      for (const msg of value?.messages || []) {
        let text = "";
        if (msg?.type === "button" && msg?.button) {
          text = msg.button.payload || msg.button.text || "";
        } else if (
          msg?.type === "interactive" &&
          msg?.interactive?.button_reply
        ) {
          const r = msg.interactive.button_reply;
          text = r.id || r.title || "";
        } else if (msg?.type === "text" && msg?.text) {
          text = msg.text.body || "";
        }
        if (!text) continue;
        out.push({
          messageId: msg.id || null,
          from: msg.from || "",
          text: String(text).trim(),
        });
      }
    }
  }
  return out;
};

const REF_RE = "([0-9a-fA-F]{6,24})";

// VERIFY [#ref] | CANCEL [#ref] [reason...] | STATUS [#ref] | HELP.
// Bare VERIFY/CANCEL (button taps carry no ref) resolve to the single
// pending booking when exactly one awaits action.
export const parseAdminCommand = (raw) => {
  const text = String(raw || "").trim();
  const clean = text.replace(/^#/, "");

  let m = clean.match(new RegExp(`^v[eè]rify\\s+#?${REF_RE}\\s*$`, "i"));
  if (m) return { action: "verify", ref: m[1].toUpperCase() };

  m = clean.match(new RegExp(`^cancel\\s+#?${REF_RE}(?:\\s+(.+))?\\s*$`, "i"));
  if (m)
    return {
      action: "cancel",
      ref: m[1].toUpperCase(),
      reason: (m[2] || "").trim() || null,
    };

  m = clean.match(new RegExp(`^status\\s+#?${REF_RE}\\s*$`, "i"));
  if (m) return { action: "status", ref: m[1].toUpperCase() };

  if (/^(help|hi|hello|menu)$/i.test(clean)) return { action: "help", ref: null };
  if (/verify/i.test(clean)) return { action: "verify", ref: null };
  if (/cancel/i.test(clean)) return { action: "cancel", ref: null, reason: null };

  return { action: null, ref: null };
};

// Suffix-match lookup WITHOUT the guest phone gate (admin context).
// Accepts a full ObjectId or a trailing ref (case-insensitive).
const findBookingByRef = async (ref) => {
  const clean = String(ref || "")
    .trim()
    .replace(/^#/, "");
  if (!clean) return null;
  if (/^[0-9a-fA-F]{24}$/.test(clean)) {
    return Booking.findById(clean);
  }
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return Booking.findOne({
    $expr: {
      $regexMatch: {
        input: { $toString: "$_id" },
        regex: `${escaped}$`,
        options: "i",
      },
    },
  });
};

const shortRef = (booking) =>
  booking?._id?.toString().slice(-8).toUpperCase() || "UNKNOWN";

const emitBookingChanged = (booking) => {
  try {
    emitToAdmins("booking-updated", booking);
    emitToAdmins("admin-counts-updated", null);
  } catch {
    // socket layer is best-effort here
  }
};

const HELP_TEXT = [
  "🤖 *GenZRides admin commands*",
  "",
  "• *VERIFY <BookingID>* — approve + send to drivers",
  "• *CANCEL <BookingID> [reason]* — cancel the booking",
  "• *STATUS <BookingID>* — live status of a booking",
  "",
  "Example: `VERIFY A1B2C3D4`",
].join("\n");

// Exactly one booking awaiting action? Used to resolve bare button taps
// ("✅ Verify" carries no ref) without asking follow-ups.
const findSolePendingBooking = async () => {
  const pending = await Booking.find({ approvalStatus: "Pending Approval" })
    .select("_id")
    .sort({ createdAt: -1 })
    .limit(2)
    .lean();
  return pending.length === 1 ? pending[0] : null;
};

const claimMessage = async (messageId, from, action, bookingId) => {
  if (!messageId) return true; // no id — process once, can't dedupe
  try {
    await WhatsappInbound.create({
      messageId,
      from: from || "unknown",
      action,
      booking: bookingId || null,
    });
    return true;
  } catch (err) {
    if (err?.code === 11000) return false; // Meta retry — already handled
    throw err;
  }
};

/**
 * Runs one inbound admin message end-to-end (parse → guard → act →
 * confirm). `sender` is injectable for tests (receives the Meta text
 * payload, returns { sent } or throws). NEVER throws — webhook must
 * always answer 200 so Meta stops retrying.
 */
export const handleAdminMessage = async (
  { from, text, messageId },
  { sender = null, config = getConfig() } = {}
) => {
  const adminTo = normalizeRecipient(from);
  try {
    if (!isAdminSender(from, config)) {
      console.warn(
        `[whatsapp-inbound] ignoring message from non-admin ${maskPhone(adminTo || from)}`
      );
      return { handled: false, skipped: "not-admin" };
    }

    const cmd = parseAdminCommand(text);

    if (!cmd.action) {
      await sendTextMessage(adminTo, HELP_TEXT, sender, config);
      await claimMessage(messageId, adminTo, "help", null).catch(() => {});
      return { handled: true, action: "help" };
    }

    // Bare button tap — resolve the single pending booking when possible.
    let ref = cmd.ref;
    if (!ref) {
      const sole = await findSolePendingBooking();
      if (!sole) {
        const pending = await Booking.countDocuments({
          approvalStatus: "Pending Approval",
        });
        await sendTextMessage(
          adminTo,
          pending === 0
            ? "✅ No bookings are awaiting action right now."
            : `There are *${pending}* bookings awaiting action.\nReply with the ID, e.g. \`${cmd.action.toUpperCase()} <BookingID>\`.`,
          sender,
          config
        );
        await claimMessage(messageId, adminTo, "help", null).catch(() => {});
        return { handled: true, action: "needs-ref" };
      }
      ref = sole._id.toString().slice(-8).toUpperCase();
    }

    const booking = await findBookingByRef(ref);
    if (!booking) {
      await sendTextMessage(
        adminTo,
        `⚠️ Booking *#${String(ref).toUpperCase()}* not found. Check the ID and try again.`,
        sender,
        config
      );
      await claimMessage(messageId, adminTo, cmd.action, null).catch(() => {});
      return { handled: true, action: cmd.action, result: "not-found" };
    }

    if (!(await claimMessage(messageId, adminTo, cmd.action, booking._id))) {
      return { handled: false, skipped: "duplicate" };
    }

    const ref8 = shortRef(booking);

    if (cmd.action === "status") {
      const driverBits = booking.driver ? "Driver assigned ✓" : "No driver yet";
      await sendTextMessage(
        adminTo,
        [
          `🧾 *Booking #${ref8}*`,
          `Status: *${booking.bookingStatus || "Pending"}* (${booking.approvalStatus || "Approved"})`,
          `${booking.pickup?.address || "N/A"} → ${booking.drop?.address || "N/A"}`,
          `Fare: ₹${Number(booking.finalFare > 0 ? booking.finalFare : booking.estimatedFare || 0).toLocaleString("en-IN")}`,
          driverBits,
        ].join("\n"),
        sender,
        config
      );
      return { handled: true, action: "status", booking: booking._id };
    }

    if (cmd.action === "verify") {
      if ((booking.approvalStatus || "Approved") === "Approved") {
        await sendTextMessage(
          adminTo,
          `ℹ️ Booking *#${ref8}* is already verified (status: ${booking.bookingStatus || "Pending"}).`,
          sender,
          config
        );
        return { handled: true, action: "verify", result: "already" };
      }
      const result = booking.guestName
        ? await verifyInstantBooking(booking._id)
        : await approveBooking(booking._id);
      emitBookingChanged(result.booking || booking);
      await sendTextMessage(
        adminTo,
        result.dispatched
          ? `✅ Booking *#${ref8}* verified — sent to drivers. No dashboard visit needed.`
          : `✅ Booking *#${ref8}* verified, but no drivers are online — assign manually from the dashboard if needed.`,
        sender,
        config
      );
      return {
        handled: true,
        action: "verify",
        booking: booking._id,
        dispatched: !!result.dispatched,
      };
    }

    // cancel
    if (["Completed", "Cancelled"].includes(booking.bookingStatus)) {
      await sendTextMessage(
        adminTo,
        `ℹ️ Booking *#${ref8}* is already *${booking.bookingStatus}* — nothing to cancel.`,
        sender,
        config
      );
      return { handled: true, action: "cancel", result: "already" };
    }
    await cancelBooking(
      booking._id,
      cmd.reason || "Cancelled by admin via WhatsApp"
    );
    const fresh = await Booking.findById(booking._id).lean();
    emitBookingChanged(fresh || booking);
    await sendTextMessage(
      adminTo,
      `❌ Booking *#${ref8}* cancelled${cmd.reason ? ` — ${cmd.reason}` : "."} No dashboard visit needed.`,
      sender,
      config
    );
    return { handled: true, action: "cancel", booking: booking._id };
  } catch (err) {
    console.error(
      `[whatsapp-inbound] failed handling message from ${maskPhone(adminTo || from)}:`,
      err?.message || err
    );
    try {
      if (isAdminSender(from, config)) {
        await sendTextMessage(
          adminTo,
          `⚠️ Sorry, that action failed (${err?.message || "unknown error"}). Please try again or use the dashboard.`,
          sender,
          config
        );
      }
    } catch {
      // last-resort reply must never throw
    }
    return { handled: false, skipped: "error" };
  }
};
