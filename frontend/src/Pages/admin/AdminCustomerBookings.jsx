import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { formatTripDuration } from "../../utils/formatDuration";
import {
  Calendar,
  Eye,
  MapPin,
  Navigation,
  User,
  Car,
  CheckCircle,
  Clock,
  Phone,
  XCircle,
  Wallet,
  CalendarCheck,
  Copy,
  Check,
  Repeat,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { adminAPI, vehicleAPI } from "../../services/endpoints";
import { BookingStatusBadge } from "../../utils/bookingStatus";
import { fareTotal } from "../../utils/bookingStatusMeta";
import { useCopyBooking } from "../../utils/bookingText";
import { TableSkeleton } from "../../components/shared/Skeleton";
import ErrorState from "../../components/shared/ErrorState";
import EmptyState from "../../components/shared/EmptyState";
import Pagination from "../../components/shared/Pagination";
import Modal from "../../components/shared/Modal";
import SearchBar from "../../components/shared/SearchBar";
import ViewToggle from "../../components/shared/ViewToggle";
import GlassTable from "../../components/shared/GlassTable";
import useDebounce from "../../hooks/useDebounce";
import CancelReasonDialog from "../../components/shared/CancelReasonDialog";
import AssignDriverDialog from "../../components/shared/AssignDriverDialog";
import { customerEmail } from "./bookingUtils";
// 

import { useSocket } from "../../Context/SocketContext";
import { motion as Motion } from "framer-motion";

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

const AdminCustomerBookings = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  // Debounced so typing "Trichy" fires one request per pause, not per key.
  const debouncedSearch = useDebounce(search, 300);
  // Table/cards preference persists; switching never refetches or resets
  // search, filters or page — all live outside the view branch.
  const [view, setView] = useState(
    () => localStorage.getItem("adminCustomerBookingsView") || "cards"
  );
  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem("adminCustomerBookingsView", v);
    } catch {
      // private mode — preference simply won't persist
    }
  };
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionDialog, setActionDialog] = useState({
    open: false,
    action: null,
    id: null,
  });
  const [assignDialog, setAssignDialog] = useState({
    open: false,
    bookingId: null,
  });
  const [assigningDriverId, setAssigningDriverId] = useState(null);
  const { copied, copyBooking } = useCopyBooking();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const navigate = useNavigate();
 const openBooking = (id) => navigate(`/admin/bookings/${id}`);

  // Real-time list updates on driver/customer/admin ride changes.
  // If the Eye details modal is open for the updated booking, refresh it
  // too so payment/status changes reflect immediately.
  useEffect(() => {
    if (!socket) return;
    const handleRideUpdate = (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminCustomerBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminCounts"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      if (data?._id) {
        setSelectedBooking((prev) =>
          prev && prev._id === data._id ? { ...prev, ...data } : prev,
        );
      }
      if (data?.bookingStatus === "Cancelled") {
        toast.success("A booking was cancelled");
      }
    };
    socket.on("ride-status-updated", handleRideUpdate);
    socket.on("booking-updated", handleRideUpdate);
    socket.on("admin-counts-updated", handleRideUpdate);
    return () => {
      socket.off("ride-status-updated", handleRideUpdate);
      socket.off("booking-updated", handleRideUpdate);
      socket.off("admin-counts-updated", handleRideUpdate);
    };
  }, [socket, queryClient]);

  const { data: vehicleData } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await vehicleAPI.getAll();
      return data;
    },
    staleTime: 300_000,
  });
  const vehicleTypes = vehicleData?.vehicles || [];

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["adminCustomerBookings", page, statusFilter, vehicleTypeFilter, debouncedSearch],
    queryFn: async () => {
      // Registered customers only — guest bookings live in Instant Bookings.
      const params = { page, limit: 10, scope: "registered" };
      if (statusFilter) params.status = statusFilter;
      if (vehicleTypeFilter) params.vehicleType = vehicleTypeFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await adminAPI.getBookings(params);
      return data;
    },
    staleTime: 30_000,
    // Keep the previous page visible while search/pagination refetches.
    placeholderData: (prev) => prev,
  });

  const { data: driversData } = useQuery({
    queryKey: ["approvedDrivers"],
    queryFn: async () => {
      const { data } = await adminAPI.getApprovedDrivers();
      return data;
    },
    staleTime: 30_000,
  });

  // Hero aggregates — reuse adminDashboard cache to avoid duplicate fetches.
  const { data: statsData } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const { data } = await adminAPI.getDashboard();
      return data;
    },
    staleTime: 30_000,
  });
  const stats = statsData?.stats || {};

  const completeMutation = useMutation({
    mutationFn: (id) => adminAPI.completeBooking(id),
    onSuccess: () => {
      toast.success("Booking completed");
      queryClient.invalidateQueries({ queryKey: ["adminCustomerBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["adminCounts"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to complete booking"),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => adminAPI.cancelBooking(id, { reason }),
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["adminCustomerBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["adminCounts"] });
      setActionDialog({ open: false, action: null, id: null });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to cancel booking"),
  });

  const assignMutation = useMutation({
    mutationFn: ({ bookingId, driverId }) =>
      adminAPI.assignDriver(bookingId, { driverId }),
    onSuccess: () => {
      toast.success("Driver assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminCustomerBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminCustomerRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminCounts"] });
      setAssignDialog({ open: false, bookingId: null });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to assign driver");
    },
    onSettled: () => setAssigningDriverId(null),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => adminAPI.approveBooking(id),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Booking approved!");
      queryClient.invalidateQueries({ queryKey: ["adminCustomerBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminCustomerRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["adminCounts"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to approve booking"),
  });

  const handleSelectDriver = (driverId) => {
    setAssigningDriverId(driverId);
    assignMutation.mutate({ bookingId: assignDialog.bookingId, driverId });
  };

  const bookings = data?.bookings || [];
  const drivers = driversData?.drivers || driversData || [];
  const pagination = data || {};

  if (isError)
    return (
      <ErrorState
        message={error?.message || "Failed to load bookings"}
        onRetry={() =>
          queryClient.invalidateQueries({ queryKey: ["adminCustomerBookings"] })
        }
      />
    );

  const canAct = (b) =>
    b.bookingStatus !== "Completed" && b.bookingStatus !== "Cancelled";

  const formatBookedOn = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const TripTypeBadge = ({ type }) => {
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

  // Table view columns — same data and actions as the cards.
  const bookingColumns = [
    {
      header: "Booking",
      cell: (b) => (
        <div className="min-w-[130px]">
          <p className="font-mono text-xs text-gray-400">#{b._id?.slice(-6).toUpperCase()}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 whitespace-nowrap">{formatBookedOn(b.createdAt)}</p>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (b) => (
        <div className="min-w-[140px] max-w-[200px]">
          <p className="text-sm font-semibold text-white truncate">{b.customer?.name || "N/A"}</p>
          <p className="text-[11px] text-gray-500 truncate">{customerEmail(b) || b.customer?.phone || ""}</p>
        </div>
      ),
    },
    {
      header: "Driver",
      cell: (b) => (
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
      ),
    },
    {
      header: "Route",
      cell: (b) => (
        <div className="min-w-[180px] max-w-[260px]">
          <p className="text-xs text-gray-300 truncate" title={b.pickup?.address}>
            <span className="text-green-400 font-bold">↑ </span>{b.pickup?.address || "N/A"}
          </p>
          <p className="text-xs text-gray-300 truncate mt-1" title={b.drop?.address}>
            <span className="text-red-400 font-bold">↓ </span>{b.drop?.address || "N/A"}
          </p>
        </div>
      ),
    },
    {
      header: "Type",
      cell: (b) => <TripTypeBadge type={b.tripType} />,
    },
    {
      header: "Status",
      cell: (b) => <BookingStatusBadge status={b.bookingStatus} size="sm" />,
    },
    {
      header: "Fare",
      tdClassName: "text-right",
      thClassName: "text-right",
      cell: (b) => (
        <span className="block tabular-nums whitespace-nowrap">
          <span className="block text-[11px] text-gray-500">Approx ₹{(b.estimatedFare ?? 0).toLocaleString("en-IN")}</span>
          <span className="block font-bold text-white">₹{fareTotal(b).toLocaleString("en-IN")}</span>
        </span>
      ),
    },
    {
      header: "Actions",
      tdClassName: "text-right",
      thClassName: "text-right",
      cell: (b) => (
        <span className="inline-flex items-center justify-end gap-1.5">
          <button onClick={() => setSelectedBooking(b)} title="Details" aria-label="View details" className="p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs hover:bg-white/10 transition">
            <Eye size={14} />
          </button>
          <button onClick={() => openBooking(b._id)} title="Track ride" aria-label="Track ride" className="p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded-xl text-xs hover:bg-emerald-500/25 transition">
            <Navigation size={14} />
          </button>
          {!b.driver && b.bookingStatus === "Pending" && (
            <>
              <button onClick={() => approveMutation.mutate(b._id)} disabled={approveMutation.isPending} title="Approve & dispatch to drivers" aria-label="Approve and dispatch" className="p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-xs hover:shadow-[0_0_18px_rgba(34,197,94,0.5)] transition disabled:opacity-50">
                <CheckCircle size={14} />
              </button>
              <button onClick={() => setAssignDialog({ open: true, bookingId: b._id })} title="Assign driver" aria-label="Assign driver" className="p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs hover:bg-white/10 transition">
                <User size={14} />
              </button>
            </>
          )}
          {canAct(b) && (
            <>
              <button onClick={() => completeMutation.mutate(b._id)} disabled={completeMutation.isPending} title="Complete" aria-label="Complete booking" className="p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded-xl text-xs hover:bg-emerald-500/25 transition disabled:opacity-50">
                <Check size={14} />
              </button>
              <button onClick={() => setActionDialog({ open: true, action: "cancel", id: b._id })} title="Cancel" aria-label="Cancel booking" className="p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center bg-red-500/15 border border-red-500/25 text-red-300 rounded-xl text-xs hover:bg-red-500/25 transition">
                <XCircle size={14} />
              </button>
            </>
          )}
        </span>
      ),
    },
  ];

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6 min-w-0"
    >
      {/* ── Hero panel (compact) ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/15 via-white/5 to-transparent p-4 sm:p-5">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-violet-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
        <div className="relative min-w-0 flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300">
            <CalendarCheck size={12} /> Operations
          </p>
          <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            Customer Bookings
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-400 w-full">
            Every registered-customer ride — track, approve, assign drivers, complete or cancel. Updates live.
          </p>
        </div>
        <div className="relative mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            {
              label: "Total rides",
              value: stats.totalBookings ?? "–",
              icon: Calendar,
              tint: "text-violet-300",
            },
            {
              label: "Pending",
              value: stats.pendingBookings ?? "–",
              icon: Clock,
              tint: "text-amber-300",
            },
            {
              label: "Completed",
              value: stats.completedBookings ?? "–",
              icon: CheckCircle,
              tint: "text-emerald-300",
            },
            {
              label: "Accepted Revenue",
              value:
                stats.customerAcceptedRevenue != null
                  ? `₹${Number(stats.customerAcceptedRevenue).toLocaleString("en-IN")}`
                  : "–",
              icon: CheckCircle,
              tint: "text-green-300",
            },
            {
              label: "Revenue",
              value:
                stats.totalRevenue != null
                  ? `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`
                  : "–",
              icon: Wallet,
              tint: "text-sky-300",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-black/30 border border-white/10 rounded-2xl px-3 py-2 min-w-0"
            >
              <p className="flex items-center gap-1.5 text-[10px] text-gray-400 truncate">
                <s.icon size={12} className={s.tint} />
                {s.label}
              </p>
              <p className="text-base sm:text-lg font-bold text-white leading-tight mt-0.5 truncate">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status tabs — scrollable pills on mobile ───────────── */}
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

      {/* ── Premium search + vehicle filter + view toggle ── */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1 min-w-0">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search name, email, booking ID, pickup, drop, trip type…"
          />
          {isFetching && !isLoading && (
            <span className="absolute right-11 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin pointer-events-none" aria-label="Searching" />
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ViewToggle view={view} onChange={changeView} />
          {vehicleTypes.length > 0 && (
            <>
              <label className="text-xs font-semibold text-gray-400 hidden sm:inline">Vehicle</label>
              <div className="relative flex-1 sm:flex-none">
              <select
                value={vehicleTypeFilter}
                onChange={(e) => {
                  setVehicleTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-auto appearance-none bg-white/[0.06] backdrop-blur-xl border border-white/15 text-white text-xs font-semibold rounded-2xl pl-4 pr-10 py-3 min-h-[48px] outline-none cursor-pointer hover:border-emerald-500/40 focus:border-emerald-500/60 transition shadow-lg shadow-black/20"
              >
                <option value="" className="bg-gray-900 text-white">All Types</option>
                {vehicleTypes.map((v) => (
                  <option key={v._id} value={v._id} className="bg-gray-900 text-white">
                    {v.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
              </div>
            </>
          )}
        </div>
      </div>
      {debouncedSearch && !isLoading && (
        <p className="text-xs text-gray-400 -mt-1" role="status">
          {pagination.total != null ? (
            <>
              <span className="text-white font-bold">{pagination.total}</span> result{pagination.total === 1 ? "" : "s"} for{" "}
              <span className="text-emerald-300 font-semibold">“{debouncedSearch}”</span>
            </>
          ) : (
            <>Searching for <span className="text-emerald-300 font-semibold">“{debouncedSearch}”</span>…</>
          )}
        </p>
      )}

      {/* ── Feed ───────────────────────────────────────────────── */}
      {/* <FareNotes compact /> */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={debouncedSearch ? "No matching bookings" : "No bookings found"}
          description={
            debouncedSearch
              ? `Nothing matches “${debouncedSearch}”. Try a name, email, booking ID, place, or trip type (one way, round trip).`
              : statusFilter
                ? `No ${statusFilter.toLowerCase()} bookings.`
                : "Bookings will appear here."
          }
          action={
            debouncedSearch ? (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="px-5 py-2.5 min-h-[44px] rounded-2xl bg-white/5 border border-white/15 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Clear search
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          {view === "cards" ? (
          <div className="grid gap-3 sm:gap-4 w-full max-w-full">
            {bookings.map((b, i) => (
              <Motion.article
                key={b._id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.25), duration: 0.3 }}
              
                className="group relative overflow-hidden cursor-pointer bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 hover:border-violet-400/40 hover:shadow-[0_8px_40px_-12px_rgba(139,92,246,0.35)] transition-all duration-300 min-w-0"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
                <div className="relative grid sm:grid-cols-[1fr_212px] min-w-0">
                  {/* Route side */}
                  <div className="p-3.5 sm:p-4 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5 min-w-0">
                      <BookingStatusBadge status={b.bookingStatus} size="sm" />
                      <TripTypeBadge type={b.tripType} />
                      <span className="font-mono text-[12px] bg-purple-400/15 font-bold border border-purple-400/25 text-purple-500 px-2.5 py-1 rounded-full ">
                      #{b._id?.slice(-6).toUpperCase()}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                        <Calendar size={11} /> {formatBookedOn(b.createdAt)}
                      </span>
                    </div>
                    <div className="relative pl-5 space-y-3 min-w-0">
                      <span
                        aria-hidden
                        className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-green-400/70 via-white/15 to-red-400/70"
                      />
                      <div className="min-w-0">
                        <span
                          aria-hidden
                          className="absolute left-0 mt-1 w-[11px] h-[11px] rounded-full bg-green-400 ring-4 ring-green-400/20"
                        />
                        <p
                          className="text-sm font-medium text-white truncate"
                          title={b.pickup?.address}
                        >
                          {b.pickup?.address || "N/A"}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {b.customer?.name || "N/A"}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <span
                          aria-hidden
                          className="absolute left-0 mt-1 w-[11px] h-[11px] rounded-full bg-red-400 ring-4 ring-red-400/20"
                        />
                        <p
                          className="text-sm font-medium text-white truncate"
                          title={b.drop?.address}
                        >
                          {b.drop?.address || "N/A"}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {b.driver?.user?.name
                            ? `Driver: ${b.driver.user.name}`
                            : "Not assigned yet"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300">
                        <Car size={12} className="text-violet-400 shrink-0" />
                        {(b.vehicleType?.name || b.driver?.vehicleType?.name) && (
                          <>{b.vehicleType?.name || b.driver?.vehicleType?.name} · </>
                        )}
                        {b.paymentMethod || "Cash"} ·{" "}
                        {b.paymentStatus || "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Fare rail */}
                  <div className="relative flex sm:flex-col items-center sm:items-stretch justify-between gap-2.5 px-4 py-3 sm:p-4 bg-gradient-to-br from-violet-500/15 via-violet-500/5 to-transparent border-t sm:border-t-0 sm:border-l border-white/10 min-w-0">
                    <div className="min-w-0 sm:text-right">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-semibold">
                        Total fare
                      </p>
                      <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent leading-tight">
                        ₹{fareTotal(b).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Approx ₹{(b.estimatedFare ?? 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex sm:flex-col gap-1 shrink-0 sm:shrink">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        aria-label="View details"
                        className="inline-flex items-center justify-center gap-1 p-0 min-w-[44px] min-h-[40px] sm:min-h-[30px] sm:w-full bg-white/5 border border-white/10 text-gray-300 rounded-2xl text-xs font-medium hover:bg-white/10 transition"
                      >
                        <Eye size={15} />
                        <span className="hidden sm:inline text-xs">Details</span>
                      </button>
                      <button
                            onClick={() => openBooking(b._id)}
                            disabled={completeMutation.isPending}
                            title="Track ride"
                            aria-label="Track ride"
                            className="inline-flex items-center justify-center gap-1 p-0 min-w-[44px] min-h-[40px] sm:min-h-[30px] sm:w-full sm:px-4 bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded-2xl text-xs font-semibold hover:bg-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            <Navigation size={15} />
                            <span className="hidden sm:inline text-xs">Track ride</span>
                          </button>
                      {!b.driver && b.bookingStatus === "Pending" && (
                        <button
                          onClick={() => approveMutation.mutate(b._id)}
                          disabled={approveMutation.isPending}
                          title="Approve & dispatch to drivers"
                          aria-label="Approve and dispatch"
                          className="inline-flex items-center justify-center gap-1 px-0 py-0 min-w-[44px] min-h-[40px] sm:min-h-[30px] sm:w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-xs font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          <CheckCircle size={15} />
                          <span className="hidden sm:inline text-xs">Approve</span>
                        </button>
                      )}
                      {!b.driver && b.bookingStatus === "Pending" && (
                        <button
                          onClick={() =>
                            setAssignDialog({ open: true, bookingId: b._id })
                          }
                          className="hidden items-center justify-center gap-1 px-0 py-0 min-h-[40px] sm:min-h-[30px] sm:w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-xs font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:brightness-110 active:scale-[0.98] transition-all"
                        >
                          Assign
                        </button>
                      )}
                      {canAct(b) && (
                        <>
                          <button
                            onClick={() => completeMutation.mutate(b._id)}
                            disabled={completeMutation.isPending}
                            className=" hidden items-center justify-center gap-1 px-0 py-0 min-h-[40px] sm:min-h-[30px] sm:w-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded-2xl text-xs font-semibold hover:bg-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            Complete
                          </button>
                          
                          <button
                            onClick={() =>
                              setActionDialog({
                                open: true,
                                action: "cancel",
                                id: b._id,
                              })
                            }
                            className="hidden items-center justify-center gap-1 px-0 py-0 min-h-[40px] sm:min-h-[30px] sm:w-full bg-red-500/15 border border-red-500/25 text-red-300 rounded-2xl text-xs font-semibold hover:bg-red-500/25 active:scale-[0.98] transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Motion.article>
            ))}
          </div>
          ) : (
            <GlassTable columns={bookingColumns} rows={bookings} rowKey={(b) => b._id} density="compact" />
          )}

          <Pagination
            page={pagination.page || 1}
            totalPages={pagination.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}

      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={`Booking #${selectedBooking?._id?.slice(-8).toUpperCase()}`}
        maxWidth="max-w-xl"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <BookingStatusBadge status={selectedBooking.bookingStatus} size="sm" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyBooking(selectedBooking)}
                  title="Copy booking details"
                  aria-label="Copy booking details"
                  className="inline-flex items-center gap-1.5 p-2 min-w-[40px] min-h-[40px] justify-center bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs font-medium hover:bg-white/10 hover:text-white transition"
                >
                  {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                </button>
                <span className="text-right">
                  <span className="block text-xl font-bold text-white tabular-nums">
                    ₹{fareTotal(selectedBooking).toLocaleString("en-IN")}
                  </span>
                  <span className="block text-[11px] text-gray-500 tabular-nums">
                    Approx ₹{(selectedBooking.estimatedFare ?? 0).toLocaleString("en-IN")}
                  </span>
                </span>
              </div>
            </div>

            {selectedBooking.bookingStatus === "Cancelled" && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-sm font-semibold text-red-300">
                    {selectedBooking.cancelledBy === "Driver"
                      ? "Driver cancelled"
                      : selectedBooking.cancelledBy === "Admin"
                        ? "Cancelled by admin"
                        : "Customer cancelled"}
                  </p>
                </div>
                {selectedBooking.cancelReason && (
                  <p className="text-sm text-slate-200/80 mt-1 break-words">
                    Reason: {selectedBooking.cancelReason}
                  </p>
                )}
                {selectedBooking.cancelledAt && (
                  <p className="text-xs text-slate-200/60 mt-1">
                    {new Date(selectedBooking.cancelledAt).toLocaleString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-0">
                <p className="text-xs font-semibold text-slate-200/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User size={12} /> Customer
                </p>
                <p className="font-semibold text-white truncate">
                  {selectedBooking.customer?.name || "N/A"}
                </p>
                {selectedBooking.customer?.phone && (
                  <p className="text-sm text-slate-200/80 flex items-center gap-1.5 mt-1">
                    <Phone size={12} />
                    {selectedBooking.customer.phone}
                  </p>
                )}
                {customerEmail(selectedBooking) && (
                  <p className="text-xs text-slate-200/60 mt-0.5 truncate">
                    {customerEmail(selectedBooking)}
                  </p>
                )}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-0">
                <p className="text-xs font-semibold text-slate-200/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Car size={12} /> Driver
                </p>
                {selectedBooking.driver?.user?.name ? (
                  <>
                    <p className="font-semibold text-white truncate">
                      {selectedBooking.driver.user.name}
                    </p>
                    {selectedBooking.driver.user?.phone && (
                      <p className="text-sm text-slate-200/80 flex items-center gap-1.5 mt-1">
                        <Phone size={12} />
                        {selectedBooking.driver.user.phone}
                      </p>
                    )}
                    {(selectedBooking.vehicleType?.name || selectedBooking.driver.vehicleType?.name) && (
                      <p className="text-xs text-slate-200/60 mt-1 truncate">
                        Cab: {selectedBooking.vehicleType?.name || selectedBooking.driver.vehicleType?.name}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-slate-200/60 italic text-sm">
                    Not Assigned
                    {(selectedBooking.vehicleType?.name) && (
                      <span className="block not-italic mt-1 text-slate-200/80">
                        Requested cab: {selectedBooking.vehicleType.name}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Payment</p>
                <p className="font-medium text-white text-sm">
                  {selectedBooking.paymentMethod} ·{" "}
                  <span
                    className={
                      selectedBooking.paymentStatus === "Paid"
                        ? "text-emerald-400"
                        : selectedBooking.paymentStatus === "Unpaid"
                          ? "text-red-400"
                          : "text-amber-400"
                    }
                  >
                    {selectedBooking.paymentStatus}
                  </span>
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Distance</p>
                <p className="font-medium text-white text-sm">
                  {selectedBooking.distance != null
                    ? `${Number(selectedBooking.distance).toFixed(1)} km`
                    : "—"}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Duration</p>
                <p className="font-medium text-white text-sm">
                  {formatTripDuration(selectedBooking.duration)}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Trip Type</p>
                <p className="font-medium text-white text-sm">
                  {selectedBooking.tripType}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Booked On</p>
                <p className="font-medium text-white text-sm">
                  {formatBookedOn(selectedBooking.createdAt)}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Cab Type</p>
                <p className="font-medium text-white text-sm">
                  {selectedBooking.vehicleType?.name || selectedBooking.driver?.vehicleType?.name || '—'}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Pickup At</p>
                <p className="font-medium text-white text-sm">
                  {selectedBooking.pickupDateTime
                    ? new Date(selectedBooking.pickupDateTime).toLocaleString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-green-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300 break-words">
                  {selectedBooking.pickup?.address}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300 break-words">
                  {selectedBooking.drop?.address}
                </p>
              </div>
            </div>
            {selectedBooking.customerNotes && (
              <p className="text-xs text-gray-300 bg-white/5 border border-white/10 rounded-2xl p-3 break-words">
                <span className="text-gray-500">Note: </span>{selectedBooking.customerNotes}
              </p>
            )}
            {/* Ride Timeline */}
            <div className="bg-white/5 rounded-2xl p-3 space-y-2">
              <p className="text-xs text-gray-500 mb-2">Ride Timeline</p>
              {[
                { label: "Created", time: selectedBooking.createdAt },
                { label: "Accepted", time: selectedBooking.acceptedAt },
                { label: "On The Way", time: selectedBooking.onTheWayAt },
                { label: "Arrived", time: selectedBooking.arrivedAt },
                { label: "Started", time: selectedBooking.startedAt },
                { label: "Reached", time: selectedBooking.reachedAt },
                { label: "Completed", time: selectedBooking.completedAt },
                { label: "Cancelled", time: selectedBooking.cancelledAt },
              ]
                .filter((e) => e.time)
                .map((event) => (
                  <div
                    key={event.label}
                    className="flex items-center gap-2 text-sm min-w-0"
                  >
                    <Clock size={12} className="text-gray-500 shrink-0" />
                    <span className="text-gray-300 shrink-0">
                      {event.label}:
                    </span>
                    <span className="font-medium text-white truncate">
                      {new Date(event.time).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
            </div>
            {!selectedBooking.driver &&
              selectedBooking.bookingStatus === "Pending" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      approveMutation.mutate(selectedBooking._id);
                      setSelectedBooking(null);
                    }}
                    disabled={approveMutation.isPending}
                    className="w-full py-2.5 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-2xl hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(null);
                      setAssignDialog({
                        open: true,
                        bookingId: selectedBooking._id,
                      });
                    }}
                    className="w-full py-2.5 min-h-[44px] bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Assign Driver
                  </button>
                </div>
              )}
            {selectedBooking.bookingStatus !== "Completed" &&
              selectedBooking.bookingStatus !== "Cancelled" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      completeMutation.mutate(selectedBooking._id);
                      setSelectedBooking(null);
                    }}
                    disabled={completeMutation.isPending}
                    className="py-2.5 min-h-[44px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-2xl text-sm font-medium hover:bg-emerald-500/30 transition disabled:opacity-50"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => {
                      const id = selectedBooking._id;
                      setSelectedBooking(null);
                      setActionDialog({ open: true, action: "cancel", id });
                    }}
                    className="py-2.5 min-h-[44px] bg-red-500/20 text-red-300 border border-red-500/30 rounded-2xl text-sm font-medium hover:bg-red-500/30 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
          </div>
        )}
      </Modal>

      <CancelReasonDialog
        isOpen={actionDialog.open}
        onClose={() => setActionDialog({ open: false, action: null, id: null })}
        onConfirm={(reason) =>
          cancelMutation.mutate({ id: actionDialog.id, reason })
        }
        title="Cancel Booking"
        message="Please provide a cancellation reason. The customer and driver will be notified."
        confirmText="Cancel Booking"
        isPending={cancelMutation.isPending}
      />

      {/* Assign Driver — offline drivers disabled (backend rejects them) */}
      <AssignDriverDialog
        open={assignDialog.open}
        onClose={() => setAssignDialog({ open: false, bookingId: null })}
        drivers={drivers}
        isPending={assignMutation.isPending}
        pendingDriverId={assigningDriverId}
        onSelect={handleSelectDriver}
        requiredVehicleType={bookings.find((b) => b._id === assignDialog.bookingId)?.vehicleType || selectedBooking?.vehicleType || null}
      />
    </Motion.div>
  );
};

export default AdminCustomerBookings;
