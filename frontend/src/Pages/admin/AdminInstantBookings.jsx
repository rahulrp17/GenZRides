import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Eye,
  MapPin,
  Check,
  Ban,
  XCircle,
  UserPlus,
  Zap,
  CheckCircle,
  Users,
  IndianRupee,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { adminAPI } from "../../services/endpoints";
import { useSocket } from "../../Context/SocketContext";
import useDebounce from "../../hooks/useDebounce";
import { TableSkeleton } from "../../components/shared/Skeleton";
import ErrorState from "../../components/shared/ErrorState";
import EmptyState from "../../components/shared/EmptyState";
import GlassTable from "../../components/shared/GlassTable";
import Pagination from "../../components/shared/Pagination";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import CancelReasonDialog from "../../components/shared/CancelReasonDialog";
import AssignDriverDialog from "../../components/shared/AssignDriverDialog";
import { BookingStatusBadge } from "../../utils/bookingStatus";
import { fareTotal } from "../../utils/bookingStatusMeta";
import {
  QueueToolbar,
  QueueCard,
  BookingRouteSide,
  BookingFareRail,
  RailDetailsBtn,
  BookingDetailModal,
  ApprovalBadge,
  DriverCell,
  TripTypeBadge,
} from "./bookingShared";
import {
  useVehicles,
  useApprovedDrivers,
  formatDateTime,
  customerName,
  customerPhone,
} from "./bookingUtils";

const PAGE_LIMIT = 10;

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

const APPROVALS = ["Pending Approval", "Approved", "Rejected"];

const REJECT_REASONS = [
  "Duplicate request",
  "Fake booking",
  "Customer unreachable",
  "No drivers for this route",
  "Out of service area",
];

// Every guest (instant) booking: verify pending ones, assign approved ones,
// complete/cancel active ones. Registered bookings never appear here.
const AdminInstantBookings = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const openBooking = (id) => navigate(`/admin/bookings/${id}`);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem("adminInstantBookingsView") || "cards";
    } catch {
      return "cards";
    }
  });
  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem("adminInstantBookingsView", v);
    } catch {
      // private mode — preference simply won't persist
    }
  };
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignDialog, setAssignDialog] = useState({ open: false, bookingId: null });
  const [assigningDriverId, setAssigningDriverId] = useState(null);
  const [rejectDialog, setRejectDialog] = useState({ open: false, bookingId: null });
  const [cancelDialog, setCancelDialog] = useState({ open: false, bookingId: null });

  const vehicleTypes = useVehicles();
  const drivers = useApprovedDrivers();

  // Accepted-revenue hero numbers reuse the shared dashboard cache —
  // no extra endpoint, same socket-invalidated data as /admin.
  const { data: dashData } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const { data } = await adminAPI.getDashboard();
      return data;
    },
    staleTime: 30_000,
  });
  const dash = dashData?.stats || {};
  const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      "adminInstantBookings",
      page,
      statusFilter,
      approvalFilter,
      vehicleTypeFilter,
      debouncedSearch,
    ],
    queryFn: async () => {
      const params = { page, limit: PAGE_LIMIT };
      if (statusFilter) params.status = statusFilter;
      if (approvalFilter) params.approval = approvalFilter;
      if (vehicleTypeFilter) params.vehicleType = vehicleTypeFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await adminAPI.getInstantBookings(params);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (!socket) return;
    const handleRideUpdate = (update) => {
      queryClient.invalidateQueries({ queryKey: ["adminInstantBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminInstantRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminCounts"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      if (update?._id) {
        setSelectedBooking((prev) =>
          prev && prev._id === update._id ? { ...prev, ...update } : prev,
        );
      }
    };
    ["instant-booking-pending", "new-booking", "booking-updated", "ride-status-updated", "admin-counts-updated"].forEach(
      (e) => socket.on(e, handleRideUpdate),
    );
    return () =>
      ["instant-booking-pending", "new-booking", "booking-updated", "ride-status-updated", "admin-counts-updated"].forEach(
        (e) => socket.off(e, handleRideUpdate),
      );
  }, [socket, queryClient]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["adminInstantBookings"] });
    queryClient.invalidateQueries({ queryKey: ["adminInstantRequests"] });
    queryClient.invalidateQueries({ queryKey: ["adminCounts"] });
    queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
  };

  const verifyMutation = useMutation({
    mutationFn: (bookingId) => adminAPI.verifyInstantBooking(bookingId),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Booking verified!");
      invalidate();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to verify booking");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ bookingId, reason }) =>
      adminAPI.rejectInstantBooking(bookingId, { reason }),
    onSuccess: () => {
      toast.success("Booking rejected");
      invalidate();
      setRejectDialog({ open: false, bookingId: null });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to reject booking");
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ bookingId, driverId }) =>
      adminAPI.assignDriver(bookingId, { driverId }),
    onSuccess: () => {
      toast.success("Driver assigned successfully!");
      invalidate();
      setAssignDialog({ open: false, bookingId: null });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to assign driver");
    },
    onSettled: () => setAssigningDriverId(null),
  });

  const completeMutation = useMutation({
    mutationFn: (bookingId) => adminAPI.completeBooking(bookingId),
    onSuccess: () => {
      toast.success("Booking completed");
      invalidate();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to complete booking");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) =>
      adminAPI.cancelBooking(bookingId, { reason: "Cancelled by admin" }),
    onSuccess: () => {
      toast.success("Booking cancelled");
      invalidate();
      setCancelDialog({ open: false, bookingId: null });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to cancel booking");
    },
  });

  const bookings = data?.bookings || [];
  const busy =
    verifyMutation.isPending ||
    rejectMutation.isPending ||
    assignMutation.isPending ||
    completeMutation.isPending ||
    cancelMutation.isPending;

  const handleSelectDriver = (driverId) => {
    setAssigningDriverId(driverId);
    assignMutation.mutate({ bookingId: assignDialog.bookingId, driverId });
  };

  if (isError) {
    return (
      <ErrorState
        message={error?.message || "Failed to load instant bookings"}
        onRetry={refetch}
      />
    );
  }

  const isPendingApproval = (b) =>
    (b.approvalStatus || "Approved") === "Pending Approval" &&
    b.bookingStatus === "Pending";
  const canAssign = (b) =>
    !b.driver && b.bookingStatus === "Pending" && !isPendingApproval(b);
  const isActive = (b) => !["Completed", "Cancelled"].includes(b.bookingStatus);

  const rowActions = (b, rail = false) => {
    const btn = rail
      ? "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full rounded-2xl text-xs font-semibold transition-all disabled:opacity-50"
      : "p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center rounded-xl text-xs transition disabled:opacity-50";
    return (
      <>
        {rail && <RailDetailsBtn onClick={() => setSelectedBooking(b)} />}
        {!rail && (
          <>
            <button onClick={() => setSelectedBooking(b)} title="Details" aria-label="View details" className={`${btn} bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10`}>
              <Eye size={14} />
            </button>
            <button onClick={() => openBooking(b._id)} title="Track" aria-label="Track booking" className={`${btn} bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/25`}>
              <MapPin size={14} />
            </button>
          </>
        )}
        {isPendingApproval(b) && (
          <button
            onClick={() => verifyMutation.mutate(b._id)}
            disabled={busy}
            title="Verify & dispatch to drivers"
            aria-label="Verify booking"
            className={`${btn} bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-[0_0_18px_rgba(34,197,94,0.5)]`}
          >
            <Check size={14} />
            {rail && "Verify"}
          </button>
        )}
        {canAssign(b) && (
          <button
            onClick={() => setAssignDialog({ open: true, bookingId: b._id })}
            disabled={busy}
            title="Assign a driver manually"
            aria-label="Assign driver"
            className={`${btn} bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10`}
          >
            <UserPlus size={14} />
            {rail && "Assign"}
          </button>
        )}
        {isPendingApproval(b) ? (
          <button
            onClick={() => setRejectDialog({ open: true, bookingId: b._id })}
            disabled={busy}
            title="Reject (never shown to drivers)"
            aria-label="Reject booking"
            className={`${btn} bg-amber-500/15 border border-amber-500/25 text-amber-300 hover:bg-amber-500/25`}
          >
            <Ban size={14} />
            {rail && "Reject"}
          </button>
        ) : (
          isActive(b) && (
            <button
              onClick={() => setCancelDialog({ open: true, bookingId: b._id })}
              disabled={busy}
              title="Cancel"
              aria-label="Cancel booking"
              className={`${btn} bg-red-500/15 border border-red-500/25 text-red-300 hover:bg-red-500/25`}
            >
              <XCircle size={14} />
              {rail && "Cancel"}
            </button>
          )
        )}
        {!rail && isActive(b) && b.driver && (
          <button
            onClick={() => completeMutation.mutate(b._id)}
            disabled={busy}
            title="Complete"
            aria-label="Complete booking"
            className={`${btn} bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/25`}
          >
            <Check size={14} />
          </button>
        )}
      </>
    );
  };

  const bookingColumns = [
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
      header: "Guest",
      cell: (b) => (
        <div className="min-w-[140px] max-w-[200px]">
          <p className="text-sm font-semibold text-white truncate">{customerName(b)}</p>
          <p className="text-[11px] text-gray-500 truncate">{customerPhone(b)}</p>
        </div>
      ),
    },
    { header: "Driver", cell: (b) => <DriverCell b={b} /> },
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
      header: "Approval",
      cell: (b) => <ApprovalBadge value={b.approvalStatus} />,
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
          {rowActions(b)}
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
      {/* ── Hero panel (compact) — same style as Customer Bookings ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-white/5 to-transparent p-4 sm:p-5">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
        <div className="relative min-w-0 flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
            <Zap size={12} /> Instant Ops
          </p>
          <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            Instant Customer Bookings
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-400 w-full">
            Verify pending holds, assign approved rides, complete or cancel — updates live. Accepted revenue counts assigned rides only.
          </p>
        </div>
        <div className="relative mt-3 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            {
              label: "Total instant",
              value: dash.instantBookersCount ?? data?.total ?? "–",
              icon: Zap,
              tint: "text-emerald-300",
            },
            {
              label: "Accepted",
              value: dash.instantAccepted ?? "–",
              icon: CheckCircle,
              tint: "text-emerald-300",
            },
            {
              label: "Accepted Revenue",
              value: inr(dash.instantAcceptedRevenue),
              icon: IndianRupee,
              tint: "text-green-300",
            },
            {
              label: "Drivers online",
              value: drivers.filter((d) => d.isOnline).length,
              icon: Users,
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

      <QueueToolbar
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search guest, phone, booking ID, pickup, drop, trip type…"
        view={view}
        onViewChange={changeView}
        vehicleTypes={vehicleTypes}
        vehicleType={vehicleTypeFilter}
        onVehicleType={(v) => {
          setVehicleTypeFilter(v);
          setPage(1);
        }}
        fetching={isFetching}
        loading={isLoading}
      />

      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-1.5 overflow-x-auto min-w-0" role="tablist" aria-label="Filter by approval">
          {["", ...APPROVALS].map((a) => (
            <button
              key={a || "all"}
              role="tab"
              aria-selected={approvalFilter === a}
              onClick={() => {
                setApprovalFilter(a);
                setPage(1);
              }}
              className={`flex-1 whitespace-nowrap px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all ${
                approvalFilter === a
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_18px_rgba(34,197,94,0.35)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {a || "All approvals"}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-1.5 overflow-x-auto min-w-0" role="tablist" aria-label="Filter by status">
          {["", ...STATUSES].map((s) => (
            <button
              key={s || "all"}
              role="tab"
              aria-selected={statusFilter === s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`flex-1 whitespace-nowrap px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all ${
                statusFilter === s
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_18px_rgba(34,197,94,0.35)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {s || "All statuses"}
            </button>
          ))}
        </div>
      </div>
      {debouncedSearch && !isLoading && (
        <p className="text-xs text-gray-400 -mt-1" role="status">
          <span className="text-white font-bold">{data?.total ?? 0}</span> result{(data?.total ?? 0) === 1 ? "" : "s"} for{" "}
          <span className="text-emerald-300 font-semibold">“{debouncedSearch}”</span>
        </p>
      )}

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No instant bookings"
          description={
            debouncedSearch || statusFilter || approvalFilter
              ? "Nothing matches the current filters."
              : "No guest has booked yet. New instant bookings appear here live."
          }
          action={
            debouncedSearch || statusFilter || approvalFilter ? (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setApprovalFilter("");
                }}
                className="px-5 py-2.5 min-h-[44px] rounded-2xl bg-white/5 border border-white/15 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          {view === "cards" ? (
            <div className="grid gap-3 sm:gap-4 w-full max-w-full">
              {bookings.map((b, i) => (
                <QueueCard key={b._id} index={i}>
                  <BookingRouteSide b={b} showApproval />
                  <BookingFareRail b={b}>{rowActions(b, true)}</BookingFareRail>
                </QueueCard>
              ))}
            </div>
          ) : (
            <GlassTable columns={bookingColumns} rows={bookings} rowKey={(b) => b._id} density="compact" />
          )}
          <Pagination
            page={data?.page || 1}
            totalPages={data?.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}

      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        footer={
          selectedBooking && (
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              {isPendingApproval(selectedBooking) ? (
                <button
                  onClick={() => {
                    const id = selectedBooking._id;
                    setSelectedBooking(null);
                    verifyMutation.mutate(id);
                  }}
                  disabled={busy}
                  className="flex-1 py-2.5 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50"
                >
                  <Check size={16} /> Verify
                </button>
              ) : (
                canAssign(selectedBooking) && (
                  <button
                    onClick={() => {
                      setAssignDialog({ open: true, bookingId: selectedBooking._id });
                      setSelectedBooking(null);
                    }}
                    disabled={busy}
                    className="flex-1 py-2.5 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50"
                  >
                    <UserPlus size={16} /> Assign
                  </button>
                )
              )}
              {isPendingApproval(selectedBooking) ? (
                <button
                  onClick={() => {
                    setRejectDialog({ open: true, bookingId: selectedBooking._id });
                    setSelectedBooking(null);
                  }}
                  disabled={busy}
                  className="flex-1 py-2.5 min-h-[44px] bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-500/25 transition-all disabled:opacity-50"
                >
                  <Ban size={16} /> Reject
                </button>
              ) : (
                isActive(selectedBooking) && (
                  <button
                    onClick={() => {
                      setCancelDialog({ open: true, bookingId: selectedBooking._id });
                      setSelectedBooking(null);
                    }}
                    disabled={busy}
                    className="flex-1 py-2.5 min-h-[44px] bg-red-500/20 text-red-300 border border-red-500/30 text-sm font-medium rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/30 transition-all disabled:opacity-50"
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                )
              )}
              <button
                onClick={() => openBooking(selectedBooking._id)}
                className="flex-1 py-2.5 min-h-[44px] bg-white/5 border border-white/10 text-white text-sm font-medium rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                <MapPin size={16} /> Track
              </button>
            </div>
          )
        }
      />

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

      <CancelReasonDialog
        isOpen={rejectDialog.open}
        onClose={() => !rejectMutation.isPending && setRejectDialog({ open: false, bookingId: null })}
        onConfirm={(reason) =>
          rejectMutation.mutate({ bookingId: rejectDialog.bookingId, reason })
        }
        title="Reject Booking"
        message="The guest is notified. Rejected bookings never reach any driver."
        confirmText="Reject Booking"
        reasons={REJECT_REASONS}
        isPending={rejectMutation.isPending}
      />

      <ConfirmDialog
        isOpen={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, bookingId: null })}
        onConfirm={() => cancelMutation.mutate(cancelDialog.bookingId)}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking?"
        confirmText="Cancel Booking"
        variant="danger"
      />
    </Motion.div>
  );
};

export default AdminInstantBookings;
