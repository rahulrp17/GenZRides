import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  MapPin,
  Navigation,
  Crosshair,
  Loader2,
  ArrowRight,
  CalendarDays,
  Hash,
  X,
  MapPinned,
  AlertTriangle,
  Plane,
  Search,
} from "lucide-react";
import { DateInput, TimeInput } from "@mantine/dates";
import { NumberInput } from "@mantine/core";
import { guestAPI } from "../../services/endpoints";
import { loadDraft, saveDraft, minPickupISO } from "./guestDraft";
import TrackRidePanel from "./TrackRidePanel";
import RideMap from "../../components/customer/RideMap";
import {
  toDisplayAddress,
  buildPlaceDisplayName,
} from "../../utils/locationFormat";

const DEBOUNCE_MS = 300;

const CHENNAI_AIRPORT = {
  address:
    "Chennai International Airport (MAA), Meenambakkam, Chennai, Tamil Nadu 600027",
  lat: 12.9941,
  lng: 80.1709,
};

const pad = (n) => String(n).padStart(2, "0");

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

const resolvePlaceName = async (coords) => {
  try {
    const { data } = await guestAPI.reverseGeocode({
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
    if (typeof window !== "undefined" && window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({
        location: { lat: coords.lat, lng: coords.lng },
      });
      const name = toDisplayAddress(
        result?.results?.[0]?.formatted_address,
        null,
      );
      if (name) return name;
    }
  } catch {
    /* no name available */
  }
  return null;
};

function ActionButton({ icon, iconBg, title, hint, onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition text-left disabled:opacity-60"
    >
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin text-white/60" />
        ) : (
          icon
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-white truncate">{title}</span>
        {hint && (
          <span className="block text-xs text-gray-400 truncate">{hint}</span>
        )}
      </span>
    </button>
  );
}

function PlaceField({
  id,
  label,
  icon,
  accent,
  placeholder,
  value,
  onPick,
  onCurrentLocation,
  onSetOnMap,
  locationBusy,
}) {
  const [text, setText] = useState(value?.address || "");
  const [open, setOpen] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const timerRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) setText(value?.address || "");
  }, [value, open]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      boxRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 120);
    return () => clearTimeout(t);
  }, [open]);

  const search = useCallback((input) => {
    setText(input);
    setOpen(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!input || input.trim().length < 2) {
      setPredictions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const { data } = await guestAPI.autocomplete({ input: input.trim() });
        if (data.success) setPredictions(data.data || []);
      } catch {
        setPredictions([]);
      } finally {
        setSearching(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const finishPick = useCallback(
    (place) => {
      onPick(place);
      setText(place.address);
      setOpen(false);
      setPredictions([]);
    },
    [onPick],
  );

  const pick = useCallback(
    async (prediction) => {
      setResolving(true);
      try {
        const { data } = await guestAPI.placeDetails({
          placeId: prediction.placeId,
        });
        if (data.success && data.data?.lat != null && data.data?.lng != null) {
          finishPick({
            address: buildPlaceDisplayName({
              name: data.data.name,
              formattedAddress: data.data.formattedAddress,
              fallback: prediction.text,
            }),
            lat: data.data.lat,
            lng: data.data.lng,
          });
          return;
        }
        toast.error(
          "Could not locate that place. Please pick another suggestion.",
        );
      } catch {
        toast.error(
          "Could not locate that place. Please pick another suggestion.",
        );
      } finally {
        setResolving(false);
      }
    },
    [finishPick],
  );

  const handleActionTap = useCallback(() => {
    setOpen(false);
  }, []);

  const handleCurrentLocationTap = useCallback(() => {
    handleActionTap();
    onCurrentLocation(id);
  }, [handleActionTap, onCurrentLocation, id]);

  const handleSetOnMapTap = useCallback(() => {
    handleActionTap();
    onSetOnMap(id);
  }, [handleActionTap, onSetOnMap, id]);

  const handleAirportTap = useCallback(() => {
    handleActionTap();
    finishPick({ ...CHENNAI_AIRPORT });
  }, [handleActionTap, finishPick]);

  const hasText = text.trim().length >= 2;
  const busy =
    searching || resolving || (id === "pickup" && locationBusy === "pickup");

  return (
    <div ref={boxRef} className="relative min-w-0">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="relative mt-1.5">
        <span className={`absolute top-1/2 left-3 -translate-y-1/2 ${accent}`}>
          {icon}
        </span>
        <input
          type="text"
          value={text}
          onChange={(e) => search(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-white/5 border border-white/10 pl-10 pr-10 py-3 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition text-[15px] [color-scheme:dark]"
        />
        {busy && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 animate-spin"
          />
        )}
      </div>

      <AnimatePresence>
        {open && (
          <Motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0a0f0d]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[240px] overflow-y-auto"
          >
            {hasText ? (
              searching ? (
                <p className="px-4 py-4 text-sm text-gray-400 text-center">
                  Searching places…
                </p>
              ) : predictions.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-400 text-center">
                  No matches. Keep typing.
                </p>
              ) : (
                predictions.map((p) => (
                  <button
                    key={p.placeId}
                    type="button"
                    title={p.text}
                    onClick={() => pick(p)}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition text-left"
                  >
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin size={14} className="text-green-400" />
                    </span>
                    <span className="text-sm text-white truncate">
                      {p.text}
                    </span>
                  </button>
                ))
              )
            ) : (
              <div className="py-1">
                {id === "drop" && (
                  <ActionButton
                    icon={<Plane size={16} className="text-sky-400" />}
                    iconBg="bg-sky-500/10"
                    title="Chennai International Airport"
                    hint="MAA - Meenambakkam"
                    onClick={handleAirportTap}
                  />
                )}
                {id === "pickup" && (
                  <ActionButton
                    icon={<Navigation size={16} className="text-blue-500" />}
                    iconBg="bg-blue-500/10"
                    title="Use current location"
                    hint="Auto-fill from your GPS position"
                    onClick={handleCurrentLocationTap}
                    loading={locationBusy === "pickup"}
                  />
                )}
                <ActionButton
                  icon={<Crosshair size={16} className="text-green-500" />}
                  iconBg="bg-green-500/10"
                  title={
                    id === "pickup" ? "Set pickup on map" : "Set drop-off on map"
                  }
                  hint="Tap the map to pin the exact spot"
                  onClick={handleSetOnMapTap}
                />
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DateTimeField({ id, label, value, minDate, minTime, onChange }) {
  const [dateVal, setDateVal] = useState(null);
  const [timeVal, setTimeVal] = useState("");
  const valueRef = useRef(value);

  useEffect(() => {
    if (valueRef.current === value) return;
    valueRef.current = value;
    if (value) {
      const d = new Date(value);
      // Invalid dates (bad draft/restored value) fall back to empty.
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

const GuestBookingForm = () => {
  const navigate = useNavigate();
  const MODES = ["One Way", "Round Trip", "Track Ride"];
  const [tripType, setTripType] = useState("One Way");
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);

  const [pickupAt, setPickupAt] = useState("");
  const [tripDays, setTripDays] = useState(1);

  const [selectingPin, setSelectingPin] = useState(null);
  const [locationBusy, setLocationBusy] = useState(null);
  const [resolvingPlace, setResolvingPlace] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const [modeFlow, setModeFlow] = useState({ enter: -64, exit: 64 });
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const switchMode = useCallback(
    (mode) => {
      if (mode === tripType) return;
      const enter = mode === "Round Trip" ? -64 : 64;
      setModeFlow({ enter, exit: -enter });
      setTripType(mode);
    },
    [tripType],
  );

  const minDate = minPickupISO();
  const minTime = `${pad(minDate.getHours())}:${pad(minDate.getMinutes())}`;

  useEffect(() => {
    if (!selectingPin) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setSelectingPin(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selectingPin]);

  const handleCurrentLocation = useCallback(
    async (which) => {
      if (locationBusy || which !== "pickup") return;
      setLocationError(null);
      if (!navigator.geolocation) {
        const msg =
          "Your browser does not support location. Please search for your pickup or set it on the map.";
        setLocationError(msg);
        toast.error(msg);
        return;
      }
      setLocationBusy("pickup");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setResolvingPlace(true);
          const resolved = await resolvePlaceName(coords);
          setResolvingPlace(false);
          setLocationBusy(null);
          if (resolved) {
            setPickup({ address: resolved, lat: coords.lat, lng: coords.lng });
            toast.success("Current location set as pickup");
          } else {
            const msg =
              "Couldn't identify this place. Please search for it or set the pin on the map.";
            setLocationError(msg);
            toast.error(msg);
          }
        },
        (err) => {
          setLocationBusy(null);
          const msg =
            err.code === 1
              ? "Location permission denied. Please enable location access in your browser settings, then try again."
              : err.code === 2
                ? "Unable to determine your location. Please try again."
                : "Location request timed out. Please try again.";
          setLocationError(msg);
          toast.error(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    },
    [locationBusy],
  );

  const handleSetOnMap = useCallback((which) => {
    setSelectingPin(which);
  }, []);

  const handleCancelMapSelect = useCallback(() => {
    setSelectingPin(null);
  }, []);

  const handlePinSelect = useCallback(
    async (coords) => {
      const which = selectingPin;
      if (which !== "pickup" && which !== "drop") return;
      setSelectingPin(null);
      setResolvingPlace(true);
      const resolved = await resolvePlaceName(coords);
      setResolvingPlace(false);
      if (resolved) {
        const place = {
          address: resolved,
          lat: Number(coords.lat),
          lng: Number(coords.lng),
        };
        if (which === "pickup") setPickup(place);
        else setDrop(place);
        toast.success(
          `${which === "pickup" ? "Pickup" : "Drop"} location set`,
        );
      } else {
        const msg =
          "Couldn't identify this place. Please try a nearby landmark or search for it.";
        setLocationError(msg);
        toast.error(msg);
      }
    },
    [selectingPin],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tripType === "Track Ride") return;

    if (!pickup?.lat || !pickup?.lng) {
      toast.error("Please choose a pickup suggestion from the list.");
      return;
    }
    if (!drop?.lat || !drop?.lng) {
      toast.error("Please choose a drop suggestion from the list.");
      return;
    }

    let pickupISO;
    if (tripType === "Round Trip") {
      if (!pickupAt) {
        toast.error("Please choose a pickup date and time.");
        return;
      }
      const numDays = parseInt(tripDays, 10);
      if (Number.isNaN(numDays) || numDays < 1) {
        toast.error("Please enter at least 1 day for the trip.");
        return;
      }
      pickupISO = new Date(pickupAt).toISOString();
    } else {
      if (!pickupAt) {
        toast.error("Please choose a pickup date and time.");
        return;
      }
      pickupISO = pickupAt;
    }

    if (new Date(pickupISO) <= new Date(Date.now() + 25 * 60 * 1000)) {
      toast.error("Pickup must be at least 30 minutes from now.");
      return;
    }

    // Keep any contact fields the customer already typed (name/email/phone/
    // note) — only the trip address should reset to the fresh pickup.
    const prevGuest = loadDraft()?.guest || {};
    saveDraft({
      tripType,
      pickup: { address: pickup.address, lat: pickup.lat, lng: pickup.lng },
      drop: { address: drop.address, lat: drop.lat, lng: drop.lng },
      pickupDateTime: pickupISO,
      days: tripType === "Round Trip" ? parseInt(tripDays, 10) : 1,
      vehicleType: null,
      fareEstimate: null,
      guest: {
        name: prevGuest.name || "",
        email: prevGuest.email || "",
        phone: prevGuest.phone || "",
        note: prevGuest.note || "",
        address: pickup.address,
      },
    });
    navigate("/booking/vehicles");
  };

  const tabBtnCls = (active) =>
    `relative flex-1 flex items-center justify-center gap-2  py-3 text-sm font-semibold transition-colors duration-200 cursor-pointer z-10 ${
      active ? "text-white" : "text-gray-300 hover:text-white"
    }`;

  return (
    <>
      <form onSubmit={handleSubmit} className="min-w-0">
        <div className="relative flex border border-green-500/30 rounded-2xl overflow-hidden bg-white/5">
          <Motion.span
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.35)]"
            animate={{ left: `${(MODES.indexOf(tripType) * 100) / MODES.length}%` }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => switchMode(mode)}
              className={tabBtnCls(tripType === mode)}
            >
              {mode === "Track Ride" ? (
                <>
                  Track Ride
                </>
              ) : (
                mode
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={modeFlow}>
          <Motion.div
            key={tripType}
            custom={modeFlow}
            initial={hasMounted ? { opacity: 0, x: modeFlow.enter } : false}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: modeFlow.exit }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-4 items-end min-w-0 mt-4"
          >
            {tripType === "Track Ride" ? (
              <TrackRidePanel />
            ) : (
              <>
            <PlaceField
              id="pickup"
              label="Pickup Location"
              icon={<MapPin size={16} />}
              accent="text-green-400"
              placeholder="Pickup place or set on map"
              value={pickup}
              onPick={setPickup}
              onCurrentLocation={handleCurrentLocation}
              onSetOnMap={handleSetOnMap}
              locationBusy={locationBusy}
            />
            <PlaceField
              id="drop"
              label="Drop Location"
              icon={<Navigation size={16} />}
              accent="text-red-400"
              placeholder="Destination or set on map"
              value={drop}
              onPick={setDrop}
              onCurrentLocation={handleCurrentLocation}
              onSetOnMap={handleSetOnMap}
              locationBusy={locationBusy}
            />

            {tripType === "Round Trip" ? (
              <>
                <DateTimeField
                  id="guest-pickup-at"
                  label="Pickup Date & Time"
                  value={pickupAt}
                  minDate={minDate}
                  minTime={minTime}
                  onChange={setPickupAt}
                />
                <div>
                  <label
                    htmlFor="guest-trip-days"
                    className="text-sm font-medium text-gray-300 flex items-center gap-1.5"
                  >
                    <Hash size={14} className="text-green-400" /> Number of Days
                  </label>
                  <NumberInput
                    id="guest-trip-days"
                    className="mt-1.5"
                    min={1}
                    max={30}
                    step={1}
                    clampBehavior="blur"
                    value={tripDays}
                    onChange={(v) =>
                      setTripDays(
                        typeof v === "number" ? v : parseInt(v, 10) || 1,
                      )
                    }
                    styles={mantineInputStyles}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How many days will this round trip take?
                  </p>
                </div>
              </>
            ) : (
              <DateTimeField
                id="guest-pickup-at"
                label="Pickup Date & Time"
                value={pickupAt}
                minDate={minDate}
                minTime={minTime}
                onChange={setPickupAt}
              />
            )}

            <AnimatePresence>
              {locationError && (
                <Motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2.5"
                >
                  <AlertTriangle
                    size={14}
                    className="text-red-400 mt-0.5 shrink-0"
                  />
                  <p className="text-xs text-red-300 flex-1">{locationError}</p>
                  <button
                    type="button"
                    onClick={() => setLocationError(null)}
                    className="p-0.5 rounded-full hover:bg-white/10 text-red-300 transition shrink-0"
                    aria-label="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </Motion.div>
              )}
            </AnimatePresence>

            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={resolvingPlace}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-6 py-3.5 rounded-2xl hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resolvingPlace ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Resolving…
                </>
              ) : (
                <>
                  Choose Car Type <ArrowRight size={18} />
                </>
              )}
            </Motion.button>
              </>
            )}
          </Motion.div>
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {selectingPin && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-black/75 backdrop-blur-sm flex items-center justify-center p-0 sm:p-0"
            onClick={handleCancelMapSelect}
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl h-[73dvh] flex flex-col bg-[#0a0f0d]/95 border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <MapPinned
                      size={18}
                      className={
                        selectingPin === "pickup"
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    />
                    {selectingPin === "pickup"
                      ? "Set pickup on map"
                      : "Set drop-off on map"}
                  </h3>
                  <p className="text-xs text-green-400 mt-0.5">
                    Drag the pin or tap the map, then confirm.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelMapSelect}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-300 transition"
                  aria-label="Close map"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <RideMap
                  pickupCoords={
                    pickup?.lat != null
                      ? { lat: pickup.lat, lng: pickup.lng }
                      : null
                  }
                  dropCoords={
                    drop?.lat != null ? { lat: drop.lat, lng: drop.lng } : null
                  }
                  pickupAddress={pickup?.address || ""}
                  dropAddress={drop?.address || ""}
                  selectingPin={selectingPin}
                  onPinSelect={handlePinSelect}
                  className="h-full rounded-none"
                />
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GuestBookingForm;