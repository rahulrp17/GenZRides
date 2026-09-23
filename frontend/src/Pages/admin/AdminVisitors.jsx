import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Users, Eye, MapPin, Clock, User, Phone, Mail, Calendar } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { adminAPI } from "../../services/endpoints";
import { useSocket } from "../../Context/SocketContext";
import useDebounce from "../../hooks/useDebounce";
import { TableSkeleton } from "../../components/shared/Skeleton";
import ErrorState from "../../components/shared/ErrorState";
import EmptyState from "../../components/shared/EmptyState";
import GlassTable from "../../components/shared/GlassTable";
import Pagination from "../../components/shared/Pagination";
import Modal from "../../components/shared/Modal";
import {
  QueueHero,
  QueueToolbar,
  QueueCard,
  BookingFareRail,
  RailDetailsBtn,
  TripTypeBadge,
} from "./bookingShared";
import { formatDateTime } from "./bookingUtils";

const PAGE_LIMIT = 10;

const VISITOR_STATUSES = ["Pending", "Confirmed", "Expired", "Cancelled"];

const VISITOR_STYLES = {
  Pending: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  Confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  Expired: "bg-white/5 text-gray-400 border-white/15",
  Cancelled: "bg-rose-500/15 text-rose-300 border-rose-400/30",
};

const VisitorBadge = ({ value }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur whitespace-nowrap ${
      VISITOR_STYLES[value] || VISITOR_STYLES.Pending
    }`}
  >
    {value || "Pending"}
  </span>
);

// Temporary guest holds from "Book Now": pending (awaiting confirm),
// confirmed (converted — links to the booking), expired / cancelled.
const AdminVisitors = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState("");
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem("adminVisitorsView") || "cards";
    } catch {
      return "cards";
    }
  });
  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem("adminVisitorsView", v);
    } catch {
      // private mode — preference simply won't persist
    }
  };
  const [selected, setSelected] = useState(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["adminVisitors", page, statusFilter, debouncedSearch],
    queryFn: async () => {
      const params = { page, limit: PAGE_LIMIT };
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await adminAPI.getVisitors(params);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["adminVisitors"] });
    };
    ["visitor-created", "visitor-updated", "instant-booking-pending"].forEach(
      (e) => socket.on(e, handleUpdate),
    );
    return () =>
      ["visitor-created", "visitor-updated", "instant-booking-pending"].forEach(
        (e) => socket.off(e, handleUpdate),
      );
  }, [socket, queryClient]);

  const visitors = data?.visitors || [];

  if (isError) {
    return (
      <ErrorState
        message={error?.message || "Failed to load visitors"}
        onRetry={refetch}
      />
    );
  }

  const holdLeft = (v) => {
    if (v.status !== "Pending" || !v.expiresAt) return null;
    const ms = new Date(v.expiresAt).getTime() - Date.now();
    if (ms <= 0) return "expired";
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s left`;
  };

  const columns = [
    {
      header: "Hold",
      cell: (v) => (
        <div className="min-w-[130px]">
          <p className="font-mono text-xs text-emerald-300">{v.reference}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 whitespace-nowrap">
            {formatDateTime(v.createdAt)}
          </p>
        </div>
      ),
    },
    {
      header: "Guest",
      cell: (v) => (
        <div className="min-w-[140px] max-w-[200px]">
          <p className="text-sm font-semibold text-white truncate">{v.guestName}</p>
          <p className="text-[11px] text-gray-500 truncate">{v.guestPhone}</p>
        </div>
      ),
    },
    {
      header: "Route",
      cell: (v) => (
        <div className="min-w-[180px] max-w-[260px]">
          <p className="text-xs text-gray-300 truncate" title={v.pickup?.address}>
            <span className="text-green-400 font-bold">↑ </span>{v.pickup?.address || "N/A"}
          </p>
          <p className="text-xs text-gray-300 truncate mt-1" title={v.drop?.address}>
            <span className="text-red-400 font-bold">↓ </span>{v.drop?.address || "N/A"}
          </p>
        </div>
      ),
    },
    {
      header: "Type",
      cell: (v) => <TripTypeBadge type={v.tripType} />,
    },
    {
      header: "Status",
      cell: (v) => <VisitorBadge value={v.status} />,
    },
    {
      header: "",
      tdClassName: "text-right",
      cell: (v) => (
        <button
          onClick={() => setSelected(v)}
          title="Details"
          aria-label="View details"
          className="p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs hover:bg-white/10 transition"
        >
          <Eye size={14} />
        </button>
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
        icon={Users}
        eyebrow="Live holds · 10-minute confirm window"
        title="Visitors"
        subtitle="Temporary trip holds from “Book Now” — pending, confirmed, or expired. No booking exists until a hold is confirmed."
        stats={[
          { label: "Total holds", value: data?.total ?? 0 },
          { label: "Page", value: `${data?.page ?? 1}/${data?.totalPages ?? 1}` },
          {
            label: "Pending",
            value: visitors.filter((v) => v.status === "Pending").length,
            accent: "text-amber-300",
          },
        ]}
        loading={isLoading}
        refreshing={isFetching}
        onRefresh={() => refetch()}
      />

      <QueueToolbar
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search name, phone, email, hold reference, place…"
        view={view}
        onViewChange={changeView}
        vehicleTypes={[]}
        vehicleType=""
        onVehicleType={() => {}}
        fetching={isFetching}
        loading={isLoading}
      />

      <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-1.5 overflow-x-auto min-w-0" role="tablist" aria-label="Filter by hold status">
        {["", ...VISITOR_STATUSES].map((s) => (
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
            {s || "All holds"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : visitors.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No visitor holds"
          description={
            debouncedSearch || statusFilter
              ? "Nothing matches the current filters."
              : "New “Book Now” holds appear here live."
          }
          action={
            debouncedSearch || statusFilter ? (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
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
              {visitors.map((v, i) => (
                <QueueCard key={v._id} index={i}>
                  <div className="p-4 sm:p-5 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-3 min-w-0">
                      <TripTypeBadge type={v.tripType} />
                      <VisitorBadge value={v.status} />
                      <span className="font-mono text-[14px] bg-green-400/15 border border-green-400/25 rounded-full px-2 py-0.5 text-green-500">
                        {v.reference}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-gray-500">
                        <Clock size={11} /> {formatDateTime(v.pickupDateTime)}
                      </span>
                      {holdLeft(v) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-amber-300">
                          <Clock size={11} /> {holdLeft(v)}
                        </span>
                      )}
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
                        <p className="text-sm font-medium text-white truncate" title={v.pickup?.address}>
                          {v.pickup?.address || "N/A"}
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
                        <p className="text-sm font-medium text-white truncate" title={v.drop?.address}>
                          {v.drop?.address || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300 max-w-full">
                        <User size={12} className="text-emerald-400 shrink-0" />
                        <span className="truncate">
                          {v.guestName}
                          {v.guestPhone ? ` · ${v.guestPhone}` : ""}
                        </span>
                      </span>
                      {v.vehicleType?.name && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300 max-w-full">
                          <MapPin size={12} className="text-violet-400 shrink-0" />
                          <span className="truncate">{v.vehicleType.name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <BookingFareRail b={{ estimatedFare: null }}>
                    <RailDetailsBtn onClick={() => setSelected(v)} />
                    {v.bookingId && (
                      <button
                        onClick={() => navigate(`/admin/bookings/${v.bookingId}`)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full rounded-2xl text-xs font-semibold transition-all bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/25"
                      >
                        <MapPin size={14} /> Booking
                      </button>
                    )}
                  </BookingFareRail>
                </QueueCard>
              ))}
            </div>
          ) : (
            <GlassTable columns={columns} rows={visitors} rowKey={(v) => v._id} />
          )}
          <Pagination
            page={data?.page || 1}
            totalPages={data?.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Hold ${selected.reference}` : "Hold details"}
        maxWidth="max-w-xl"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <VisitorBadge value={selected.status} />
              <TripTypeBadge type={selected.tripType} />
              {holdLeft(selected) && (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-300">
                  <Clock size={11} /> {holdLeft(selected)}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                ["Pickup At", formatDateTime(selected.pickupDateTime)],
                ["Cab Type", selected.vehicleType?.name || "—"],
                ["Created", formatDateTime(selected.createdAt)],
                ["Expires", formatDateTime(selected.expiresAt)],
              ].map(([label, value]) => (
                <div key={label} className="bg-white/5 rounded-2xl p-3">
                  <p className="text-[11px] text-gray-500">{label}</p>
                  <p className="font-medium text-white text-sm">{value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-green-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300 break-words">{selected.pickup?.address}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300 break-words">{selected.drop?.address}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-[13px] text-gray-200">
                <User size={13} className="text-green-400 shrink-0" /> {selected.guestName}
              </span>
              <a
                href={`tel:${selected.guestPhone}`}
                className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-[13px] text-gray-200 hover:border-green-500/50 hover:text-green-300 transition"
              >
                <Phone size={13} className="text-green-400 shrink-0" /> {selected.guestPhone}
              </a>
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-[13px] text-gray-200 min-w-0">
                <Mail size={13} className="text-blue-400 shrink-0" />{" "}
                <span className="truncate">{selected.guestEmail}</span>
              </span>
            </div>
            {selected.customerNotes && (
              <p className="text-xs text-gray-400 bg-white/5 border border-white/10 rounded-2xl p-3">
                Note: {selected.customerNotes}
              </p>
            )}
            {selected.bookingId && (
              <button
                onClick={() => navigate(`/admin/bookings/${selected.bookingId}`)}
                className="w-full py-2.5 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all"
              >
                <MapPin size={16} /> Open Booking
              </button>
            )}
          </div>
        )}
      </Modal>
    </Motion.div>
  );
};

export default AdminVisitors;
