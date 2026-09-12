import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { bookingAPI } from '../../services/endpoints';
import { TableSkeleton } from '../../components/shared/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import { motion as Motion } from 'framer-motion';

const WalletPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const { data } = await bookingAPI.getMyBookings({ page: 1, limit: 100 });
      return data;
    },
  });

  const bookings = data?.bookings || [];
  const completedBookings = bookings.filter((b) => b.bookingStatus === 'Completed' && b.paymentStatus === 'Paid');
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.finalFare || 0), 0);
  const totalTips = completedBookings.reduce((sum, b) => sum + (b.tipAmount || 0), 0);

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-white tracking-tight">Wallet</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white">
          <Wallet size={24} className="mb-3 opacity-80" />
          <p className="text-sm opacity-80">Total Spent</p>
          <p className="text-2xl font-bold mt-1">₹{totalSpent}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-white/10">
          <TrendingUp size={24} className="text-emerald-500 mb-3" />
          <p className="text-sm text-gray-400">Tips Given</p>
          <p className="text-2xl font-bold text-white mt-1">₹{totalTips}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-white/10">
          <TrendingDown size={24} className="text-blue-500 mb-3" />
          <p className="text-sm text-gray-400">Total Rides</p>
          <p className="text-2xl font-bold text-white mt-1">{completedBookings.length}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-sm border border-white/10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
        </div>
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={3} cols={4} /></div>
        ) : completedBookings.length === 0 ? (
          <EmptyState icon={Wallet} title="No transactions yet" description="Your payment history will show here." />
        ) : (
          <div className="divide-y divide-white/10">
            {completedBookings.slice(0, 10).map((b) => (
              <div key={b._id} className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 hover:bg-white/5 transition min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <ArrowUpRight size={18} className="text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">Ride Payment</p>
                    <p className="text-xs text-gray-400 truncate max-w-[40vw] sm:max-w-[200px]">
                      {b.pickup?.address} → {b.drop?.address}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-red-400">-₹{b.finalFare}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(b.completedAt || b.updatedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Motion.div>
  );
};

export default WalletPage;
