import React from "react";
import { Clock3 } from "lucide-react";
import { displayStatus, STATUS_STYLE, STATUS_ICON } from "./bookingStatusMeta";

/* ===========================================================
   Status badge. Accepts the RAW backend status and maps it
   internally, so every view shows the same label/style/icon.
   Sizes: "md" (cards, banners, modals) and "sm" (tables, rows).
========================================================== */

const SIZES = {
  md: {
    pill: "px-3.5 py-1.5 text-xs sm:text-sm font-semibold gap-1.5",
    icon: 14,
  },
  sm: {
    pill: "px-2 py-0.5 text-[11px] font-semibold gap-1 whitespace-nowrap",
    icon: 11,
  },
};

export const BookingStatusBadge = ({ status, size = "md", className = "" }) => {
  const label = displayStatus(status);
  const Icon = STATUS_ICON[label] || Clock3;
  const s = SIZES[size] || SIZES.md;
  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur ${STATUS_STYLE[label] || "bg-white/5 border-white/10 text-gray-300"} ${s.pill} ${className}`}
    >
      <Icon size={s.icon} className="shrink-0" />
      {label}
    </span>
  );
};
