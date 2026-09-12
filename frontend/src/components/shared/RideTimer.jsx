import { useEffect, useState } from "react";

// Ride timing driven purely by backend timestamps/status, so it survives
// refresh and stays consistent across the customer and driver views.
// Accepted → Arrived counts waiting time; Started → Completed counts trip
// time; terminal states freeze at their stored timestamps.

export const formatElapsed = (ms) => {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
};

const toMs = (value) => {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
};

export const getRideTimeInfo = (booking, now = Date.now()) => {
  if (!booking) return { label: "Ride Time", elapsedMs: null, live: false };

  const status = booking.bookingStatus;

  // Trip time: Started (live) → Reached → Completed (frozen).
  if (["Started", "Reached", "Completed"].includes(status)) {
    const start = toMs(booking.startedAt) || toMs(booking.acceptedAt);
    const end =
      status === "Completed"
        ? toMs(booking.completedAt)
        : status === "Reached"
          ? toMs(booking.reachedAt)
          : now;
    if (start == null || end == null || end < start) {
      return { label: "Ride Time", elapsedMs: null, live: false };
    }
    return {
      label: "Ride Time",
      elapsedMs: end - start,
      live: status === "Started",
    };
  }

  // Wait time: Accepted → On The Way → Arrived (live until start).
  if (["Accepted", "On The Way", "Arrived"].includes(status)) {
    const start = toMs(booking.acceptedAt) || toMs(booking.createdAt);
    if (start == null || now < start) {
      return { label: "Waiting", elapsedMs: null, live: false };
    }
    return { label: "Waiting", elapsedMs: now - start, live: true };
  }

  return { label: "Ride Time", elapsedMs: null, live: false };
};

// Ticks once per second only while the ride is live; frozen states cost
// no timer. Safe to call with a null/undefined booking.
export const useRideTime = (booking) => {
  const [now, setNow] = useState(() => Date.now());
  const info = getRideTimeInfo(booking, now);

  useEffect(() => {
    if (!info.live) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [info.live, booking?._id, booking?.bookingStatus]);

  return {
    ...info,
    display: info.elapsedMs == null ? "—" : formatElapsed(info.elapsedMs),
  };
};
