import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { MapPin, Clock, Car, ArrowLeft, Loader2, CheckCircle, Navigation, User, Wifi, WifiOff, Copy, Check } from 'lucide-react';
import { bookingAPI, driverAPI } from '../../services/endpoints';
import { useCopyBooking } from '../../utils/bookingText';
import { formatTripDuration } from '../../utils/formatDuration';
import { CardSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import { motion as Motion } from 'framer-motion';

const DriverBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['driverBookingDetail', id],
    queryFn: async () => {
      const { data } = await bookingAPI.getById(id);
      return data;
    },
  });

  const { data: profileData } = useQuery({
    queryKey: ['driverProfile'],
    queryFn: async () => {
      const { data } = await driverAPI.getProfile();
      return data;
    },
  });

  const onlineMutation = useMutation({
    mutationFn: async (goOnline) => {
      if (goOnline) return (await driverAPI.goOnline()).data;
      return (await driverAPI.goOffline()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverProfile'] });
      toast.success('Status updated');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const { data } = await bookingAPI.accept(id);
      return data;
    },
    onSuccess: () => {
      toast.success('Booking accepted successfully!');
      queryClient.invalidateQueries({ queryKey: ['driverAvailableBookings'] });
      queryClient.invalidateQueries({ queryKey: ['driverBookingDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['driverCurrentBooking'] });
      navigate('/driver/ride');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to accept booking';
      toast.error(msg, { duration: 4000 });
    },
  });

  const booking = data?.booking;
  const profile = profileData?.data;
  const { copied, copyBooking } = useCopyBooking();

  // Location gate: accepting requires a live GPS fix (used for dispatch
  // accuracy and trip tracking). 'needed' shows the enable-location prompt.
  const [locCheck, setLocCheck] = useState('idle');
   const statusColors = {
    Pending: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    Accepted: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    "On The Way":
      "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    Arrived: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
    Started: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
    Reached: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    Completed:
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    Cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  const handleAccept = () => {
    if (acceptMutation.isPending || locCheck === 'checking') return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocCheck('needed');
      return;
    }
    setLocCheck('checking');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // Seed the backend with this fix (best-effort), then accept.
        try {
          await driverAPI.updateLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        } catch {
          // Non-fatal: accept proceeds with the verified live fix.
        }
        setLocCheck('idle');
        acceptMutation.mutate();
      },
      () => setLocCheck('needed'),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 }
    );
  };

  if (isError) {
    return <ErrorState message={error?.response?.data?.message || error?.message || 'Failed to load booking'} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!booking) {
    return <ErrorState message="Booking not found" />;
  }

  const canAccept = booking.bookingStatus === 'Pending' && !booking.driver;
  const isOnline = profile?.isOnline;
  const isAvailable = profile?.isAvailable;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="bg-white/5 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-white">Booking Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyBooking(booking)}
                title="Copy booking details"
                aria-label="Copy booking details"
                className="hidden items-center gap-1.5 p-2 min-w-[40px] min-h-[40px] justify-center bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs font-medium hover:bg-white/10 hover:text-white transition"
              >
                {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <span className={`px-3 py-1 rounded-full text-md font-medium ${statusColors[booking.bookingStatus]}`}>
                {booking.bookingStatus}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">#{booking._id?.slice(-8).toUpperCase()}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Route */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Route</h3>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Pickup</p>
                <p className="text-sm font-medium text-white">{booking.pickup?.address || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Drop</p>
                <p className="text-sm font-medium text-white">{booking.drop?.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Trip Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400">Date & Time</p>
              <p className="text-sm font-medium">{formatDateTime(booking.pickupDateTime)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400">Trip Type</p>
              <p className="text-sm font-medium">{booking.tripType}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400">Cab Type</p>
              <p className="text-sm font-medium">{booking.vehicleType?.name || booking.driver?.vehicleType?.name || 'N/A'}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400">Distance</p>
              <p className="text-sm font-medium">{booking.distance?.toFixed(1)} km</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400">Duration</p>
              <p className="text-sm font-medium">{formatTripDuration(booking.duration)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400">Payment</p>
              <p className="text-sm font-medium">{booking.paymentMethod}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400">Fare</p>
              <p className="text-sm font-bold text-emerald-400">₹{booking.estimatedFare}</p>
            </div>
          </div>

          {/* Customer Info */}
          {booking.customer && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Customer</h3>
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <User size={18} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{booking.customer.name || 'N/A'}</p>
                  <p className="text-xs text-gray-400">{booking.customer.phone || 'N/A'}</p>
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

        {/* Accept Button */}
        {canAccept && (
          <div className="p-6 border-t border-white/10 space-y-3">
            {!isOnline && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
                <WifiOff size={18} className="text-amber-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-300">You are offline</p>
                  <p className="text-xs text-amber-400">Go online to accept bookings.</p>
                </div>
                <button
                  onClick={() => onlineMutation.mutate(true)}
                  disabled={onlineMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {onlineMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
                  Go Online
                </button>
              </div>
            )}

            {isOnline && !isAvailable && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
                <Car size={18} className="text-amber-400 flex-shrink-0" />
                <p className="text-sm font-medium text-amber-300">You are currently on another ride. Complete it first.</p>
              </div>
            )}

            {locCheck !== 'idle' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
                <MapPin size={18} className="text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-300">
                    {locCheck === 'checking' ? 'Getting your location…' : 'Please enable location to accept booking.'}
                  </p>
                  {locCheck === 'needed' && (
                    <p className="text-xs text-blue-400/80 mt-0.5">
                      Turn on location, then tap Accept again. If blocked, allow it in your browser’s Site settings.
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleAccept}
              disabled={acceptMutation.isPending || locCheck === 'checking' || !isOnline || !isAvailable}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {acceptMutation.isPending || locCheck === 'checking' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle size={18} />
              )}
              {acceptMutation.isPending ? 'Accepting...' : locCheck === 'checking' ? 'Locating…' : 'Accept Booking Request'}
            </button>
          </div>
        )}

        {!canAccept && booking.driver && (
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center gap-3 bg-emerald-500/10 rounded-xl p-3">
              <Car size={18} className="text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-300">Assigned Driver</p>
                <p className="text-xs text-emerald-400">{booking.driver.user?.name || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Motion.div>
  );
};

export default DriverBookingDetail;
