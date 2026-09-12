import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Car, Navigation, Ban,
  RefreshCw, ChevronRight, Wallet, Sparkles, ArrowRight,
} from 'lucide-react';
import { bookingAPI, driverAPI } from '../../services/endpoints';
import { TableSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import { useSocket } from '../../Context/SocketContext';
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

const DriverBookings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [payTab, setPayTab] = useState('all');
  const [sort, setSort] = useState('newest');

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['driverAvailableBookings'],
    queryFn: async () => {
      const { data } = await bookingAPI.getAvailable();
      return data;
    },
    refetchInterval: 10000,
  });

  // Active ride gates the available list — one ride at a time
  const { data: currentRideData } = useQuery({
    queryKey: ['currentRide'],
    queryFn: async () => {
      const { data } = await driverAPI.getCurrentBooking();
      return data;
    },
    refetchInterval: 10000,
  });

  const activeRide = currentRideData?.data;
  const hasActiveRide = !!activeRide && !['Completed', 'Cancelled'].includes(activeRide.bookingStatus);

  // Return the available list in real time when rides complete/cancel
  useEffect(() => {
    if (!socket) return;
    const handleRideUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['driverAvailableBookings'] });
      queryClient.invalidateQueries({ queryKey: ['currentRide'] });
    };
    socket.on('ride-status-updated', handleRideUpdate);
    socket.on('booking-updated', handleRideUpdate);
    return () => {
      socket.off('ride-status-updated', handleRideUpdate);
      socket.off('booking-updated', handleRideUpdate);
    };
  }, [socket, queryClient]);

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
    return list;
  }, [allBookings, payTab, sort]);

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

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6 min-w-0">
      {/* ── Hero panel: headline + live stats + refresh ─────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-white/5 to-transparent p-4 sm:p-6">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
              <Sparkles size={12} /> Opportunity feed
              <span className="relative flex w-1.5 h-1.5 ml-1">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
            </p>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Available Bookings
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {isLoading ? 'Finding rides near you…' : 'Fresh requests auto-refresh every 10 seconds.'}
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
          <p className="text-[11px] text-gray-500 self-center hidden md:block">Socket live · polling every 10s as backup</p>
        </div>
      </div>

      {hasActiveRide && (
        <div className="relative overflow-hidden flex items-start gap-3 bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/30 rounded-3xl p-4 sm:p-5">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400/70 via-amber-400/20 to-transparent" />
          <span className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Ban size={17} className="text-amber-400" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Active ride · {activeRide.bookingStatus}</p>
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

      {/* ── Filter tabs + sort — scrollable pills on mobile ─────── */}
      {!isLoading && !hasActiveRide && allBookings.length > 0 && (
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
      )}

      {/* ── Feed ────────────────────────────────────────────────── */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={hasActiveRide ? 'Paused while you ride' : payTab === 'all' ? 'No available bookings' : `No ${payTab} rides right now`}
          description={hasActiveRide ? 'Finish your current ride to see new requests.' : payTab === 'all' ? 'There are no pending bookings at the moment. Check back later.' : 'Try another payment filter or refresh the feed.'}
        />
      ) : (
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 rounded-full text-[11px] font-semibold">
                      <span className="relative flex w-1.5 h-1.5">
                        <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </span>
                      New request
                    </span>
                    {b.tripType && (
                      <span className="px-2.5 py-1 bg-white/5 text-gray-300 border border-white/10 rounded-full text-[11px] font-medium truncate max-w-[150px]">
                        {b.tripType}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-gray-500">
                      <Clock size={11} /> {formatDateTime(b.pickupDateTime)}
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
                      ₹{b.estimatedFare ?? 0}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 hidden sm:block">Fare locked on accept</p>
                  </div>
                  <button
                    onClick={() => openBooking(b._id)}
                    aria-label={`View booking ${b._id?.slice(-6)}`}
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[44px] sm:min-h-[42px] sm:w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    <span className="sm:hidden">View</span>
                    <span className="hidden sm:inline">View & Accept</span>
                    <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </Motion.article>
          ))}
        </div>
      )}
    </Motion.div>
  );
};

export default DriverBookings;
