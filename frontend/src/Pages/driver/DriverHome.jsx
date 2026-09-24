import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Car, Clock, Wallet, Star, TrendingUp, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { driverAPI } from '../../services/endpoints';
import { CardSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import StatsCard from '../../components/shared/StatsCard';
import useAuth from '../../hooks/useAuth';
import { motion as Motion } from 'framer-motion';

const DriverHome = () => {
  const { user } = useAuth();

  const { data: dashboard, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['driverDashboard'],
    queryFn: async () => {
      const { data } = await driverAPI.getDashboard();
      return data;
    },
  });

  const { data: currentBooking } = useQuery({
    queryKey: ['currentRide'],
    queryFn: async () => {
      const { data } = await driverAPI.getCurrentBooking();
      return data;
    },
    refetchInterval: 5000,
  });

  if (isError) return <ErrorState message={error?.message || 'Failed to load home'} onRetry={refetch} />;

  const stats = dashboard?.data || {};

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-sm text-slate-200/80 mt-1">Here's your driving overview.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={Car} label="Total Trips" value={stats.totalTrips || 0} color="emerald" />
          <StatsCard icon={TrendingUp} label="Today Earnings" value={`₹${Number(stats.todayEarnings || 0).toLocaleString('en-IN')}`} color="indigo" />
          <StatsCard icon={Star} label="Rating" value={stats.rating?.toFixed(1) || '5.0'} color="amber" />
          <StatsCard icon={Clock} label="Completed" value={stats.completedTrips || 0} color="blue" />
        </div>
      )}

      {currentBooking?.data && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-[30px] p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <h3 className="font-semibold">Active Ride</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} /> {currentBooking.data.pickup?.address}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} /> {currentBooking.data.drop?.address}
            </div>
          </div>
          <Link
            to="/driver/ride"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition"
          >
            View Details <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/driver/ride" className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-green-400/40 rounded-[30px] p-6 transition text-center">
          <Car className="mx-auto mb-3 text-emerald-400" size={32} />
          <h3 className="font-semibold text-white">Current Ride</h3>
          <p className="text-sm text-slate-200/70 mt-1">View active ride</p>
        </Link>
        <Link to="/driver/earnings" className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-green-400/40 rounded-[30px] p-6 transition text-center">
          <Wallet className="mx-auto mb-3 text-indigo-400" size={32} />
          <h3 className="font-semibold text-white">Earnings</h3>
          <p className="text-sm text-slate-200/70 mt-1">View earnings report</p>
        </Link>
        <Link to="/driver/wallet" className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-green-400/40 rounded-[30px] p-6 transition text-center">
          <Star className="mx-auto mb-3 text-amber-400" size={32} />
          <h3 className="font-semibold text-white">Wallet</h3>
          <p className="text-sm text-slate-200/70 mt-1">Manage withdrawals</p>
        </Link>
      </div>
    </Motion.div>
  );
};

export default DriverHome;
