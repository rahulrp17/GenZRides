import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, MapPin, Filter } from 'lucide-react';
import { driverAPI } from '../../services/endpoints';
import { TableSkeleton } from '../../components/shared/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import { motion as Motion } from 'framer-motion';

const DriverHistory = () => {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['driverHistory', page, tab],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (tab === 'today') {
        const { data } = await driverAPI.getTodayHistory(params);
        return data;
      }
      const { data } = await driverAPI.getHistory(params);
      return data;
    },
  });

  const rides = data?.data?.rides || (Array.isArray(data?.data) ? data.data : []) || [];
  const pagination = data?.data?.pagination || {};

  const statusColors = {
    Completed: 'bg-emerald-500/10 text-emerald-400',
    Cancelled: 'bg-red-500/10 text-red-400',
    Reached: 'bg-amber-500/10 text-amber-400',
    'No Show': 'bg-amber-500/10 text-amber-400',
  };

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Ride History</h1>
        <div className="flex gap-1 bg-white/10 rounded-lg p-1 w-full sm:w-auto">
          {['all', 'today'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition ${
                tab === t ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {t === 'all' ? 'All Rides' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : rides.length === 0 ? (
        <EmptyState icon={Clock} title="No rides yet" description="Your ride history will appear here." />
      ) : (
        <>
          <div className="hidden md:block bg-white/5 rounded-2xl shadow-sm border border-white/10 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Route</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Fare</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rides.map((r) => (
                  <tr key={r._id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="truncate max-w-[150px]">{r.pickup?.address}</span>
                        <span className="text-gray-500">→</span>
                        <span className="truncate max-w-[150px]">{r.drop?.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(r.completedAt || r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[r.bookingStatus] || 'bg-white/10 text-gray-400'}`}>
                        {r.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">₹{r.finalFare || 0}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-400">₹{r.driverEarning ?? r.finalFare ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {rides.map((r) => (
              <div key={r._id} className="bg-white/5 rounded-xl p-4 shadow-sm border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[r.bookingStatus] || ''}`}>
                    {r.bookingStatus}
                  </span>
                  <span className="text-sm font-bold text-emerald-400">₹{r.driverEarning ?? r.finalFare ?? 0}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2"><MapPin size={12} className="text-emerald-500" /> <span className="truncate">{r.pickup?.address}</span></div>
                  <div className="flex items-center gap-2"><MapPin size={12} className="text-red-500" /> <span className="truncate">{r.drop?.address}</span></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(r.completedAt || r.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            ))}
          </div>

          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </Motion.div>
  );
};

export default DriverHistory;
