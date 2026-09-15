import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Eye,
  MapPin,
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
} from "lucide-react";
import { adminAPI, vehicleAPI } from "../../services/endpoints";
import { useCopyBooking } from "../../utils/bookingText";
import { TableSkeleton } from "../../components/shared/Skeleton";
import ErrorState from "../../components/shared/ErrorState";
import EmptyState from "../../components/shared/EmptyState";
import Pagination from "../../components/shared/Pagination";
import Modal from "../../components/shared/Modal";
import CancelReasonDialog from "../../components/shared/CancelReasonDialog";
import AssignDriverDialog from "../../components/shared/AssignDriverDialog";
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

const ManageBookings = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
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
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
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
    return () => {
      socket.off("ride-status-updated", handleRideUpdate);
      socket.off("booking-updated", handleRideUpdate);
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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminBookings", page, statusFilter, vehicleTypeFilter],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (vehicleTypeFilter) params.vehicleType = vehicleTypeFilter;
      const { data } = await adminAPI.getBookings(params);
      return data;
    },
    staleTime: 30_000,
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
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to complete booking"),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => adminAPI.cancelBooking(id, { reason }),
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
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
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      setAssignDialog({ open: false, bookingId: null });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to assign driver");
    },
    onSettled: () => setAssigningDriverId(null),
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
          queryClient.invalidateQueries({ queryKey: ["adminBookings"] })
        }
      />
    );

  const statusColors = {
    Pending: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    Accepted: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    "On The Way":
      "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    Arrived: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
    Started: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
    Reached: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    Completed:
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    Cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
  };

  const canAct = (b) =>
    b.bookingStatus !== "Completed" && b.bookingStatus !== "Cancelled";
  const fareOf = (b) => b.finalFare || b.estimatedFare;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6 min-w-0"
    >
      {/* ── Hero panel ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/15 via-white/5 to-transparent p-4 sm:p-6">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-violet-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
        <div className="relative min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300">
            <CalendarCheck size={12} /> Operations
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Manage Bookings
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track every ride, assign drivers, complete or cancel — updates live.
          </p>
        </div>
        <div className="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
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
              className="bg-black/30 border border-white/10 rounded-2xl px-3 py-2.5 min-w-0"
            >
              <p className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-400 truncate">
                <s.icon size={12} className={s.tint} />
                {s.label}
              </p>
              <p className="text-base sm:text-lg font-bold text-white leading-tight mt-1 truncate">
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

      {/* ── Vehicle type filter ────────────────────────────────── */}
      {vehicleTypes.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-400">Vehicle type</label>
          <select
            value={vehicleTypeFilter}
            onChange={(e) => {
              setVehicleTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white/5 border border-white/10 text-white text-xs font-medium rounded-xl px-3 py-2 min-h-[40px] outline-none focus:border-emerald-500/50 transition cursor-pointer"
          >
            <option value="">All Types</option>
            {vehicleTypes.map((v) => (
              <option key={v._id} value={v._id} className="bg-gray-900 text-white">
                {v.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Feed ───────────────────────────────────────────────── */}
      {/* <FareNotes compact /> */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description={
            statusFilter
              ? `No ${statusFilter.toLowerCase()} bookings.`
              : "Bookings will appear here."
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 w-full max-w-6xl">
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
                  <div className="p-4 sm:p-5 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-3 min-w-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[b.bookingStatus]}`}
                      >
                        {b.bookingStatus}
                      </span>
                      <span className="font-mono text-[11px] text-gray-500">
                        #{b._id?.slice(-6).toUpperCase()}
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
                      {b.tripType && (
                        <span className="px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300">
                          {b.tripType}
                        </span>
                      )}
                      {(b.vehicleType?.name || b.driver?.vehicleType?.name) && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300">
                          <Car size={12} className="text-violet-400 shrink-0" />
                          {b.vehicleType?.name || b.driver?.vehicleType?.name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300">
                        <Wallet size={12} className="text-amber-400 shrink-0" />
                        {b.paymentMethod || "Cash"} ·{" "}
                        {b.paymentStatus || "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Fare rail */}
                  <div className="relative flex sm:flex-col items-center sm:items-stretch justify-between gap-3 px-4 py-3.5 sm:p-5 bg-gradient-to-br from-violet-500/15 via-violet-500/5 to-transparent border-t sm:border-t-0 sm:border-l border-white/10 min-w-0">
                    <div className="min-w-0 sm:text-right">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-semibold">
                        Fare
                      </p>
                      <p className="text-2xl sm:text-[26px] font-bold bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent leading-tight">
                        ₹{fareOf(b) ?? 0}
                      </p>
                    </div>
                    <div className="flex sm:flex-col gap-1.5 shrink-0 sm:shrink">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        aria-label="View details"
                        className="inline-flex items-center justify-center gap-1.5 p-2.5 min-w-[44px] min-h-[44px] sm:min-h-[40px] sm:w-full bg-white/5 border border-white/10 text-gray-300 rounded-2xl text-xs font-medium hover:bg-white/10 transition"
                      >
                        <Eye size={15} />
                        <span className="hidden sm:inline">Details</span>
                      </button>
                      <button
                            onClick={() => openBooking(b._id)}
                            disabled={completeMutation.isPending}
                            className=" items-center justify-center px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded-2xl text-xs font-semibold hover:bg-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            Track ride
                          </button>
                      {!b.driver && b.bookingStatus === "Pending" && (
                        <button
                          onClick={() =>
                            setAssignDialog({ open: true, bookingId: b._id })
                          }
                          className="hidden items-center justify-center gap-1 px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-xs font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:brightness-110 active:scale-[0.98] transition-all"
                        >
                          Assign
                        </button>
                      )}
                      {canAct(b) && (
                        <>
                          <button
                            onClick={() => completeMutation.mutate(b._id)}
                            disabled={completeMutation.isPending}
                            className=" hidden items-center justify-center px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded-2xl text-xs font-semibold hover:bg-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
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
                            className="hidden items-center justify-center px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full bg-red-500/15 border border-red-500/25 text-red-300 rounded-2xl text-xs font-semibold hover:bg-red-500/25 active:scale-[0.98] transition-all"
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
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selectedBooking.bookingStatus]}`}
              >
                {selectedBooking.bookingStatus}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyBooking(selectedBooking)}
                  title="Copy booking details"
                  aria-label="Copy booking details"
                  className="inline-flex items-center gap-1.5 p-2 min-w-[40px] min-h-[40px] justify-center bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs font-medium hover:bg-white/10 hover:text-white transition"
                >
                  {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                </button>
                <span className="text-xl font-bold text-white">
                  ₹{selectedBooking.finalFare || selectedBooking.estimatedFare}
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
                {selectedBooking.customer?.email && (
                  <p className="text-xs text-slate-200/60 mt-0.5 truncate">
                    {selectedBooking.customer.email}
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
                  {selectedBooking.duration != null
                    ? `${Math.ceil(Number(selectedBooking.duration))} min`
                    : "—"}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-[11px] text-gray-500">Trip Type</p>
                <p className="font-medium text-white text-sm">
                  {selectedBooking.tripType}
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
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    setAssignDialog({
                      open: true,
                      bookingId: selectedBooking._id,
                    });
                  }}
                  className="w-full py-2.5 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-2xl hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Assign Driver
                </button>
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

export default ManageBookings;
