import React, { useState, useCallback, useEffect, useRef, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../../Context/SocketContext";
import { toast } from "react-hot-toast";
import { formatTripDuration } from "../../utils/formatDuration";
import { displayStatus } from "../../utils/bookingStatusMeta";
import {
  MapPin,
  CreditCard,
  StickyNote,
  Send,
  Map,
  ArrowLeft,
  Loader2,
  Navigation,
  Clock,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Play,
  Download,
  X,
  Car,
  CalendarDays,
  CarFront,
  Repeat,
  ArrowRight,
  Receipt,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { DateInput, TimeInput } from "@mantine/dates";
import {
  bookingAPI,
  fareAPI,
  vehicleAPI,
  mapsAPI,
} from "../../services/endpoints";
// Google Maps loads only when the map panel mounts (own chunk).
const RideMap = lazy(() => import("../../components/customer/RideMap"));
import { useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES } from "../../utils/googleMaps";
import LocationPicker from "../../components/customer/LocationPicker";
import VehicleSelector from "../../components/customer/VehicleSelector";
import FareNotes from "../../components/shared/FareNotes";
import Modal from "../../components/shared/Modal";
import {
  toDisplayAddress,
  buildLocationPayload,
  isValidCoords,
} from "../../utils/locationFormat";
import ErrorState from "../../components/shared/ErrorState";
import CancelReasonDialog from "../../components/shared/CancelReasonDialog";

const GOOGLE_MAPS_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const getMinDateTime = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
};

const formatCurrency = (n) =>
  `₹${Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const perKmLabel = (n) =>
  n == null
    ? "—"
    : `₹${Number(n) % 1 === 0 ? Number(n).toFixed(0) : Number(n).toFixed(2)}/km`;

const fmtWhen = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

const pad = (n) => String(n).padStart(2, "0");

// Pickup must be at least 30 minutes from now (mirrors guest flow + backend).
const minPickupDate = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  return d;
};

const mantineInputStyles = {
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.12)",
    color: "#fff",
    height: 46,
    borderRadius: 12,
    fontSize: 15,
  },
  section: { color: "#4ade80" },
};

function DateTimeField({ id, label, value, minDate, minTime, onChange }) {
  const [dateVal, setDateVal] = useState(null);
  const [timeVal, setTimeVal] = useState("");
  const valueRef = useRef(value);

  useEffect(() => {
    if (valueRef.current === value) return;
    valueRef.current = value;
    if (value) {
      const d = new Date(value);
      // Invalid dates (bad restored value) fall back to empty.
      if (!Number.isNaN(d.getTime())) {
        setDateVal(d);
        setTimeVal(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
        return;
      }
    }
    setDateVal(null);
    setTimeVal("");
  }, [value]);

  const combine = (d, t) => {
    if (!d) return "";
    const [h, m] = (t || "00:00").split(":").map(Number);
    const dt = new Date(d);
    dt.setHours(h || 0, m || 0, 0, 0);
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
      dt.getDate(),
    )}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  const handleDateChange = useCallback(
    (d) => {
      setDateVal(d);
      onChange(combine(d, timeVal));
    },
    [onChange, timeVal],
  );

  const handleTimeChange = useCallback(
    (t) => {
      setTimeVal(t);
      onChange(combine(dateVal, t));
    },
    [onChange, dateVal],
  );

  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-300 flex items-center gap-1.5"
      >
        <CalendarDays size={14} className="text-green-400" /> {label}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
        <DateInput
          id={id}
          value={dateVal}
          onChange={handleDateChange}
          minDate={minDate}
          placeholder="Pick a date"
          valueFormat="DD MMM YYYY"
          clearable
          styles={mantineInputStyles}
          popoverProps={{ withinPortal: true }}
        />
        <TimeInput
          value={timeVal}
          onChange={(e) => handleTimeChange(e.currentTarget.value)}
          withSeconds={false}
          format="24"
          minTime={minTime}
          placeholder="Pick a time"
          styles={mantineInputStyles}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1.5">
        Pickup must be at least 30 minutes from now.
      </p>
    </div>
  );
}

const BookRide = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { user } = useAuth();

  const [pickupCoords, setPickupCoords] = useState(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropCoords, setDropCoords] = useState(null);
  const [dropAddress, setDropAddress] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fareEstimates, setFareEstimates] = useState({});
  const [estimating, setEstimating] = useState(false);
  // Selected cab's estimate, derived from the per-vehicle map.
  const fareEstimate = selectedVehicle
    ? fareEstimates[selectedVehicle] || null
    : null;
  const [selectingPin, setSelectingPin] = useState(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [tripType, setTripType] = useState("One Way");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [days, setDays] = useState(1);
  const [notes, setNotes] = useState("");
  const [pickupDateTime, setPickupDateTime] = useState(getMinDateTime());
  const [locationError, setLocationError] = useState(null);
  const [bookingFlow, setBookingFlow] = useState("idle");
  const [, setBookingData] = useState(null);
  const [, setDriverResponseTime] = useState(null);
  const [, setCurrentRide] = useState(null);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  // Ref mirror — the socket effect below closes over mount-time state,
  // so without this every booking-updated event looks "new".
  const createdBookingRef = useRef(null);
  useEffect(() => {
    createdBookingRef.current = createdBookingId;
  }, [createdBookingId]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelledInfo, setCancelledInfo] = useState(null);
  // Which field is currently resolving coords → place name ("pickup"/"drop"/null).
  // Booking is blocked while set, so only real names are ever stored.
  const [resolvingAddress, setResolvingAddress] = useState(null);

  const minDate = minPickupDate();
  const minTime = `${pad(minDate.getHours())}:${pad(minDate.getMinutes())}`;

  // Ensure the Maps JS API is available for client-side geocoding fallback.
  // Uses the shared loader singleton (utils/googleMaps) — identical options
  // on every page, so navigating between maps never re-triggers the load.
  const { isLoaded: mapsScriptLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const estimateTimerRef = useRef(null);
  const estimateReqRef = useRef(0);
  const autoOpenedMapRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    const handleBookingUpdated = (data) => {
      // Ignore stale events for rides this page didn't create (e.g. review
      // submission or payment updates on a just-completed ride) — otherwise
      // a fresh "Book Again" visit bounces straight back to Current Ride.
      // Terminal statuses never navigate either.
      const eventId = data?.booking?._id;
      const eventStatus = data?.booking?.bookingStatus;
      if (!eventId || String(eventId) !== String(createdBookingRef.current)) return;
      if (eventStatus && ['Completed', 'Cancelled'].includes(eventStatus)) return;
      setBookingData(data.booking);
      setBookingFlow("driver-accepted");
      setDriverResponseTime(Date.now());
      navigate("/customer/current-ride");
      toast.success(
        `Driver ${data.driverName} accepted your ride!`
      );
    };

    const handleRideStatusUpdated = (data) => {
      setCurrentRide(data.ride);
      setBookingFlow("ride-in-progress");
    };

    const handleNoDrivers = () => {
      setBookingFlow("no-drivers");
      toast.error("No drivers available. Please try again.");
    };

    const handleError = (error) => {
      setBookingFlow("error");
      toast.error(error.message || "An error occurred");
    };

    socket.on("booking-updated", handleBookingUpdated);
    socket.on("ride-status-updated", handleRideStatusUpdated);
    socket.on("no-drivers-available", handleNoDrivers);
    socket.on("error", handleError);

    return () => {
      socket.off("booking-updated", handleBookingUpdated);
      socket.off("ride-status-updated", handleRideStatusUpdated);
      socket.off("no-drivers-available", handleNoDrivers);
      socket.off("error", handleError);
    };
  }, [socket, navigate]);

  const { data: vehicles, isError: vehiclesError, error: vehiclesErr } =
    useQuery({
      queryKey: ["vehicles"],
      queryFn: async () => {
        const { data } = await vehicleAPI.getAll();
        return data;
      },
      staleTime: 5 * 60_000,
    });

  // Auto-select the first cab type so the fare calculates immediately and
  // stays in sync on days/vehicle/trip changes — no card click required.
  // Never overrides an explicit user choice.
  useEffect(() => {
    const list = vehicles?.vehicles || [];
    if (list.length === 0) return;
    if (!selectedVehicle || !list.some((v) => v._id === selectedVehicle)) {
      setSelectedVehicle(list[0]._id);
      setFareEstimates({});
    }
  }, [vehicles, selectedVehicle]);

  const bookMutation = useMutation({
    mutationFn: async () => {
      // Address is always a real place name (never raw lat,lng); coords
      // stay numeric for the backend fare/routing pipeline.
      const pickup = buildLocationPayload(
        pickupAddress,
        pickupCoords,
        ""
      );
      const drop = buildLocationPayload(
        dropAddress,
        dropCoords,
        ""
      );
      if (
        !pickup.address ||
        !drop.address ||
        !isValidCoords(pickupCoords) ||
        !isValidCoords(dropCoords)
      ) {
        throw new Error(
          "Please set a valid pickup and drop location with place names."
        );
      }
      const payload = {
        pickup,
        drop,
        pickupDateTime: new Date(pickupDateTime).toISOString(),
        tripType,
        vehicleType: selectedVehicle,
        days: tripType === "Round Trip" ? days : 1,
        paymentMethod,
        customerNotes: notes || "",
      };
      const { data } = await bookingAPI.create(payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success("Booking created successfully. Waiting for a driver to accept.");
      setBookingFlow("waiting-for-driver");
      setBookingData(null);
      setDriverResponseTime(null);
      setCurrentRide(null);

      const bookingId = data?.data?._id || data?._id;
      if (bookingId) {
        setCreatedBookingId(bookingId);
        if (socket) socket.emit("join-booking", bookingId);
      }
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Booking failed. Please try again."
      );
    },
  });

  // Only 1 active ride at a time — detect an existing one to gate the form
  const { data: myBookingsData, isLoading: gateLoading } = useQuery({
    queryKey: ["activeRideGate"],
    queryFn: async () => {
      const { data } = await bookingAPI.getMyBookings({ page: 1, limit: 5 });
      return data;
    },
    staleTime: 15_000,
  });

  const existingActiveRide = (myBookingsData?.bookings || []).find(
    (b) => !["Completed", "Cancelled"].includes(b.bookingStatus)
  );

  const cancelBookingMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      bookingAPI.cancel(id, { cancelReason: reason }),
    onSuccess: (_data, variables) => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["activeRideGate"] });
      setCancelDialogOpen(false);
      setCancelledInfo({ reason: variables.reason });
      setCreatedBookingId(null);
      setBookingFlow("cancelled");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    },
  });

  const resetBookingForm = useCallback(() => {
    setBookingFlow("idle");
    setPickupCoords(null);
    setPickupAddress("");
    setDropCoords(null);
    setDropAddress("");
    setSelectedVehicle(null);
    setFareEstimates({});
    setCreatedBookingId(null);
    setCancelledInfo(null);
    autoOpenedMapRef.current = false;
  }, []);

  // Estimates fares for EVERY cab type in parallel (same existing
  // estimate API, one call per vehicle), so each card shows its own
  // calculated fare as soon as date/time, days, trip or route changes —
  // no vehicle click required. Stale responses are discarded by request id.
  const estimateFares = useCallback(async () => {
    const list = vehicles?.vehicles || [];
    if (!pickupCoords || !dropCoords || list.length === 0) return;
    const reqId = ++estimateReqRef.current;
    setEstimating(true);
    try {
      const base = {
        pickup: {
          latitude: pickupCoords.lat,
          longitude: pickupCoords.lng,
        },
        drop: {
          latitude: dropCoords.lat,
          longitude: dropCoords.lng,
        },
        tripType,
        days: tripType === "Round Trip" ? days : 1,
        pickupDateTime: pickupDateTime,
      };
      const results = await Promise.allSettled(
        list.map((v) =>
          fareAPI
            .estimate({ ...base, vehicleType: v._id })
            .then(({ data }) => ({
              id: v._id,
              estimate: data?.success ? data.data : null,
            }))
        )
      );
      if (estimateReqRef.current !== reqId) return;
      const next = {};
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value.estimate) {
          next[r.value.id] = r.value.estimate;
        }
      });
      setFareEstimates(next);
      if (Object.keys(next).length === 0) {
        toast.error("Failed to estimate fare");
      }
    } catch {
      if (estimateReqRef.current === reqId) {
        toast.error("Failed to estimate fare");
      }
    } finally {
      if (estimateReqRef.current === reqId) {
        setEstimating(false);
      }
    }
  }, [vehicles, pickupCoords, dropCoords, tripType, days, pickupDateTime]);

  useEffect(() => {
    if (pickupCoords && dropCoords && (vehicles?.vehicles?.length || 0) > 0) {
      if (estimateTimerRef.current)
        clearTimeout(estimateTimerRef.current);
      estimateTimerRef.current = setTimeout(
        () => estimateFares(),
        300
      );
    } else {
      setFareEstimates({});
    }
    return () => {
      if (estimateTimerRef.current)
        clearTimeout(estimateTimerRef.current);
    };
  }, [
    pickupCoords,
    dropCoords,
    tripType,
    days,
    pickupDateTime,
    vehicles,
    estimateFares,
  ]);

  // On small screens, open the map overlay once both locations are set
  // so markers, place names and the route are immediately visible
  useEffect(() => {
    if (autoOpenedMapRef.current || selectingPin || showMobileMap) return;
    if (!pickupCoords || !dropCoords) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(max-width: 1023px)').matches
    ) {
      autoOpenedMapRef.current = true;
      setShowMobileMap(true);
    }
  }, [pickupCoords, dropCoords, selectingPin, showMobileMap]);

  // Resolves coordinates to a real place name through two layers:
  // 1) existing backend reverse-geocode API, 2) client-side Maps Geocoder
  // (same Google data, already-loaded script — covers backend outages).
  // Returns null when neither yields a name; callers must then block, so
  // raw lat,lng or placeholder text is never stored as the location.
  const resolvePlaceName = useCallback(
    async (coords) => {
      try {
        const { data } = await mapsAPI.reverseGeocode({
          latitude: coords.lat,
          longitude: coords.lng,
        });
        if (data.success) {
          const name = toDisplayAddress(data.data, null);
          if (name) return name;
        }
      } catch {
        /* fall through to client-side geocoder */
      }

      try {
        if (
          mapsScriptLoaded &&
          typeof window !== "undefined" &&
          window.google?.maps?.Geocoder
        ) {
          const geocoder = new window.google.maps.Geocoder();
          const result = await geocoder.geocode({
            location: { lat: coords.lat, lng: coords.lng },
          });
          const address = result?.results?.[0]?.formatted_address;
          const name = toDisplayAddress(address, null);
          if (name) return name;
        }
      } catch {
        /* no name available */
      }

      return null;
    },
    [mapsScriptLoaded]
  );

  const handlePickupSelect = useCallback((place) => {
    // Clear stale coords when the new place has none, so markers/labels never mismatch
    if (place.lat && place.lng) {
      setPickupCoords({ lat: place.lat, lng: place.lng });
    } else {
      setPickupCoords(null);
    }
    setPickupAddress(
      toDisplayAddress(place.formatted_address || place.name, "")
    );
    setFareEstimates({});
  }, []);

  const handleDropSelect = useCallback((place) => {
    if (place.lat && place.lng) {
      setDropCoords({ lat: place.lat, lng: place.lng });
    } else {
      setDropCoords(null);
    }
    setDropAddress(
      toDisplayAddress(place.formatted_address || place.name, "")
    );
    setFareEstimates({});
  }, []);

  const handleSelectCurrentLocation = useCallback(() => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPickupCoords(coords);
        setResolvingAddress("pickup");
        setFareEstimates({});
        const resolved = await resolvePlaceName(coords);
        setResolvingAddress(null);
        if (resolved) {
          // Real place name only; coords stay separate for fare/routing.
          setPickupAddress(resolved);
          toast.success("Current location set as pickup");
        } else {
          // Never store raw lat,lng or a placeholder — leave unset so the
          // user picks a named place via search or the map.
          setPickupAddress("");
          const msg =
            "Couldn't identify this place. Please search for it or set the pin on the map.";
          setLocationError(msg);
          toast.error(msg);
        }
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location permission denied. Please enable it in browser settings."
            : err.code === 2
            ? "Unable to determine your location."
            : "Location request timed out. Please try again.";
        setLocationError(msg);
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [resolvePlaceName]);

  const handleSetOnMap = useCallback((which) => {
    setSelectingPin(which);
    setShowMobileMap(true);
  }, []);

  const handlePinSelect = useCallback(
    async (coords) => {
      const which = selectingPin;
      setSelectingPin(null);
      setShowMobileMap(false);
      if (which !== "pickup" && which !== "drop") return;

      if (which === "pickup") {
        setPickupCoords(coords);
        setPickupAddress("");
      } else {
        setDropCoords(coords);
        setDropAddress("");
      }
      setResolvingAddress(which);
      setFareEstimates({});

      const resolved = await resolvePlaceName(coords);
      setResolvingAddress(null);

      if (resolved) {
        if (which === "pickup") setPickupAddress(resolved);
        else setDropAddress(resolved);
        toast.success(
          `${which === "pickup" ? "Pickup" : "Drop"} location set`
        );
      } else {
        // Never store raw lat,lng or placeholder text — keep the pin's
        // coords for the map marker but leave the name empty so booking
        // stays blocked until a named place is chosen.
        const msg =
          "Couldn't identify this place. Please try a nearby landmark or search for it.";
        setLocationError(msg);
        toast.error(msg);
      }
    },
    [selectingPin, resolvePlaceName]
  );

  const handleCancelMapSelect = useCallback(() => {
    setSelectingPin(null);
    setShowMobileMap(false);
  }, []);

  const handleVehicleSelect = useCallback((vehicleId) => {
    // Switching cards never clears fares — every card already shows its
    // own calculated total from the per-vehicle estimate map.
    setSelectedVehicle(vehicleId);
  }, []);

  const canBook =
    pickupCoords &&
    dropCoords &&
    pickupAddress.trim() &&
    dropAddress.trim() &&
    !resolvingAddress &&
    selectedVehicle &&
    pickupDateTime &&
    !bookMutation.isPending;

  if (vehiclesError) {
    return (
      <ErrorState
        message={vehiclesErr?.message || "Failed to load vehicles"}
        onRetry={() =>
          queryClient.invalidateQueries({ queryKey: ["vehicles"] })
        }
      />
    );
  }

  if (!GOOGLE_MAPS_KEY || GOOGLE_MAPS_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
    return (
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto p-4"
      >
        <div className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-8 text-center">
          <Map className="mx-auto mb-4 text-green-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">
            Google Maps Required
          </h2>
          <p className="text-gray-400">
            Set{" "}
            <code className="bg-white/10 px-2 py-1 rounded text-sm text-green-400">
              VITE_GOOGLE_MAPS_API_KEY
            </code>{" "}
            in your .env file to enable location features.
          </p>
        </div>
      </Motion.div>
    );
  }

  // Gate: only 1 active ride at a time — a fresh visit with an
  // existing active ride shows ride status + cancel instead of the form
  // Don't flash the booking form before the gate check loads
  const showActiveGate =
    bookingFlow === "idle" && !gateLoading && !!existingActiveRide;

  const activeGatePanel = existingActiveRide && (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="bg-white/5 border border-white/10 rounded-[30px] p-8 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <Car size={30} className="text-green-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">
            You have an active ride
          </h2>
          <p className="text-sm text-slate-200/80 mt-2">
            Status:{" "}
            <span className="font-semibold text-green-400">
              {displayStatus(existingActiveRide.bookingStatus)}
            </span>
          </p>
          <p className="text-xs text-slate-200/60 mt-1 truncate">
            {existingActiveRide.pickup?.address} → {existingActiveRide.drop?.address}
          </p>
          <p className="text-xs text-slate-200/60 mt-3">
            Only 1 active ride is allowed at a time. Track it or cancel it below to book a new one.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/customer/current-ride")}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
          >
            <Navigation size={16} /> View Current Ride
          </button>
          <button
            onClick={() => {
              setCreatedBookingId(existingActiveRide._id);
              setCancelDialogOpen(true);
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 text-red-300 border border-red-500/30 rounded-2xl text-sm font-semibold hover:bg-red-500/20 transition-all"
          >
            <X size={16} /> Cancel Booking
          </button>
        </div>
      </Motion.div>
    </div>
  );

  const formPanel =
    showActiveGate ? (
      activeGatePanel
    ) : bookingFlow === "idle" ? (
      <div className="flex flex-col w-full max-w-full min-w-0 lg:h-full overflow-x-clip">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-white/10 transition"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold text-white tracking-tight truncate">
              Book a Ride
            </h1>
            <p className="text-xs text-slate-200/80 truncate">
              Where are you going?
            </p>
          </div>
        </div>

        {/* Scrollable Content — page scrolls naturally on mobile;
            inner scroll container only on lg */}
        <div className="px-4 pb-28 lg:pb-4 space-y-4 min-w-0 w-full max-w-full overflow-x-clip lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overflow-x-hidden">
          {/* Location Picker */}
          <LocationPicker
            pickupAddress={pickupAddress}
            dropAddress={dropAddress}
            pickupCoords={pickupCoords}
            dropCoords={dropCoords}
            onPickupSelect={handlePickupSelect}
            onDropSelect={handleDropSelect}
            onSelectCurrentLocation={handleSelectCurrentLocation}
            onSetOnMap={handleSetOnMap}
          />

          {/* Place-name resolution status */}
          {resolvingAddress && (
            <div className="flex items-center gap-2 px-1 text-xs text-gray-400">
              <Loader2 size={13} className="animate-spin text-emerald-400" />
              Resolving {resolvingAddress === "pickup" ? "pickup" : "drop"} place name…
            </div>
          )}

          {/* Location Error */}
          {locationError && (
            <Motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400"
            >
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{locationError}</span>
              <button
                onClick={() => setLocationError(null)}
                className="ml-auto text-red-400/60 hover:text-red-400"
              >
                <span className="sr-only">Dismiss</span>&times;
              </button>
            </Motion.div>
          )}

          {/* Trip Options */}
          <div className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">
              Trip Options
            </h3>

            {/* Trip Type */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5">
                <Navigation size={14} /> Trip Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["One Way", "Round Trip"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTripType(t)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      tripType === t
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="grid-cols-2 hidden gap-2 mt-2">
                {["Airport Pickup", "Airport Drop"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTripType(t)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      tripType === t
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time — Mantine pickers matching the guest booking form */}
            <DateTimeField
              id="pickup-datetime"
              label="Pickup Date & Time"
              value={pickupDateTime}
              minDate={minDate}
              minTime={minTime}
              onChange={setPickupDateTime}
            />

            {/* Round Trip Days */}
            {tripType === "Round Trip" && (
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5">
                  <Clock size={14} /> Number of Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) =>
                    setDays(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-base focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none transition touch-manipulation [color-scheme:dark]"
                />
              </Motion.div>
            )}

            {/* Payment Method */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5">
                <CreditCard size={14} /> Payment
              </label>
              <div className="grid grid-cols-1 gap-2">
                {["Cash"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-3  rounded-xl text-sm font-medium transition-all ${
                      paymentMethod === m
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {m === "Cash" ? "\uD83D\uDCB5" : "\uD83D\uDCB3"} {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5">
                <StickyNote size={14} /> Notes (optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions..."
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl text-base focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none transition resize-none touch-manipulation [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Vehicle Selection */}
          <VehicleSelector
            vehicles={vehicles?.vehicles || []}
            selectedVehicle={selectedVehicle}
            onSelect={handleVehicleSelect}
            fareEstimate={fareEstimate}
            fareEstimates={fareEstimates}
            estimating={estimating}
            pickupSet={!!pickupCoords}
            dropSet={!!dropCoords}
            tripType={tripType}
            days={days}
          />

          {/* Distance & Duration Summary */}
          {fareEstimate && (
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-4 py-2 text-sm text-gray-400"
            >
              <span>{fareEstimate.distance?.toFixed(1)} km</span>
              <span className="w-1 h-1 rounded-full bg-gray-500" />
              <span>{formatTripDuration(fareEstimate.duration)}</span>
            </Motion.div>
          )}

          

          {/* Book Button (sticky bottom — stays visible while page scrolls) */}
          <div className=" bottom-0 z-10 -mx-4 px-4 pb-4 pt-2 border-t border-white/10 bg-black/85 backdrop-blur-xl">
            <button
              type="button"
              disabled={!canBook}
              onClick={() => canBook && setConfirmOpen(true)}
              className="w-full flex items-center mb-3 justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-2xl font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {bookMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Booking...
                </>
              ) : fareEstimate ? (
                <>
                  <Send size={18} /> Book Ride — ₹
                  {fareEstimate.estimatedFare}
                </>
              ) : (
                <>
                  <Send size={18} /> Book Ride
                </>
              )}
            </button>
            {/* Fare & cancellation notes near the price */}
          <FareNotes compact />
          </div>

      {/* Premium glass confirm popup — same layout as the guest flow, but the
          customer's name/email/phone come from the backend auth profile.
          Confirm uses the existing booking API via bookMutation; Cancel just
          closes. The Book button is disabled unless the form is valid, and
          the mutation guards against duplicate submissions. */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => !bookMutation.isPending && setConfirmOpen(false)}
        title="Confirm your booking"
        maxWidth="max-w-lg"
      >
        <div className="space-y-3">
          {/* Customer details — compact contact strip (backend profile) */}
          <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/10">
            {[
              ["Customer", user?.name || "—"],
              ["Email", user?.email || "—"],
              ["Phone", user?.phone || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 px-3.5 py-2 text-[13px] min-w-0">
                <span className="shrink-0 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">{label}</span>
                <span className="text-white font-medium truncate">{value}</span>
              </div>
            ))}
          </div>

          {/* Trip card — route, schedule, vehicle */}
          <div className="bg-gradient-to-br from-emerald-500/15 via-white/5 to-transparent border border-emerald-500/20 rounded-xl p-3.5">
            <div className="relative pl-4 space-y-2 text-[13px]">
              <span aria-hidden className="absolute left-[4px] top-1 bottom-1 w-px bg-gradient-to-b from-green-400/70 via-white/15 to-red-400/70" />
              <div className="relative min-w-0">
                <span aria-hidden className="absolute  left-[-15px] top-1 w-[9px] h-[9px] rounded-full bg-green-400 ring-4 ring-green-400/20" />
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Pickup</p>
                <p className="text-white font-medium break-words">{pickupAddress}</p>
              </div>
              <div className="relative min-w-0">
                <span aria-hidden className="absolute  left-[-15px] top-3 w-[9px] h-[9px] rounded-full bg-red-400 ring-4 ring-red-400/20" />
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Drop</p>
                <p className="text-white font-medium break-words">{dropAddress}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[12px]">
              <div className="flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 min-w-0">
                <CalendarDays size={12} className="text-blue-400 shrink-0" />
                <span className="truncate">{fmtWhen(pickupDateTime)}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 min-w-0">
                <CarFront size={12} className="text-green-400 shrink-0" />
                <span className="truncate">{vehicles?.vehicles?.find((v) => v._id === selectedVehicle)?.name || "Selected car"}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 min-w-0">
                <Navigation size={12} className="text-sky-400 shrink-0" />
                <span className="truncate">{fareEstimate?.distance?.toFixed(1)} km · {formatTripDuration(fareEstimate?.duration || 0)}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 min-w-0">
                {tripType === "Round Trip"
                  ? <Repeat size={12} className="text-emerald-400 shrink-0" />
                  : <ArrowRight size={12} className="text-emerald-400 shrink-0" />}
                <span className="truncate">{tripType}{tripType === "Round Trip" ? ` · ${days} day${days > 1 ? "s" : ""}` : ""}</span>
              </div>
            </div>
          </div>

          {/* Trip invoice — plain-language fare receipt, same as guest flow */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-[13px]">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-dashed border-white/15">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
                <Receipt size={13} className="text-emerald-400" /> Trip invoice
              </span>
              <span className="text-[11px] text-gray-500 tabular-nums">
                {fareEstimate?.distance?.toFixed(1)} km · {formatTripDuration(fareEstimate?.duration || 0)}
              </span>
            </div>
            <div className="py-1">
              <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                <span className="text-gray-300">
                  Base fare
                  {fareEstimate?.fareBreakdown?.baseKm > 0 && (
                    <span className="block text-[11px] text-gray-500 font-normal">first {fareEstimate.fareBreakdown.baseKm} km included</span>
                  )}
                </span>
                <span className="text-white font-medium tabular-nums shrink-0">{formatCurrency(fareEstimate?.fareBreakdown?.baseFare)}</span>
              </div>
              <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                <span className="text-gray-300">
                  Distance fare
                  {fareEstimate?.fareBreakdown?.chargeableDistance > 0 && fareEstimate?.perKm != null && (
                    <span className="block text-[11px] text-gray-500 font-normal">{fareEstimate.fareBreakdown.chargeableDistance} km × {perKmLabel(fareEstimate.perKm)}</span>
                  )}
                </span>
                <span className="text-white font-medium tabular-nums shrink-0">{formatCurrency(fareEstimate?.fareBreakdown?.distanceFare)}</span>
              </div>
              {fareEstimate?.fareBreakdown?.driverAllowance > 0 && (
                <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                  <span className="text-gray-300">
                    Driver bata
                    <span className="block text-[11px] text-gray-500 font-normal">driver food & stay{tripType === "Round Trip" ? ` × ${fareEstimate.fareBreakdown.billableDays || days} day(s)` : ""}</span>
                  </span>
                  <span className="text-white font-medium tabular-nums shrink-0">{formatCurrency(fareEstimate?.fareBreakdown?.driverAllowance)}</span>
                </div>
              )}
              {fareEstimate?.fareBreakdown?.tollCharges > 0 && (
                <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                  <span className="text-gray-300">
                    Toll fee
                    <span className="block text-[11px] text-gray-500 font-normal">toll plazas on your route</span>
                  </span>
                  <span className="text-white font-medium tabular-nums shrink-0">{formatCurrency(fareEstimate?.fareBreakdown?.tollCharges)}</span>
                </div>
              )}
              {fareEstimate?.fareBreakdown?.permitCharges > 0 && (
                <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                  <span className="text-gray-300">
                    Permit fee
                    <span className="block text-[11px] text-gray-500 font-normal">interstate permit, if applicable</span>
                  </span>
                  <span className="text-white font-medium tabular-nums shrink-0">{formatCurrency(fareEstimate?.fareBreakdown?.permitCharges)}</span>
                </div>
              )}
              {fareEstimate?.fareBreakdown?.waitingCharge > 0 && (
                <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                  <span className="text-gray-300">
                    Waiting fee
                    <span className="block text-[11px] text-gray-500 font-normal">first 30 min free</span>
                  </span>
                  <span className="text-white font-medium tabular-nums shrink-0">{formatCurrency(fareEstimate?.fareBreakdown?.waitingCharge)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center gap-3 pt-2.5">
              <span className="text-gray-200 font-semibold">
                Amount payable
                <span className="block text-[11px] text-gray-500 font-normal">pay cash to the driver</span>
              </span>
              <span className="font-display text-xl font-bold text-green-400 tabular-nums">
                {fareEstimate ? `₹${Number(fareEstimate.estimatedFare ?? 0).toLocaleString("en-IN")}` : "—"}
              </span>
            </div>
          </div>

          {/* Notes — single line */}
          <p className="text-[11px] leading-5 bg-red-700 border border-white/10 rounded-md px-2.5 py-1.5">
            <span className="text-black font-bold">Note:</span>{" "}
            <span className="text-white">Pay cash to the driver. Tolls &amp; permits at actuals.{tripType === "One Way" && " Waiting ₹2.5/min after 30 min free."}</span>
            {notes.trim() && (
              <>
                <br />
                <span className="text-black font-bold">Customer note:</span>{" "}
                <span className="text-white">{notes.trim()}</span>
              </>
            )}
          </p>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={bookMutation.isPending}
              className="py-3 min-h-[48px] bg-red-400 border border-white/10 text-gray-200 rounded-2xl text-sm font-semibold hover:bg-white/10 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { setConfirmOpen(false); bookMutation.mutate(); }}
              disabled={bookMutation.isPending || !canBook}
              className="py-3 min-h-[48px] bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {bookMutation.isPending ? (<><Loader2 size={16} className="animate-spin" /> Booking…</>) : "Confirm Booking"}
            </button>
          </div>
        </div>
      </Modal>
        </div>
      </div>
    ) : bookingFlow === "waiting-for-driver" ? (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-[30px] p-8 mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="animate-pulse text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Booking Created</h2>
            <p className="text-gray-400 mt-2">
              Your booking has been created successfully.
            </p>
            <p className="text-gray-300 mt-2 font-medium">
              Waiting for a driver to accept.
            </p>
            <p className="text-gray-500 mt-4 text-sm">
              You will be notified when a driver accepts your ride.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/customer/current-ride")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
            >
              <Navigation size={16} /> Track Ride
            </button>
            <button
              onClick={() => setCancelDialogOpen(true)}
              disabled={!createdBookingId}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 text-red-300 border border-red-500/30 rounded-2xl text-sm font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50"
            >
              <X size={16} /> Cancel Booking
            </button>
          </div>
        </Motion.div>
      </div>
    ) : bookingFlow === "cancelled" ? (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="bg-red-500/10 border border-red-500/30 rounded-[30px] p-8 mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <X size={30} className="text-red-400" />
            </div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Customer cancelled
            </h2>
            <p className="text-sm text-slate-200/80 mt-2">
              You cancelled this booking.
            </p>
            {cancelledInfo?.reason && (
              <p className="text-sm text-slate-200/70 mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                Reason: {cancelledInfo.reason}
              </p>
            )}
          </div>

          <button
            onClick={resetBookingForm}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
          >
            <RefreshCw size={16} /> Book a New Ride
          </button>
        </Motion.div>
      </div>
    ) : bookingFlow === "no-drivers" ? (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="bg-red-500/10 border border-red-500/30 rounded-[30px] p-8">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-bold text-white">No Drivers Available</h3>
            <p className="text-gray-400 mt-2">
              Unfortunately, no drivers are available at the moment. Please try again shortly.
            </p>
            <button
              onClick={() => setBookingFlow("idle")}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        </Motion.div>
      </div>
    ) : bookingFlow === "driver-accepted" ? (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[30px] p-8">
            <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-white">Driver Accepted!</h3>
            <p className="text-gray-400 mb-4">
              Your driver has accepted the ride. The ride will begin shortly.
            </p>
            <button
              onClick={() => setBookingFlow("ride-in-progress")}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
            >
              <Play size={16} /> View Ride
            </button>
          </div>
        </Motion.div>
      </div>
    ) : bookingFlow === "ride-in-progress" ? (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="bg-white/5 border border-white/10 rounded-[30px] p-8">
            <div className="text-center py-4">
              <MapPin size={48} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white">Ride in Progress</h3>
              <p className="text-gray-400 mt-2">
                Your driver is on the way. Track the ride in real-time.
              </p>
              <p className="text-gray-500 mt-2 text-sm">
                The driver will update the status as they arrive at pickup.
              </p>
            </div>
          </div>
        </Motion.div>
      </div>
    ) : bookingFlow === "completed" ? (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[30px] p-8">
            <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-white">Ride Completed!</h3>
            <p className="text-gray-400 mb-4">
              Your ride has been completed. Invoice has been generated.
            </p>
            <button
              onClick={() => navigate("/customer/invoices")}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
            >
              <Download size={16} /> View Invoices
            </button>
          </div>
        </Motion.div>
      </div>
    ) : (
      <ErrorState
        message="An unexpected error occurred in the booking flow."
        onRetry={() => setBookingFlow("idle")}
      />
    );

  const mapPanel = (
    <RideMap
      pickupCoords={pickupCoords}
      dropCoords={dropCoords}
      pickupAddress={pickupAddress}
      dropAddress={dropAddress}
      onPinSelect={handlePinSelect}
      selectingPin={selectingPin}
      className="w-full h-full min-h-[400px]"
    />
  );

  return (
    <div className="bg-gradient-to-br from-slate-950 via-black to-slate-900">
      {/* Mobile Map Overlay */}
      <AnimatePresence>
        {showMobileMap && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl lg:hidden"
          >
            <div className="absolute top-0 left-0 right-0 z-10 bg-black/90 backdrop-blur-xl border-b border-white/10 p-3 flex items-center gap-3">
              <button
                onClick={handleCancelMapSelect}
                className="p-2 rounded-xl hover:bg-white/10 transition"
              >
                <ArrowLeft size={20} className="text-gray-400" />
              </button>
              <p className="text-sm font-medium text-gray-300">
                {selectingPin === "pickup"
                  ? "Set pickup location"
                  : selectingPin === "drop"
                  ? "Set drop-off location"
                  : "Select location on map"}
              </p>
              {selectingPin && (
                <button
                  onClick={handleCancelMapSelect}
                  className="ml-auto text-sm text-gray-500 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
            <div className="h-full pt-14">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white/20 border-t-green-500 rounded-full animate-spin" />
                  </div>
                }
              >
                <RideMap
                  pickupCoords={pickupCoords}
                  dropCoords={dropCoords}
                  pickupAddress={pickupAddress}
                  dropAddress={dropAddress}
                  onPinSelect={handlePinSelect}
                  selectingPin={selectingPin}
                  className="w-full h-full rounded-none"
                />
              </Suspense>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout — natural page scroll on mobile (no 100dvh lock),
          locked split view only on lg so input focus/keyboard never overflows */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[100dvh] w-full max-w-full overflow-x-clip flex flex-col lg:flex-row lg:h-[calc(100dvh-64px)] lg:overflow-hidden"
      >
        {/* Form Panel */}
        <div className="w-full max-w-full min-w-0 lg:w-[480px] xl:w-[520px] lg:flex-shrink-0 bg-black/50 backdrop-blur-xl lg:border-r border-white/10 flex flex-col lg:min-h-0 lg:h-full lg:overflow-hidden">
          {formPanel}
        </div>

        {/* Map Panel (desktop) */}
        <div className="hidden lg:block flex-1 relative">
          <Suspense
            fallback={
              <div className="w-full h-full min-h-[400px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/20 border-t-green-500 rounded-full animate-spin" />
              </div>
            }
          >
            {mapPanel}
          </Suspense>
        </div>

        {/* Mobile Map Toggle */}
        {/* {!showMobileMap && (
          <button
            type="button"
            onClick={() => setShowMobileMap(true)}
            className="lg:hidden fixed bottom-24 right-4 z-40 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all active:scale-95"
          >
            <Map size={22} />
          </button>
        )} */}
      </Motion.div>

      <CancelReasonDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={(reason) =>
          createdBookingId &&
          cancelBookingMutation.mutate({ id: createdBookingId, reason })
        }
        title="Cancel Booking"
        message="Please tell us why you are cancelling. This action cannot be undone."
        confirmText="Cancel Booking"
        isPending={cancelBookingMutation.isPending}
      />
    </div>
  );
};

export default BookRide;
