import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, Car, Star, Calendar, BarChart3, MapPin, Award, Wallet, Route } from 'lucide-react';
import { driverAPI } from '../../services/endpoints';
import { CardSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import { motion as Motion } from 'framer-motion';

const Earnings = () => {
  const { data: earnings, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['driverEarnings'],
    queryFn: async () => {
      const { data } = await driverAPI.getEarnings();
      return data;
    },
    staleTime: 30_000,
  });

  const { data: stats } = useQuery({
    queryKey: ['driverStats'],
    queryFn: async () => {
      const { data } = await driverAPI.getStatistics();
      return data;
    },
    staleTime: 30_000,
  });

  if (isError) return <ErrorState message={error?.message || 'Failed to load earnings'} onRetry={refetch} />;

  const data = earnings?.data || {};
  const statistics = stats?.data || {};

  const completedCount = statistics.completedTrips || 0;
  const cancelledCount = statistics.cancelledTrips || 0;
  // True offer acceptance from the backend (accepted dispatches / all
  // offers). Falls back to the local decided-trip ratio if absent.
  const acceptanceRate =
    statistics.acceptanceRate ??
    (completedCount + cancelledCount === 0
      ? 0
      : Number(((completedCount / (completedCount + cancelledCount)) * 100).toFixed(1)));

  const totalTrips = statistics.totalTrips ?? 0;
  const completionRate = statistics.completionRate ?? 0;
  const totalDistance = statistics.totalDistance ?? 0;

  const cards = [
    { Icon: DollarSign, label: 'Today', value: `₹${(data.earnings?.today ?? 0).toLocaleString('en-IN')}`, sub: 'Today earnings', grad: 'from-emerald-500 to-teal-600' },
    { Icon: Calendar, label: 'This Week', value: `₹${(data.earnings?.thisWeek ?? 0).toLocaleString('en-IN')}`, sub: 'Weekly', grad: 'from-indigo-500 to-violet-600' },
    { Icon: BarChart3, label: 'This Month', value: `₹${(data.earnings?.thisMonth ?? 0).toLocaleString('en-IN')}`, sub: 'Monthly', grad: 'from-amber-500 to-orange-600' },
    { Icon: Wallet, label: 'Total Tips', value: `₹${(data.earnings?.tips ?? 0).toLocaleString('en-IN')}`, sub: 'Tips earned', grad: 'from-purple-500 to-fuchsia-600' },
  ];

  const stripStats = [
    { k: 'Total', v: totalTrips, Icon: Car },
    { k: 'Completed', v: statistics.completedTrips ?? 0, Icon: Award },
    { k: 'Completion', v: `${Number(completionRate).toFixed(0)}%`, Icon: BarChart3 },
    { k: 'Distance', v: `${Number(totalDistance).toFixed(0)}km`, Icon: MapPin },
  ];

  const hasData = totalTrips > 0 || (data.earnings?.total ?? 0) > 0;

  return (
    <Motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 sm:space-y-6 min-w-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <TrendingUp size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">Earnings</h1>
          <p className="text-xs sm:text-sm text-gray-400">Your lifetime performance at a glance</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1,2,3,4].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : !hasData ? (
        <EmptyState icon={Wallet} title="No earnings yet" description="Complete your first ride to see earnings here." />
      ) : (
        <>
          {/* Top earnings cards - 2 cols on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {cards.map((card, i) => (
              <Motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="relative overflow-hidden rounded-[20px] sm:rounded-2xl p-4 sm:p-6 border border-white/10 bg-white/5 backdrop-blur-xl"
              >
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent`} />
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${card.grad} flex items-center justify-center mb-3`}>
                  <card.Icon size={18} className="text-white" />
                </div>
                <p className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-gray-400">{card.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1 truncate">{card.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 hidden sm:block">{card.sub}</p>
              </Motion.div>
            ))}
          </div>

          {/* Lifetime + Performance - stack on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div className="bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 p-5 sm:p-6">
              <h3 className="font-display font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                <Award size={16} className="text-green-400" /> Lifetime Stats
              </h3>
              <div className="mt-4 space-y-0 divide-y divide-white/5">
                {[
                  { label: 'Total Earnings', value: `₹${(data.earnings?.total ?? 0).toLocaleString('en-IN')}` },
                  { label: 'Total Trips', value: totalTrips },
                  { label: 'Completed Trips', value: statistics.completedTrips ?? 0 },
                  { label: 'Completion Rate', value: `${Number(completionRate).toFixed(1)}%`, highlight: true },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-3">
                    <span className="text-xs sm:text-sm text-gray-400">{row.label}</span>
                    <span className={`text-sm font-bold ${row.highlight ? 'text-green-400' : 'text-white'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 p-5 sm:p-6">
              <h3 className="font-display font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                <Route size={16} className="text-indigo-400" /> Performance
              </h3>
              <div className="mt-4 space-y-0 divide-y divide-white/5">
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs sm:text-sm text-gray-400">Rating</span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                    <Star size={14} className="fill-amber-400 text-amber-400" /> {(statistics.rating ?? 5).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs sm:text-sm text-gray-400">Total Ratings</span>
                  <span className="text-sm font-bold text-white">{statistics.totalRatings ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs sm:text-sm text-gray-400">Distance Covered</span>
                  <span className="text-sm font-bold text-white">{Number(totalDistance).toFixed(1)} km</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs sm:text-sm text-gray-400">Acceptance Rate</span>
                  <span className="text-sm font-bold text-emerald-400">{acceptanceRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats strip - always 2 cols on mobile for readability */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stripStats.map((s) => (
              <div key={s.k} className="bg-black/20 border border-white/10 rounded-2xl p-3 sm:p-4 text-center">
                <s.Icon size={16} className="mx-auto text-gray-500 mb-1" />
                <p className="text-[11px] uppercase tracking-widest text-gray-500">{s.k}</p>
                <p className="text-sm sm:text-base font-bold text-white mt-0.5">{s.v}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Motion.div>
  );
};

export default Earnings;
