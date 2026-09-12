import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  MapPin,
  Navigation,
  Loader2,
  ArrowRight,
  CalendarDays,
  Hash,
} from "lucide-react";
import { guestAPI } from "../../services/endpoints";
import { saveDraft, minPickupISO } from "./guestDraft";

const DEBOUNCE_MS = 300;

const pad = (n) => String(n).padStart(2, "0");

function PlaceField({ label, icon, placeholder, value, onPick, accent }) {
  const [text, setText] = useState(value?.address || "");
  const [open, setOpen] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const timerRef = useRef(null);
  const boxRef = useRef(null);

  // Keep typed text in sync when a place is picked elsewhere (e.g. swap)
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

  const pick = useCallback(
    async (prediction) => {
      setResolving(true);
      try {
        const { data } = await guestAPI.placeDetails({
          placeId: prediction.placeId,
        });
        if (data.success && data.data?.lat != null && data.data?.lng != null) {
          const place = {
            address:
              data.data.formattedAddress || data.data.name || prediction.text,
            lat: data.data.lat,
            lng: data.data.lng,
          };
          onPick(place);
          setText(place.address);
          setOpen(false);
          setPredictions([]);
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
    [onPick],
  );

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
        {(searching || resolving) && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 animate-spin"
          />
        )}
      </div>

      <AnimatePresence>
        {open && text.trim().length >= 2 && (
          <Motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-30 bg-[#0a0f0d]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[240px] overflow-y-auto"
          >
            {searching ? (
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
                  <span className="text-sm text-white truncate">{p.text}</span>
                </button>
              ))
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Click-anywhere native date/time field. The whole control (label +
   input box) opens the native picker via showPicker(), with focus/click
   fallbacks for browsers without it. Typing stays fully native. */
function DateTimeField({ id, label, value, min, onChange }) {
  const inputRef = useRef(null);

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    try {
      if (typeof el.showPicker === "function") {
        el.showPicker();
        return;
      }
    } catch {
      // Already open or not allowed — fall through to focus.
    }
    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }
  };

  return (
    <div>
      <label
        htmlFor={id}
        onClick={openPicker}
        className="text-sm font-medium text-gray-300 flex items-center gap-1.5 cursor-pointer w-fit"
      >
        <CalendarDays size={14} className="text-green-400" /> {label}
      </label>
      <div onClick={openPicker} className="mt-1.5 cursor-pointer">
        <input
          ref={inputRef}
          id={id}
          type="datetime-local"
          value={value}
          min={min}
          onChange={onChange}
          onClick={openPicker}
          className="w-full bg-white/5 border border-white/10 px-3 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition [color-scheme:dark] cursor-pointer touch-manipulation text-[15px]"
        />
      </div>
    </div>
  );
}

const GuestBookingForm = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState("One Way");
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);

  const [pickupAt, setPickupAt] = useState("");
  const [tripDays, setTripDays] = useState(1);

  const minDateTime = (() => {
    const d = minPickupISO();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();

  const buildPickupISO = () => pickupAt;

  const handleSubmit = (e) => {
    e.preventDefault();
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
      pickupISO = buildPickupISO();
    }

    if (new Date(pickupISO) <= new Date(Date.now() + 25 * 60 * 1000)) {
      toast.error("Pickup must be at least 30 minutes from now.");
      return;
    }

    saveDraft({
      tripType,
      pickup: { address: pickup.address, lat: pickup.lat, lng: pickup.lng },
      drop: { address: drop.address, lat: drop.lat, lng: drop.lng },
      pickupDateTime: pickupISO,
      days: tripType === "Round Trip" ? parseInt(tripDays, 10) : 1,
      vehicleType: null,
      fareEstimate: null,
      guest: { name: "", email: "", phone: "", address: pickup.address },
    });
    navigate("/booking/vehicles");
  };

  const selectCls = (active) =>
    `flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer ${
      active
        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
        : "text-gray-300 hover:bg-white/10"
    }`;

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 items-end min-w-0">
      <div className="flex border border-green-500/30 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setTripType("One Way")}
          className={`w-1/2 ${selectCls(tripType === "One Way")}`}
        >
          One Way
        </button>
        <button
          type="button"
          onClick={() => setTripType("Round Trip")}
          className={`w-1/2 ${selectCls(tripType === "Round Trip")}`}
        >
          Round Trip
        </button>
      </div>

      <PlaceField
        label="Pickup Location"
        icon={<MapPin size={16} />}
        accent="text-green-400"
        placeholder="Search pickup place"
        value={pickup}
        onPick={setPickup}
      />
      <PlaceField
        label="Drop Location"
        icon={<Navigation size={16} />}
        accent="text-red-400"
        placeholder="Search destination"
        value={drop}
        onPick={setDrop}
      />

      {tripType === "Round Trip" ? (
        <>
          <DateTimeField
            id="guest-pickup-at"
            label="Pickup Date & Time"
            value={pickupAt}
            min={minDateTime}
            onChange={(e) => setPickupAt(e.target.value)}
          />
          <div>
            <label
              htmlFor="guest-trip-days"
              className="text-sm font-medium text-gray-300 flex items-center gap-1.5"
            >
              <Hash size={14} className="text-green-400" /> Number of Days
            </label>

            <input
              id="guest-trip-days"
              type="number"
              min="1"
              max="30"
              value={tripDays}
              onChange={(e) => {
                const raw = e.target.value;
                setTripDays(raw); // let the user type freely, including empty

                if (raw === "") return; // don't touch tripDays yet, just let field be empty

                const v = parseInt(raw, 10);
                if (!Number.isNaN(v)) {
                  setTripDays(Math.max(1, Math.min(30, v)));
                }
              }}
              onBlur={() => {
                // when they click away, clean up: if empty or invalid, reset to 1
                const v = parseInt(tripDays, 10);
                const clamped = Number.isNaN(v)
                  ? 1
                  : Math.max(1, Math.min(30, v));
                setTripDays(clamped);
                setTripDays(String(clamped));
              }}
              className="mt-1.5 w-full bg-white/5 border border-white/10 px-3 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition [color-scheme:dark] text-[15px]"
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
          min={minDateTime}
          onChange={(e) => setPickupAt(e.target.value)}
        />
      )}

      <Motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-6 py-3.5 rounded-2xl hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
      >
        Choose Car Type <ArrowRight size={18} />
      </Motion.button>
    </form>
  );
};

export default GuestBookingForm;
