import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Clock, MapPin, Star, X, Eye, Download, Filter, RefreshCw } from 'lucide-react';
import { historyAPI, bookingAPI, invoiceAPI } from '../../services/endpoints';
import { useSocket } from '../../Context/SocketContext';
import { TableSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import Modal from '../../components/shared/Modal';
import CancelReasonDialog from '../../components/shared/CancelReasonDialog';
import { BookingStatusBadge } from '../../utils/bookingStatus';
import { motion as Motion } from 'framer-motion';

const RideHistory = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const queryClient = useQueryClient();

  const { socket } = useSocket();
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['rideHistory', page, statusFilter],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await historyAPI.getAll(params);
      return data;
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (!socket) return;
    const onUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['rideHistory'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    };
    socket.on('booking-updated', onUpdate);
    socket.on('ride-status-updated', onUpdate);
    socket.on('notification', onUpdate);
    const onVis = () => { if (document.visibilityState === 'visible') {
      queryClient.invalidateQueries({ queryKey: ['rideHistory'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    }};
    document.addEventListener('visibilitychange', onVis);
    return () => {
      socket.off('booking-updated', onUpdate);
      socket.off('ride-status-updated', onUpdate);
      socket.off('notification', onUpdate);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [socket, queryClient]);

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => bookingAPI.cancel(id, { cancelReason: reason }),
    onSuccess: () => {
      toast.success('Booking cancelled');
      queryClient.invalidateQueries({ queryKey: ['rideHistory'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      setCancelId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to cancel'),
  });

  const handleDownloadInvoice = async (bookingId) => {
    let url = null;
    try {
      const response = await invoiceAPI.download(bookingId);
      url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Failed to download invoice');
    } finally {
      if (url) setTimeout(() => window.URL.revokeObjectURL(url), 4000);
    }
  };

  const bookings = data?.data || [];
  const pagination = data?.pagination || {};

  if (isError) return <ErrorState message={error?.message || 'Failed to load ride history'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['rideHistory'] })} />;

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Ride History</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['rideHistory'] })}
            disabled={isFetching}
            title="Refresh"
            className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <Filter size={16} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {(isLoading || (isFetching && !data)) ? (
        <TableSkeleton rows={5} cols={5} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No rides found"
          description="You haven't taken any rides yet."
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white/5 backdrop-blur-lg rounded-2xl shadow-sm border border-white/10 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Route</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Fare</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={14} className="text-emerald-500 shrink-0" />
                        <span className="truncate max-w-[120px]">{b.pickup?.address}</span>
                        <span className="text-gray-500">→</span>
                        <MapPin size={14} className="text-red-500 shrink-0" />
                        <span className="truncate max-w-[120px]">{b.drop?.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(b.pickupDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <BookingStatusBadge status={b.bookingStatus} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      {b.finalFare > 0 ? `₹${Number(b.finalFare).toLocaleString('en-IN')}` : `₹${Number(b.estimatedFare ?? 0).toLocaleString('en-IN')}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={16} className="text-gray-400" />
                        </button>
                        {b.bookingStatus === 'Completed' && (
                          <button
                            onClick={() => handleDownloadInvoice(b._id)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition"
                            title="Download Invoice"
                          >
                            <Download size={16} className="text-indigo-400" />
                          </button>
                        )}
                        {['Pending', 'Accepted'].includes(b.bookingStatus) && (
                          <button
                            onClick={() => setCancelId(b._id)}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg transition"
                            title="Cancel"
                          >
                            <X size={16} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {bookings.map((b) => (
              <div key={b._id} className="bg-white/5 backdrop-blur-lg rounded-xl p-4 shadow-sm border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <BookingStatusBadge status={b.bookingStatus} size="sm" />
                  <span className="text-sm font-bold text-white">
                    {b.finalFare > 0 ? `₹${Number(b.finalFare).toLocaleString('en-IN')}` : `₹${Number(b.estimatedFare ?? 0).toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin size={14} className="text-emerald-500" />
                    <span className="truncate">{b.pickup?.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin size={14} className="text-red-500" />
                    <span className="truncate">{b.drop?.address}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-400 shrink-0">
                    {new Date(b.pickupDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedBooking(b)} aria-label="View details" className="p-2 hover:bg-white/10 rounded-lg">
                      <Eye size={14} className="text-gray-400" />
                    </button>
                    {b.bookingStatus === 'Completed' && (
                      <button onClick={() => handleDownloadInvoice(b._id)} aria-label="Download invoice" className="p-2 hover:bg-white/10 rounded-lg">
                        <Download size={14} className="text-indigo-400" />
                      </button>
                    )}
                    {['Pending', 'Accepted'].includes(b.bookingStatus) && (
                      <button onClick={() => setCancelId(b._id)} aria-label="Cancel ride" className="p-2 hover:bg-red-500/10 rounded-lg">
                        <X size={14} className="text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Ride Details" maxWidth="max-w-xl">
        {selectedBooking && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <BookingStatusBadge status={selectedBooking.bookingStatus} />
              <span className="text-xl font-bold text-white">
                ₹{selectedBooking.finalFare || selectedBooking.estimatedFare}
              </span>
            </div>

            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-400">Pickup</p>
                  <p className="text-sm font-medium text-white">{selectedBooking.pickup?.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-400">Drop</p>
                  <p className="text-sm font-medium text-white">{selectedBooking.drop?.address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Trip Type</p>
                <p className="font-medium">{selectedBooking.tripType}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Payment</p>
                <p className="font-medium">{selectedBooking.paymentMethod}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Distance</p>
                <p className="font-medium">{selectedBooking.distance?.toFixed(1) || 0} km</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Date</p>
                <p className="font-medium">{new Date(selectedBooking.pickupDateTime).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {selectedBooking.rating && (
              <div className="bg-amber-500/10 rounded-xl p-4">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < selectedBooking.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-500'} />
                  ))}
                </div>
                {selectedBooking.review && <p className="text-sm text-gray-400">{selectedBooking.review}</p>}
              </div>
            )}

            {['Completed'].includes(selectedBooking.bookingStatus) && (
              <button
                onClick={() => handleDownloadInvoice(selectedBooking._id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-indigo-500/30 text-indigo-400 rounded-xl hover:bg-indigo-500/10 transition font-medium"
              >
                <Download size={16} /> Download Invoice
              </button>
            )}
          </div>
        )}
      </Modal>

      <CancelReasonDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={(reason) => cancelMutation.mutate({ id: cancelId, reason })}
        title="Cancel Ride"
        message="Please tell us why you are cancelling. The driver will be notified immediately."
        confirmText="Cancel Ride"
        isPending={cancelMutation.isPending}
      />
    </Motion.div>
  );
};

export default RideHistory;
