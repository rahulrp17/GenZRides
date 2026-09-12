import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Calendar, MapPin, Clock, Car, Eye, X, Download, Filter, Copy, Check } from 'lucide-react';
import { bookingAPI, invoiceAPI } from '../../services/endpoints';
import { useCopyBooking } from '../../utils/bookingText';
import { TableSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import Modal from '../../components/shared/Modal';
import CancelReasonDialog from '../../components/shared/CancelReasonDialog';
import { motion as Motion } from 'framer-motion';

const STATUS_COLORS = {
  Pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  Accepted: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'On The Way': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  Arrived: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  Started: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  Reached: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  Completed: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const CustomerBookings = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const { copied, copyBooking } = useCopyBooking();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['myBookings', page, statusFilter],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await bookingAPI.getMyBookings(params);
      return data;
    },
    staleTime: 30000,
    placeholderData: (prev) => prev,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => bookingAPI.cancel(id, { cancelReason: reason }),
    onSuccess: () => {
      toast.success('Booking cancelled');
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      setCancelId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to cancel'),
  });

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const response = await invoiceAPI.download(bookingId);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  const bookings = data?.bookings || [];
  const pagination = { total: data?.total, page: data?.page, totalPages: data?.totalPages };

  if (isError) {
    return <ErrorState message={error?.message || 'Failed to load bookings'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['myBookings'] })} />;
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">My Bookings</h1>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl text-sm outline-none"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="On The Way">On The Way</option>
            <option value="Arrived">Arrived</option>
            <option value="Started">Started</option>
            <option value="Reached">Reached</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {(isLoading || (isFetching && !data)) ? (
        <TableSkeleton rows={5} cols={6} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description={statusFilter ? `No ${statusFilter.toLowerCase()} bookings.` : "You haven't made any bookings yet."}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase">Route</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase">Driver</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase">Cab</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase">Fare</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-green-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((b) => (
                  <tr key={b._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={14} className="text-green-400 shrink-0" />
                        <span className="truncate max-w-[120px] text-gray-300">{b.pickup?.address}</span>
                        <span className="text-gray-500">→</span>
                        <MapPin size={14} className="text-red-400 shrink-0" />
                        <span className="truncate max-w-[120px] text-gray-300">{b.drop?.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatDateTime(b.pickupDateTime)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {b.driver?.user?.name || <span className="text-gray-500 italic">Not assigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                        <Car size={12} className="text-green-400" />
                        {b.vehicleType?.name || b.driver?.vehicleType?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.bookingStatus] || 'bg-white/5 text-gray-400 border border-white/10'}`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      ₹{b.finalFare || b.estimatedFare}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {b.bookingStatus === 'Completed' && (
                          <button
                            onClick={() => handleDownloadInvoice(b._id)}
                            className="p-1.5 text-green-400 hover:text-green-300 hover:bg-white/5 rounded-xl transition"
                            title="Download Invoice"
                          >
                            <Download size={16} />
                          </button>
                        )}
                        {['Pending', 'Accepted'].includes(b.bookingStatus) && (
                          <button
                            onClick={() => setCancelId(b._id)}
                            className="p-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition"
                            title="Cancel"
                          >
                            <X size={16} />
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
              <div key={b._id} className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.bookingStatus] || ''}`}>
                    {b.bookingStatus}
                  </span>
                  <span className="text-sm font-bold text-white">
                    ₹{b.finalFare || b.estimatedFare}
                  </span>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MapPin size={14} className="text-green-400" />
                    <span className="truncate">{b.pickup?.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MapPin size={14} className="text-red-400" />
                    <span className="truncate">{b.drop?.address}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Car size={12} className="text-gray-500 shrink-0" />
                    <span className="text-xs text-gray-400 truncate">{b.driver?.user?.name || 'No driver'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-gray-300 border border-white/10 shrink-0">
                      {b.vehicleType?.name || b.driver?.vehicleType?.name || '—'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedBooking(b)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">
                      <Eye size={14} />
                    </button>
                    {b.bookingStatus === 'Completed' && (
                      <button onClick={() => handleDownloadInvoice(b._id)} className="p-1.5 text-green-400 hover:text-green-300 hover:bg-white/5 rounded-xl transition">
                        <Download size={14} />
                      </button>
                    )}
                    {['Pending', 'Accepted'].includes(b.bookingStatus) && (
                      <button onClick={() => setCancelId(b._id)} className="p-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition">
                        <X size={14} />
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
      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking Details" maxWidth="max-w-xl">
        {selectedBooking && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedBooking.bookingStatus]}`}>
                {selectedBooking.bookingStatus}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyBooking(selectedBooking)}
                  title="Copy booking details"
                  aria-label="Copy booking details"
                  className="inline-flex items-center gap-1.5 p-2 min-w-[40px] min-h-[40px] justify-center bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs font-medium hover:bg-white/10 hover:text-white transition"
                >
                  {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                </button>
                <span className="text-xl font-bold text-white">
                  ₹{selectedBooking.finalFare || selectedBooking.estimatedFare}
                </span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Pickup</p>
                  <p className="text-sm font-medium text-white">{selectedBooking.pickup?.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Drop</p>
                  <p className="text-sm font-medium text-white">{selectedBooking.drop?.address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Trip Type</p>
                <p className="font-medium text-white">{selectedBooking.tripType}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Payment</p>
                <p className="font-medium text-white">{selectedBooking.paymentMethod}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Cab Type</p>
                <p className="font-medium text-white">{selectedBooking.vehicleType?.name || selectedBooking.driver?.vehicleType?.name || 'N/A'}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Distance</p>
                <p className="font-medium text-white">{selectedBooking.distance?.toFixed(1) || 0} km</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Duration</p>
                <p className="font-medium text-white">{selectedBooking.duration != null ? `${Math.ceil(Number(selectedBooking.duration))} min` : 'N/A'}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3">
                <p className="text-gray-500 text-xs">Date</p>
                <p className="font-medium text-white">{formatDateTime(selectedBooking.pickupDateTime)}</p>
              </div>
              {selectedBooking.driver && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3 col-span-2">
                  <p className="text-gray-500 text-xs">Driver</p>
                  <p className="font-medium text-white">{selectedBooking.driver.user?.name || 'N/A'}</p>
                </div>
              )}
              {selectedBooking.customerNotes && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3 col-span-2">
                  <p className="text-gray-500 text-xs">Booking Note</p>
                  <p className="font-medium text-white break-words">{selectedBooking.customerNotes}</p>
                </div>
              )}
            </div>

            {selectedBooking.bookingStatus === 'Cancelled' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-300">
                  {selectedBooking.cancelledBy === 'Driver'
                    ? 'Driver cancelled this ride'
                    : selectedBooking.cancelledBy === 'Admin'
                      ? 'Cancelled by admin'
                      : 'You cancelled this ride'}
                </p>
                {selectedBooking.cancelReason && (
                  <p className="text-sm text-slate-200/80 mt-1">Reason: {selectedBooking.cancelReason}</p>
                )}
              </div>
            )}

            {['Completed'].includes(selectedBooking.bookingStatus) && (
              <button
                onClick={() => handleDownloadInvoice(selectedBooking._id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all font-semibold"
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
        title="Cancel Booking"
        message="Please tell us why you are cancelling. The driver will be notified immediately."
        confirmText="Cancel Booking"
        isPending={cancelMutation.isPending}
      />
    </Motion.div>
  );
};

export default CustomerBookings;
