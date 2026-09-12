import Vehicle from "../models/Vehicle.js";
import EmailLog from "../models/EmailLog.js";
import User from "../models/User.js";

const REQUEST_TIMEOUT = 10000;

const combineNameAddress = (name, address) => {
  if (name && address) return `${name} <${address}>`;
  return address || "";
};

export const getEmailConfig = () => getConfig();

const getConfig = () => {
  const rawPort = Number(process.env.SMTP_PORT || 587);
  // Port 465 is implicit TLS — must be `secure:true` even if the env flag
  // is missing/wrong (common prod misconfiguration). For every other port
  // (587, 2525, 2587, etc.) honour the explicit SMTP_SECURE flag.
  const explicitSecure = String(process.env.SMTP_SECURE || "false") === "true";
  const secure = rawPort === 465 ? true : explicitSecure;
  return {
    host: (process.env.SMTP_HOST || "").trim(),
    port: rawPort,
    secure,
    user: (process.env.SMTP_USER || "").trim(),
    pass: process.env.SMTP_PASS || "",
    adminEmail: (process.env.ADMIN_EMAIL || "").trim(),
    // Base URL for inbox deep links (View booking button). Falls back to
    // CLIENT_URL; when neither is set the button is omitted.
    appUrl: (process.env.FRONTEND_URL || process.env.CLIENT_URL || "")
      .trim()
      .replace(/\/+$/, ""),
    from:
      (process.env.EMAIL_FROM || "").trim() ||
      combineNameAddress(
        (process.env.EMAIL_FROM_NAME || "").trim(),
        (process.env.EMAIL_FROM_ADDRESS || "").trim()
      ) ||
      "GenZRides <no-reply@genzrides.com>",
  };
};

// Safe for logs: never prints the full address.
export const maskEmail = (email) => {
  const [local, domain] = String(email || "").split("@");
  if (!domain) return "***";
  const head = (local || "").slice(0, 2);
  return `${head}***@${domain}`;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatDateTime = (value) => {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

const   getBookingEmailFields = async (booking) => {
  const customer = booking.customer || {};

  // Guest bookings have a placeholder `guest-...@guest.letsgocab.local`
  // on the User record; the real address is snapshot on `booking.guestEmail`.
  // Prioritize the snapshot so the admin sees the guest's actual contact.
  let customerEmail = booking.guestEmail || customer.email || "N/A";
  // Detect placeholder and prefer snapshot even if customer.email is truthy.
  if (customerEmail && String(customerEmail).includes("@guest.letsgocab.local") && booking.guestEmail) {
    customerEmail = booking.guestEmail;
  }
  try {
    if ((!customer.email || String(customer.email).includes("@guest.letsgocab.local")) && !booking.guestEmail && customer._id) {
      const user = await User.findById(customer._id)
        .select("email")
        .lean();
      if (user?.email && !String(user.email).includes("@guest.letsgocab.local")) customerEmail = user.email;
      else if (user?.email && booking.guestEmail) customerEmail = booking.guestEmail;
    } else if (!customer.email && customer._id && !booking.guestEmail) {
      const user = await User.findById(customer._id)
        .select("email")
        .lean();
      if (user?.email) customerEmail = user.email;
    }
  } catch {
    // best-effort; the email must still go out.
  }

  let vehicleName = "N/A";
  try {
    if (booking.vehicleType) {
      if (booking.vehicleType.name) {
        vehicleName = booking.vehicleType.name;
      } else {
        const vehicleId =
          booking.vehicleType._id || booking.vehicleType;
        const vehicle = await Vehicle.findById(vehicleId)
          .select("name")
          .lean();
        if (vehicle?.name) vehicleName = vehicle.name;
      }
    }
  } catch {
    // Vehicle lookup is best-effort; the email must still go out.
  }

  const hasDist = typeof booking.distance === "number" && !isNaN(booking.distance);
  const baseDist = hasDist ? booking.distance : 0;
  const days = Math.max(1, Number(booking.days) || 1);
  const isRound = String(booking.tripType || "").toLowerCase().includes("round");
  const totalDist = isRound ? baseDist * days * 2 : baseDist;

  return {
    id: booking._id.toString(),
    ref: booking._id.toString().slice(-8).toUpperCase(),
    name:
      customer.name || booking.guestName || "Guest",
    phone:
      customer.phone || booking.guestPhone || "N/A",
    email: customerEmail,
    pickup: booking.pickup?.address || "N/A",
    drop: booking.drop?.address || "N/A",
    when: formatDateTime(booking.pickupDateTime),
    tripType: booking.tripType || "One Way",
    days,
    isRound,
    distance: hasDist ? `${baseDist.toFixed(1)} km` : "N/A",
    totalDistance: hasDist ? `${totalDist.toFixed(1)} km${isRound && days > 1 ? ` (${baseDist.toFixed(1)} km × ${days} days × 2)` : isRound ? ` (${baseDist.toFixed(1)} km × 2)` : ""}` : "N/A",
    vehicle: vehicleName,
    fare: booking.finalFare || booking.estimatedFare || 0,
    payment: `${booking.paymentMethod || "Cash"} · ${booking.paymentStatus || "Pending"}`,
    status: booking.bookingStatus || "Pending",
    notes: booking.customerNotes || null,
  };
};

/* ===========================================================
   PREMIUM RESPONSIVE BOOKING EMAIL TEMPLATE
   Table-based layout + inline styles for inbox compatibility
   (Gmail, Outlook, Apple Mail). Brand: GenZRides.
=========================================================== */

export const buildBookingEmailHtml = async (booking) => {
  const f = await getBookingEmailFields(booking);
  const e = escapeHtml;
  const appUrl = getConfig().appUrl;
  const detailsUrl = appUrl
    ? `${appUrl}/admin/bookings/${f.id}`
    : null;

  const row = (label, value, highlight = false) => `
    <tr>
      <td class="stack-column label-col" style="padding:12px 16px;font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;width:36%;vertical-align:top;background-color:#f8fafc;border-bottom:1px solid #f1f5f9;">${label}</td>
      <td class="stack-column value-col" style="padding:12px 16px;font-size:14px;color:${highlight ? "#059669" : "#0f172a"};font-weight:${highlight ? "700" : "500"};vertical-align:top;word-break:break-word;border-bottom:1px solid #f1f5f9;">${value}</td>
    </tr>`;

  return `<!doctype html>
<html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @media only screen and (max-width: 600px) {
      .container { padding: 12px 6px !important; }
      .stack-column { padding:10px 10px !important; }
      .label-col { width:32% !important; font-size:10px !important; }
      .value-col { font-size:13px !important; }
      .header { padding:20px 16px !important; }
      .cta { padding:12px 20px !important; font-size:13px !important; }
    }
  </style>
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <div class="container" style="max-width:600px;margin:0 auto;padding:24px 12px;">
      <div class="header" style="background:linear-gradient(135deg,#059669,#10b981);border-radius:16px 16px 0 0;padding:28px 24px;text-align:center;">
        <div style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">GenZRides</div>
        <div style="font-size:13px;color:#d1fae5;margin-top:6px;letter-spacing:2px;">NEW BOOKING RECEIVED</div>
      </div>
      <div style="background-color:#ffffff;border-radius:0 0 16px 16px;padding:8px 8px 20px;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td colspan="2" style="padding:18px 16px 6px;">
              <span style="display:inline-block;background-color:#ecfdf5;color:#059669;font-size:13px;font-weight:700;padding:6px 14px;border-radius:999px;">Ref: ${e(f.ref)}</span>
              <span style="display:inline-block;background-color:#f1f5f9;color:#334155;font-size:13px;font-weight:700;padding:6px 14px;border-radius:999px;margin-left:8px;">${e(f.status)}</span>
            </td>
          </tr>
          
          ${row("Customer", e(f.name))}
          ${row("Phone", e(f.phone))}
          ${row("Email", e(f.email))}
          ${row("Pickup", e(f.pickup))}
          ${row("Drop", e(f.drop))}
          ${row("Date &amp; Time", e(f.when))}
          ${row("Trip Type", e(f.tripType) + (f.isRound ? ` · ${f.days} day${f.days>1?"s":""}` : ""))}
          ${row("Distance", e(f.distance))}
          ${row("Total Distance", e(f.totalDistance), true)}
          ${row("Cab Type", e(f.vehicle))}
          ${row("Fare", `₹${e(f.fare)}`, true)}
          ${row("Payment", e(f.payment))}
          ${f.notes ? row("Customer Notes", e(f.notes)) : ""}
        </table>
        <div style="padding:16px 0;color:#8a94a6;font-size:12px;line-height:1.4;">
           <p>Pay cash to the driver. Tolls & permits extra at actuals.</p>
        </div>
        ${detailsUrl ? `
        <div style="padding:8px 16px 4px;text-align:center;">
          <a href="${e(detailsUrl)}" class="cta" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:999px;">View booking in admin panel</a>
        </div>` : ""}
        <div style="padding:16px;text-align:center;font-size:12px;color:#94a3b8;">
          Assign a driver from the GenZRides admin panel to confirm this ride.
        </div>
      </div>
      <div style="text-align:center;font-size:12px;color:#94a3b8;padding:16px 8px 0;">
        GenZRides · Premium Rides · support@genzrides.com
      </div>
    </div>
  </body>
</html>`;
};

export const buildBookingEmailText = async (booking) => {
  const f = await getBookingEmailFields(booking);
  const appUrl = getConfig().appUrl;

  return [
    "GenZRides — New booking received",
    `Ref: ${f.ref}`,
    `Status: ${f.status}`,
    `Customer: ${f.name}`,
    `Phone: ${f.phone}`,
    `Email: ${f.email}`,
    `Pickup: ${f.pickup}`,
    `Drop: ${f.drop}`,
    `Date & Time: ${f.when}`,
    `Trip Type: ${f.tripType}${f.isRound ? ` · ${f.days} day${f.days>1?"s":""}` : ""}`,
    `Distance: ${f.distance}`,
    `Total Distance: ${f.totalDistance}`,
    `Cab Type: ${f.vehicle}`,
    `Fare: Rs.${f.fare}`,
    `Payment: ${f.payment}`,
    f.notes ? `Customer Notes: ${f.notes}` : null,
    appUrl ? `View: ${appUrl}/admin/bookings/${f.id}` : null,
  ]
    .filter(Boolean)
    .join("\n");
};

// Injectable transport factory (default: nodemailer SMTP). Tests inject a
// fake factory returning { sendMail } without touching the network.
//
// Production robustness:
// - Port 465 → implicit TLS (`secure:true`).
// - Port 587 → STARTTLS (`secure:false` + `requireTLS:true`) so mis-configured
//   hosts that advertise STARTTLS are forced to upgrade instead of sending
//   credentials in cleartext. `requireTLS` is ignored when `secure:true`.
// - Timeouts prevent hung SMTP from blocking the booking response (>30s
//   requestTimeout). 10s is the nodemailer best-practice for cloud SMTPs.
const defaultTransportFactory = async (config) => {
  const { default: nodemailer } = await import("nodemailer");

  // ENETUNREACH on 2607:f8b0:...:587 (Render/Railway) = host's VPC has no
  // IPv6 egress or outbound SMTP 587 is blocked. Force IPv4 and allow
  // override via SMTP_FAMILY=4|6. `family:4` makes nodemailer resolve only
  // A records (e.g. smtp.gmail.com → 142.250.x.x) and avoids :: → ENETUNREACH.
  const familyEnv = String(process.env.SMTP_FAMILY || "").trim();
  const family = familyEnv === "6" ? 6 : familyEnv === "4" ? 4 : 4; // default 4 for prod

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    // Enforce STARTTLS on plain ports; harmless when the server doesn't
    // support it and critical when it does (e.g. Gmail 587).
    requireTLS: !config.secure,
    family,
    auth: config.user
      ? { user: config.user, pass: config.pass }
      : undefined,
    connectionTimeout: REQUEST_TIMEOUT,
    greetingTimeout: REQUEST_TIMEOUT,
    socketTimeout: REQUEST_TIMEOUT,
    // TLS for prod clouds (e.g. Render → Gmail) can fail with
    // self-signed intermediates; do not reject by default but keep
    // hostname verification. This matches the previous behaviour and
    // avoids `self signed certificate` flakes on managed SMTPs.
    tls: {
      // `ciphers: 'SSLv3'` is intentionally NOT set — it weakens security.
      // Nodemailer negotiates the best cipher automatically.
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
      // Prefer IPv4 SNI — some Gmail IPv6 frontends require it.
      servername: config.host,
    },
  });
};

// HTTP API fallback for hosts that block outbound SMTP (Render free,
// Vercel, etc.). If RESEND_API_KEY / BREVO_API_KEY / SENDGRID_API_KEY is
// set, uses HTTPS (443) which is never blocked. Returns {messageId} or
// throws like nodemailer.
const sendViaHttpApi = async (config, { from, to, subject, text, html }) => {
  const toArr = Array.isArray(to) ? to : [to];
  // Resend (https://resend.com) — simplest HTTPS email API
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: toArr, subject, text, html }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `Resend ${res.status}`);
    return { messageId: data?.id || null };
  }
  // Brevo (Sendinblue) — https://api.brevo.com/v3/smtp/email
  if (process.env.BREVO_API_KEY) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { email: from.match(/<(.+)>/)?.[1] || from, name: from.match(/(.+)<.+/ )?.[1]?.trim() || "GenZRides" },
        to: toArr.map((e) => ({ email: String(e).trim() })),
        subject, textContent: text, htmlContent: html,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `Brevo ${res.status}`);
    return { messageId: data?.messageId || null };
  }
  return null; // no API key → fall through to SMTP
};

// Every admin login (role=admin, not blocked) receives booking alerts,
// plus the configured ADMIN_EMAIL as fallback/extra. Deduped + lowercased.
// In production the ADMIN_EMAIL is often the only recipient (no admin user
// may exist yet on a fresh prod DB), so the fallback is critical. Filtering
// `isBlocked` prevents alerts to deactivated admins.
export const getAdminRecipients = async (fallbackEmail) => {
  const set = new Set();

  try {
    const admins = await User.find({ role: "admin", isBlocked: { $ne: true } })
      .select("email")
      .lean();
    admins.forEach((a) => {
      if (a?.email) set.add(String(a.email).trim().toLowerCase());
    });
  } catch {
    // best-effort; the fallback address can still receive the alert.
  }

  if (fallbackEmail) {
    // ADMIN_EMAIL may be a comma-separated list on prod (e.g. "a@x.com,b@y.com")
    const parts = String(fallbackEmail).split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    for (const cleaned of parts) {
      if (cleaned.includes("@") && cleaned.includes(".")) {
        set.add(cleaned);
      } else if (cleaned) {
        console.warn(`[email] ignoring invalid ADMIN_EMAIL entry: ${maskEmail(cleaned)}`);
      }
    }
  }

  return [...set].filter(Boolean);
};

// Returns true when this worker won the race and recorded the send.
// Partial unique on `sent` allows `failed` to be retried. For backwards
// compat with an older `unique:true` index on `booking` (pre-fix prod DBs),
// we delete any stale `failed` row BEFORE attempting the `sent` create so
// the old unique doesn't block the retry with 11000.
const markEmailSent = async (bookingId, to) => {
  const toStr = Array.isArray(to) ? to.join(",") : to || "invalid";
  // Clean stale failures first — required for old DBs with `unique:true`.
  try {
    await EmailLog.deleteMany({ booking: bookingId, status: "failed" });
  } catch {}
  try {
    await EmailLog.create({
      booking: bookingId,
      to: toStr,
      status: "sent",
    });
    return true;
  } catch (err) {
    if (err?.code === 11000) {
      // Another worker already recorded `sent` (partial unique).
      return false;
    }
    throw err;
  }
};

const recordEmailFailure = async (bookingId, to, error) => {
  const toStr = Array.isArray(to) ? to.join(",") : to || "invalid";
  try {
    // Upsert so repeated failures for the same booking don't create
    // unbounded `failed` rows and don't hit the partial unique.
    await EmailLog.findOneAndUpdate(
      { booking: bookingId, status: "failed" },
      { to: toStr, status: "failed", error: error || "Unknown email error" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (e) {
    // Fallback to raw create if upsert races; ignore duplicate.
    try {
      await EmailLog.create({ booking: bookingId, to: toStr, status: "failed", error });
    } catch (err) {
      if (err?.code !== 11000) console.warn(`[email] failed to record failure for ${bookingId}: ${err.message}`);
    }
  }
};

/* ===========================================================
   ADMIN BOOKING EMAIL (guest + logged-in bookings)
   - Recipient + credentials come from process.env only.
   - Deduped per booking via EmailLog unique index.
   - NEVER throws: booking creation must succeed even if email fails.
=========================================================== */

export const notifyAdminOfBookingEmail = async (
  booking,
  transportFactory = null
) => {
  const ref =
    booking?._id?.toString().slice(-8).toUpperCase() || "unknown";

  try {
    if (!booking?._id) {
      return { sent: false, skipped: "no-booking" };
    }

    // Only `sent` blocks a retry — `failed`/`skipped` never do. This is the
    // production fix: a transient SMTP 5xx/timeout previously created a
    // `failed` doc with `unique:true` that permanently blocked the next
    // `sent` attempt for the same booking (11000). With the partial index
    // only `sent` is unique, so we check only for `sent` here.
    const existingSent = await EmailLog.findOne({
      booking: booking._id,
      status: "sent",
    }).lean();

    if (existingSent) {
      return { sent: false, skipped: "duplicate" };
    }

    const config = getConfig();
    const missing = [
      !config.host && "SMTP_HOST",
      !config.user && "SMTP_USER",
      !config.pass && "SMTP_PASS",
    ].filter(Boolean);

    if (missing.length > 0) {
      console.warn(
        `[email] booking ${ref}: skipped, missing env: ${missing.join(", ")} (set SMTP_HOST/USER/PASS on production)`
      );
      return { sent: false, skipped: "email-not-configured" };
    }

    // All admin logins + the configured ADMIN_EMAIL fallback.
    const recipients = await getAdminRecipients(config.adminEmail);

    if (!recipients.length) {
      console.warn(
        `[email] booking ${ref}: skipped, no admin recipients (no admin users, ADMIN_EMAIL unset). Set ADMIN_EMAIL on production or create an admin user.`
      );
      return { sent: false, skipped: "no-recipients" };
    }

    // Fresh guest snapshot (defensive): if the booking was stamped with
    // guest fields after the initial `Booking.create` (legacy path before
    // this fix), merge the persisted guest fields so the admin sees the
    // guest's real email/phone instead of the placeholder.
    let effectiveBooking = booking;
    try {
      if (booking?._id) {
        const { default: Booking } = await import("../models/Booking.js");
        const freshened = await Booking.findById(booking._id)
          .select("guestName guestEmail guestPhone customer pickup drop pickupDateTime tripType days distance vehicleType estimatedFare finalFare paymentMethod paymentStatus bookingStatus customerNotes")
          .lean();
        if (freshened) {
          const base = booking?.toObject ? booking.toObject() : booking;
          effectiveBooking = { ...base, ...freshened, _id: booking._id };
          if (base.customer && !effectiveBooking.customer?.name) effectiveBooking.customer = base.customer;
          if (base.vehicleType && !effectiveBooking.vehicleType) effectiveBooking.vehicleType = base.vehicleType;
          if (base.driver && !effectiveBooking.driver) effectiveBooking.driver = base.driver;
        }
      }
    } catch {
      effectiveBooking = booking;
    }

    const html = await buildBookingEmailHtml(effectiveBooking);
    const text = await buildBookingEmailText(effectiveBooking);
    const subject = `New GenZRides booking ${ref} — ${effectiveBooking.bookingStatus || "Pending"}`;

    // Prefer HTTPS API when configured — Render/Railway block 587, but 443 always works
    let info = null;
    let apiUsed = null;
    try {
      const apiInfo = await sendViaHttpApi(config, {
        from: config.from,
        to: recipients.length === 1 ? recipients[0] : recipients,
        subject, text, html,
      });
      if (apiInfo) {
        info = apiInfo;
        apiUsed = process.env.RESEND_API_KEY ? "resend" : "brevo";
      }
    } catch (apiErr) {
      console.error(`[email] booking ${ref}: HTTP API send failed:`, apiErr?.message || apiErr);
      // fall through to SMTP attempt
    }

    if (!info) {
      const factory = transportFactory || defaultTransportFactory;
      const transporter = await factory(config);
      try {
        info = await transporter.sendMail({
          from: config.from,
          to: recipients.length === 1 ? recipients[0] : recipients,
          subject,
          text,
          html,
        });
      } catch (err) {
        const msg = err?.message || String(err);
        const code = String(err?.code || "");
        const isNetUnreach =
          /ENETUNREACH|EHOSTUNREACH|ETIMEDOUT|ECONNREFUSED|Connection timeout|Timeout/i.test(msg) ||
          /ENETUNREACH|EHOSTUNREACH|ETIMEDOUT|ECONNREFUSED/i.test(code);
        if (isNetUnreach) {
          console.error(
            `[email] booking ${ref}: SMTP ${code || "TIMEOUT"} to ${config.host}:${config.port} — host blocks outbound SMTP (common on Render/Vercel free). Fix: set RESEND_API_KEY (or BREVO_API_KEY) to send via HTTPS 443 (recommended), or use SMTP_PORT=2525/2587 via a relay like SendGrid/Mailgun. Current family:4 already set. Original: ${msg}`
          );
        } else {
          console.error(
            `[email] booking ${ref}: send failed to ${recipients.map(maskEmail).join(",")}:`,
            msg
          );
        }
        await recordEmailFailure(booking._id, recipients, msg);
        return { sent: false, skipped: "send-failed" };
      }
    }

    const logged = await markEmailSent(booking._id, recipients);

    if (!logged) {
      return { sent: false, skipped: "duplicate" };
    }

    console.log(
      `[email] booking ${ref}: sent via ${apiUsed || `smtp:${config.host}:${config.port}`} to ${recipients.map(maskEmail).join(",")} (id=${info?.messageId || "n/a"})`
    );
    return { sent: true, messageId: info?.messageId || null };
  } catch (err) {
    console.error(
      `[email] booking ${ref}: unexpected error:`,
      err?.message || err
    );
    return { sent: false, skipped: "error" };
  }
};

// Re-send helper for admin retry (e.g. after fixing SMTP config). Only
// useful when the previous attempt was `failed`/`no-recipients`/not-sent.
export const resendAdminBookingEmail = async (bookingId, transportFactory = null) => {
  const { default: Booking } = await import("../models/Booking.js");
  const booking = await Booking.findById(bookingId)
    .populate("customer", "name phone email")
    .populate("vehicleType")
    .lean();
  if (!booking) return { sent: false, skipped: "booking-not-found" };
  // Allow retry by removing only `failed` logs; `sent` stays blocked.
  await EmailLog.deleteMany({ booking: bookingId, status: "failed" });
  return notifyAdminOfBookingEmail(booking, transportFactory);
};
