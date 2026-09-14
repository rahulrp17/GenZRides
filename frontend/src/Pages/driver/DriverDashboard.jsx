import React, { Suspense, lazy, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Car, Clock, Wallet, Star, TrendingUp, MapPin, ArrowRight, BarChart3, CircleDollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { driverAPI } from '../../services/endpoints';
import { CardSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import StatsCard from '../../components/shared/StatsCard';
import useAuth from '../../hooks/useAuth';
import { motion as Motion } from 'framer-motion';

const DriverCharts = lazy(() => import('../../components/charts/DriverCharts'));
const DriverPie = lazy(() =>
  import('../../components/charts/DriverCharts').then((m) => ({ default: m.DriverPie }))
);

const ChartFallback = () => (
  <div className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-6 flex items-center justify-center min-h-[200px] sm:min-h-[280px]">
    <div className="w-8 h-8 border-4 border-white/20 border-t-green-500 rounded-full animate-spin" />
  </div>
);

const EmptyDashboard = ({ name }) => (
  <div className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-8 sm:p-12 text-center">
    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
      <Car size={28} className="text-green-400" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">Welcome aboard, {name}!</h3>
    <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6">
      Your dashboard will come alive once you complete your first ride. Go online and start earning!
    </p>
    <Link
      to="/driver/ride"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
    >
      Go to Current Ride <ArrowRight size={16} />
    </Link>
  </div>
);

const DriverDashboard = () => {
  const { user } = useAuth();

  const { data: dashboard, isLoading, isError: dashError, error: dashErr, refetch } = useQuery({
    queryKey: ['driverDashboard'],
    queryFn: async () => {
      const { data } = await driverAPI.getDashboard();
      return data;
    },
    refetchOnWindowFocus: true,
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

  const { data: currentBooking } = useQuery({
    queryKey: ['currentRide'],
    queryFn: async () => {
      const { data } = await driverAPI.getCurrentBooking();
      return data;
    },
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });

  if (dashError) return <ErrorState message={dashErr?.message || 'Failed to load dashboard'} onRetry={refetch} />;

  const d = dashboard?.data || {};
  const s = stats?.data || {};

  const todayEarnings = d.statistics?.todayEarnings ?? 0;
  const weekEarnings = d.statistics?.weekEarnings ?? s.weekEarnings ?? 0;
  const monthEarnings = d.statistics?.monthEarnings ?? s.monthEarnings ?? 0;
  const totalEarnings = d.statistics?.totalEarnings ?? s.totalEarnings ?? 0;
  const totalTips = d.statistics?.totalTips ?? s.totalTips ?? 0;

  const totalTrips = d.statistics?.totalTrips ?? s.totalTrips ?? 0;
  const completedTrips = d.statistics?.completedTrips ?? s.completedTrips ?? 0;
  const cancelledTrips = d.statistics?.cancelledTrips ?? s.cancelledTrips ?? 0;

  const completionRate = d.statistics?.completionRate ?? 0;
  const cancellationRate = totalTrips > 0 ? Math.round((cancelledTrips / totalTrips) * 100 * 100) / 100 : 0;

  const rating = d.profile?.rating ?? s.rating ?? 5;

  const hasAnyData = totalTrips > 0 || totalEarnings > 0;

  const earningsData = useMemo(() => [
    { name: 'Today', amount: todayEarnings },
    { name: 'This Week', amount: weekEarnings },
    { name: 'This Month', amount: monthEarnings },
    { name: 'All Time', amount: totalEarnings },
  ], [todayEarnings, weekEarnings, monthEarnings, totalEarnings]);

  const tripsData = useMemo(() => [
    { name: 'Completed', value: completedTrips },
    { name: 'Cancelled', value: cancelledTrips },
  ], [completedTrips, cancelledTrips]);

  const rateData = useMemo(() => (completionRate > 0 || cancellationRate > 0
    ? [
        { name: 'Completed', value: completionRate },
        { name: 'Cancelled', value: cancellationRate },
      ]
    : []), [completionRate, cancellationRate]);

  const hasEarningsData = useMemo(() => earningsData.some((e) => e.amount > 0), [earningsData]);
  const hasTripsData = useMemo(() => tripsData.some((t) => t.value > 0), [tripsData]);

  const breakdownItems = useMemo(() => [
    { label: 'Total Earnings', value: totalEarnings, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    { label: 'This Week', value: weekEarnings, color: 'bg-indigo-500', textColor: 'text-indigo-400' },
    { label: 'This Month', value: monthEarnings, color: 'bg-amber-500', textColor: 'text-amber-400' },
    { label: 'Total Tips', value: totalTips, color: 'bg-purple-500', textColor: 'text-purple-400' },
  ], [totalEarnings, weekEarnings, monthEarnings, totalTips]);

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">Welcome, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-sm text-slate-200/80 mt-1">Here&apos;s your driving overview.</p>
      </div>

      {isLoading ? (
        <div className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1,2,3,4].map((i) => <CardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      ) : !hasAnyData ? (
        <EmptyDashboard name={user?.name?.split(' ')[0] || 'Driver'} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatsCard icon={Car} label="Total Trips" value={totalTrips} color="emerald" />
            <StatsCard icon={CircleDollarSign} label="Today Earnings" value={`₹${todayEarnings.toLocaleString('en-IN')}`} color="indigo" />
            <StatsCard icon={Star} label="Rating" value={rating.toFixed(1)} color="amber" />
            <StatsCard icon={Clock} label="Completed" value={completedTrips} color="blue" />
          </div>

          {currentBooking?.data && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-[30px] p-5 sm:p-6 text-white">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <h3 className="font-semibold text-sm sm:text-base">Active Ride</h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} className="shrink-0 mt-0.5" /> <span className="truncate" title={currentBooking.data.pickup?.address}>{currentBooking.data.pickup?.address}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} className="shrink-0 mt-0.5" /> <span className="truncate" title={currentBooking.data.drop?.address}>{currentBooking.data.drop?.address}</span>
                </div>
              </div>
              <Link to="/driver/ride" className="inline-flex items-center gap-2 mt-3 sm:mt-4 px-4 py-2 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition">
                View Details <ArrowRight size={14} />
              </Link>
            </div>
          )}

          <Suspense fallback={<ChartFallback />}>
            <DriverCharts
              earningsData={earningsData}
              hasEarningsData={hasEarningsData}
              tripsData={tripsData}
              hasTripsData={hasTripsData}
            />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <Suspense fallback={<ChartFallback />}>
              <DriverPie rateData={rateData} />
            </Suspense>

            <div className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-5 sm:p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm sm:text-base">
                <BarChart3 size={18} className="text-green-400" /> Earnings Breakdown
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {breakdownItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-xs sm:text-sm text-gray-400">{item.label}</span>
                    </div>
                    <span className={`text-sm font-semibold ${item.textColor}`}>₹{item.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Link to="/driver/ride" className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:border-green-400/40 rounded-[30px] p-5 sm:p-6 transition text-center">
              <Car className="mx-auto mb-3 text-emerald-400 group-hover:scale-110 transition-transform" size={28} />
              <h3 className="font-semibold text-white text-sm sm:text-base">Current Ride</h3>
              <p className="text-xs sm:text-sm text-slate-200/70 mt-1">View active ride</p>
            </Link>
            <Link to="/driver/earnings" className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:border-green-400/40 rounded-[30px] p-5 sm:p-6 transition text-center">
              <Wallet className="mx-auto mb-3 text-indigo-400 group-hover:scale-110 transition-transform" size={28} />
              <h3 className="font-semibold text-white text-sm sm:text-base">Earnings</h3>
              <p className="text-xs sm:text-sm text-slate-200/70 mt-1">View earnings report</p>
            </Link>
            <Link to="/driver/wallet" className="group bg-white/5 backdrop-blur-lg border border-white/10 hover:border-green-400/40 rounded-[30px] p-5 sm:p-6 transition text-center">
              <Star className="mx-auto mb-3 text-amber-400 group-hover:scale-110 transition-transform" size={28} />
              <h3 className="font-semibold text-white text-sm sm:text-base">Wallet</h3>
              <p className="text-xs sm:text-sm text-slate-200/70 mt-1">Manage withdrawals</p>
            </Link>
          </div>
        </>
      )}
    </Motion.div>
  );
};

export default DriverDashboard;
