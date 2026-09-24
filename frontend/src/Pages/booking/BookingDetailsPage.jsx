import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  MapPin, Clock, Car, ArrowLeft, Loader2, CheckCircle, Navigation,
  User, Phone, X, CreditCard, CalendarDays, CircleDot, Wifi, WifiOff,
  Copy, Check,
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { bookingAPI, driverAPI, adminAPI } from '../../services/endpoints';
import { useCopyBooking } from '../../utils/bookingText';
import { formatTripDuration } from '../../utils/formatDuration';
import useAuth from '../../hooks/useAuth';
import { useSocket } from '../../Context/SocketContext';
import { CardSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import Modal from '../../components/shared/Modal';
import CancelReasonDialog from '../../components/shared/CancelReasonDialog';
import RideTimeline from '../../components/shared/RideTimeline';
import { BookingStatusBadge } from '../../utils/bookingStatus';
import { fareTotal } from '../../utils/bookingStatusMeta';

const STATUS_ORDER = ['Accepted', 'On The Way', 'Arrived', 'Started', 'Reached', 'Completed'];



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

// Premium role-aware booking details. Data + actions reuse the exact
// endpoints already used by the driver details page and the admin/
// customer list modals — no new APIs, no new business rules.
const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { socket } = useSocket();
  const role = user?.role || 'customer';

  const [cancelOpen, setCancelOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const { copied, copyBooking } = useCopyBooking();

  const detailKey = ['bookingDetails', role, id];
  const invalidateDetail = () => queryClient.invalidateQueries({ queryKey: detailKey });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: detailKey,
    queryFn: async () => {
      const { data } =
        role === 'admin'
          ? await adminAPI.getBooking(id)
          : await bookingAPI.getById(id);
      return data;
    },
    enabled: !!id,
  });

  // Driver online/availability gating for Accept (same as driver details page)
  const { data: profileData } = useQuery({
    queryKey: ['driverProfile'],
    queryFn: async () => {
      const { data } = await driverAPI.getProfile();
      return data;
    },
    enabled: role === 'driver',
  });

  // Online + available approved drivers for admin assign
  const { data: driversData } = useQuery({
    queryKey: ['approvedDrivers'],
    queryFn: async () => {
      const { data } = await adminAPI.getApprovedDrivers();
      return data;
    },
    enabled: role === 'admin',
  });

  useEffect(() => {
    if (!socket || !id) return;
    const handleRideUpdate = () => invalidateDetail();
    socket.on('ride-status-updated', handleRideUpdate);
    socket.on('booking-updated', handleRideUpdate);
    return () => {
      socket.off('ride-status-updated', handleRideUpdate);
      socket.off('booking-updated', handleRideUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, id]);

  const customerCancelMutation = useMutation({
    mutationFn: ({ reason }) => bookingAPI.cancel(id, { cancelReason: reason }),
    onSuccess: () => {
      toast.success('Booking cancelled');
      setCancelOpen(false);
      invalidateDetail();
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to cancel'),
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const { data } = await bookingAPI.accept(id);
      return data;
    },
    onSuccess: () => {
      toast.success('Booking accepted successfully!');
      invalidateDetail();
      queryClient.invalidateQueries({ queryKey: ['driverAvailableBookings'] });
      navigate('/driver/ride');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to accept booking', { duration: 4000 });
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ driverId }) => adminAPI.assignDriver(id, { driverId }),
    onSuccess: () => {
      toast.success('Driver assigned successfully!');
      setAssignOpen(false);
      invalidateDetail();
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to assign driver'),
  });

  const adminCancelMutation = useMutation({
    mutationFn: ({ reason }) => adminAPI.cancelBooking(id, { reason }),
    onSuccess: () => {
      toast.success('Booking cancelled');
      setCancelOpen(false);
      invalidateDetail();
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to cancel booking'),
  });

  if (isError) {
    return <ErrorState message={error?.response?.data?.message || error?.message || 'Failed to load booking'} onRetry={invalidateDetail} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const booking = data?.booking;
  if (!booking) {
    return <ErrorState message="Booking not found" onRetry={invalidateDetail} />;
  }

  const profile = profileData?.data;
  const drivers = driversData?.drivers || driversData || [];
  // Only drivers whose registered cab type matches the booking may be
  // assigned (backend enforces the same guard).
  const requiredVehicleId = booking?.vehicleType?._id || booking?.vehicleType || null;
  const eligibleDrivers = requiredVehicleId
    ? drivers.filter((d) => {
        const typeId = d.vehicleType?._id || d.vehicleType;
        return typeId && typeId.toString() === requiredVehicleId.toString();
      })
    : drivers;
  const currentStatusIndex = STATUS_ORDER.indexOf(booking.bookingStatus);

  const canCustomerCancel = role === 'customer' && ['Pending', 'Accepted'].includes(booking.bookingStatus);
  const canDriverAccept =
    role === 'driver' && booking.bookingStatus === 'Pending' && !booking.driver;
  const canAdminAssign =
    role === 'admin' &&
    !booking.driver &&
    !['Completed', 'Cancelled'].includes(booking.bookingStatus);
  const canAdminCancel =
    role === 'admin' &&
    !['Completed', 'Cancelled'].includes(booking.bookingStatus);

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="bg-white/5 backdrop-blur-lg rounded-[30px] shadow-sm border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-display text-xl font-bold text-white tracking-tight">Booking Details</h2>
              <p className="text-xs text-gray-400 mt-1">#{booking._id?.slice(-8).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyBooking(booking)}
                title="Copy booking details"
                aria-label="Copy booking details"
                className="inline-flex items-center gap-1.5 p-2 min-w-[40px] min-h-[40px] justify-center bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs font-medium hover:bg-white/10 hover:text-white transition"
              >
                {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <BookingStatusBadge status={booking.bookingStatus} />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress timeline */}
          {booking.bookingStatus !== 'Cancelled' && (
            <RideTimeline booking={booking} currentStatusIndex={currentStatusIndex} />
          )}

          {/* Cancellation banner */}
          {booking.bookingStatus === 'Cancelled' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <p className="text-sm font-semibold text-red-300">
                {booking.cancelledBy === 'Driver'
                  ? 'Driver cancelled this ride'
                  : booking.cancelledBy === 'Admin'
                    ? 'Cancelled by admin'
                    : 'Customer cancelled this ride'}
              </p>
              {booking.cancelReason && (
                <p className="text-sm text-slate-200/80 mt-1">Reason: {booking.cancelReason}</p>
              )}
            </div>
          )}

          {/* Route */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Route</h3>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Pickup</p>
                <p className="text-sm font-medium text-white break-words">{booking.pickup?.address || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Drop</p>
                <p className="text-sm font-medium text-white break-words">{booking.drop?.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Trip info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 flex items-center gap-1"><CalendarDays size={12} /> Date</p>
              <p className="text-sm font-medium text-white mt-0.5">{formatDateTime(booking.pickupDateTime)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 flex items-center gap-1"><Navigation size={12} /> Distance</p>
              <p className="text-sm font-medium text-white mt-0.5">{booking.distance?.toFixed(1) ?? 'N/A'} km</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> Duration</p>
              <p className="text-sm font-medium text-white mt-0.5">{formatTripDuration(booking.duration)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 flex items-center gap-1"><CreditCard size={12} /> Total Fare</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">₹{fareTotal(booking).toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Approx ₹{(booking.estimatedFare ?? 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 flex items-center gap-1"><CircleDot size={12} /> Trip Type</p>
              <p className="text-sm font-medium text-white mt-0.5">{booking.tripType || 'N/A'}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> Payment</p>
              <p className="text-sm font-medium text-white mt-0.5">{booking.paymentMethod || 'N/A'}</p>
            </div>
            {(
              booking.vehicleType?.name ||
              booking.driver?.vehicleType?.name
            ) && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-400 flex items-center gap-1"><Car size={12} /> Cab Type</p>
                <p className="text-sm font-medium text-white mt-0.5">{booking.vehicleType?.name || booking.driver.vehicleType.name}</p>
              </div>
            )}
          </div>

          {/* Driver */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Driver</h3>
            {booking.driver?.user ? (
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{booking.driver.user.name || 'N/A'}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Phone size={11} /> {booking.driver.user.phone || 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic bg-white/5 rounded-xl p-3">Not Assigned</p>
            )}
          </div>

          {/* Customer (driver + admin views) */}
          {role !== 'customer' && booking.customer && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Customer</h3>
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{booking.customer.name || 'N/A'}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Phone size={11} /> {booking.customer.phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.customerNotes && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Notes</h3>
              <p className="text-sm text-gray-400 bg-white/5 rounded-xl p-3">{booking.customerNotes}</p>
            </div>
          )}
        </div>

        {/* Role actions */}
        {(canCustomerCancel || canDriverAccept || canAdminAssign || canAdminCancel) && (
          <div className="p-6 border-t border-white/10 space-y-3">
            {canCustomerCancel && (
              <button
                onClick={() => setCancelOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold hover:bg-red-500/30 transition"
              >
                <X size={18} /> Cancel Booking
              </button>
            )}

            {canDriverAccept && (
              <>
                {profile && !profile.isOnline && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
                    <WifiOff size={18} className="text-amber-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-amber-300">You are offline. Accepting requires online status.</p>
                  </div>
                )}
                <button
                  onClick={() => acceptMutation.mutate()}
                  disabled={acceptMutation.isPending || (profile && (!profile.isOnline || !profile.isAvailable))}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {acceptMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  {acceptMutation.isPending ? 'Accepting...' : 'Accept Booking'}
                </button>
              </>
            )}

            {canAdminAssign && (
              <button
                onClick={() => setAssignOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
              >
                Assign Driver
              </button>
            )}

            {canAdminCancel && (
              <button
                onClick={() => setCancelOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-semibold transition"
              >
                <X size={18} /> Cancel Booking
              </button>
            )}
          </div>
        )}
      </div>

      <CancelReasonDialog
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={(reason) => {
          if (role === 'admin') adminCancelMutation.mutate({ reason });
          else customerCancelMutation.mutate({ reason });
        }}
        title="Cancel Booking"
        message={
          role === 'admin'
            ? 'Please provide a cancellation reason. The customer and driver will be notified.'
            : 'Please tell us why you are cancelling. Your driver will be notified immediately.'
        }
        confirmText="Cancel Booking"
        isPending={customerCancelMutation.isPending || adminCancelMutation.isPending}
      />

      <Modal isOpen={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Driver" maxWidth="max-w-md">
        {(booking.vehicleType?.name || booking.driver?.vehicleType?.name) && (
          <p className="text-xs text-gray-400 mb-2">
            Only <span className="font-semibold text-emerald-300">{booking.vehicleType?.name || booking.driver?.vehicleType?.name}</span> drivers can take this ride.
          </p>
        )}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {eligibleDrivers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No {booking.vehicleType?.name || ''} drivers available</p>
          ) : (
            eligibleDrivers.map((driver) => (
              <button
                key={driver._id}
                onClick={() => assignMutation.mutate({ driverId: driver._id })}
                disabled={assignMutation.isPending}
                className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-left disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400 font-semibold text-sm">{driver.user?.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{driver.user?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{driver.vehicleType?.name || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {driver.isOnline && <span className="w-2 h-2 bg-emerald-400 rounded-full" />}
                  <span className="text-xs text-gray-500">{driver.isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </Modal>

      {(!booking.driver || !booking.driver.isAvailable) && role === 'driver' && booking.bookingStatus === 'Pending' && (
        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1.5">
          {profile?.isOnline ? <Wifi size={12} className="text-emerald-400" /> : <WifiOff size={12} className="text-amber-400" />}
          {profile?.isOnline ? 'You are online' : 'You are offline'}
        </p>
      )}
    </Motion.div>
  );
};

export default BookingDetailsPage;
