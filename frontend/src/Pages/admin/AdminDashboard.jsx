import React, { Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Car, Calendar, DollarSign, TrendingUp, Clock, Star, Wallet } from 'lucide-react';
import { adminAPI } from '../../services/endpoints';
import { CardSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import StatsCard from '../../components/shared/StatsCard';
import { motion as Motion } from 'framer-motion';

// Recharts ships in its own chunk — same pattern as the driver dashboard.
const AdminCharts = lazy(() => import('../../components/charts/AdminCharts'));

const ChartsFallback = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
    {[1, 2].map((i) => <CardSkeleton key={i} />)}
  </div>
);

const AdminDashboard = () => {
  const { data: dashboard, isLoading, isError, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const { data } = await adminAPI.getDashboard();
      return data;
    },
    staleTime: 30_000,
  });

  const stats = dashboard?.stats || {};

  if (isError) return <ErrorState message={error?.message || 'Failed to load dashboard'} />;

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-slate-200/80 mt-1">Overview of your platform performance.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={Users} label="Total Customers" value={stats.totalCustomers || 0} color="indigo" />
          <StatsCard icon={Car} label="Total Drivers" value={stats.totalDrivers || 0} color="emerald" />
          <StatsCard icon={Calendar} label="Total Bookings" value={stats.totalBookings || 0} color="blue" />
          <StatsCard icon={DollarSign} label="Revenue" value={`₹${stats.totalRevenue || 0}`} color="amber" />
          <StatsCard icon={TrendingUp} label="Pending Bookings" value={stats.pendingBookings || 0} color="purple" />
          <StatsCard icon={Clock} label="Pending Drivers" value={stats.pendingDrivers || 0} color="amber" />
          <StatsCard icon={Star} label="Completed Bookings" value={stats.completedBookings || 0} color="emerald" />
          <StatsCard icon={Wallet} label="Cancelled Bookings" value={stats.cancelledBookings || 0} color="rose" />
        </div>
      )}

      {/* Live charts from dashboard stats */}
      {!isLoading && (
        <Suspense fallback={<ChartsFallback />}>
          <AdminCharts stats={stats} />
        </Suspense>
      )}

      {/* Fare & cancellation policy notes */}
      {/* <FareNotes /> */}

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Manage Customers', desc: 'View, block, or unblock customers', link: '/admin/customers', color: 'from-indigo-500/20 to-violet-500/20', border: 'hover:border-violet-500/30' },
          { title: 'Manage Drivers', desc: 'Approve, reject, or manage drivers', link: '/admin/drivers', color: 'from-emerald-500/20 to-teal-500/20', border: 'hover:border-emerald-500/30' },
          { title: 'Manage Vehicles', desc: 'Add, edit, or remove vehicle types', link: '/admin/vehicles', color: 'from-amber-500/20 to-orange-500/20', border: 'hover:border-amber-500/30' },
          { title: 'Bookings', desc: 'View and manage all bookings', link: '/admin/bookings', color: 'from-blue-500/20 to-cyan-500/20', border: 'hover:border-blue-500/30' },
          { title: 'Withdrawals', desc: 'Process driver withdrawal requests', link: '/admin/withdrawals', color: 'from-rose-500/20 to-pink-500/20', border: 'hover:border-rose-500/30' },
          { title: 'Reviews', desc: 'Moderate customer reviews', link: '/admin/reviews', color: 'from-purple-500/20 to-fuchsia-500/20', border: 'hover:border-purple-500/30' },
        ].map((item) => (
          <Link
            key={item.link}
            to={item.link}
            className={`bg-gradient-to-r ${item.color} backdrop-blur-lg rounded-[30px] border border-white/10 p-6 text-white transition-all ${item.border} hover:shadow-[0_0_25px_rgba(34,197,94,0.1)]`}
          >
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </Motion.div>
  );
};

export default AdminDashboard;
