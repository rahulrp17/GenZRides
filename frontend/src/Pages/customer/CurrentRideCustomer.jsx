import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { motion as Motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { MapPin, Navigation, Car, Clock, Phone, User, CheckCircle, X, Download, Star } from 'lucide-react';
import { bookingAPI, invoiceAPI, reviewAPI } from '../../services/endpoints';
import { useSocket } from '../../Context/SocketContext';
import { CardSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import RideTimeline from '../../components/shared/RideTimeline';
import CancelReasonDialog from '../../components/shared/CancelReasonDialog';
import { useRideTime } from '../../components/shared/RideTimer';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const STATUS_FLOW = [
  { key: 'Accepted', label: 'Driver Assigned', sublabel: 'Ride confirmed', icon: CheckCircle, color: 'emerald', ring: 'ring-emerald-300', bg: 'bg-emerald-500', text: 'text-emerald-400', light: 'bg-emerald-50', tsKey: 'acceptedAt' },
  { key: 'On The Way', label: 'On The Way', sublabel: 'Driver heading to you', icon: Car, color: 'blue', ring: 'ring-blue-300', bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', tsKey: 'onTheWayAt' },
  { key: 'Arrived', label: 'Arrived at Pickup', sublabel: 'Driver is here', icon: MapPin, color: 'purple', ring: 'ring-purple-300', bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50', tsKey: 'arrivedAt' },
  { key: 'Started', label: 'Ride Started', sublabel: 'Trip in progress', icon: Navigation, color: 'indigo', ring: 'ring-indigo-300', bg: 'bg-indigo-500', text: 'text-indigo-400', light: 'bg-indigo-50', tsKey: 'startedAt' },
  { key: 'Reached', label: 'Reached Destination', sublabel: 'Verifying payment', icon: MapPin, color: 'amber', ring: 'ring-amber-300', bg: 'bg-amber-500', text: 'text-amber-400', light: 'bg-amber-50', tsKey: 'reachedAt' },
  { key: 'Completed', label: 'Ride Completed', sublabel: 'Trip finished', icon: CheckCircle, color: 'emerald', ring: 'ring-emerald-300', bg: 'bg-emerald-600', text: 'text-emerald-400', light: 'bg-emerald-50', tsKey: 'completedAt' },
];


const GREEN_MARKER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#16a34a" stroke="#fff" stroke-width="2"/><circle cx="14" cy="14" r="4" fill="#fff"/></svg>'
)}`;

const RED_MARKER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="34" viewBox="0 0 24 34"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z" fill="#dc2626" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="11" r="4" fill="#fff"/></svg>'
)}`;

const DRIVER_MARKER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42"><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#4f46e5" stroke="#fff" stroke-width="2"/><circle cx="16" cy="15" r="6" fill="#fff"/><circle cx="16" cy="15" r="3" fill="#4f46e5"/></svg>'
)}`;

const mapContainerStyle = { width: '100%', height: '100%' };
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
  draggable: true,
  styles: [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  ],
};

function decodePolyline(encoded) {
  const points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

const StarRating = ({ rating, onRate, size = 24, interactive = true }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onRate?.(star)}
        className={`transition ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
      >
        <Star
          size={size}
          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}
        />
      </button>
    ))}
  </div>
);

const CurrentRideCustomer = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverEta, setDriverEta] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const mapRef = useRef(null);
  const hasInteractedRef = useRef(false);
  const initialFitDoneRef = useRef(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => bookingAPI.cancel(id, { cancelReason: reason }),
    onSuccess: (res) => {
      const cancelled = res?.data?.booking || res?.booking;
      if (cancelled) setLiveStatus(cancelled);
      toast.success('Booking cancelled');
      queryClient.invalidateQueries({ queryKey: ['currentRideCustomer'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      setCancelDialogOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to cancel booking'),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ bookingId, rating, review }) => reviewAPI.create(bookingId, { rating, review: review || undefined }),
    onSuccess: () => {
      toast.success('Review submitted!');
      setReviewSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['currentRideCustomer'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to submit review';
      if (msg.toLowerCase().includes('already')) {
        setReviewSubmitted(true);
        toast.success('Review already submitted');
      } else {
        toast.error(msg);
      }
    },
  });

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['currentRideCustomer'],
    queryFn: async () => {
      const { data } = await bookingAPI.getMyBookings({ page: 1, limit: 20 });
      return data;
    },
    refetchInterval: (query) => {
      const bookings = query.state.data?.bookings || [];
      const active = bookings.find((b) => !['Completed', 'Cancelled'].includes(b.bookingStatus));
      if (!active) return false;
      return 10000;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });

  const bookings = data?.bookings || [];

  // Find the most recent booking: active first, then most recent completed
  const activeBooking = bookings.find(
    (b) => !['Completed', 'Cancelled'].includes(b.bookingStatus)
  ) || null;

  const recentCompleted = !activeBooking
    ? bookings.find((b) => b.bookingStatus === 'Completed')
    : null;

  const booking = liveStatus || activeBooking || recentCompleted;
  const isCompleted = booking?.bookingStatus === 'Completed';
  const isCancelled = booking?.bookingStatus === 'Cancelled';

  // Live elapsed time from backend timestamps (refresh-safe).
  const rideTime = useRideTime(booking);
  const pickupCoordsEarly = booking?.pickup?.latitude && booking?.pickup?.longitude
    ? { lat: booking.pickup.latitude, lng: booking.pickup.longitude }
    : null;
  const dropCoordsEarly = booking?.drop?.latitude && booking?.drop?.longitude
    ? { lat: booking.drop.latitude, lng: booking.drop.longitude }
    : null;
  const [livePath, setLivePath] = useState(null);
  const lastFetchRef = useRef(0);

  // Check if review already exists for this completed booking
  useEffect(() => {
    if (!isCompleted || !booking?._id) return;
    if (booking.rating) {
      setReviewSubmitted(true);
      setReviewRating(booking.rating);
      setReviewText(booking.review || '');
    } else {
      setReviewSubmitted(false);
      setReviewRating(0);
      setReviewText('');
    }
  }, [booking?._id, booking?.rating, booking?.review, isCompleted]);

  // Live route: Accepted/On The Way -> driver -> pickup ; Started/Reached -> pickup -> drop (car moving)
  useEffect(() => {
    if (!isLoaded || !window.google || !booking) { setLivePath(null); return; }
    const status = booking.bookingStatus;
    if (['Accepted', 'On The Way'].includes(status) && driverLocation && pickupCoordsEarly) {
      const now = Date.now();
      if (now - lastFetchRef.current < 5000) return;
      lastFetchRef.current = now;
      try {
        const svc = new window.google.maps.DirectionsService();
        svc.route(
          { origin: driverLocation, destination: pickupCoordsEarly, travelMode: window.google.maps.TravelMode.DRIVING },
          (res, st) => {
            if (st === 'OK' && res?.routes?.[0]?.overview_path) {
              setLivePath(res.routes[0].overview_path.map((p) => ({ lat: p.lat(), lng: p.lng() })));
            }
          }
        );
      } catch { /* ignore */ }
    } else if (['Started', 'Reached', 'Completed', 'Arrived'].includes(status) && pickupCoordsEarly && dropCoordsEarly) {
      if (booking.routePolyline) setLivePath(decodePolyline(booking.routePolyline));
      else setLivePath(null);
    } else {
      setLivePath(null);
    }
  }, [isLoaded, booking?.bookingStatus, booking?.routePolyline, driverLocation, pickupCoordsEarly, dropCoordsEarly]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (!map || !window.google || !booking) return;
    if (initialFitDoneRef.current) return;
    initialFitDoneRef.current = true;
    const bounds = new window.google.maps.LatLngBounds();
    let has = false;
    const add = (c) => { if (c?.lat && c?.lng) { bounds.extend(c); has = true; } };
    add(pickupCoordsEarly);
    add(dropCoordsEarly);
    if (driverLocation) add(driverLocation);
    if (has) map.fitBounds(bounds, 48);
  }, [booking, driverLocation]);

  const onMapDragStart = useCallback(() => {
    hasInteractedRef.current = true;
  }, []);

  useEffect(() => {
    initialFitDoneRef.current = false;
    hasInteractedRef.current = false;
  }, [booking?._id]);

  // Join booking room and listen for real-time updates (re-join on reconnect)
  useEffect(() => {
    if (!socket || !booking?._id) return;

    const join = () => socket.emit('join-booking', booking._id);
    join();
    socket.on('connect', join);

    const handleBookingUpdated = (data) => {
      setLiveStatus((prev) => ({ ...(prev || {}), ...data, _id: data._id || prev?._id }));
      queryClient.invalidateQueries({ queryKey: ['currentRideCustomer'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      if (data?.bookingStatus) toast.success(`Ride status updated to ${data.bookingStatus}`);
    };

    const handleDriverLocation = (data) => {
      setDriverLocation({ lat: data.latitude, lng: data.longitude });
      setDriverEta(data.eta);
    };

    const handleRideStatusUpdated = (data) => {
      setLiveStatus((prev) => ({ ...(prev || {}), ...data }));
      queryClient.invalidateQueries({ queryKey: ['currentRideCustomer'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    };

    socket.on('booking-updated', handleBookingUpdated);
    socket.on('driver-location-updated', handleDriverLocation);
    socket.on('ride-status-updated', handleRideStatusUpdated);
    const handleNotification = (n) => {
      if (n?.booking && String(n.booking) === String(booking._id)) {
        queryClient.invalidateQueries({ queryKey: ['currentRideCustomer'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      }
    };
    socket.on('notification', handleNotification);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: ['currentRideCustomer'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      socket.off('connect', join);
      socket.off('booking-updated', handleBookingUpdated);
      socket.off('driver-location-updated', handleDriverLocation);
      socket.off('ride-status-updated', handleRideStatusUpdated);
      socket.off('notification', handleNotification);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [socket, booking?._id, queryClient]);

  // Reset live status when active booking changes
  useEffect(() => {
    if (activeBooking) {
      setLiveStatus(activeBooking);
      setDriverLocation(null);
      setDriverEta(null);
    }
  }, [activeBooking?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmitReview = () => {
    if (!reviewRating) return toast.error('Please select a rating');
    if (!booking?._id) return toast.error('Booking not found');
    reviewMutation.mutate({ bookingId: booking._id, rating: reviewRating, review: reviewText });
  };

  if (isError) {
    return <ErrorState message={error?.message || 'Failed to load ride'} />;
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
    return (
      <EmptyState
        icon={Car}
        title="No active ride"
        description="You don't have any active rides. Book a ride to get started!"
        action={
          <Link
            to="/customer/book"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
          >
            <Car size={16} /> Book a Ride
          </Link>
        }
      />
    );
  }

  const pickupCoords = booking?.pickup?.latitude && booking?.pickup?.longitude
    ? { lat: booking.pickup.latitude, lng: booking.pickup.longitude }
    : null;

  const dropCoords = booking?.drop?.latitude && booking?.drop?.longitude
    ? { lat: booking.drop.latitude, lng: booking.drop.longitude }
    : null;

  const currentStatusIndex = STATUS_FLOW.findIndex((s) => s.key === booking.bookingStatus);

  const defaultCenter = { lat: 13.0827, lng: 80.2707 };
  const mapCenterProp = hasInteractedRef.current ? undefined : (pickupCoords || defaultCenter);

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 min-w-0 w-full max-w-full overflow-x-clip">
      <div>
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Current Ride</h1>
        <p className="text-sm text-slate-200/80 mt-1">{isCompleted ? 'Your completed ride' : 'Track your ride in real-time'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-w-0">
        {/* Left Panel - Ride Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status Banner */}
          <div className={`rounded-2xl p-5 text-white ${
            isCancelled ? 'bg-gradient-to-r from-red-500 to-red-600' :
            isCompleted ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
            'bg-gradient-to-r from-indigo-500 to-violet-500'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm opacity-80">Booking #{booking._id?.slice(-8).toUpperCase()}</p>
                <h2 className="text-lg font-bold mt-0.5">
                  {isCancelled ? 'Ride Cancelled' :
                   isCompleted ? 'Ride Completed!' :
                   booking.bookingStatus === 'Accepted' ? 'Driver Assigned!' :
                   booking.bookingStatus === 'On The Way' ? 'Driver En Route' :
                   booking.bookingStatus === 'Arrived' ? 'Driver Arrived!' :
                   booking.bookingStatus === 'Started' ? 'Ride In Progress' :
                   booking.bookingStatus === 'Reached' ? 'Reached Destination' :
                   booking.bookingStatus}
                </h2>
              </div>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                isCompleted || isCancelled ? 'bg-white/20' : 'bg-white/20 animate-pulse'
              }`}>
                <Car size={20} />
              </div>
            </div>

            {driverEta && !isCompleted && !isCancelled && (
              <div className="flex items-center gap-3 mt-3 bg-white/10 rounded-xl p-3">
                <Clock size={16} />
                <div>
                  <p className="text-sm font-medium">ETA: {driverEta.duration}</p>
                  <p className="text-xs opacity-80">Distance: {driverEta.distance}</p>
                </div>
              </div>
            )}
          </div>

          {/* Cancel — visible only until the driver arrives. */}
          {!isCompleted && !isCancelled && ['Pending', 'Accepted', 'On The Way'].includes(booking.bookingStatus) && (
            <button
              onClick={() => setCancelDialogOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-300 border border-red-500/30 rounded-2xl font-semibold hover:bg-red-500/20 transition-all"
            >
              <X size={18} /> Cancel Booking
            </button>
          )}

          {/* Ride Progress Timeline */}
          {!isCancelled && (
            <RideTimeline booking={booking} currentStatusIndex={currentStatusIndex} />
          )}

          {/* Cancellation banner */}
          {isCancelled && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
              <h3 className="font-semibold text-red-300">
                {booking.cancelledBy === 'Driver'
                  ? 'Driver cancelled this ride'
                  : booking.cancelledBy === 'Admin'
                    ? 'Cancelled by admin'
                    : 'Customer cancelled'}
              </h3>
              {booking.cancelReason && (
                <p className="text-sm text-slate-200/80 mt-1">Reason: {booking.cancelReason}</p>
              )}
              {booking.cancelledAt && (
                <p className="text-xs text-slate-200/60 mt-1">
                  {new Date(booking.cancelledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              <button
                onClick={() => navigate('/customer/book')}
                className="mt-4 w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
              >
                Book a New Ride
              </button>
            </div>
          )}

          {/* Route Details */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 shadow-sm border border-white/10">
            <h3 className="font-semibold text-white mb-4">Route</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Pickup</p>
                  <p className="text-sm font-medium text-white truncate">{booking.pickup?.address}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/50 ml-4" />
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <Navigation size={14} className="text-red-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Drop</p>
                  <p className="text-sm font-medium text-white truncate">{booking.drop?.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 shadow-sm border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Navigation size={12} className="text-gray-500" />
                <p className="text-xs text-gray-400">Distance</p>
              </div>
              <p className="text-lg font-bold text-white">{booking.distance?.toFixed(1) || 0} km</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 shadow-sm border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={12} className="text-gray-500" />
                <p className="text-xs text-gray-400">{rideTime.label === 'Waiting' ? 'Waiting' : 'Ride Time'}</p>
                {rideTime.live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
              <p className="text-lg font-bold text-white">{rideTime.display}</p>
              {rideTime.label === 'Waiting' && booking.duration ? (
                <p className="text-[11px] text-gray-500 mt-0.5">Est. trip: {Math.ceil(Number(booking.duration))} min</p>
              ) : null}
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 shadow-sm border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={12} className="text-gray-500" />
                <p className="text-xs text-gray-400">Fare</p>
              </div>
              <p className="text-lg font-bold text-indigo-400">₹{booking.finalFare || booking.estimatedFare}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 shadow-sm border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <User size={12} className="text-gray-500" />
                <p className="text-xs text-gray-400">Payment</p>
              </div>
              <p className="text-sm font-bold text-white">
                {booking.paymentMethod}
                {' · '}
                <span className={booking.paymentStatus === 'Paid' ? 'text-emerald-400' : booking.paymentStatus === 'Unpaid' ? 'text-red-400' : 'text-amber-400'}>
                  {booking.paymentStatus || 'Pending'}
                </span>
              </p>
            </div>
          </div>

          {/* Reached Destination — payment verification in progress */}
          {booking.bookingStatus === 'Reached' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
              <p className="text-sm font-semibold text-amber-300">Reached Destination</p>
              <p className="text-sm text-slate-200/80 mt-1">
                Payment status: <span className="font-semibold">{booking.paymentStatus || 'Pending'}</span>
                {(!booking.paymentStatus || booking.paymentStatus === 'Pending') && ' — your driver is verifying payment.'}
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Map & Driver Info */}
        <div className="lg:col-span-3 space-y-5">
          {/* Live Map - always visible when booking exists, draggable */}
          {!isCancelled && booking && (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-sm border border-white/10 overflow-hidden">
              <div className="relative h-[400px] lg:h-[calc(100vh-120px)] min-h-[350px]">
                {loadError ? (
                  <div className="h-full flex items-center justify-center bg-white/10">
                    <p className="text-sm text-gray-400">Failed to load map</p>
                  </div>
                ) : !isLoaded ? (
                  <div className="h-full flex items-center justify-center bg-white/10 animate-pulse">
                    <div className="w-8 h-8 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenterProp}
                    zoom={13}
                    options={mapOptions}
                    onLoad={onMapLoad}
                    onDragStart={onMapDragStart}
                    onZoomChanged={() => { hasInteractedRef.current = true; }}
                  >
                    {pickupCoords && <Marker position={pickupCoords} icon={GREEN_MARKER} title={booking.pickup?.address || "Pickup"} />}
                    {dropCoords && <Marker position={dropCoords} icon={RED_MARKER} title={booking.drop?.address || "Drop"} />}
                    {driverLocation && <Marker position={driverLocation} icon={DRIVER_MARKER} title="Driver - moving" />}
                    {(livePath || (pickupCoords && dropCoords && booking.routePolyline)) && (
                      <Polyline
                        path={livePath || decodePolyline(booking.routePolyline)}
                        options={{
                          strokeColor: '#2513c2',
                          strokeWeight: 4,
                          strokeOpacity: 0.6,
                          geodesic: true,
                        }}
                      />
                    )}
                    </GoogleMap>
                )}
                {/* Recenter button */}
                <button
                  onClick={() => {
                    hasInteractedRef.current = false;
                    const map = mapRef.current;
                    if (map && window.google) {
                      const bounds = new window.google.maps.LatLngBounds();
                      [pickupCoords, dropCoords, driverLocation].forEach((c) => { if (c?.lat && c?.lng) bounds.extend(c); });
                      if (!bounds.isEmpty()) map.fitBounds(bounds, 48);
                    }
                  }}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur text-white text-xs font-medium rounded-full border border-white/10 hover:bg-black/80"
                >
                  Recenter
                </button>
              </div>
            </div>
          )}

          {/* Driver Info */}
          {booking.driver && (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 shadow-sm border border-white/10">
              <h3 className="font-semibold text-white mb-3">Driver</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  {booking.driver.user?.profileImage ? (
                    <img src={booking.driver.user.profileImage} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <User size={20} className="text-indigo-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{booking.driver.user?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-400">{booking.driver.user?.phone || 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{booking.driver.vehicleType?.name || 'Vehicle'}</p>
                </div>
                {!isCompleted && !isCancelled && booking.driver.user?.phone && (
                  <a
                    href={`tel:${booking.driver.user.phone}`}
                    className="w-11 h-11 rounded-full bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition shrink-0"
                  >
                    <Phone size={18} className="text-emerald-400" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Completed Ride Details + Inline Review */}
          {isCompleted && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-emerald-400" />
                <div>
                  <h3 className="font-semibold text-emerald-300">Ride Completed</h3>
                  <p className="text-sm text-emerald-400">Thank you for riding with us!</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Final Fare</p>
                  <p className="text-lg font-bold text-emerald-400">₹{booking.finalFare || booking.estimatedFare}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Payment Status</p>
                  <p className="text-sm font-semibold">{booking.paymentStatus}</p>
                </div>
                {booking.driver?.user?.name && (
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Driver</p>
                    <p className="text-sm font-semibold text-white">{booking.driver.user.name}</p>
                  </div>
                )}
                {booking.completedAt && (
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Completed At</p>
                    <p className="text-sm font-semibold text-white">
                      {new Date(booking.completedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>

              {/* Inline Review Section */}
              {!reviewSubmitted ? (
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white">Rate Your Ride</h4>
                  <StarRating rating={reviewRating} onRate={setReviewRating} size={28} />
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                    placeholder="Tell us about your experience (optional)"
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 resize-none"
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={!reviewRating || reviewMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50"
                  >
                    {reviewMutation.isPending ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Star size={16} />
                    )}
                    {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">Review submitted</span>
                  </div>
                  <StarRating rating={reviewRating} onRate={() => {}} interactive={false} size={20} />
                  {reviewText && <p className="text-xs text-gray-400 mt-2">{reviewText}</p>}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={async () => {
                    try {
                      toast.loading('Preparing invoice...', { id: `invoice-${booking._id}` });
                      const response = await invoiceAPI.download(booking._id);
                      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `invoice-${booking._id}.pdf`);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      window.URL.revokeObjectURL(url);
                      toast.success('Invoice downloaded', { id: `invoice-${booking._id}` });
                    } catch {
                      toast.error('Failed to download invoice', { id: `invoice-${booking._id}` });
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all font-semibold text-sm"
                >
                  <Download size={16} /> Download Invoice
                </button>
                <button
                  onClick={() => navigate('/customer/book')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 text-white border border-white/10 rounded-xl hover:bg-white/15 transition font-semibold text-sm"
                >
                  <Car size={16} /> Book Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CancelReasonDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={(reason) => cancelMutation.mutate({ id: booking._id, reason })}
        title="Cancel Booking"
        message="Please tell us why you are cancelling. Your driver will be notified immediately."
        confirmText="Cancel Booking"
        isPending={cancelMutation.isPending}
      />
    </Motion.div>
  );
};

export default CurrentRideCustomer;
