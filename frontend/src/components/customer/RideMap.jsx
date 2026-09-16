import React from "react";
import { motion as Motion } from "framer-motion";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { mapsAPI } from "../../services/endpoints";
import { GOOGLE_MAPS_LIBRARIES } from "../../utils/googleMaps";

function decodePolyline(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;
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

const CHENNAI_CENTER = { lat: 13.0827, lng: 80.2707 };
const DEFAULT_ZOOM = 12;

const GREEN_MARKER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#16a34a" stroke="#fff" stroke-width="2"/><circle cx="14" cy="14" r="4" fill="#fff"/></svg>',
)}`;

const RED_MARKER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="34" viewBox="0 0 24 34"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z" fill="#dc2626" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="11" r="4" fill="#fff"/></svg>',
)}`;

const DRAGGABLE_MARKER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42"><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#4f46e5" stroke="#fff" stroke-width="2"/><circle cx="16" cy="15" r="6" fill="#fff"/><circle cx="16" cy="15" r="3" fill="#4f46e5"/></svg>',
)}`;

const mapContainerStyle = { width: "100%", height: "100%" };

// Default Google map styling: POI, transit, road/area labels all visible
// so places, stations and local areas render on the Book Ride map.
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

function RideMap({
  pickupCoords,
  dropCoords,
  pickupAddress = "",
  dropAddress = "",
  onPinSelect,
  selectingPin,
  className = "",
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [map, setMap] = React.useState(null);
  const [encodedPolyline, setEncodedPolyline] = React.useState("");
  const [draggablePin, setDraggablePin] = React.useState(null);
  const [center, setCenter] = React.useState(CHENNAI_CENTER);
  const [zoom, setZoom] = React.useState(DEFAULT_ZOOM);

  const routeTimerRef = React.useRef(null);
  const mapRef = React.useRef(null);

  // When entering selection mode, place initial draggable pin
  React.useEffect(() => {
    if (selectingPin) {
      const initial =
        selectingPin === "pickup"
          ? pickupCoords || center
          : dropCoords || center;
      setDraggablePin(initial);
      if (map) {
        map.panTo(initial);
        map.setZoom(14);
      }
    } else {
      setDraggablePin(null);
    }
  }, [selectingPin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch route polyline from backend when both coords present
  React.useEffect(() => {
    if (!pickupCoords || !dropCoords) {
      setEncodedPolyline("");
      return;
    }

    if (routeTimerRef.current) clearTimeout(routeTimerRef.current);

    routeTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await mapsAPI.getRoute({
          origin: {
            latitude: pickupCoords.lat,
            longitude: pickupCoords.lng,
          },
          destination: {
            latitude: dropCoords.lat,
            longitude: dropCoords.lng,
          },
        });
        if (data.success && data.data?.polyline) {
          setEncodedPolyline(data.data.polyline);
        }
      } catch {
        setEncodedPolyline("");
      }
    }, 200);

    return () => {
      if (routeTimerRef.current) clearTimeout(routeTimerRef.current);
    };
  }, [pickupCoords?.lat, pickupCoords?.lng, dropCoords?.lat, dropCoords?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fit bounds when both markers present
  React.useEffect(() => {
    if (!map || !pickupCoords || !dropCoords) return;

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(pickupCoords);
    bounds.extend(dropCoords);
    map.fitBounds(bounds, 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    map,
    pickupCoords?.lat,
    pickupCoords?.lng,
    dropCoords?.lat,
    dropCoords?.lng,
  ]);

  // Zoom to pickup when only pickup is set
  React.useEffect(() => {
    if (!pickupCoords || dropCoords || !map) return;

    map.panTo(pickupCoords);
    map.setZoom(13);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, pickupCoords?.lat, pickupCoords?.lng, dropCoords]);

  const onMapLoad = React.useCallback((m) => {
    mapRef.current = m;
    setMap(m);
  }, []);

  // Click on map in selection mode -> move the draggable pin
  const onMapClick = React.useCallback(
    (e) => {
      if (!selectingPin || !onPinSelect) return;
      const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setDraggablePin(coords);
    },
    [selectingPin, onPinSelect],
  );

  // Drag the marker
  const onMarkerDragEnd = React.useCallback(
    (e) => {
      if (!selectingPin || !onPinSelect) return;
      const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setDraggablePin(coords);
    },
    [selectingPin, onPinSelect],
  );

  // Confirm pin selection
  const handleConfirmPin = React.useCallback(() => {
    if (draggablePin && onPinSelect) {
      onPinSelect(draggablePin);
    }
  }, [draggablePin, onPinSelect]);

  const handleCenterOnMe = React.useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCenter(coords);
        setZoom(14);
        if (mapRef.current) {
          mapRef.current.panTo(coords);
          mapRef.current.setZoom(14);
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  if (loadError) {
    return (
      <div
        className={`rounded-2xl shadow-lg overflow-hidden bg-white/5 flex items-center justify-center ${className}`}
      >
        <p className="text-sm text-gray-400">Failed to load map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`rounded-2xl shadow-lg overflow-hidden bg-white/10 animate-pulse ${className}`}
        style={{ minHeight: 300 }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-white/20 border-t-green-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative rounded-2xl shadow-lg overflow-hidden ${className}`}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={onMapLoad}
        onClick={onMapClick}
      >
        {/* Confirmed pickup marker */}
        {pickupCoords && !selectingPin && (
          <Marker
            position={pickupCoords}
            icon={GREEN_MARKER}
            title={pickupAddress || "Pickup"}
          />
        )}

        {/* Confirmed drop marker */}
        {dropCoords && !selectingPin && (
          <Marker
            position={dropCoords}
            icon={RED_MARKER}
            title={dropAddress || "Drop"}
          />
        )}

        {/* Route polyline (no legacy DirectionsService) */}
        {encodedPolyline && !selectingPin && (
          <Polyline
            path={decodePolyline(encodedPolyline)}
            options={{
              strokeColor: "#2513c2",
              strokeWeight: 4,
              strokeOpacity: 0.7,
              geodesic: true,
            }}
          />
        )}

        {/* Draggable pin in selection mode */}
        {selectingPin && draggablePin && (
          <Marker
            position={draggablePin}
            icon={DRAGGABLE_MARKER}
            title={`Set ${selectingPin}`}
            draggable
            onDragEnd={onMarkerDragEnd}
            animation={window.google?.maps?.Animation?.DROP}
          />
        )}

        {/* Show existing markers while in selection mode (dimmed) */}
        {selectingPin && selectingPin === "drop" && pickupCoords && (
          <Marker
            position={pickupCoords}
            icon={GREEN_MARKER}
            opacity={0.5}
            title="Pickup"
          />
        )}
        {selectingPin && selectingPin === "pickup" && dropCoords && (
          <Marker
            position={dropCoords}
            icon={RED_MARKER}
            opacity={0.5}
            title="Drop"
          />
        )}
      </GoogleMap>

      {/* Selected place names — always visible when set */}
      {(pickupAddress || dropAddress) && !selectingPin && (
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {pickupAddress ? (
            <div className="pointer-events-auto flex items-center gap-2 bg-black/70 backdrop-blur-md border border-emerald-500/30 rounded-xl px-3 py-2 shadow-lg max-w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <p
                className="text-xs font-medium text-white truncate min-w-0"
                title={pickupAddress}
              >
                {pickupAddress}
              </p>
            </div>
          ) : null}
          {dropAddress ? (
            <div className="pointer-events-auto flex items-center gap-2 bg-black/70 backdrop-blur-md border border-red-500/30 rounded-xl px-3 py-2 shadow-lg max-w-full">
              <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
              <p
                className="text-xs font-medium text-white truncate min-w-0"
                title={dropAddress}
              >
                {dropAddress}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Center on me button */}
      <button
        type="button"
        onClick={handleCenterOnMe}
        className="absolute bottom-3 right-3 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl shadow-md p-2.5 transition-all duration-200 hover:scale-105"
        title="Center on my location"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Selection mode banner + confirm button */}
      {selectingPin && (
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2">
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 px-3 py-2 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                selectingPin === "pickup" ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <p className="text-xs font-medium text-gray-300">
              {draggablePin
                ? "Drag pin or tap map to adjust"
                : "Tap on the map to place pin"}
            </p>
          </div>
          {draggablePin && (
            <button
              type="button"
              onClick={handleConfirmPin}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
            >
              Confirm
            </button>
          )}
        </div>
      )}
    </Motion.div>
  );
}

export default React.memo(RideMap);
