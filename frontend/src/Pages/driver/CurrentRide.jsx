import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoogleMap, useJsApiLoader, Polyline } from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES } from '../../utils/googleMaps';
import AdvancedMarker from '../../components/maps/AdvancedMarker';
import { motion as Motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Car, MapPin, Navigation, Phone, Clock, CheckCircle,
  Play, Radio, Wifi, WifiOff,
  User, IndianRupee, CreditCard, CircleDot, X, Flag,
  Banknote, Loader2,
} from 'lucide-react';
import { driverAPI, bookingAPI, mapsAPI } from '../../services/endpoints';
import { CardSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import CancelReasonDialog from '../../components/shared/CancelReasonDialog';
import RideTimeline from '../../components/shared/RideTimeline';
import { useRideTime } from '../../components/shared/RideTimer';
import { useSocket } from '../../Context/SocketContext';
import { displayStatus } from '../../utils/bookingStatusMeta';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const STATUS_FLOW = [
  { key: 'Accepted', label: 'Driver Assigned', sublabel: 'Ride assigned', icon: CheckCircle, color: 'emerald', ring: 'ring-emerald-300', bg: 'bg-emerald-500', text: 'text-emerald-400', light: 'bg-emerald-50', tsKey: 'acceptedAt' },
  { key: 'On The Way', label: 'Driver On The Way', sublabel: 'Heading to pickup', icon: Navigation, color: 'blue', ring: 'ring-blue-300', bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', tsKey: 'onTheWayAt' },
  { key: 'Arrived', label: 'Driver Arrived', sublabel: 'At pickup location', icon: MapPin, color: 'purple', ring: 'ring-purple-300', bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50', tsKey: 'arrivedAt' },
  { key: 'Started', label: 'Ride Started', sublabel: 'Trip in progress', icon: Play, color: 'indigo', ring: 'ring-indigo-300', bg: 'bg-indigo-500', text: 'text-indigo-400', light: 'bg-indigo-50', tsKey: 'startedAt' },
  { key: 'Reached', label: 'Reached Destination', sublabel: 'Trip ended, verify payment', icon: Flag, color: 'amber', ring: 'ring-amber-300', bg: 'bg-amber-500', text: 'text-amber-400', light: 'bg-amber-50', tsKey: 'reachedAt' },
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

const CurrentRide = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [actionConfirm, setActionConfirm] = useState({ open: false, action: null, title: '', message: '' });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [justCancelled, setJustCancelled] = useState(null);
  const [gpsSharing, setGpsSharing] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(true);
  const geoWatchRef = useRef(null);
  const gpsActiveRef = useRef(false);
  const mapRef = useRef(null);
  const hasInteractedRef = useRef(false);
  const wakeLockRef = useRef(null);
  const initialFitDoneRef = useRef(false);
  const [selfLocation, setSelfLocation] = useState(null);
  const [livePathDriver, setLivePathDriver] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const lastFetchDriverRef = useRef(0);
  // decodePolyline allocates a new array per call — only apply when the
  // encoded string actually changes, or the effect re-fires forever.
  const appliedPolylineDriverRef = useRef(null);

  const [mapInstance, setMapInstance] = useState(null);
  const { isLoaded: mapLoaded, loadError: mapLoadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const { data: currentBooking, isLoading, isError: rideError, error: rideErr } = useQuery({
    queryKey: ['currentRide'],
    queryFn: async () => {
      const { data } = await driverAPI.getCurrentBooking();
      return data;
    },
    refetchInterval: (q) => {
      const b = q.state.data?.data;
      if (!b) return 8000;
      const done = ['Completed', 'Cancelled'].includes(b.bookingStatus);
      return done ? false : 10000;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });

  const { data: profile } = useQuery({
    queryKey: ['driverProfile'],
    queryFn: async () => {
      const { data } = await driverAPI.getProfile();
      return data;
    },
    staleTime: 60_000,
  });

  const booking = currentBooking?.data;
  const isRideActive = booking && !['Completed', 'Cancelled'].includes(booking.bookingStatus);
  // Live elapsed time from backend timestamps (refresh-safe).
  const rideTime = useRideTime(booking);

  useEffect(() => {
    initialFitDoneRef.current = false;
    hasInteractedRef.current = false;
    setLiveStatus(null);
  }, [booking?._id]);

  const statusMutation = useMutation({
    mutationFn: async ({ action, id }) => {
      switch (action) {
        case 'reached': return (await bookingAPI.reached(id)).data;
        case 'arrived': return (await bookingAPI.arrived(id)).data;
        case 'start': return (await bookingAPI.start(id)).data;
        case 'reachDestination': return (await bookingAPI.reachDestination(id)).data;
        case 'complete': return (await bookingAPI.complete(id)).data;
        default: throw new Error('Unknown action');
      }
    },
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['currentRide'] });
      queryClient.invalidateQueries({ queryKey: ['driverDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['driverAvailableBookings'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  // Cash collected from the customer. Empty until the driver submits the
  // amount they actually received; editable afterwards in case of a typo.
  const [cashInput, setCashInput] = useState('');
  const [editingPayment, setEditingPayment] = useState(false);

  const paymentMutation = useMutation({
    mutationFn: async ({ id, amount }) =>
      (await bookingAPI.updatePayment(id, { amount })).data,
    onSuccess: (data) => {
      const collected = data?.data?.booking?.collectedAmount;
      toast.success(
        collected ? `Payment of ₹${Number(collected).toLocaleString("en-IN")} recorded.` : 'Payment recorded.'
      );
      setCashInput('');
      setEditingPayment(false);
      queryClient.invalidateQueries({ queryKey: ['currentRide'] });
      queryClient.invalidateQueries({ queryKey: ['driverDashboard'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to record payment'),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => bookingAPI.driverCancel(id, { cancelReason: reason }),
    onSuccess: (_res, variables) => {
      toast.success('Ride cancelled');
      setJustCancelled({ reason: variables.reason, at: new Date().toISOString() });
      setCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['currentRide'] });
      queryClient.invalidateQueries({ queryKey: ['driverAvailableBookings'] });
      queryClient.invalidateQueries({ queryKey: ['driverDashboard'] });
    },
    onError: (err) => {
      const status = err.response?.status;
      toast.error(
        status === 429
          ? 'Daily cancellation limit reached (3 per day).'
          : err.response?.data?.message || 'Failed to cancel ride'
      );
    },
  });

  const toggleOnline = useMutation({
    mutationFn: async () => {
      const isOnline = profile?.data?.isOnline;
      if (isOnline) return (await driverAPI.goOffline()).data;
      return (await driverAPI.goOnline()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverProfile'] });
      toast.success('Status updated');
    },
  });

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator && document.visibilityState === 'visible') {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockRef.current?.addEventListener('release', () => { wakeLockRef.current = null; });
      }
    } catch { /* ignore */ }
  }, []);

  const startGpsSharing = useCallback(() => {
    if (gpsActiveRef.current) return; // already sharing
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    gpsActiveRef.current = true;
    setGpsSharing(true);
    requestWakeLock();

    navigator.geolocation.getCurrentPosition(
      () => {
        setGpsError(null);

        if (geoWatchRef.current !== null) {
          try { navigator.geolocation.clearWatch(geoWatchRef.current); } catch (err) { void err; }
        }

        geoWatchRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setSelfLocation({ lat: latitude, lng: longitude });
            if (socket && booking?._id) {
              socket.emit('driver-location', {
                bookingId: booking._id,
                latitude,
                longitude,
              });
            }
          },
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              setGpsError('Location permission denied. Please enable in settings.');
              gpsActiveRef.current = false;
              setGpsSharing(false);
            } else if (err.code === err.POSITION_UNAVAILABLE) {
              setGpsError('Location unavailable. Check your GPS signal.');
            } else if (err.code === err.TIMEOUT) {
              setGpsError('Location request timed out. Retrying...');
            }
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
        );
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please enable in settings.');
        } else {
          setGpsError('Unable to get your location.');
        }
        gpsActiveRef.current = false;
        setGpsSharing(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [socket, booking?._id, requestWakeLock]);

  const stopGpsSharing = useCallback(() => {
    if (geoWatchRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchRef.current);
      geoWatchRef.current = null;
    }
    gpsActiveRef.current = false;
    setGpsSharing(false);
    setGpsError(null);
  }, []);

  useEffect(() => {
    if (isRideActive) {
      startGpsSharing();
    } else {
      stopGpsSharing();
    }
    return () => stopGpsSharing();
  }, [isRideActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep GPS alive when driver minimizes / switches apps — watches are throttled in background,
  // so re-acquire wake lock and restart watch on visibility change
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
        if (isRideActive && gpsActiveRef.current) {
          // Restart GPS sharing — watchPosition is throttled/ended in background
          stopGpsSharing();
          startGpsSharing();
          if (socket && booking?._id) socket.emit('join-booking', booking._id);
        }
        queryClient.invalidateQueries({ queryKey: ['currentRide'] });
      }
    };
    const onPageShow = () => {
      if (isRideActive && !gpsActiveRef.current) startGpsSharing();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [isRideActive, socketConnected, booking?._id, queryClient, requestWakeLock, stopGpsSharing, startGpsSharing, socket]);

  useEffect(() => {
    if (!socket) return;
    const handleConnect = () => { setSocketConnected(true); };
    const handleDisconnect = () => {
      setSocketConnected(false);
      setGpsError('Connection lost. Reconnecting...');
    };
    const handleReconnect = () => {
      setSocketConnected(true);
      setGpsError(null);
      if (isRideActive) startGpsSharing();
    };
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
    };
  }, [socket, isRideActive, startGpsSharing]);

  useEffect(() => {
    if (!socket || !booking?._id) return;

    const join = () => socket.emit('join-booking', booking._id);
    join();
    socket.on('connect', join);

    const handleRideStatusUpdated = (data) => {
      if (data?._id === booking?._id) {
        setLiveStatus((prev) => ({ ...(prev || {}), ...data }));
      }
      queryClient.invalidateQueries({ queryKey: ['currentRide'] });
      queryClient.invalidateQueries({ queryKey: ['driverDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['driverAvailableBookings'] });
      if (data.bookingStatus === 'Completed' || data.bookingStatus === 'Cancelled') {
        toast.success(`Ride ${data.bookingStatus.toLowerCase()}`);
      }
    };
    const handleBookingUpdated = (data) => {
      if (data?._id === booking?._id) {
        setLiveStatus((prev) => ({ ...(prev || {}), ...data }));
      }
      queryClient.invalidateQueries({ queryKey: ['currentRide'] });
    };

    socket.on('ride-status-updated', handleRideStatusUpdated);
    socket.on('booking-updated', handleBookingUpdated);
    return () => {
      socket.off('connect', join);
      socket.off('ride-status-updated', handleRideStatusUpdated);
      socket.off('booking-updated', handleBookingUpdated);
    };
  }, [socket, booking?._id, queryClient]);

  // Live route for driver: Accepted/On The Way -> self -> pickup ; Arrived/Started -> pickup -> drop
  useEffect(() => {
    if (!mapLoaded || !booking) { setLivePathDriver(null); return; }
    const pickup = booking.pickup?.latitude && booking.pickup?.longitude ? { lat: booking.pickup.latitude, lng: booking.pickup.longitude } : null;
    const drop = booking.drop?.latitude && booking.drop?.longitude ? { lat: booking.drop.latitude, lng: booking.drop.longitude } : null;
    const activeStatus = liveStatus?.bookingStatus || booking.bookingStatus;

    if (['Accepted', 'On The Way'].includes(activeStatus) && selfLocation && pickup) {
      const now = Date.now();
      if (now - lastFetchDriverRef.current < 5000) return;
      lastFetchDriverRef.current = now;
      const fetchRoute = async () => {
        try {
          const { data } = await mapsAPI.getRoute({
            origin: { latitude: selfLocation.lat, longitude: selfLocation.lng },
            destination: { latitude: pickup.lat, longitude: pickup.lng },
          });
          if (data?.data?.polyline) {
            setLivePathDriver(decodePolyline(data.data.polyline));
          }
        } catch (err) {
          console.error('Route fetch failed:', err);
        }
      };
      fetchRoute();
    } else if (['Arrived', 'Started', 'Reached', 'Completed'].includes(activeStatus) && pickup && drop) {
      const encoded = booking.routePolyline;
      if (encoded) {
        if (appliedPolylineDriverRef.current !== encoded) {
          appliedPolylineDriverRef.current = encoded;
          setLivePathDriver(decodePolyline(encoded));
        }
      } else if (appliedPolylineDriverRef.current !== null || livePathDriver !== null) {
        appliedPolylineDriverRef.current = null;
        setLivePathDriver(null);
      }
    } else if (appliedPolylineDriverRef.current !== null || livePathDriver !== null) {
      appliedPolylineDriverRef.current = null;
      setLivePathDriver(null);
    }
  }, [mapLoaded, booking, selfLocation, liveStatus?.bookingStatus, livePathDriver]);

  if (rideError) return <ErrorState message={rideErr?.message || 'Failed to load current ride'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['currentRide'] })} />;

  const handleAction = (action, id) => {
    const actions = {
      reached: { title: 'On The Way', message: 'Confirm you are heading to the pickup location?' },
      arrived: { title: 'Arrived at Pickup', message: 'Confirm you have arrived at the pickup location?' },
      start: { title: 'Start Ride', message: 'Start the ride now?' },
      reachDestination: { title: 'Reached Destination', message: 'Confirm you have reached the destination?' },
      complete: { title: 'Complete Ride', message: 'Mark this ride as completed?' },
    };
    setActionConfirm({ open: true, action, id, ...actions[action] });
  };

  const confirmAction = () => {
    if (actionConfirm.action && actionConfirm.id) {
      statusMutation.mutate({ action: actionConfirm.action, id: actionConfirm.id });
    }
  };

  const pickupCoords = booking?.pickup?.latitude && booking?.pickup?.longitude
    ? { lat: booking.pickup.latitude, lng: booking.pickup.longitude }
    : null;
  const dropCoords = booking?.drop?.latitude && booking?.drop?.longitude
    ? { lat: booking.drop.latitude, lng: booking.drop.longitude }
    : null;
  const activeStatus = liveStatus?.bookingStatus || booking?.bookingStatus;
  const currentStatusIndex = STATUS_FLOW.findIndex((s) => s.key === booking?.bookingStatus);
  const driverMapCenter = pickupCoords || { lat: 13.0827, lng: 80.2707 };
  const mapCenterPropDriver = hasInteractedRef.current ? undefined : driverMapCenter;

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 min-w-0 w-full max-w-full overflow-x-clip">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Current Ride</h1>
          <p className="text-sm text-slate-200/70 mt-0.5">
            {isRideActive ? 'Active ride in progress' : 'No active ride'}
          </p>
        </div>
        <button
          onClick={() => toggleOnline.mutate()}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            profile?.data?.isOnline
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
              : 'bg-white/5 text-slate-200/80 border border-white/10 hover:bg-white/10'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${profile?.data?.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {profile?.data?.isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : !booking ? (
        justCancelled ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md">
            <h3 className="font-display text-lg font-bold text-white tracking-tight">Driver cancelled</h3>
            <p className="text-sm text-slate-200/80 mt-1">You cancelled this ride. The customer was notified in real time.</p>
            {justCancelled.reason && (
              <p className="text-sm text-slate-200/70 mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                Reason: {justCancelled.reason}
              </p>
            )}
            <button
              onClick={() => setJustCancelled(null)}
              className="mt-4 w-full py-2.5 bg-white/5 border border-white/10 text-slate-200/80 rounded-xl font-semibold hover:bg-white/10 transition-all"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <EmptyState
            icon={Car}
            title="No active ride"
            description="Go online and wait for ride requests."
          />
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-w-0">
          {/* Left Panel - Ride Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status Card */}
            <div className={`rounded-2xl p-5 text-white ${
              booking.bookingStatus === 'Cancelled' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              booking.bookingStatus === 'Completed' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
              'bg-gradient-to-r from-indigo-500 to-violet-500'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm opacity-80">#{booking._id?.slice(-8).toUpperCase()}</p>
                  <h2 className="text-lg font-bold mt-0.5">
                    {displayStatus(booking.bookingStatus)}
                  </h2>
                </div>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  ['Completed', 'Cancelled'].includes(booking.bookingStatus) ? 'bg-white/20' : 'bg-white/20 animate-pulse'
                }`}>
                  <Car size={20} />
                </div>
              </div>
              {rideTime.elapsedMs != null && (
                <div className="flex items-center gap-2 mt-3 bg-white/10 rounded-xl px-3 py-2 text-sm w-fit">
                  <Clock size={14} />
                  <span className="opacity-90">{rideTime.label}:</span>
                  <span className="font-bold">{rideTime.display}</span>
                  {rideTime.live && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <RideTimeline booking={booking} currentStatusIndex={currentStatusIndex} />

            {/* Route Details */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 shadow-sm border border-white/10">
              <h3 className="font-semibold text-white mb-4">Route</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-200/70">Pickup</p>
                    <p className="text-sm font-medium text-white truncate">{booking.pickup?.address}</p>
                  </div>
                </div>
                <div className="w-px h-4 bg-white/10 ml-4" />
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <Navigation size={14} className="text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-200/70">Drop</p>
                    <p className="text-sm font-medium text-white truncate">{booking.drop?.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 shadow-sm border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Navigation size={12} className="text-slate-200/60" />
                  <p className="text-xs text-slate-200/70">Distance</p>
                </div>
                <p className="text-lg font-bold text-white">{booking.distance?.toFixed(1) || 0} km</p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 shadow-sm border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <IndianRupee size={12} className="text-slate-200/60" />
                  <p className="text-xs text-slate-200/70">Fare</p>
                </div>
                <p className="text-lg font-bold text-indigo-400">₹{Number(booking.estimatedFare || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 shadow-sm border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={12} className="text-slate-200/60" />
                  <p className="text-xs text-slate-200/70">Payment</p>
                </div>
                <p className="text-sm font-bold text-white">{booking.paymentMethod}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 shadow-sm border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <CircleDot size={12} className="text-slate-200/60" />
                  <p className="text-xs text-slate-200/70">Type</p>
                </div>
                <p className="text-sm font-bold text-white">{booking.tripType}</p>
              </div>
            </div>

            {/* Action Buttons */}
            {isRideActive && (
              <div className="space-y-3">
                {booking.bookingStatus === 'Accepted' && (
                  <button
                    onClick={() => handleAction('reached', booking._id)}
                    disabled={statusMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    <Navigation size={18} /> On The Way
                  </button>
                )}
                {booking.bookingStatus === 'On The Way' && (
                  <button
                    onClick={() => handleAction('arrived', booking._id)}
                    disabled={statusMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition"
                  >
                    <MapPin size={18} /> Arrived at Pickup
                  </button>
                )}
                {booking.bookingStatus === 'Arrived' && (
                  <button
                    onClick={() => handleAction('start', booking._id)}
                    disabled={statusMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    <Play size={18} /> Start Ride
                  </button>
                )}
                {booking.bookingStatus === 'Started' && (
                  <button
                    onClick={() => handleAction('reachDestination', booking._id)}
                    disabled={statusMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50 transition"
                  >
                    <Flag size={18} /> Reached Destination
                  </button>
                )}
                {booking.bookingStatus === 'Reached' && (
                  <>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Cash Collection</p>
                      {booking.paymentStatus === 'Paid' && booking.collectedAmount > 0 && !editingPayment ? (
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-white">
                            Collected: <span className="text-emerald-400 font-bold tabular-nums">₹{Number(booking.collectedAmount ?? 0).toLocaleString("en-IN")}</span>
                          </p>
                          <button
                            onClick={() => {
                              setCashInput(String(booking.collectedAmount));
                              setEditingPayment(true);
                            }}
                            className="shrink-0 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs font-semibold hover:bg-white/10 transition"
                          >
                            Update
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-white mb-3">
                            Enter the cash the customer handed over{booking.paymentMethod === 'Cash' ? '' : ' (confirm the online fare)'}.
                          </p>
                          <div className="flex gap-2">
                            <div className="relative flex-1 min-w-0">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={cashInput}
                                onChange={(e) => setCashInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                placeholder={booking.estimatedFare ? `${booking.estimatedFare}` : 'Amount'}
                                aria-label="Cash received from customer"
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3.5 py-2.5 text-white font-semibold tabular-nums placeholder:text-gray-600 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition"
                              />
                            </div>
                            <button
                              onClick={() => paymentMutation.mutate({ id: booking._id, amount: Number(cashInput) })}
                              disabled={paymentMutation.isPending || !Number(cashInput) || Number(cashInput) <= 0}
                              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50"
                            >
                              {paymentMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Banknote size={16} />
                              )}
                              Submit
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handleAction('complete', booking._id)}
                      disabled={statusMutation.isPending || paymentMutation.isPending || booking.paymentStatus !== 'Paid'}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50"
                      title={booking.paymentStatus === 'Paid' ? 'Mark this ride as completed' : 'Submit the collected cash first'}
                    >
                      <CheckCircle size={18} /> Complete Ride
                    </button>
                  </>
                )}
                {['Accepted', 'On The Way', 'Arrived'].includes(booking.bookingStatus) && (
                  <button
                    onClick={() => setCancelDialogOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/10 text-red-300 border border-red-500/30 rounded-xl font-semibold hover:bg-red-500/20 transition-all"
                  >
                    <X size={18} /> Cancel Ride
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Map & Live Info */}
          <div className="lg:col-span-3 space-y-5">
            {/* Map - draggable, not resetting on drag */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-sm border border-white/10 overflow-hidden">
              <div className="relative h-[400px] lg:h-[calc(100vh-320px)] min-h-[350px]">
                {mapLoadError ? (
                  <div className="h-full flex items-center justify-center bg-white/10">
                    <p className="text-sm text-slate-200/70">Failed to load map</p>
                  </div>
                ) : !mapLoaded ? (
                  <div className="h-full flex items-center justify-center bg-white/10 animate-pulse">
                    <div className="w-8 h-8 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                ) : (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={mapCenterPropDriver}
                      zoom={pickupCoords ? 14 : 12}
                      options={mapOptions}
                      onLoad={(map) => {
                       mapRef.current = map;
                       setMapInstance(map);
                       if (map && window.google && booking && !initialFitDoneRef.current) {
                        initialFitDoneRef.current = true;
                        const bounds = new window.google.maps.LatLngBounds();
                        let has = false;
                        const add = (c) => { if (c?.lat && c?.lng) { bounds.extend(c); has = true; } };
                        add(pickupCoords);
                        add(dropCoords);
                        if (selfLocation) add(selfLocation);
                        if (has) map.fitBounds(bounds, 48);
                      }
                    }}
                    onDragStart={() => { hasInteractedRef.current = true; }}
                    onZoomChanged={() => { hasInteractedRef.current = true; }}
                  >
                    {pickupCoords && <AdvancedMarker position={pickupCoords} icon={GREEN_MARKER} title={booking.pickup?.address || "Pickup"} map={mapInstance} />}
                    {dropCoords && <AdvancedMarker position={dropCoords} icon={RED_MARKER} title={booking.drop?.address || "Drop"} map={mapInstance} />}
                    {selfLocation && <AdvancedMarker position={selfLocation} icon={DRIVER_MARKER} title="You" map={mapInstance} />}
                    {(livePathDriver || (pickupCoords && dropCoords && booking.routePolyline)) && (
                      <Polyline
                        path={livePathDriver || decodePolyline(booking.routePolyline)}
                        options={{
                          strokeColor: livePathDriver && ['Accepted','On The Way'].includes(activeStatus) ? '#16a34a' : '#6366f1',
                          strokeWeight: 4,
                          strokeOpacity: 0.7,
                          geodesic: true,
                        }}
                      />
                    )}
                  </GoogleMap>
                )}
                <button
                  onClick={() => {
                    hasInteractedRef.current = false;
                    const map = mapRef.current;
                    if (map && window.google && pickupCoords) {
                      const bounds = new window.google.maps.LatLngBounds();
                      [pickupCoords, dropCoords, selfLocation].forEach((c) => { if (c?.lat && c?.lng) bounds.extend(c); });
                      if (!bounds.isEmpty()) map.fitBounds(bounds, 48);
                    }
                  }}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur text-white text-xs font-medium rounded-full border border-white/10 hover:bg-black/80"
                >
                  Recenter
                </button>
              </div>
            </div>

            {/* GPS Sharing Status */}
            {isRideActive && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 shadow-sm border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Location Sharing</h3>
                  <button
                    onClick={gpsSharing ? stopGpsSharing : startGpsSharing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                      gpsSharing
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20'
                    }`}
                  >
                    {gpsSharing ? <Radio size={16} className="animate-pulse" /> : <Radio size={16} />}
                    {gpsSharing ? 'Sharing Live' : 'Start Sharing'}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${gpsSharing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-200/90">
                      {gpsSharing
                        ? 'Your live location is being shared with the customer'
                        : 'Location sharing is paused'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {socketConnected ? (
                      <Wifi size={14} className="text-emerald-500" />
                    ) : (
                      <WifiOff size={14} className="text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${socketConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                      {socketConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>

                {gpsError && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-sm text-red-300">{gpsError}</p>
                  </div>
                )}
              </div>
            )}

            {/* Customer Info */}
            {booking.customer && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 shadow-sm border border-white/10">
                <h3 className="font-semibold text-white mb-3">Customer</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    {booking.customer.profileImage ? (
                      <img src={booking.customer.profileImage} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User size={20} className="text-indigo-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{booking.customer.name || 'N/A'}</p>
                    <p className="text-sm text-slate-200/70">{booking.customer.phone || 'N/A'}</p>
                  </div>
                  {booking.customer.phone && (
                    <a
                      href={`tel:${booking.customer.phone}`}
                      className="w-11 h-11 rounded-full bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition shrink-0"
                    >
                      <Phone size={18} className="text-emerald-400" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ETA Card */}
            {booking.bookingStatus === 'On The Way' && pickupCoords && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Heading to pickup</p>
                    <p className="text-lg font-bold">Follow the route on the map</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={actionConfirm.open}
        onClose={() => setActionConfirm({ open: false })}
        onConfirm={confirmAction}
        title={actionConfirm.title}
        message={actionConfirm.message}
        confirmText="Confirm"
        variant="success"
      />

      <CancelReasonDialog
        isOpen={cancelDialogOpen && !!booking}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={(reason) => cancelMutation.mutate({ id: booking._id, reason })}
        title="Cancel Ride"
        message="Please tell us why you are cancelling. The customer and admin will be notified immediately. Max 3 cancellations per day."
        confirmText="Cancel Ride"
        isPending={cancelMutation.isPending}
      />
    </Motion.div>
  );
};

export default CurrentRide;
