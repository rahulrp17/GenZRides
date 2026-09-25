import React from "react";
import {
  ArrowRight,
  Repeat,
  ShieldCheck,
  ShieldAlert,
  Clock3,
  RefreshCw,
  ChevronDown,
  Car,
  User,
  MapPin,
  Wallet,
  Clock,
  Calendar,
  Eye,
  Copy,
  Check,
  Mail,
  Phone,
  Navigation,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { BookingStatusBadge } from "../../utils/bookingStatus";
import { fareTotal } from "../../utils/bookingStatusMeta";
import { useCopyBooking } from "../../utils/bookingText";
import { formatTripDuration } from "../../utils/formatDuration";
import Modal from "../../components/shared/Modal";
import SearchBar from "../../components/shared/SearchBar";
import ViewToggle from "../../components/shared/ViewToggle";
import {
  formatDateTime,
  customerName,
  customerPhone,
} from "./bookingUtils";

export const TripTypeBadge = ({ type }) => {
  const round = type === "Round Trip";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur ${
        round
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          : "bg-sky-500/15 text-sky-300 border-sky-500/30"
      }`}
    >
      {round ? <Repeat size={12} /> : <ArrowRight size={12} />}
      {type || "One Way"}
    </span>
  );
};

const APPROVAL_STYLES = {
  Approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Pending Approval": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const APPROVAL_ICONS = {
  Approved: ShieldCheck,
  "Pending Approval": Clock3,
  Rejected: ShieldAlert,
};

export const ApprovalBadge = ({ value }) => {
  const v = value || "Approved";
  const Icon = APPROVAL_ICONS[v] || ShieldCheck;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur whitespace-nowrap ${
        APPROVAL_STYLES[v] || APPROVAL_STYLES.Approved
      }`}
    >
      <Icon size={12} />
      {v}
    </span>
  );
};

// Compact hero panel shared by all booking queues.
export const QueueHero = ({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  stats = [],
  loading,
  refreshing,
  onRefresh,
}) => (
  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-green-500/15 via-white/5 to-transparent p-4 sm:p-5">
    <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-green-500/15 blur-[100px]" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-400/60 to-transparent" />
    <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between min-w-0">
      <div className="min-w-0">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-green-300">
          {Icon && <Icon size={12} />} {eyebrow}
          <span className="relative flex w-1.5 h-1.5 ml-1">
            <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-60 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-green-400" />
          </span>
        </p>
        <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
          {title}
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 lg:min-w-[360px]">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-black/30 border border-white/10 rounded-2xl px-3 py-2 text-center min-w-0"
          >
            <p
              className={`text-base sm:text-lg font-bold leading-none truncate ${
                s.accent || "text-white"
              }`}
            >
              {loading ? "–" : s.value}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 truncate">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="relative mt-3 flex flex-col sm:flex-row gap-2 sm:items-center">
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl px-5 py-2.5 min-h-[44px] text-sm hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
      >
        <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        {refreshing ? "Refreshing…" : "Refresh now"}
      </button>
      <p className="text-[11px] text-gray-500 self-center hidden md:block">
        Socket live · polling as backup
      </p>
    </div>
  </div>
);

// Search + vehicle filter + view toggle shared by all booking queues.
export const QueueToolbar = ({
  search,
  onSearch,
  searchPlaceholder,
  view,
  onViewChange,
  vehicleTypes = [],
  vehicleType,
  onVehicleType,
  fetching,
  loading,
}) => (
  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
    <div className="relative flex-1 min-w-0">
      <SearchBar
        value={search}
        onChange={onSearch}
        placeholder={searchPlaceholder}
      />
      {fetching && !loading && (
        <span
          className="absolute right-11 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin pointer-events-none"
          aria-label="Searching"
        />
      )}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <ViewToggle view={view} onChange={onViewChange} />
      {vehicleTypes.length > 0 && (
        <>
          <label className="text-xs font-semibold text-gray-400 hidden sm:inline">
            Vehicle
          </label>
          <div className="relative flex-1 sm:flex-none">
            <select
              value={vehicleType}
              onChange={(e) => onVehicleType(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white/[0.06] backdrop-blur-xl border border-white/15 text-white text-xs font-semibold rounded-2xl pl-4 pr-10 py-3 min-h-[48px] outline-none cursor-pointer hover:border-emerald-500/40 focus:border-emerald-500/60 transition shadow-lg shadow-black/20"
            >
              <option value="">All Types</option>
              {vehicleTypes.map((v) => (
                <option key={v._id} value={v._id} className="bg-gray-900 text-white">
                  {v.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"
            />
          </div>
        </>
      )}
    </div>
  </div>
);

// Shared driver cell: assigned name or the "Driver Not Assigned" fallback.
// Pages spread it as `{ header: "Driver", cell: (b) => <DriverCell b={b} /> }`.
export const DriverCell = ({ b }) => (
  <div className="min-w-[130px] max-w-[190px]">
    {b.driver?.user?.name ? (
      <>
        <p className="text-[13px] font-semibold text-white truncate">{b.driver.user.name}</p>
        <p className="text-[11px] text-gray-500 truncate">{b.driver.user.phone || ""}</p>
      </>
    ) : (
      <p className="text-[13px] text-gray-500 italic whitespace-nowrap">Driver Not Assigned</p>
    )}
  </div>
);

// Left (route) side of a queue card: badges, timeline, chips.
export const BookingRouteSide = ({ b, showApproval }) => (
  <div className="p-3.5 sm:p-4 min-w-0">
    <div className="flex flex-wrap items-center gap-1.5 mb-2.5 min-w-0">
      <TripTypeBadge type={b.tripType} />
      {showApproval && <ApprovalBadge value={b.approvalStatus} />}
      <span className="font-mono text-[14px] bg-green-400/15 border border-green-400/25 rounded-full px-2 py-0.5 text-green-500">
        #{b._id?.slice(-6).toUpperCase()}
      </span>
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-gray-500">
        <Clock size={11} /> {formatDateTime(b.pickupDateTime)}
      </span>
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-gray-500"
        title={`Booked ${formatDateTime(b.createdAt)}`}
      >
        <Calendar size={11} /> Booked {formatDateTime(b.createdAt)}
      </span>
    </div>

    <div className="relative pl-5 space-y-2.5 min-w-0">
      <span
        aria-hidden
        className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-green-400/70 via-white/15 to-red-400/70"
      />
      <div className="min-w-0">
        <span
          aria-hidden
          className="absolute left-0 mt-1 w-[11px] h-[11px] rounded-full bg-green-400 ring-4 ring-green-400/20"
        />
        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500 font-semibold">
          Pickup
        </p>
        <p className="text-sm font-medium text-white truncate" title={b.pickup?.address}>
          {b.pickup?.address || "N/A"}
        </p>
      </div>
      <div className="min-w-0">
        <span
          aria-hidden
          className="absolute left-0 mt-1 w-[11px] h-[11px] rounded-full bg-red-400 ring-4 ring-red-400/20"
        />
        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500 font-semibold">
          Drop
        </p>
        <p className="text-sm font-medium text-white truncate" title={b.drop?.address}>
          {b.drop?.address || "N/A"}
        </p>
      </div>
    </div>

    <div className="flex flex-wrap gap-1.5 mt-2.5">
      {(b.vehicleType?.name || b.driver?.vehicleType?.name) && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300 max-w-full">
          <Car size={12} className="text-violet-400 shrink-0" />
          <span className="truncate">
            {b.vehicleType?.name || b.driver?.vehicleType?.name}
          </span>
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300 max-w-full">
        <User size={12} className="text-emerald-400 shrink-0" />
        <span className="truncate">
          {customerName(b)}
          {customerPhone(b) ? ` · ${customerPhone(b)}` : ""}
        </span>
      </span>
      {b.distance != null && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300">
          <MapPin size={12} className="text-sky-400 shrink-0" />
          {Number(b.distance).toFixed(1)} km
        </span>
      )}
      {b.paymentMethod && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300">
          <Wallet size={12} className="text-amber-400 shrink-0" />
          {b.paymentMethod}
        </span>
      )}
    </div>
  </div>
);

// Right (fare) rail of a queue card; action buttons go in as children.
export const BookingFareRail = ({ b, children }) => (
  <div className="relative flex sm:flex-col items-center sm:items-stretch justify-between gap-2.5 px-4 py-3 sm:p-4 bg-gradient-to-br from-green-500/15 via-green-500/5 to-transparent border-t sm:border-t-0 sm:border-l border-white/10 min-w-0">
    {b?.estimatedFare != null && (
      <div className="min-w-0 sm:text-right">
        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-semibold">
          Est. fare
        </p>
        <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-300 via-green-200 to-green-400 bg-clip-text text-transparent leading-tight">
          ₹{(b.estimatedFare ?? 0).toLocaleString("en-IN")}
        </p>
      </div>
    )}
    <div className="flex flex-wrap sm:flex-col gap-1.5 shrink-0 sm:shrink">
      {children}
    </div>
  </div>
);

const railBtn =
  "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full rounded-2xl text-xs font-semibold transition-all disabled:opacity-50";

export const RailDetailsBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    aria-label="View details"
    className={`${railBtn} bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10`}
  >
    <Eye size={15} />
    <span className="sm:inline">Details</span>
  </button>
);

// Detail modal shared by all booking queues; footer actions via prop.
export const BookingDetailModal = ({ booking: b, onClose, footer }) => {
  const { copied, copyBooking } = useCopyBooking();
  const contactEmail = b?.customer?.email || b?.guestEmail || "";
  return (
    <Modal
      isOpen={!!b}
      onClose={onClose}
      title="Booking Details"
      maxWidth="max-w-xl"
    >
      {b && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white">
              #{b._id?.slice(-8).toUpperCase()}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <BookingStatusBadge status={b.bookingStatus} size="sm" />
              <ApprovalBadge value={b.approvalStatus} />
              <button
                onClick={() => copyBooking(b)}
                title="Copy booking details"
                aria-label="Copy booking details"
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs font-medium hover:bg-white/10 hover:text-white transition"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-1.5 mb-2">
              <User size={12} className="text-emerald-400" /> Customer
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-full px-3 py-1.5 text-[13px] text-gray-200 min-w-0 max-w-full">
                <User size={12} className="text-emerald-400 shrink-0" />
                <span className="truncate">{customerName(b)}</span>
              </span>
              {customerPhone(b) && (
                <a href={`tel:${customerPhone(b)}`} className="inline-flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-full px-3 py-1.5 text-[13px] text-gray-200 hover:border-green-500/50 hover:text-green-300 transition">
                  <Phone size={12} className="text-green-400 shrink-0" /> {customerPhone(b)}
                </a>
              )}
              {contactEmail && (
                <span className="inline-flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-full px-3 py-1.5 text-[13px] text-gray-200 min-w-0 max-w-full">
                  <Mail size={12} className="text-blue-400 shrink-0" />
                  <span className="truncate">{contactEmail}</span>
                </span>
              )}
            </div>
          </div>

          {/* Trip */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-white/5 to-transparent border border-emerald-500/20 rounded-2xl p-3.5">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Trip</p>
            <div className="relative pl-4 space-y-2 text-[13px]">
              <span aria-hidden className="absolute left-[4px] top-1 bottom-1 w-px bg-gradient-to-b from-green-400/70 via-white/15 to-red-400/70" />
              <div className="relative min-w-0">
                <span aria-hidden className="absolute left-[-15px] top-1 w-[9px] h-[9px] rounded-full bg-green-400 ring-4 ring-green-400/20" />
                <p className="text-white font-medium break-words">{b.pickup?.address}</p>
              </div>
              <div className="relative min-w-0">
                <span aria-hidden className="absolute left-[-15px] top-1 w-[9px] h-[9px] rounded-full bg-red-400 ring-4 ring-red-400/20" />
                <p className="text-white font-medium break-words">{b.drop?.address}</p>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[12px]">
              <span className="inline-flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300">
                <Clock size={12} className="text-blue-400 shrink-0" />
                {formatDateTime(b.pickupDateTime)}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300">
                <Car size={12} className="text-violet-400 shrink-0" />
                {b.vehicleType?.name || b.driver?.vehicleType?.name || "—"}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300">
                <Navigation size={12} className="text-sky-400 shrink-0" />
                {b.tripType || "One Way"}
                {b.distance != null ? ` · ${Number(b.distance).toFixed(1)} km` : ""}
              </span>
            </div>
          </div>

          {/* Fare & driver */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-2xl p-3">
              <p className="text-[11px] text-gray-500">Total Fare</p>
              <p className="font-bold text-white text-sm">₹{fareTotal(b).toLocaleString("en-IN")}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Approx ₹{(b.estimatedFare ?? 0).toLocaleString("en-IN")} · {b.paymentMethod || "Cash"} · {b.paymentStatus || "Pending"}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 min-w-0">
              <p className="text-[11px] text-gray-500">Driver</p>
              {b.driver?.user?.name ? (
                <>
                  <p className="font-bold text-white text-sm truncate">{b.driver.user.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">{b.driver.user.phone || ""}</p>
                </>
              ) : (
                <p className="font-medium text-gray-500 text-sm italic">Driver Not Assigned</p>
              )}
            </div>
            <div className="bg-white/5 rounded-2xl p-3">
              <p className="text-[11px] text-gray-500">Duration</p>
              <p className="font-medium text-white text-sm">{formatTripDuration(b.duration)}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3">
              <p className="text-[11px] text-gray-500">Booked On</p>
              <p className="font-medium text-white text-sm">{formatDateTime(b.createdAt)}</p>
            </div>
          </div>
          {b.customerNotes && (
            <p className="text-xs text-gray-400 bg-white/5 border border-white/10 rounded-2xl p-3">
              Note: {b.customerNotes}
            </p>
          )}
          {footer}
        </div>
      )}
    </Modal>
  );
};

// Card shell shared by all booking queues. `highlight` flashes a newly
// arrived booking for a few seconds (ring + glow + pulse).
export const QueueCard = ({ index, children, highlight = false }) => (
  <Motion.article
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.32 }}
    className={`group relative overflow-hidden bg-white/5 backdrop-blur-lg rounded-3xl border transition-all duration-300 min-w-0 ${
      highlight
        ? "border-emerald-400/70 shadow-[0_0_35px_rgba(34,197,94,0.45)] animate-pulse"
        : "border-white/10 hover:border-green-400/40 hover:shadow-[0_8px_40px_-12px_rgba(0,255,128,0.3)]"
    }`}
  >
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />
    <span
      aria-hidden
      className="pointer-events-none absolute -right-1 -top-3 text-[64px] sm:text-[76px] font-bold text-white/[0.04] leading-none select-none"
    >
      {String(index + 1).padStart(2, "0")}
    </span>
    <div className="relative grid sm:grid-cols-[1fr_212px] min-w-0">{children}</div>
  </Motion.article>
);
