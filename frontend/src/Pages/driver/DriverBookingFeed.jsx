import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Calendar, MapPin, Clock, Car, Navigation, Ban,
  RefreshCw, Wallet, Sparkles, ArrowRight, Repeat,
  Check, Eye, Loader2,
} from 'lucide-react';
import { bookingAPI, driverAPI } from '../../services/endpoints';
import { TableSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import SearchBar from '../../components/shared/SearchBar';
import ViewToggle from '../../components/shared/ViewToggle';
import GlassTable from '../../components/shared/GlassTable';
import useDebounce from '../../hooks/useDebounce';
import { useSocket } from '../../Context/SocketContext';
import { BookingStatusBadge } from '../../utils/bookingStatus';
import { displayStatus } from '../../utils/bookingStatusMeta';
import { motion as Motion } from 'framer-motion';

const PAY_TABS = [
  { id: 'all', label: 'All rides' },
  { id: 'Cash', label: 'Cash' },
  { id: 'Online', label: 'Online' },
];

const SORTS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'fare', label: 'Highest fare' },
  { id: 'distance', label: 'Shortest trip' },
];

// Parameterized opportunity feed. `mode` picks the source:
// - "instant": verified guest bookings (scope=instant)
// - "customer": registered-customer bookings (scope=customer)
// - "mine": rides assigned to the logged-in driver
const DriverBookingFeed = ({
  mode,
  queryKey,
  storageKey,
  eyebrow,
  title,
  subtitle,
  liveSubtitle,
  actionLabel,
  emptyTitle,
  emptyDescription,
  showStatus = false,
  gateOnActiveRide = true,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [payTab, setPayTab] = useState('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  // Debounced client-side filter over the fetched queue (bounded rows by
  // the API, so no backend round-trip is needed per keystroke).
  const debouncedSearch = useDebounce(search, 300);
  const [view, setView] = useState(
    () => {
      try {
        return localStorage.getItem(storageKey) || 'cards';
      } catch {
        return 'cards';
      }
    }
  );
  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem(storageKey, v);
    } catch {
      // private mode — preference simply won't persist
    }
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      if (mode === 'mine') {
        const { data } = await bookingAPI.getMyDriverBookings({ page: 1, limit: 50 });
        return data;
      }
      const { data } = await bookingAPI.getAvailable({ scope: mode });
      return data;
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    staleTime: 5_000,
  });

  // Active ride gates the available lists — one ride at a time.
  // "My bookings" are the driver's own rides, so they never gate.
  const { data: currentRideData } = useQuery({
    queryKey: ['currentRide'],
    queryFn: async () => {
      const { data } = await driverAPI.getCurrentBooking();
      return data;
    },
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });

  const activeRide = currentRideData?.data;
  const hasActiveRide = gateOnActiveRide && !!activeRide && !['Completed', 'Cancelled'].includes(activeRide.bookingStatus);

  // Reject ≠ Cancel: the request stays open for other drivers (routed via
  // the dispatch queue) but never shows again to the rejecting driver.
  const rejectMutation = useMutation({
    mutationFn: async (id) => (await bookingAPI.reject(id)).data,
    onSuccess: () => {
      toast.success("Request rejected. It won't be shown again.");
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ['currentRide'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to reject request');
    },
  });

  // Only unassigned pending requests can be accepted/rejected. Assigned
  // rides (My Bookings) use the driver-cancel policy instead.
  const canAct = (b) => mode !== 'mine' && !b.driver && b.bookingStatus === 'Pending';

  const [acceptingId, setAcceptingId] = useState(null);
  const acceptMutation = useMutation({
    mutationFn: async (id) => (await bookingAPI.accept(id)).data,
    onSuccess: () => {
      toast.success('Booking accepted successfully!');
      ['driverAvailableBookings', 'driverInstantBookings', 'driverCustomerRequests', 'driverMyBookings', 'currentRide'].forEach((k) =>
        queryClient.invalidateQueries({ queryKey: [k] })
      );
      setAcceptingId(null);
      navigate('/driver/ride');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to accept booking', { duration: 4000 });
      setAcceptingId(null);
    },
  });

  // One-tap accept with the same live-GPS gate as the detail page: seed
  // the backend with a fresh fix (best-effort), then accept. Without a
  // fix, fall through to the detail page which explains the requirement.
  const handleAccept = (id) => {
    if (acceptMutation.isPending) return;
    setAcceptingId(id);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setAcceptingId(null);
      openBooking(id);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await driverAPI.updateLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        } catch {
          // Non-fatal: accept proceeds with the verified live fix.
        }
        acceptMutation.mutate(id);
      },
      () => {
        setAcceptingId(null);
        toast.error('Enable location to accept — opening details.', { duration: 4000 });
        openBooking(id);
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 }
    );
  };

  // Return the list in real time when rides complete/cancel
  useEffect(() => {
    if (!socket) return;
    const handleRideUpdate = () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ['currentRide'] });
    };
    socket.on('ride-status-updated', handleRideUpdate);
    socket.on('booking-updated', handleRideUpdate);
    return () => {
      socket.off('ride-status-updated', handleRideUpdate);
      socket.off('booking-updated', handleRideUpdate);
    };
  }, [socket, queryClient, queryKey]);

  const bookingsSource = data?.bookings;
  const allBookings = useMemo(
    () => (hasActiveRide ? [] : bookingsSource || []),
    [hasActiveRide, bookingsSource]
  );

  const counts = useMemo(() => {
    const c = { all: allBookings.length, Cash: 0, Online: 0 };
    allBookings.forEach((b) => {
      if (b.paymentMethod === 'Cash') c.Cash += 1;
      else if (b.paymentMethod === 'Online') c.Online += 1;
    });
    return c;
  }, [allBookings]);

  const stats = useMemo(() => {
    const total = allBookings.reduce((s, b) => s + (Number(b.estimatedFare) || 0), 0);
    const dist = allBookings.filter((b) => b.distance != null).map((b) => Number(b.distance));
    const avg = dist.length ? dist.reduce((s, d) => s + d, 0) / dist.length : 0;
    return { total, avg };
  }, [allBookings]);

  const bookings = useMemo(() => {
    const list = payTab === 'all' ? [...allBookings] : allBookings.filter((b) => b.paymentMethod === payTab);
    if (sort === 'fare') list.sort((a, b) => (Number(b.estimatedFare) || 0) - (Number(a.estimatedFare) || 0));
    else if (sort === 'distance')
      list.sort((a, b) => (a.distance ?? Number.MAX_SAFE_INTEGER) - (b.distance ?? Number.MAX_SAFE_INTEGER));
    else list.sort((a, b) => new Date(b.createdAt || b.pickupDateTime) - new Date(a.createdAt || a.pickupDateTime));
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return list;
    // Trip types are stored with spaces ("One Way", "Round Trip",
    // "Airport Pickup", "Airport Drop"), so strip spaces/hyphens on both
    // sides — "oneway" and "roundtrip" must match too.
    const norm = (s) => String(s || "").toLowerCase().replace(/[\s_-]+/g, "");
    const nq = norm(q);
    return list.filter((b) =>
      norm(b.pickup?.address).includes(nq) ||
      norm(b.drop?.address).includes(nq) ||
      String(b._id || '').toLowerCase().includes(q) ||
      norm(b.customer?.name).includes(nq) ||
      norm(b.tripType).includes(nq)
    );
  }, [allBookings, payTab, sort, debouncedSearch]);

  if (isError) {
    return <ErrorState message={error?.message || 'Failed to load bookings'} onRetry={refetch} />;
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openBooking = (id) => navigate(`/driver/bookings/${id}`);

  const formatBookedOn = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const TripTypeBadge = ({ type }) => {
    const round = type === 'Round Trip';
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur ${
          round
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
        }`}
      >
        {round ? <Repeat size={12} /> : <ArrowRight size={12} />}
        {type || 'One Way'}
      </span>
    );
  };

  // Table view columns — same data and actions as the cards.
  const bookingColumns = [
    {
      header: 'Booking',
      cell: (b) => (
        <div className="min-w-[130px]">
          <p className="font-mono text-xs text-gray-400">#{b._id?.slice(-6).toUpperCase()}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 whitespace-nowrap">{formatBookedOn(b.createdAt)}</p>
        </div>
      ),
    },
    {
      header: 'Route',
      cell: (b) => (
        <div className="min-w-[180px] max-w-[260px]">
          <p className="text-xs text-gray-300 truncate" title={b.pickup?.address}>
            <span className="text-green-400 font-bold">↑ </span>{b.pickup?.address || 'N/A'}
          </p>
          <p className="text-xs text-gray-300 truncate mt-1" title={b.drop?.address}>
            <span className="text-red-400 font-bold">↓ </span>{b.drop?.address || 'N/A'}
          </p>
        </div>
      ),
    },
    {
      header: 'Customer',
      cell: (b) => (
        <div className="min-w-[120px] max-w-[180px]">
          <p className="text-sm font-semibold text-white truncate">{b.customer?.name || b.guestName || 'Guest'}</p>
          <p className="text-[11px] text-gray-500 truncate">{b.customer?.phone || b.guestPhone || ''}</p>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (b) => <TripTypeBadge type={b.tripType} />,
    },
    ...(showStatus
      ? [
          {
            header: 'Status',
            cell: (b) => <BookingStatusBadge status={b.bookingStatus} size="sm" />,
          },
        ]
      : []),
    {
      header: 'Fare',
      tdClassName: 'text-right',
      thClassName: 'text-right',
      cell: (b) => <span className="font-bold text-white tabular-nums whitespace-nowrap">₹{(b.estimatedFare ?? 0).toLocaleString('en-IN')}</span>,
    },
    {
      header: 'Pickup At',
      cell: (b) => <span className="text-xs text-gray-300 whitespace-nowrap">{formatDateTime(b.pickupDateTime)}</span>,
    },
    {
      header: '',
      tdClassName: 'text-right',
      cell: (b) => {
        const acting = acceptingId === b._id || rejectMutation.isPending;
        return (
          <span className="inline-flex items-center justify-end gap-1.5">
            <button
              onClick={() => openBooking(b._id)}
              title="View details"
              aria-label={`View booking ${b._id?.slice(-6)}`}
              className="p-2 min-w-[40px] min-h-[40px] inline-flex items-center justify-center bg-white/5 border border-white/10 text-gray-300 rounded-2xl text-xs hover:bg-white/10 transition"
            >
              <Eye size={14} />
            </button>
            {canAct(b) && (
              <>
                <button
                  onClick={() => handleAccept(b._id)}
                  disabled={acting}
                  title="Accept request"
                  aria-label={`Accept booking ${b._id?.slice(-6)}`}
                  className="p-2 min-w-[40px] min-h-[40px] inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-xs hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {acceptingId === b._id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                </button>
                <button
                  onClick={() => rejectMutation.mutate(b._id)}
                  disabled={acting}
                  title="Reject request"
                  aria-label={`Reject request ${b._id?.slice(-6)}`}
                  className="p-2 min-w-[40px] min-h-[40px] inline-flex items-center justify-center bg-red-500/15 border border-red-500/25 text-red-300 rounded-2xl text-xs hover:bg-red-500/25 transition disabled:opacity-50"
                >
                  <Ban size={14} />
                </button>
              </>
            )}
          </span>
        );
      },
    },
  ];

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6 min-w-0">
      {/* ── Hero panel: headline + live stats + refresh ─────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-white/5 to-transparent p-4 sm:p-6">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
              <Sparkles size={12} /> {eyebrow}
              <span className="relative flex w-1.5 h-1.5 ml-1">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
            </p>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {title}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {isLoading ? 'Finding rides near you…' : subtitle}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-[380px]">
            <div className="bg-black/30 border border-white/10 rounded-2xl px-3 py-2.5 text-center min-w-0">
              <p className="text-lg sm:text-xl font-bold text-white leading-none">{isLoading ? '–' : allBookings.length}</p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 truncate">Rides open</p>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-2xl px-3 py-2.5 text-center min-w-0">
              <p className="text-lg sm:text-xl font-bold text-emerald-300 leading-none truncate">₹{isLoading ? '–' : stats.total.toLocaleString('en-IN')}</p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 truncate">Potential value</p>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-2xl px-3 py-2.5 text-center min-w-0">
              <p className="text-lg sm:text-xl font-bold text-white leading-none">{isLoading ? '–' : `${stats.avg.toFixed(0)} km`}</p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 truncate">Avg trip</p>
            </div>
          </div>
        </div>
        <div className="relative mt-4 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl px-5 py-2.5 min-h-[44px] text-sm hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            {isFetching ? 'Refreshing…' : 'Refresh now'}
          </button>
          <p className="text-[11px] text-gray-500 self-center hidden md:block">{liveSubtitle}</p>
        </div>
      </div>

      {hasActiveRide && (
        <div className="relative overflow-hidden flex items-start gap-3 bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/30 rounded-3xl p-4 sm:p-5">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400/70 via-amber-400/20 to-transparent" />
          <span className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Ban size={17} className="text-amber-400" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Active ride · {displayStatus(activeRide.bookingStatus)}</p>
            <p className="text-xs text-slate-200/70 mt-1">
              New requests are paused until your current ride completes or is cancelled.
            </p>
            <button
              onClick={() => navigate('/driver/ride')}
              className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-xs font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] active:scale-[0.98] transition-all"
            >
              Go to Current Ride <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Search + filter tabs + sort + view toggle ──────── */}
      {!isLoading && !hasActiveRide && allBookings.length > 0 && (
        <div className="flex flex-col gap-2.5 min-w-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative flex-1 min-w-0">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search pickup, drop, booking ID, customer, trip type…"
              />
              {isFetching && !isLoading && (
                <span className="absolute right-11 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin pointer-events-none" aria-label="Refreshing" />
              )}
            </div>
            <div className="shrink-0">
              <ViewToggle view={view} onChange={changeView} />
            </div>
          </div>
          {debouncedSearch && (
            <p className="text-xs text-gray-400" role="status">
              <span className="text-white font-bold">{bookings.length}</span> result{bookings.length === 1 ? "" : "s"} for{" "}
              <span className="text-emerald-300 font-semibold">“{debouncedSearch}”</span>
            </p>
          )}
          <div className="flex flex-col md:flex-row md:items-center gap-2.5 min-w-0">
          <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-1.5 overflow-x-auto min-w-0" role="tablist" aria-label="Filter by payment">
            {PAY_TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={payTab === t.id}
                onClick={() => setPayTab(t.id)}
                className={`flex-1 md:flex-none whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all ${
                  payTab === t.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_18px_rgba(34,197,94,0.35)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${payTab === t.id ? 'bg-black/25 text-white' : 'bg-white/10 text-gray-400'}`}>
                  {counts[t.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort bookings"
            className="w-full md:w-auto md:ml-auto px-3.5 py-2.5 min-h-[44px] md:min-h-[40px] bg-white/5 border border-white/10 text-gray-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/40"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id} className="bg-gray-900">{s.label}</option>
            ))}
          </select>
          </div>
        </div>
      )}

      {/* ── Feed ────────────────────────────────────────────────── */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={hasActiveRide ? 'Paused while you ride' : debouncedSearch ? 'No matching rides' : payTab === 'all' ? emptyTitle : `No ${payTab} rides right now`}
          description={hasActiveRide ? 'Finish your current ride to see new requests.' : debouncedSearch ? `Nothing matches “${debouncedSearch}”. Try a place, ID, name, or trip type (one way, round trip).` : payTab === 'all' ? emptyDescription : 'Try another payment filter or refresh the feed.'}
          action={
            debouncedSearch && !hasActiveRide ? (
              <button
                onClick={() => setSearch('')}
                className="px-5 py-2.5 min-h-[44px] rounded-2xl bg-white/5 border border-white/15 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Clear search
              </button>
            ) : undefined
          }
        />
      ) : view === 'cards' ? (
        <div className="grid gap-3 sm:gap-4 w-full max-w-6xl">
          {bookings.map((b, i) => (
            <Motion.article
              key={b._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.32 }}
              className="group relative overflow-hidden bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 hover:border-emerald-400/40 hover:shadow-[0_8px_40px_-12px_rgba(34,197,94,0.35)] transition-all duration-300 min-w-0"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
              {/* rank number watermark */}
              <span aria-hidden className="pointer-events-none absolute -right-1 -top-3 text-[64px] sm:text-[76px] font-bold text-white/[0.04] leading-none select-none">
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="relative grid sm:grid-cols-[1fr_212px] min-w-0">
                {/* ── Route side ── */}
                <div className="p-4 sm:p-5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-3 min-w-0">
                    {mode !== 'mine' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 rounded-full text-[11px] font-semibold">
                        <span className="relative flex w-1.5 h-1.5">
                          <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                          <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </span>
                        New request
                      </span>
                    )}
                    <TripTypeBadge type={b.tripType} />
                    {showStatus && <BookingStatusBadge status={b.bookingStatus} size="sm" />}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-gray-500">
                      <Clock size={11} /> {formatDateTime(b.pickupDateTime)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-gray-500" title={`Booked ${formatBookedOn(b.createdAt)}`}>
                      <Calendar size={11} /> Booked {formatBookedOn(b.createdAt)}
                    </span>
                  </div>

                  <div className="relative pl-5 space-y-3 min-w-0">
                    <span aria-hidden className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-green-400/70 via-white/15 to-red-400/70" />
                    <div className="min-w-0">
                      <span aria-hidden className="absolute left-0 mt-1 w-[11px] h-[11px] rounded-full bg-green-400 ring-4 ring-green-400/20" />
                      <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500 font-semibold">Pickup</p>
                      <p className="text-sm font-medium text-white truncate" title={b.pickup?.address}>{b.pickup?.address || 'N/A'}</p>
                    </div>
                    <div className="min-w-0">
                      <span aria-hidden className="absolute left-0 mt-1 w-[11px] h-[11px] rounded-full bg-red-400 ring-4 ring-red-400/20" />
                      <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500 font-semibold">Drop</p>
                      <p className="text-sm font-medium text-white truncate" title={b.drop?.address}>{b.drop?.address || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300">
                      <Navigation size={12} className="text-sky-400 shrink-0" />
                      {b.distance != null ? `${Number(b.distance).toFixed(1)} km` : '—'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300">
                      <Wallet size={12} className="text-amber-400 shrink-0" />
                      {b.paymentMethod || 'Cash'}
                    </span>
                    {b.vehicleType?.name && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-full text-[11px] text-gray-300 max-w-full">
                        <Car size={12} className="text-violet-400 shrink-0" />
                        <span className="truncate">{b.vehicleType.name}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Fare rail: stacks below on mobile, side panel on sm+ ── */}
                <div className="relative flex sm:flex-col items-center sm:items-stretch justify-between gap-3 px-4 py-3.5 sm:p-5 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border-t sm:border-t-0 sm:border-l border-white/10 min-w-0">
                  <div className="min-w-0 sm:text-right">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-semibold">Est. fare</p>
                    <p className="text-2xl sm:text-[26px] font-bold bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent leading-tight">
                      ₹{Number(b.estimatedFare ?? 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 hidden sm:block">Fare locked on accept</p>
                  </div>
                  <button
                    onClick={() => openBooking(b._id)}
                    aria-label={`View booking ${b._id?.slice(-6)}`}
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full bg-white/5 border border-white/10 text-gray-200 rounded-2xl text-sm font-semibold hover:bg-white/10 active:scale-[0.98] transition-all"
                  >
                    <Eye size={15} />
                    <span className="hidden sm:inline">{actionLabel}</span>
                  </button>
                  {canAct(b) && (
                    <button
                      onClick={() => handleAccept(b._id)}
                      disabled={acceptingId === b._id || rejectMutation.isPending}
                      title="Accept request"
                      aria-label={`Accept booking ${b._id?.slice(-6)}`}
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {acceptingId === b._id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Check size={15} />
                      )}
                      <span className="hidden sm:inline">Accept</span>
                    </button>
                  )}
                  {canAct(b) && (
                    <button
                      onClick={() => rejectMutation.mutate(b._id)}
                      disabled={rejectMutation.isPending || acceptingId === b._id}
                      title="Reject request — it stays open for other drivers"
                      aria-label={`Reject request ${b._id?.slice(-6)}`}
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full bg-red-500/15 border border-red-500/25 text-red-300 rounded-2xl text-sm font-semibold hover:bg-red-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <Ban size={15} />
                      <span className="hidden sm:inline">Reject</span>
                    </button>
                  )}
                </div>
              </div>
            </Motion.article>
          ))}
        </div>
      ) : (
        <GlassTable columns={bookingColumns} rows={bookings} rowKey={(b) => b._id} />
      )}
    </Motion.div>
  );
};

export default DriverBookingFeed;
