import Vehicle from "../models/Vehicle.js";
import EmailLog from "../models/EmailLog.js";
import User from "../models/User.js";

const REQUEST_TIMEOUT = 10000;

const combineNameAddress = (name, address) => {
  if (name && address) return `${name} <${address}>`;
  return address || "";
};

export const getEmailConfig = () => getConfig();

const getConfig = () => ({
  host: (process.env.SMTP_HOST || "").trim(),
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false") === "true",
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
});

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

  // Customer email is not part of booking API populates (contract), so
  // resolve it here best-effort for the admin email only.
  let customerEmail = customer.email || booking.guestEmail || "N/A";
  try {
    if (!customer.email && customer._id) {
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
const defaultTransportFactory = async (config) => {
  const { default: nodemailer } = await import("nodemailer");

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user
      ? { user: config.user, pass: config.pass }
      : undefined,
    connectionTimeout: REQUEST_TIMEOUT,
    greetingTimeout: REQUEST_TIMEOUT,
    socketTimeout: REQUEST_TIMEOUT,
  });
};

// Every admin login (role=admin) receives booking alerts, plus the
// configured ADMIN_EMAIL as fallback/extra. Deduped + lowercased.
export const getAdminRecipients = async (fallbackEmail) => {
  const set = new Set();

  try {
    const admins = await User.find({ role: "admin" })
      .select("email")
      .lean();
    admins.forEach((a) => {
      if (a?.email) set.add(String(a.email).trim().toLowerCase());
    });
  } catch {
    // best-effort; the fallback address can still receive the alert.
  }

  if (fallbackEmail) {
    set.add(String(fallbackEmail).trim().toLowerCase());
  }

  return [...set].filter(Boolean);
};

// Returns true when this worker won the race and recorded the send.
const markEmailSent = async (bookingId, to) => {
  try {
    await EmailLog.create({
      booking: bookingId,
      to: Array.isArray(to) ? to.join(",") : to || "invalid",
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

    const existing = await EmailLog.findOne({
      booking: booking._id,
    }).lean();

    if (existing) {
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
        `[email] booking ${ref}: skipped, missing env: ${missing.join(", ")}`
      );
      return { sent: false, skipped: "email-not-configured" };
    }

    // All admin logins + the configured ADMIN_EMAIL fallback.
    const recipients = await getAdminRecipients(config.adminEmail);

    if (!recipients.length) {
      console.warn(
        `[email] booking ${ref}: skipped, no admin recipients (no admin users, ADMIN_EMAIL unset)`
      );
      return { sent: false, skipped: "no-recipients" };
    }

    const html = await buildBookingEmailHtml(booking);
    const text = await buildBookingEmailText(booking);
    const subject = `New GenZRides booking ${ref} — ${booking.bookingStatus || "Pending"}`;

    const factory = transportFactory || defaultTransportFactory;
    const transporter = await factory(config);

    let info;
    try {
      info = await transporter.sendMail({
        from: config.from,
        to: recipients.length === 1 ? recipients[0] : recipients,
        subject,
        text,
        html,
      });
    } catch (err) {
      console.error(
        `[email] booking ${ref}: send failed to ${recipients.map(maskEmail).join(",")}:`,
        err?.message || err
      );
      await EmailLog.create({
        booking: booking._id,
        to: recipients.join(","),
        status: "failed",
        error: err?.message || "Unknown email error",
      });
      return { sent: false, skipped: "send-failed" };
    }

    const logged = await markEmailSent(booking._id, recipients);

    if (!logged) {
      return { sent: false, skipped: "duplicate" };
    }

    console.log(
      `[email] booking ${ref}: sent to ${recipients.map(maskEmail).join(",")} (id=${info?.messageId || "n/a"})`
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
