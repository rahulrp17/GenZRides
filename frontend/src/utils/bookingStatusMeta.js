import {
  Clock3,
  UserCheck,
  Navigation,
  MapPin,
  Play,
  Flag,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* ===========================================================
   Single source of truth: backend bookingStatus → guest-facing
   display label. Only real backend statuses appear here —
   nothing is invented.
========================================================== */

export const BOOKING_STATUS_LABEL = {
  Pending: "Booking Pending",
  Accepted: "Driver Assigned",
  "On The Way": "Driver On The Way",
  Arrived: "Driver Arrived",
  Started: "Ride Started",
  Reached: "Reached Destination",
  Completed: "Ride Completed",
  Cancelled: "Booking Cancelled",
};

export const displayStatus = (raw) =>
  BOOKING_STATUS_LABEL[raw] || raw || "Booking Pending";

/* ===========================================================
   Display label → pill style. One style per tracking state,
   shared by guest tracking, admin, customer and driver views.
========================================================== */

export const STATUS_STYLE = {
  "Booking Pending": "bg-amber-500/15 border-amber-500/40 text-amber-300",
  "Driver Assigned": "bg-blue-500/15 border-blue-500/40 text-blue-300",
  "Driver On The Way": "bg-sky-500/15 border-sky-500/40 text-sky-300",
  "Driver Arrived": "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",
  "Ride Started": "bg-indigo-500/15 border-indigo-500/40 text-indigo-300",
  "Reached Destination": "bg-green-500/15 border-green-500/40 text-green-300",
  "Ride Completed": "bg-green-500/15 border-green-500/40 text-green-300",
  "Booking Cancelled": "bg-red-500/15 border-red-500/40 text-red-300",
};

/* ===========================================================
   One meaningful icon per tracking state.
========================================================== */

export const STATUS_ICON = {
  "Booking Pending": Clock3,
  "Driver Assigned": UserCheck,
  "Driver On The Way": Navigation,
  "Driver Arrived": MapPin,
  "Ride Started": Play,
  "Reached Destination": Flag,
  "Ride Completed": CheckCircle2,
  "Booking Cancelled": XCircle,
};

/* ===========================================================
   Fare semantics shared by driver + admin views.
   Approximate = the booking-time estimate.
   Total = cash actually collected (driver payment input) once
   known, otherwise the estimate.
========================================================== */

export const fareApprox = (b) => Number(b?.estimatedFare ?? 0);

export const fareTotal = (b) =>
  Number(b?.finalFare) > 0 ? Number(b.finalFare) : Number(b?.estimatedFare ?? 0);

export const inr0 = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
