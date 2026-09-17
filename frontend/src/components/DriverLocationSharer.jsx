import { useEffect, useRef } from "react";
import { driverAPI } from "../services/endpoints";
import useAuth from "../hooks/useAuth";

// Shares the driver's GPS while they are on duty (any /driver page).
//
// WHY THIS EXISTS: dispatch matches bookings to drivers within 5 km via a
// $near query on DriverProfile.currentLocation. GPS was previously shared
// ONLY inside CurrentRide (active trips), so idle drivers kept a stale (or
// default [0,0]) location and were invisible to dispatch — they never got
// ride-request notifications. This keeps their position fresh while online.
//
// Throttled: first fix immediately, then at most every 15 s and only when
// moved > 50 m. Silent when geolocation is denied/unavailable.
const UPDATE_INTERVAL_MS = 15_000;
const MIN_MOVE_METERS = 50;

const movedMeters = (a, b) => {
  if (!a || !b) return Infinity;
  const rad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

const DriverLocationSharer = () => {
  const { user, loading } = useAuth();
  const lastSentRef = useRef(null);
  const lastAtRef = useRef(0);

  useEffect(() => {
    if (loading || !user || user.role !== "driver") return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    let cancelled = false;

    const push = async (lat, lng) => {
      const now = Date.now();
      const last = lastSentRef.current;
      if (now - lastAtRef.current < UPDATE_INTERVAL_MS) return;
      if (last && movedMeters(last, { lat, lng }) < MIN_MOVE_METERS) {
        lastAtRef.current = now;
        return;
      }
      lastAtRef.current = now;
      lastSentRef.current = { lat, lng };
      try {
        await driverAPI.updateLocation({ latitude: lat, longitude: lng });
      } catch {
        // Best-effort: offline backend / must-be-online guard. Next tick retries.
      }
    };

    const onPosition = (pos) => {
      if (cancelled || !pos?.coords) return;
      push(pos.coords.latitude, pos.coords.longitude);
    };

    let watchId = null;
    try {
      // Seed with the last known fix instantly (no waiting for movement).
      navigator.geolocation.getCurrentPosition(onPosition, () => {}, {
        enableHighAccuracy: false,
        maximumAge: 60_000,
        timeout: 10_000,
      });
      watchId = navigator.geolocation.watchPosition(onPosition, () => {}, {
        enableHighAccuracy: false,
        maximumAge: 30_000,
        timeout: 20_000,
      });
    } catch {
      // geolocation blocked — driver stays undiscoverable by proximity
    }

    return () => {
      cancelled = true;
      try {
        if (watchId != null) navigator.geolocation.clearWatch(watchId);
      } catch {
        // ignore
      }
    };
  }, [loading, user]);

  return null;
};

export default DriverLocationSharer;
