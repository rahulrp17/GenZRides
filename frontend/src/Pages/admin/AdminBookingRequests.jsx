import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { formatTripDuration } from "../../utils/formatDuration";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  BellRing,
  Wallet,
  Car,
  Copy,
  Check,
  Repeat,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { adminAPI, vehicleAPI } from "../../services/endpoints";
import { useCopyBooking } from "../../utils/bookingText";
import { useSocket } from "../../Context/SocketContext";
import { TableSkeleton } from "../../components/shared/Skeleton";
import ErrorState from "../../components/shared/ErrorState";
import EmptyState from "../../components/shared/EmptyState";
import Modal from "../../components/shared/Modal";
import SearchBar from "../../components/shared/SearchBar";
import ViewToggle from "../../components/shared/ViewToggle";
import GlassTable from "../../components/shared/GlassTable";
import useDebounce from "../../hooks/useDebounce";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import AssignDriverDialog from "../../components/shared/AssignDriverDialog";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AdminBookingRequests = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignDialog, setAssignDialog] = useState({
    open: false,
    bookingId: null,
  });
  const [assigningDriverId, setAssigningDriverId] = useState(null);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  // Debounced so typing "Trichy" fires one request per pause, not per key.
  const debouncedSearch = useDebounce(search, 300);
  // Table/cards preference persists; switching never refetches — same data.
  const [view, setView] = useState(
    () => {
      try {
        return localStorage.getItem("adminRequestsView") || "cards";
      } catch {
        return "cards";
      }
    }
  );
  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem("adminRequestsView", v);
    } catch {
      // private mode — preference simply won't persist
    }
  };
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    bookingId: null,
  });
  const { copied, copyBooking } = useCopyBooking();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const openBooking = (id) => navigate(`/admin/bookings/${id}`);

  const { data: vehicleData } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await vehicleAPI.getAll();
      return data;
    },
    staleTime: 300_000,
  });
  const vehicleTypes = vehicleData?.vehicles || [];

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["adminPendingBookings", vehicleTypeFilter, debouncedSearch],
    queryFn: async () => {
      const params = { page: 1, limit: 100, status: "Pending" };
      if (vehicleTypeFilter) params.vehicleType = vehicleTypeFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await adminAPI.getBookings(params);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    // Keep the queue visible while search refetches.
    placeholderData: (prev) => prev,
  });

  // Real-time: new guest/customer bookings and status changes refresh the
  // pending queue instantly on both desktop and mobile.
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["adminPendingBookings"] });
    };
    socket.on("booking-created", handleUpdate);
    socket.on("booking-updated", handleUpdate);
    socket.on("ride-status-updated", handleUpdate);
    socket.on("new-booking", handleUpdate);
    return () => {
      socket.off("booking-created", handleUpdate);
      socket.off("booking-updated", handleUpdate);
      socket.off("ride-status-updated", handleUpdate);
      socket.off("new-booking", handleUpdate);
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

  const assignMutation = useMutation({
    mutationFn: ({ bookingId, driverId }) =>
      adminAPI.assignDriver(bookingId, { driverId }),
    onSuccess: () => {
      toast.success("Driver assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminPendingBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      setAssignDialog({ open: false, bookingId: null });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to assign driver");
    },
    onSettled: () => setAssigningDriverId(null),
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) =>
      adminAPI.cancelBooking(bookingId, { reason: "Cancelled by admin" }),
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["adminPendingBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      setCancelDialog({ open: false, bookingId: null });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to cancel booking");
    },
  });

  const bookings = data?.bookings || [];
  const drivers = driversData?.drivers || driversData || [];
  // Small lists (≤100 rows) — direct computation, no memo staleness risk.
  const onlineDrivers = drivers.filter((d) => d.isOnline).length;
  const totalValue = bookings.reduce(
    (s, b) => s + (Number(b.estimatedFare) || 0),
    0,
  );

  const handleSelectDriver = (driverId) => {
    setAssigningDriverId(driverId);
    assignMutation.mutate({ bookingId: assignDialog.bookingId, driverId });
  };

  if (isError) {
    return (
      <ErrorState
        message={error?.message || "Failed to load booking requests"}
        onRetry={refetch}
      />
    );
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const customerName = (b) => b.customer?.name || b.guestName || "Guest";
  const customerPhone = (b) => b.customer?.phone || b.guestPhone || "";

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
  const requestColumns = [
    {
      header: "Booking",
      cell: (b) => (
        <div className="min-w-[130px]">
          <p className="font-mono text-xs text-gray-400">#{b._id?.slice(-6).toUpperCase()}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 whitespace-nowrap">{formatDateTime(b.createdAt)}</p>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (b) => (
        <div className="min-w-[140px] max-w-[200px]">
          <p className="text-sm font-semibold text-white truncate">{customerName(b)}</p>
          <p className="text-[11px] text-gray-500 truncate">{customerPhone(b)}</p>
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
      header: "Fare",
      tdClassName: "text-right",
      thClassName: "text-right",
      cell: (b) => <span className="font-bold text-white tabular-nums whitespace-nowrap">₹{(b.estimatedFare ?? 0).toLocaleString("en-IN")}</span>,
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
          <button onClick={() => openBooking(b._id)} title="Track" aria-label="Track booking" className="p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded-xl text-xs hover:bg-emerald-500/25 transition">
            <MapPin size={14} />
          </button>
          <button onClick={() => setAssignDialog({ open: true, bookingId: b._id })} disabled={assignMutation.isPending || cancelMutation.isPending} title="Approve & assign" aria-label="Approve and assign driver" className="p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-xs hover:shadow-[0_0_18px_rgba(34,197,94,0.5)] transition disabled:opacity-50">
            <Check size={14} />
          </button>
          <button onClick={() => setCancelDialog({ open: true, bookingId: b._id })} disabled={assignMutation.isPending || cancelMutation.isPending} title="Cancel" aria-label="Cancel booking" className="p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center bg-red-500/15 border border-red-500/25 text-red-300 rounded-xl text-xs hover:bg-red-500/25 transition disabled:opacity-50">
            <XCircle size={14} />
          </button>
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
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-green-500/15 via-white/5 to-transparent p-4 sm:p-5">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-green-500/15 blur-[100px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-400/60 to-transparent" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-green-300">
              <BellRing size={12} /> Live queue
              <span className="relative flex w-1.5 h-1.5 ml-1">
                <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-60 animate-ping" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-green-400" />
              </span>
            </p>
            <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
              Booking Requests
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
              Approve by assigning an online driver, or cancel with a reason.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:min-w-[360px]">
            <div className="bg-black/30 border border-white/10 rounded-2xl px-3 py-2 text-center min-w-0">
              <p className="text-base sm:text-lg font-bold text-white leading-none">
                {isLoading ? "–" : bookings.length}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 truncate">
                Pending
              </p>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-2xl px-3 py-2 text-center min-w-0">
              <p className="text-base sm:text-lg font-bold text-green-300 leading-none truncate">
                ₹{isLoading ? "–" : totalValue.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 truncate">
                Queue value
              </p>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-2xl px-3 py-2 text-center min-w-0">
              <p className="text-base sm:text-lg font-bold text-emerald-300 leading-none">
                {onlineDrivers}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 truncate">
                Drivers online
              </p>
            </div>
          </div>
        </div>
        <div className="relative mt-3 flex flex-col sm:flex-row gap-2 sm:items-center">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl px-5 py-2.5 min-h-[44px] text-sm hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            {isFetching ? 'Refreshing…' : 'Refresh now'}
          </button>
          <p className="text-[11px] text-gray-500 self-center hidden md:block">Socket live · polling every 10s as backup</p>
        </div>

      </div>

      {/* ── Premium search + vehicle filter + view toggle ── */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1 min-w-0">
          <SearchBar
            value={search}
            onChange={(v) => setSearch(v)}
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
                onChange={(e) => setVehicleTypeFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white/[0.06] backdrop-blur-xl border border-white/15 text-white text-xs font-semibold rounded-2xl pl-4 pr-10 py-3 min-h-[48px] outline-none cursor-pointer hover:border-emerald-500/40 focus:border-emerald-500/60 transition shadow-lg shadow-black/20"
              >
                <option value="">All Types</option>
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
          <span className="text-white font-bold">{bookings.length}</span> result{bookings.length === 1 ? "" : "s"} for{" "}
          <span className="text-emerald-300 font-semibold">“{debouncedSearch}”</span>
        </p>
      )}

      {/* ── Feed ───────────────────────────────────────────────── */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={debouncedSearch ? "No matching requests" : "No pending booking requests"}
          description={
            debouncedSearch
              ? `Nothing matches “${debouncedSearch}”. Try a name, email, booking ID, place, or trip type (one way, round trip).`
              : "All bookings have been assigned or completed."
          }
          action={
            debouncedSearch ? (
              <button
                onClick={() => setSearch("")}
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
              transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.32 }}
              className="group relative overflow-hidden cursor-pointer bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 hover:border-green-400/40 hover:shadow-[0_8px_40px_-12px_rgba(0,255,128,0.3)] transition-all duration-300 min-w-0"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-1 -top-3 text-[64px] sm:text-[76px] font-bold text-white/[0.04] leading-none select-none"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="relative grid sm:grid-cols-[1fr_212px] min-w-0">
                {/* Route side */}
                <div className="p-4 sm:p-5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-3 min-w-0">
                    <span className=" hidden items-center gap-1.5 px-2.5 py-1 bg-green-500/15 text-green-300 border border-green-500/25 rounded-full text-[11px] font-semibold">
                      <span className="relative flex w-1.5 h-1.5">
                        <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-60 animate-ping" />
                        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-green-400" />
                      </span>
                      Awaiting driver
                    </span>
                    <TripTypeBadge type={b.tripType} />
                    <span className="font-mono text-[14px] bg-green-400/15 border border-green-400/25 rounded-full px-2 py-0.5 text-green-500">
                      #{b._id?.slice(-6).toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-gray-500">
                      <Clock size={11} /> {formatDateTime(b.pickupDateTime)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-gray-500" title={`Booked ${formatDateTime(b.createdAt)}`}>
                      <Calendar size={11} /> Booked {formatDateTime(b.createdAt)}
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
                      <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500 font-semibold">
                        Pickup
                      </p>
                      <p
                        className="text-sm font-medium text-white truncate"
                        title={b.pickup?.address}
                      >
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
                      <p
                        className="text-sm font-medium text-white truncate"
                        title={b.drop?.address}
                      >
                        {b.drop?.address || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(b.vehicleType?.name || b.driver?.vehicleType?.name) && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300 max-w-full">
                        <Car size={12} className="text-violet-400 shrink-0" />
                        <span className="truncate">
                          {b.vehicleType?.name || b.driver?.vehicleType?.name}
                        </span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300 max-w-full">
                      <User size={12} className="text-emerald-400 shrink-0" />
                      <span className="truncate">
                        {customerName(b)}
                        {customerPhone(b) ? ` · ${customerPhone(b)}` : ""}
                      </span>
                    </span>
                    {b.distance != null && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300">
                        <MapPin size={12} className="text-sky-400 shrink-0" />
                        {Number(b.distance).toFixed(1)} km
                      </span>
                    )}
                    {b.paymentMethod && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300">
                        <Wallet size={12} className="text-amber-400 shrink-0" />
                        {b.paymentMethod}
                      </span>
                    )}
                  </div>
                </div>

                {/* Fare rail */}
                <div className="relative flex sm:flex-col items-center sm:items-stretch justify-between gap-3 px-4 py-3.5 sm:p-5 bg-gradient-to-br from-green-500/15 via-green-500/5 to-transparent border-t sm:border-t-0 sm:border-l border-white/10 min-w-0">
                  <div className="min-w-0 sm:text-right">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-semibold">
                      Est. fare
                    </p>
                    <p className="text-2xl sm:text-[26px] font-bold bg-gradient-to-r from-green-300 via-green-200 to-green-400 bg-clip-text text-transparent leading-tight">
                      ₹{b.estimatedFare ?? 0}
                    </p>
                  </div>
                  <div className="flex sm:flex-col gap-1.5 shrink-0 sm:shrink">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      aria-label="View details"
                      className="inline-flex items-center justify-center gap-1.5 p-2.5 min-w-[44px] min-h-[44px] sm:min-h-[40px] sm:w-full bg-white/5 border border-white/10 text-gray-300 rounded-2xl text-xs font-medium hover:bg-white/10 transition"
                    >
                      <Eye size={15} />
                      <span className=" sm:inline">Details</span>
                    </button>
                    <button
                      onClick={() => openBooking(b._id)}
                      disabled={
                        assignMutation.isPending || cancelMutation.isPending
                      }
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full bg-gradient-to-r from-green-500   to-green-600 text-white rounded-2xl text-xs font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <XCircle className="hidden" size={15} /> Track
                    </button>

                    <button
                      onClick={() =>
                        setAssignDialog({ open: true, bookingId: b._id })
                      }
                      disabled={
                        assignMutation.isPending || cancelMutation.isPending
                      }
                      className="  hidden  items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-xs font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <CheckCircle className="hidden" size={14} /> Approve
                    </button>
                    <button
                      onClick={() =>
                        setCancelDialog({ open: true, bookingId: b._id })
                      }
                      disabled={
                        assignMutation.isPending || cancelMutation.isPending
                      }
                      className="  hidden  items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full bg-red-500/15 border border-red-500/25 text-red-300 rounded-2xl text-xs font-semibold hover:bg-red-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <XCircle className="hidden" size={14} /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            </Motion.article>
          ))}
          </div>
          ) : (
            <GlassTable columns={requestColumns} rows={bookings} rowKey={(b) => b._id} />
          )}
        </>
      )}

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Request Details"
        maxWidth="max-w-xl"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">
                #{selectedBooking._id?.slice(-8).toUpperCase()}
              </p>
              <button
                onClick={() => copyBooking(selectedBooking)}
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
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Status</p>
                <p className="font-medium text-white text-sm">
                  {selectedBooking.bookingStatus}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Cab Type</p>
                <p className="font-medium text-white text-sm">
                  {selectedBooking.vehicleType?.name ||
                    selectedBooking.driver?.vehicleType?.name ||
                    "—"}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Payment</p>
                <p className="font-medium text-white text-sm">
                  {selectedBooking.paymentMethod} ·{" "}
                  {selectedBooking.paymentStatus}
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
                <p className="text-[11px] text-gray-500">Fare</p>
                <p className="font-medium text-white text-sm">
                  ₹{selectedBooking.estimatedFare}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Trip Type</p>
                <p className="font-medium text-white text-sm">
                  {selectedBooking.tripType || "One Way"}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Booked On</p>
                <p className="font-medium text-white text-sm">
                  {formatDateTime(selectedBooking.createdAt)}
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
            <div className="flex items-center gap-2 text-sm text-gray-300 min-w-0">
              <User size={14} className="shrink-0" />
              <span className="truncate">
                Customer: {customerName(selectedBooking)}
                {customerPhone(selectedBooking)
                  ? ` · ${customerPhone(selectedBooking)}`
                  : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock size={14} className="shrink-0" />
              <span>
                Scheduled: {formatDateTime(selectedBooking.pickupDateTime)}
              </span>
            </div>
            {selectedBooking.customerNotes && (
              <p className="text-xs text-gray-400 bg-white/5 border border-white/10 rounded-2xl p-3">
                Note: {selectedBooking.customerNotes}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setAssignDialog({
                    open: true,
                    bookingId: selectedBooking._id,
                  });
                }}
                className="flex-1 py-2.5 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all"
              >
                <CheckCircle size={16} /> Approve
              </button>
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setCancelDialog({
                    open: true,
                    bookingId: selectedBooking._id,
                  });
                }}
                className="flex-1 py-2.5 min-h-[44px] bg-red-500/20 text-red-300 border border-red-500/30 text-sm font-medium rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/30 transition-all"
              >
                <XCircle size={16} /> Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Driver Dialog — offline drivers disabled (backend rejects them) */}
      <AssignDriverDialog
        open={assignDialog.open}
        onClose={() => setAssignDialog({ open: false, bookingId: null })}
        drivers={drivers}
        isPending={assignMutation.isPending}
        pendingDriverId={assigningDriverId}
        onSelect={handleSelectDriver}
        requiredVehicleType={
          bookings.find((b) => b._id === assignDialog.bookingId)?.vehicleType ||
          selectedBooking?.vehicleType ||
          null
        }
      />

      <ConfirmDialog
        isOpen={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, bookingId: null })}
        onConfirm={() => cancelMutation.mutate(cancelDialog.bookingId)}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking request?"
        confirmText="Cancel Booking"
        variant="danger"
      />
    </Motion.div>
  );
};

export default AdminBookingRequests;
