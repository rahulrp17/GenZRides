import { useState } from "react";
import { toast } from "react-hot-toast";

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

// Complete, human-readable booking summary for copy-to-clipboard.
export const formatBookingDetails = (booking) => {
  if (!booking) return "";
  const cab =
    booking.vehicleType?.name || booking.driver?.vehicleType?.name || "N/A";
  const lines = [
    `🆔 GenZRides Booking Id: #${String(booking._id || "")
      .slice(-8)
      .toUpperCase()}`,
    `📌 Status: ${booking.bookingStatus || "N/A"}`,
    `👤 Customer: ${booking.customer?.name || booking.guestName || "N/A"}${
      booking.customer?.phone || booking.guestPhone
        ? ` (${booking.customer?.phone || booking.guestPhone})`
        : ""
    }`,
    `🚗 Driver: ${booking.driver?.user?.name || "Not assigned"}${
      booking.driver?.user?.phone ? ` (${booking.driver.user.phone})` : ""
    }`,
    `📍 Pickup: ${booking.pickup?.address || "N/A"}`,
    `🏁 Drop: ${booking.drop?.address || "N/A"}`,
    `🗓️ Date & Time: ${formatDateTime(booking.pickupDateTime)}`,
    `🛣️ Trip Type: ${booking.tripType || "N/A"}`,
    `🚙 Cab Type: ${cab}`,
    `📏 Distance: ${booking.distance != null ? `${Number(booking.distance).toFixed(1)} km` : "N/A"}`,
    `⏱️ Duration: ${booking.duration != null ? `${Math.ceil(Number(booking.duration))} min` : "N/A"}`,
    `💵 Fare: Rs.${booking.finalFare || booking.estimatedFare || 0}`,
    `💳 Payment: ${booking.paymentMethod || "Cash"} (${booking.paymentStatus || "Pending"})`,
    `⚠️ Note: Please inform the customer that they are required to pay both the toll fee and the interstate permit fee.`,
  ];
  if (booking.customerNotes) lines.push(`📝 Note: ${booking.customerNotes}`);
  if (booking.cancelReason)
    lines.push(
      `❌ Cancellation: ${booking.cancelledBy || ""} — ${booking.cancelReason}`.trim(),
    );
  return lines.join("\n");
};

// Clipboard write with legacy fallback (non-secure contexts / old browsers).
export const copyTextToClipboard = async (text) => {
  if (!text) throw new Error("Nothing to copy.");
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } finally {
    document.body.removeChild(area);
  }
  if (!ok) throw new Error("Copy failed.");
  return true;
};

// Copy button state machine: idle → copied (2s) → idle, with toasts.
export const useCopyBooking = () => {
  const [copied, setCopied] = useState(false);

  const copyBooking = async (booking) => {
    try {
      await copyTextToClipboard(formatBookingDetails(booking));
      setCopied(true);
      toast.success("Booking details copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — please copy manually");
    }
  };

  return { copied, copyBooking };
};
