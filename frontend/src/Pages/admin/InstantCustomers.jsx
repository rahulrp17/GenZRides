import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Users,
  Zap,
  Mail,
  Phone,
  Calendar,
  Eye,
  UserPlus,
  Ban,
  Clock,
  Car,
  Navigation,
  ArrowRight,
  Repeat,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { useSocket } from "../../Context/SocketContext";
import { adminAPI, vehicleAPI } from "../../services/endpoints";
import { CardSkeleton } from "../../components/shared/Skeleton";
import ErrorState from "../../components/shared/ErrorState";
import EmptyState from "../../components/shared/EmptyState";
import Pagination from "../../components/shared/Pagination";
import SearchBar from "../../components/shared/SearchBar";
import useDebounce from "../../hooks/useDebounce";
import ViewToggle from "../../components/shared/ViewToggle";
import Modal from "../../components/shared/Modal";
import AssignDriverDialog from "../../components/shared/AssignDriverDialog";
import CancelReasonDialog from "../../components/shared/CancelReasonDialog";
import { formatTripDuration } from "../../utils/formatDuration";

const PAGE_LIMIT = 8;

const STATUSES = [
  "Pending",
  "Accepted",
  "On The Way",
  "Arrived",
  "Started",
  "Reached",
  "Completed",
  "Cancelled",
];

const STATUS_STYLES = {
  Pending: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  Accepted: "bg-blue-500/15 text-blue-300 border-blue-400/30",
  "On The Way": "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
  Arrived: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  Started: "bg-violet-500/15 text-violet-300 border-violet-400/30",
  Reached: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  Completed: "bg-green-500/15 text-green-300 border-green-400/30",
  Cancelled: "bg-rose-500/15 text-rose-300 border-rose-400/30",
};

const initials = (name) =>
  (name || "G")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "G";

const shortId = (id, len = 6) =>
  id ? `#${String(id).slice(-len).toUpperCase()}` : "";

const timeAgo = (iso) => {
  if (!iso) return "";
  const mins = Math.max(
    1,
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000),
  );
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const fmtWhen = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const fmtFull = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// Small helper shared by cards + table + modal action rows.
const GuestActions = ({ g, onView, onAssign, onReject, compact = false }) => {
  const disabled = ["Cancelled", "Completed"].includes(g.bookingStatus);
  const assigned = !!g.driver?._id;
  if (compact) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <button
          onClick={() => onView(g)}
          className="p-2 text-gray-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-lg transition"
          title="View details"
          aria-label="View details"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() => !disabled && !assigned && onAssign(g)}
          disabled={disabled || assigned}
          className="p-2 text-gray-300 hover:text-green-400 bg-white/5 border border-white/10 hover:bg-green-500/15 hover:border-green-500/30 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
          title={
            assigned
              ? "Driver already assigned"
              : disabled
                ? "Booking closed"
                : "Assign driver"
          }
          aria-label="Assign driver"
        >
          <UserPlus size={18} />
        </button>
        <button
          onClick={() => !disabled && onReject(g)}
          disabled={disabled}
          className="p-2 text-gray-300 hover:text-red-400 bg-white/5 border border-white/10 hover:bg-red-500/15 hover:border-red-500/30 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
          title={disabled ? "Booking closed" : "Reject booking"}
          aria-label="Reject booking"
        >
          <Ban size={18} />
        </button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => onView(g)}
        className="inline-flex items-center justify-center gap-1.5 py-2 bg-white/5 text-gray-200 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/10 active:scale-[0.98] transition"
      >
        <Eye size={14} /> View
      </button>
      <button
        onClick={() => !disabled && !assigned && onAssign(g)}
        disabled={disabled || assigned}
        className="inline-flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-xs font-semibold hover:shadow-[0_0_18px_rgba(34,197,94,0.4)] active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
        title={assigned ? "Driver already assigned" : ""}
      >
        <UserPlus size={14} /> {assigned ? "Assigned" : "Assign"}
      </button>
      <button
        onClick={() => !disabled && onReject(g)}
        disabled={disabled}
        className="inline-flex items-center justify-center gap-1.5 py-2 bg-red-500/15 text-red-300 border border-red-500/25 rounded-xl text-xs font-semibold hover:bg-red-500/25 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Ban size={14} /> Reject
      </button>
    </div>
  );
};

const InstantCustomers = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  // Debounce typing → one request per pause, not one per keystroke.
  const debouncedSearch = useDebounce(search, 300);
  // Table/cards preference persists; switching never refetches or resets
  // search or page — all live outside the view branch.
  const [view, setView] = useState(
    () => localStorage.getItem("adminInstantCustomersView") || "cards",
  );
  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem("adminInstantCustomersView", v);
    } catch {
      // private mode — preference simply won't persist
    }
  };

  const [selectedGuest, setSelectedGuest] = useState(null);
  const [assignDialog, setAssignDialog] = useState({
    open: false,
    bookingId: null,
  });
  const [assigningDriverId, setAssigningDriverId] = useState(null);
  const [rejectDialog, setRejectDialog] = useState({
    open: false,
    bookingId: null,
  });

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [
      "adminInstantCustomers",
      page,
      statusFilter,
      vehicleTypeFilter,
      debouncedSearch,
    ],
    queryFn: async () => {
      const params = { page, limit: PAGE_LIMIT };
      if (statusFilter) params.status = statusFilter;
      if (vehicleTypeFilter) params.vehicleType = vehicleTypeFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data: res } = await adminAPI.getInstantCustomers(params);
      return res;
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const { data: vehicleData } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await vehicleAPI.getAll();
      return data;
    },
    staleTime: 300_000,
  });
  const vehicleTypes = vehicleData?.vehicles || [];

  // Live: a fresh guest request (or any booking/status change) refreshes the
  // feed the moment it lands. If the details modal is open for the updated
  // booking, merge it in so payment/status changes reflect immediately.
  useEffect(() => {
    if (!socket) return;
    const refresh = (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminInstantCustomers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      if (data?._id) {
        setSelectedGuest((prev) =>
          prev && prev._id === data._id ? { ...prev, ...data } : prev,
        );
      }
    };
    socket.on("new-booking", refresh);
    socket.on("booking-created", refresh);
    socket.on("booking-updated", refresh);
    socket.on("ride-status-updated", refresh);
    return () => {
      socket.off("new-booking", refresh);
      socket.off("booking-created", refresh);
      socket.off("booking-updated", refresh);
      socket.off("ride-status-updated", refresh);
    };
  }, [socket, queryClient]);

  const { data: driversData } = useQuery({
    queryKey: ["approvedDrivers"],
    queryFn: async () => {
      const { data } = await adminAPI.getApprovedDrivers();
      return data;
    },
    staleTime: 30_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["adminInstantCustomers"] });
    queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
  };

  const assignMutation = useMutation({
    mutationFn: ({ id, driverId }) => adminAPI.assignDriver(id, { driverId }),
    onSuccess: () => {
      toast.success("Driver assigned to guest booking");
      setAssignDialog({ open: false, bookingId: null });
      setSelectedGuest(null);
      invalidate();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to assign driver"),
    onSettled: () => setAssigningDriverId(null),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminAPI.cancelBooking(id, { reason }),
    onSuccess: () => {
      toast.success("Guest booking rejected");
      setRejectDialog({ open: false, bookingId: null });
      setSelectedGuest(null);
      invalidate();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to reject booking"),
  });

  if (isError) {
    return (
      <ErrorState
        message={error?.message || "Failed to load instant customers"}
        onRetry={() =>
          queryClient.invalidateQueries({ queryKey: ["adminInstantCustomers"] })
        }
      />
    );
  }

  const guests = data?.guests || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const filtering =
    !!debouncedSearch.trim() || !!statusFilter || !!vehicleTypeFilter;

  const openAssign = (g) => setAssignDialog({ open: true, bookingId: g._id });
  const openReject = (g) => setRejectDialog({ open: true, bookingId: g._id });

  const detailsBooking =
    selectedGuest ||
    (assignDialog.bookingId
      ? guests.find((g) => g._id === assignDialog.bookingId)
      : null) ||
    null;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold text-white tracking-tight">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/25 to-teal-500/25 border border-white/10 flex items-center justify-center">
              <Zap size={18} className="text-emerald-300" />
            </span>
            Instant Customers
            <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-400/25 rounded-full px-2.5 py-0.5">
              {filtering ? `${guests.length} / ${total}` : total}
            </span>
          </h1>
          <p className="text-sm text-slate-200/70 mt-1">
            Guests booking instantly without an account — the guest details live
            here, not in Manage Customers.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-full sm:w-72">
            <SearchBar
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search name, phone, route…"
            />
          </div>
          {vehicleTypes.length > 0 && (
            <div className="relative flex-1 sm:flex-none min-w-[160px] max-w-full">
              <select
                value={vehicleTypeFilter}
                onChange={(e) => {
                  setVehicleTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none bg-white/[0.06] backdrop-blur-xl border border-white/15 text-white text-xs font-semibold rounded-2xl pl-4 pr-10 py-3.5 min-h-[44px] outline-none cursor-pointer hover:border-emerald-500/40 focus:border-emerald-500/60 transition shadow-lg shadow-black/20"
              >
                <option value="" className="bg-gray-900 text-white">
                  All Vehicles
                </option>
                {vehicleTypes.map((v) => (
                  <option
                    key={v._id}
                    value={v._id}
                    className="bg-gray-900 text-white"
                  >
                    {v.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"
              />
            </div>
          )}
          <ViewToggle view={view} onChange={changeView} />
          <Link
            to="/admin/bookings"
            className="hidden md:inline-flex items-center gap-1 text-sm text-gray-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-400/30 rounded-full px-3.5 py-2 transition"
          >
            All bookings <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* ── Status tabs — scrollable pills on mobile ── */}
      <div
        className="flex gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-1.5 overflow-x-auto min-w-0"
        role="tablist"
        aria-label="Filter by status"
      >
        <button
          role="tab"
          aria-selected={statusFilter === ""}
          onClick={() => {
            setStatusFilter("");
            setPage(1);
          }}
          className={`whitespace-nowrap px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all ${
            statusFilter === ""
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_18px_rgba(34,197,94,0.35)]"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={statusFilter === s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`whitespace-nowrap px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all ${
              statusFilter === s
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_18px_rgba(34,197,94,0.35)]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : guests.length === 0 ? (
        <div className="bg-white/[0.03] border border-dashed border-white/10 rounded-2xl">
          <EmptyState
            icon={Users}
            title={filtering ? "No matches found" : "No guest bookings yet"}
            description={
              filtering
                ? "Try a different name, phone number or route."
                : "When a guest books without logging in, they appear here instantly."
            }
          />
        </div>
      ) : view === "cards" ? (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 ${isFetching ? "opacity-70 pointer-events-none" : ""}`}
        >
          {guests.map((g) => {
            const name = g.guestName || g.customer?.name || "Guest";
            const phone = g.guestPhone || g.customer?.phone || "";
            const email = g.guestEmail || "";
            const status = g.bookingStatus || "Pending";
            const assigned = !!g.driver?._id;
            return (
              <article
                key={g._id}
                className="relative overflow-hidden bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 rounded-2xl p-4 space-y-3 hover:border-emerald-400/30 hover:shadow-[0_0_25px_rgba(34,197,94,0.08)] transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400/25 to-teal-500/25 border border-white/15 flex items-center justify-center text-emerald-300 font-display font-bold shrink-0">
                      {initials(name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-[15px] truncate">
                        {name}
                      </p>
                      <p className="font-mono text-[11px] text-gray-500">
                        {shortId(g._id)}
                      </p>
                      {phone && (
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 min-w-0">
                          <Phone
                            size={11}
                            className="shrink-0 text-green-400/80"
                          />
                          <a
                            href={`tel:${phone}`}
                            className="truncate hover:text-emerald-300 transition"
                          >
                            {phone}
                          </a>
                        </p>
                      )}
                      {email && (
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1 min-w-0">
                          <Mail
                            size={11}
                            className="shrink-0 text-blue-400/80"
                          />
                          <span className="truncate">{email}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-300 bg-sky-500/15 border border-sky-400/25 rounded-full px-2.5 py-1">
                      Guest
                    </span>
                    {assigned && (
                      <span
                        className="text-[9px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 rounded-full px-2 py-0.5 max-w-[110px] truncate"
                        title={g.driver?.user?.name || "Driver assigned"}
                      >
                        ✓ {g.driver?.user?.name || "Assigned"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-[12px] min-w-0">
                  <div className="flex items-center gap-2 text-gray-300 min-w-0">
                    <span
                      aria-hidden
                      className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-400"
                    />
                    <span className="truncate">{g.pickup?.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 min-w-0">
                    <span
                      aria-hidden
                      className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-400"
                    />
                    <span className="truncate">{g.drop?.address}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {fmtWhen(g.pickupDateTime) && (
                    <span className="text-[10px] text-gray-400 bg-black/25 border border-white/10 rounded-full px-2 py-0.5">
                      {fmtWhen(g.pickupDateTime)}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 bg-black/25 border border-white/10 rounded-full px-2 py-0.5">
                    {g.tripType || "One Way"}
                    {g.tripType === "Round Trip" && g.days > 1
                      ? ` · ${g.days}d`
                      : ""}
                  </span>
                  {g.vehicleType?.name && (
                    <span className="text-[10px] text-gray-400 bg-black/25 border border-white/10 rounded-full px-2 py-0.5">
                      {g.vehicleType.name}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-2.5">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Calendar size={11} className="text-gray-600" />
                    {timeAgo(g.createdAt)}
                  </span>
                  <span className="font-display text-lg font-bold text-emerald-300">
                    ₹{(g.estimatedFare || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <GuestActions
                  g={g}
                  onView={setSelectedGuest}
                  onAssign={openAssign}
                  onReject={openReject}
                />
              </article>
            );
          })}
        </div>
      ) : (
        <>
          {/* Desktop / tablet premium glass table */}
          <div
            className={`relative hidden @4xl:block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] ${isFetching ? "pointer-events-none opacity-70" : ""}`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[860px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                    >
                      Guest
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                    >
                      Booking ID
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                    >
                      Phone
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                    >
                      Route
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                    >
                      Trip
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                    >
                      When
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-right text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                    >
                      Fare
                    </th>
                    <th
                      scope="col"
                      className=" right-0 z-20 bg-white/[0.03] backdrop-blur-xl px-10 py-3.5 text-right text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((g) => {
                    const name = g.guestName || g.customer?.name || "Guest";
                    const phone = g.guestPhone || g.customer?.phone || "—";
                    const status = g.bookingStatus || "Pending";
                    const assigned = !!g.driver?._id;
                    return (
                      <tr
                        key={g._id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-colors"
                      >
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400/25 to-teal-500/25 border border-white/15 flex items-center justify-center shrink-0">
                              <span className="text-emerald-300 font-semibold text-sm">
                                {initials(name)[0]}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate flex items-center gap-2">
                                {name}
                                <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-sky-300 bg-sky-500/15 border border-sky-400/25 rounded-full px-2 py-0.5">
                                  Guest
                                </span>
                              </p>
                              {g.guestEmail && (
                                <p className="text-xs text-gray-500 truncate">
                                  {g.guestEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-top font-mono text-xs text-gray-400 whitespace-nowrap">
                          {shortId(g._id)}
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <a
                            href={`tel:${phone}`}
                            className="text-sm text-gray-300 hover:text-emerald-300 transition whitespace-nowrap"
                          >
                            {phone}
                          </a>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <div className="text-sm text-gray-300 min-w-0 max-w-[260px]">
                            <p className="truncate">
                              <span className="text-green-400">↑</span>{" "}
                              {g.pickup?.address}
                            </p>
                            <p className="truncate text-gray-500">
                              <span className="text-red-400">↓</span>{" "}
                              {g.drop?.address}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <p className="text-sm text-gray-300 whitespace-nowrap">
                            {g.vehicleType?.name || "—"}
                          </p>
                          <p className="text-xs text-gray-500 whitespace-nowrap">
                            {g.tripType || "One Way"}
                            {g.tripType === "Round Trip" && g.days > 1
                              ? ` · ${g.days} days`
                              : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 align-top text-sm text-gray-300 whitespace-nowrap">
                          {fmtWhen(g.pickupDateTime) || "—"}
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-flex text-[10px] font-medium border rounded-full px-2.5 py-1 whitespace-nowrap ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}
                            >
                              {status}
                            </span>
                            {assigned && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 rounded-full px-2 py-1 whitespace-nowrap"
                                title={
                                  g.driver?.user?.name || "Driver assigned"
                                }
                              >
                                ✓{" "}
                                {g.driver?.user?.name?.split(" ")[0] ||
                                  "Assigned"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-top text-right font-display font-bold text-emerald-300 whitespace-nowrap">
                          ₹{(g.estimatedFare || 0).toLocaleString('en-IN')}
                        </td>
                        <td className=" right-0 z-10 bg-white/[0.03] backdrop-blur-xl px-4 py-3.5 shadow-[-20px_0_20px_-16px_rgba(0,0,0,0.6)]">
                          <GuestActions
                            g={g}
                            onView={setSelectedGuest}
                            onAssign={openAssign}
                            onReject={openReject}
                            compact
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Narrow-content table (mobile/tablet) — compact column set tuned to fit */}
          <div
            className={`@4xl:hidden overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] ${isFetching ? "pointer-events-none opacity-70" : ""}`}
          >
            <table className="w-full border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th
                    scope="col"
                    className="px-3.5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                  >
                    Guest
                  </th>
                  <th
                    scope="col"
                    className="px-3.5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-3.5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                  >
                    Route
                  </th>
                  <th
                    scope="col"
                    className="px-3.5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                  >
                    When
                  </th>
                  <th
                    scope="col"
                    className="px-3.5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                  >
                    Fare
                  </th>
                  <th
                    scope="col"
                    className=" right-0 z-20 bg-white/[0.03] backdrop-blur-xl mx-4 px-10 py-3 text-right text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => {
                  const name = g.guestName || g.customer?.name || "Guest";
                  const status = g.bookingStatus || "Pending";
                  const assigned = !!g.driver?._id;
                  return (
                    <tr
                      key={g._id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-3.5 py-3 align-top min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {name}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span
                            className={`inline-flex text-[10px] font-medium border rounded-full px-2 py-0.5 whitespace-nowrap ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}
                          >
                            {status}
                          </span>
                          {assigned && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 rounded-full px-2 py-0.5 whitespace-nowrap">
                              ✓{" "}
                              {g.driver?.user?.name?.split(" ")[0] ||
                                "Assigned"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3.5 py-3 align-top font-mono text-xs text-gray-400 whitespace-nowrap">
                        {shortId(g._id)}
                      </td>
                      <td className="px-3.5 py-3 align-top min-w-0 max-w-[200px]">
                        <p className="truncate text-sm text-gray-300">
                          <span className="text-green-400">↑</span>{" "}
                          {g.pickup?.address}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          <span className="text-red-400">↓</span>{" "}
                          {g.drop?.address}
                        </p>
                      </td>
                      <td className="px-3.5 py-3 align-top text-sm text-gray-300 whitespace-nowrap">
                        {fmtWhen(g.pickupDateTime) || "—"}
                      </td>
                      <td className="px-3.5 py-3 align-top text-right font-display font-bold text-emerald-300 whitespace-nowrap">
                        ₹{(g.estimatedFare || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="  z-10 bg-white/[0.03] backdrop-blur-xl px-3.5 py-3 shadow-[-20px_0_20px_-16px_rgba(0,0,0,0.6)]">
                        <GuestActions
                          g={g}
                          onView={setSelectedGuest}
                          onAssign={openAssign}
                          onReject={openReject}
                          compact
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Quick-loading indicator while refetching (search/page changes) */}
      {!isLoading && isFetching && !guests.length && (
        <div className="flex items-center justify-center py-10 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin mr-2" /> filtering…
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedGuest}
        onClose={() => setSelectedGuest(null)}
        title="Guest Booking Details"
        maxWidth="max-w-xl"
      >
        {selectedGuest &&
          (() => {
            const g = selectedGuest;
            const name = g.guestName || g.customer?.name || "Guest";
            const phone = g.guestPhone || g.customer?.phone || "";
            const email = g.guestEmail || "";
            const status = g.bookingStatus || "Pending";
            const assigned = !!g.driver?._id;
            return (
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400/25 to-teal-500/25 border border-white/15 flex items-center justify-center text-emerald-300 font-display font-bold shrink-0">
                    {initials(name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold truncate">{name}</p>
                    <p className="font-mono text-[11px] text-gray-500">
                      {shortId(g._id, 8)}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-300 bg-sky-500/15 border border-sky-400/25 rounded-full px-2 py-0.5">
                        Guest
                      </span>
                      <span
                        className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}
                      >
                        {status}
                      </span>
                      {assigned && (
                        <span className="text-[10px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                          ✓ {g.driver?.user?.name || "Driver assigned"}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-display text-2xl font-bold text-emerald-300 shrink-0">
                    ₹{g.estimatedFare || 0}
                  </span>
                </div>

                {/* Contact */}
                <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/10">
                  {[
                    [
                      "Phone",
                      phone ? (
                        <a
                          key="p"
                          href={`tel:${phone}`}
                          className="text-white font-medium truncate hover:text-emerald-300"
                        >
                          {phone}
                        </a>
                      ) : (
                        "—"
                      ),
                    ],
                    [
                      "Email",
                      email.trim() ? (
                        <span
                          key="e"
                          className="text-white font-medium truncate"
                        >
                          {email}
                        </span>
                      ) : (
                        "—"
                      ),
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3 px-3.5 py-2 text-[13px] min-w-0"
                    >
                      <span className="shrink-0 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                        {label}
                      </span>
                      <span className="min-w-0 overflow-hidden">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Route */}
                <div className="bg-gradient-to-br from-emerald-500/15 via-white/5 to-transparent border border-emerald-500/20 rounded-xl p-3.5">
                  <div className="relative pl-4 space-y-2 text-[13px]">
                    <span
                      aria-hidden
                      className="absolute left-[4px] top-1 bottom-1 w-px bg-gradient-to-b from-green-400/70 via-white/15 to-red-400/70"
                    />
                    <div className="relative min-w-0">
                      <span
                        aria-hidden
                        className="absolute left-[-15px] top-1 w-[9px] h-[9px] rounded-full bg-green-400 ring-4 ring-green-400/20"
                      />
                      <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                        Pickup
                      </p>
                      <p className="text-white font-medium break-words">
                        {g.pickup?.address}
                      </p>
                    </div>
                    <div className="relative min-w-0">
                      <span
                        aria-hidden
                        className="absolute left-[-15px] top-3 w-[9px] h-[9px] rounded-full bg-red-400 ring-4 ring-red-400/20"
                      />
                      <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                        Drop
                      </p>
                      <p className="text-white font-medium break-words">
                        {g.drop?.address}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[12px]">
                    {[
                      {
                        icon: (
                          <Calendar
                            size={12}
                            className="text-blue-400 shrink-0"
                          />
                        ),
                        value: fmtFull(g.pickupDateTime),
                      },
                      {
                        icon: (
                          <Car size={12} className="text-green-400 shrink-0" />
                        ),
                        value: g.vehicleType?.name || "Selected car",
                      },
                      {
                        icon: (
                          <Navigation
                            size={12}
                            className="text-sky-400 shrink-0"
                          />
                        ),
                        value: `${Number(g.distance || 0).toFixed(1)} km · ${formatTripDuration(g.duration)}`,
                      },
                      {
                        icon:
                          g.tripType === "Round Trip" ? (
                            <Repeat
                              size={12}
                              className="text-emerald-400 shrink-0"
                            />
                          ) : (
                            <ArrowRight
                              size={12}
                              className="text-emerald-400 shrink-0"
                            />
                          ),
                        value: `${g.tripType || "One Way"}${g.tripType === "Round Trip" && g.days > 1 ? ` · ${g.days} days` : ""}`,
                      },
                    ].map((chip, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 min-w-0"
                      >
                        {chip.icon}
                        <span className="truncate">{chip.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ["Requested", timeAgo(g.createdAt)],
                    ["Payment", g.paymentMethod || "Cash"],
                    ["Payment status", g.paymentStatus || "Pending"],
                  ].map(([label, value]) => (
                    <span
                      key={label}
                      className="text-[10px] text-gray-400 bg-black/25 border border-white/10 rounded-full px-2 py-0.5"
                    >
                      <span className="text-gray-500">{label}:</span> {value}
                    </span>
                  ))}
                </div>

                {/* Assigned driver */}
                <div
                  className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 ${assigned ? "bg-emerald-500/10 border-emerald-400/25" : "bg-white/[0.03] border-white/10"}`}
                >
                  {assigned ? (
                    <Car size={15} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Clock size={15} className="text-amber-400 shrink-0" />
                  )}
                  <div className="min-w-0 text-xs">
                    {assigned ? (
                      <>
                        <p className="text-emerald-300 font-medium truncate">
                          {g.driver?.user?.name || "Driver assigned"}
                        </p>
                        <p className="text-gray-400 truncate">
                          {[g.driver?.vehicleBrand, g.driver?.vehicleModel]
                            .filter(Boolean)
                            .join(" ") || ""}
                          {g.driver?.vehicleNumber
                            ? ` · ${g.driver.vehicleNumber}`
                            : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-amber-300 font-medium">
                        No driver assigned yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGuest(null);
                      openAssign(g);
                    }}
                    disabled={
                      ["Cancelled", "Completed"].includes(g.bookingStatus) ||
                      assigned
                    }
                    className="py-2.5 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <UserPlus size={15} />{" "}
                    {assigned ? "Assigned" : "Assign Driver"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGuest(null);
                      openReject(g);
                    }}
                    disabled={["Cancelled", "Completed"].includes(
                      g.bookingStatus,
                    )}
                    className="py-2.5 min-h-[44px] bg-red-500/15 text-red-300 border border-red-500/25 rounded-xl text-sm font-semibold hover:bg-red-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Ban size={15} /> Reject Booking
                  </button>
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* Assign Driver */}
      <AssignDriverDialog
        open={assignDialog.open}
        onClose={() => setAssignDialog({ open: false, bookingId: null })}
        drivers={driversData?.drivers || []}
        isPending={assignMutation.isPending}
        pendingDriverId={assigningDriverId}
        onSelect={(driverId) => {
          setAssigningDriverId(driverId);
          assignMutation.mutate({ id: assignDialog.bookingId, driverId });
        }}
        requiredVehicleType={detailsBooking?.vehicleType || null}
      />

      {/* Reject (admin cancel with reason) */}
      <CancelReasonDialog
        isOpen={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, bookingId: null })}
        onConfirm={(reason) =>
          rejectMutation.mutate({ id: rejectDialog.bookingId, reason })
        }
        title="Reject Booking"
        message="Rejecting removes this guest request from dispatch. The guest will be notified. This action cannot be undone."
        confirmText="Reject Booking"
        reasons={[
          "Driver unavailable for this route",
          "Invalid pickup details",
          "Fare mismatch",
          "Duplicate booking",
        ]}
        isPending={rejectMutation.isPending}
      />
    </Motion.div>
  );
};

export default InstantCustomers;
