import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Zap, Mail, Phone, Calendar } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useSocket } from '../../Context/SocketContext';
import { adminAPI } from '../../services/endpoints';
import { CardSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';

const STATUS_STYLES = {
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  Accepted: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
  'On The Way': 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
  Arrived: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  Started: 'bg-violet-500/15 text-violet-300 border-violet-400/30',
  Reached: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  Completed: 'bg-green-500/15 text-green-300 border-green-400/30',
  Cancelled: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
};

const initials = (name) =>
  (name || 'G').split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'G';

const timeAgo = (iso) => {
  if (!iso) return '';
  const mins = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const fmtWhen = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

const InstantCustomers = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data: dashboard, isLoading, isError, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const { data } = await adminAPI.getDashboard();
      return data;
    },
    staleTime: 30_000,
  });

  // Live: a fresh guest request (or any booking/status change) refreshes the
  // Instant Customers feed the moment it lands, without a manual reload.
  useEffect(() => {
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    socket.on('new-booking', refresh);
    socket.on('booking-created', refresh);
    socket.on('booking-updated', refresh);
    socket.on('ride-status-updated', refresh);
    return () => {
      socket.off('new-booking', refresh);
      socket.off('booking-created', refresh);
      socket.off('booking-updated', refresh);
      socket.off('ride-status-updated', refresh);
    };
  }, [socket, queryClient]);

  if (isError) return <ErrorState message={error?.message || 'Failed to load instant customers'} />;

  const bookers = dashboard?.stats?.instantBookers || [];
  const bookersCount = dashboard?.stats?.instantBookersCount || 0;

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold text-white tracking-tight">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/25 to-teal-500/25 border border-white/10 flex items-center justify-center">
              <Zap size={18} className="text-emerald-300" />
            </span>
            Instant Customers
            <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-400/25 rounded-full px-2.5 py-0.5">
              {bookersCount}
            </span>
          </h1>
          <p className="text-sm text-slate-200/70 mt-1">
            Guests booking instantly without an account — the guest details live here, not in Manage Customers.
          </p>
        </div>
        <Link
          to="/admin/bookings"
          className="inline-flex items-center gap-1 text-sm text-gray-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-400/30 rounded-full px-3.5 py-1.5 transition"
        >
          View all bookings <span aria-hidden>→</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : bookers.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl px-6">
          <span className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-3">
            <Users size={22} className="text-gray-500" />
          </span>
          <p className="text-gray-400 text-sm">No guest bookings yet.</p>
          <p className="text-gray-600 text-xs mt-1">When a guest books without logging in, they appear here instantly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {bookers.map((b) => {
            const name = b.guestName || b.customer?.name || 'Guest';
            const phone = b.guestPhone || b.customer?.phone || '';
            const email = b.guestEmail || '';
            const status = b.bookingStatus || 'Pending';
            return (
              <article
                key={b._id}
                className="relative overflow-hidden bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 rounded-2xl p-4 space-y-3 hover:border-emerald-400/30 hover:shadow-[0_0_25px_rgba(34,197,94,0.08)] transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400/25 to-teal-500/25 border border-white/15 flex items-center justify-center text-emerald-300 font-display font-bold shrink-0">
                      {initials(name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-[15px] truncate">{name}</p>
                      {phone && (
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 min-w-0">
                          <Phone size={11} className="shrink-0 text-green-400/80" />
                          <a href={`tel:${phone}`} className="truncate hover:text-emerald-300 transition">{phone}</a>
                        </p>
                      )}
                      {email && (
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1 min-w-0">
                          <Mail size={11} className="shrink-0 text-blue-400/80" />
                          <span className="truncate">{email}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-sky-300 bg-sky-500/15 border border-sky-400/25 rounded-full px-2.5 py-1">
                    Guest
                  </span>
                </div>

                <div className="space-y-1.5 text-[12px] min-w-0">
                  <div className="flex items-center gap-2 text-gray-300 min-w-0">
                    <span aria-hidden className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="truncate">{b.pickup?.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 min-w-0">
                    <span aria-hidden className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="truncate">{b.drop?.address}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {fmtWhen(b.pickupDateTime) && (
                    <span className="text-[10px] text-gray-400 bg-black/25 border border-white/10 rounded-full px-2 py-0.5">
                      {fmtWhen(b.pickupDateTime)}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 bg-black/25 border border-white/10 rounded-full px-2 py-0.5">
                    {b.tripType || 'One Way'}
                    {b.tripType === 'Round Trip' && b.days > 1 ? ` · ${b.days}d` : ''}
                  </span>
                  {b.vehicleType?.name && (
                    <span className="text-[10px] text-gray-400 bg-black/25 border border-white/10 rounded-full px-2 py-0.5">
                      {b.vehicleType.name}
                    </span>
                  )}
                  <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}>
                    {status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-2.5">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Calendar size={11} className="text-gray-600" />
                    {timeAgo(b.createdAt)}
                  </span>
                  <span className="font-display text-lg font-bold text-emerald-300">₹{b.estimatedFare || 0}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Motion.div>
  );
};

export default InstantCustomers;