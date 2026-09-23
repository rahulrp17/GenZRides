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
  Zap,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { adminAPI } from "../../services/endpoints";
import { useSocket } from "../../Context/SocketContext";
import useDebounce from "../../hooks/useDebounce";
import { TableSkeleton } from "../../components/shared/Skeleton";
import ErrorState from "../../components/shared/ErrorState";
import EmptyState from "../../components/shared/EmptyState";
import GlassTable from "../../components/shared/GlassTable";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import CancelReasonDialog from "../../components/shared/CancelReasonDialog";
import {
  QueueHero,
  QueueToolbar,
  QueueCard,
  BookingRouteSide,
  BookingFareRail,
  RailDetailsBtn,
  BookingDetailModal,
  ApprovalBadge,
  TripTypeBadge,
} from "./bookingShared";
import {
  useVehicles,
  formatDateTime,
  customerName,
  customerPhone,
} from "./bookingUtils";

const REJECT_REASONS = [
  "Duplicate request",
  "Fake booking",
  "Customer unreachable",
  "No drivers for this route",
  "Out of service area",
];

// Guest bookings awaiting admin verification. Verify approves + dispatches
// to drivers; reject hides them from every driver feed forever.
const AdminInstantBookingRequests = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const openBooking = (id) => navigate(`/admin/bookings/${id}`);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem("adminInstantRequestsView") || "cards";
    } catch {
      return "cards";
    }
  });
  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem("adminInstantRequestsView", v);
    } catch {
      // private mode — preference simply won't persist
    }
  };
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectDialog, setRejectDialog] = useState({ open: false, bookingId: null });
  const [cancelDialog, setCancelDialog] = useState({ open: false, bookingId: null });

  const vehicleTypes = useVehicles();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["adminInstantRequests", vehicleTypeFilter, debouncedSearch],
    queryFn: async () => {
      const params = { page: 1, limit: 100 };
      if (vehicleTypeFilter) params.vehicleType = vehicleTypeFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await adminAPI.getInstantBookingRequests(params);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["adminInstantRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminInstantBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminCounts"] });
    };
    ["instant-booking-pending", "new-booking", "booking-updated", "ride-status-updated", "admin-counts-updated"].forEach(
      (e) => socket.on(e, handleUpdate),
    );
    return () =>
      ["instant-booking-pending", "new-booking", "booking-updated", "ride-status-updated", "admin-counts-updated"].forEach(
        (e) => socket.off(e, handleUpdate),
      );
  }, [socket, queryClient]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["adminInstantRequests"] });
    queryClient.invalidateQueries({ queryKey: ["adminInstantBookings"] });
    queryClient.invalidateQueries({ queryKey: ["adminCounts"] });
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
  const totalValue = bookings.reduce(
    (s, b) => s + (Number(b.estimatedFare) || 0),
    0,
  );
  const busy = verifyMutation.isPending || rejectMutation.isPending || cancelMutation.isPending;

  if (isError) {
    return (
      <ErrorState
        message={error?.message || "Failed to load instant requests"}
        onRetry={refetch}
      />
    );
  }

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
      </>
    );
  };

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
      header: "Guest",
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
      header: "Approval",
      cell: (b) => <ApprovalBadge value={b.approvalStatus} />,
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
      <QueueHero
        icon={Zap}
        eyebrow="Live queue · guest holds awaiting verification"
        title="Instant Booking Requests"
        subtitle="Verify to approve + dispatch to drivers, or reject so it never reaches a driver."
        stats={[
          { label: "Awaiting verify", value: bookings.length, accent: "text-amber-300" },
          { label: "Queue value", value: `₹${totalValue.toLocaleString("en-IN")}`, accent: "text-green-300" },
          { label: "Hidden drivers", value: "100%", accent: "text-emerald-300" },
        ]}
        loading={isLoading}
        refreshing={isFetching}
        onRefresh={() => refetch()}
      />

      <QueueToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search guest, phone, booking ID, pickup, drop, trip type…"
        view={view}
        onViewChange={changeView}
        vehicleTypes={vehicleTypes}
        vehicleType={vehicleTypeFilter}
        onVehicleType={setVehicleTypeFilter}
        fetching={isFetching}
        loading={isLoading}
      />
      {debouncedSearch && !isLoading && (
        <p className="text-xs text-gray-400 -mt-1" role="status">
          <span className="text-white font-bold">{bookings.length}</span> result{bookings.length === 1 ? "" : "s"} for{" "}
          <span className="text-emerald-300 font-semibold">“{debouncedSearch}”</span>
        </p>
      )}

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={debouncedSearch ? "No matching requests" : "No instant requests waiting"}
          description={
            debouncedSearch
              ? `Nothing matches “${debouncedSearch}”. Try a name, phone, booking ID, or place.`
              : "Every guest booking has been verified or rejected."
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
      ) : view === "cards" ? (
        <div className="grid gap-3 sm:gap-4 w-full max-w-full">
          {bookings.map((b, i) => (
            <QueueCard key={b._id} index={i}>
              <BookingRouteSide b={b} showApproval />
              <BookingFareRail b={b}>{rowActions(b, true)}</BookingFareRail>
            </QueueCard>
          ))}
        </div>
      ) : (
        <GlassTable columns={requestColumns} rows={bookings} rowKey={(b) => b._id} />
      )}

      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        footer={
          selectedBooking && (
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
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
              <button
                onClick={() => openBooking(selectedBooking._id)}
                className="flex-1 py-2.5 min-h-[44px] bg-white/5 border border-white/10 text-white text-sm font-medium rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                <MapPin size={16} /> Track
              </button>
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
            </div>
          )
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
        message="Are you sure you want to cancel this booking request?"
        confirmText="Cancel Booking"
        variant="danger"
      />
    </Motion.div>
  );
};

export default AdminInstantBookingRequests;
