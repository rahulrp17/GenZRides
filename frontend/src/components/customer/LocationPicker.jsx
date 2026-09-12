import { useState, useCallback, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Home,
  Building2,
  Clock,
  Plus,
  X,
  Plane,
  Loader2,
  Crosshair,
} from "lucide-react";
import { mapsAPI } from "../../services/endpoints";

const SAVED_PLACES_KEY = "rideSavedPlaces";
const RECENT_SEARCHES_KEY = "rideRecentSearches";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 300;

const CHENNAI_AIRPORT = {
  name: "Chennai International Airport",
  formatted_address:
    "Chennai International Airport (MAA), Meenambakkam, Chennai, Tamil Nadu 600027",
  lat: 12.9941,
  lng: 80.1709,
  place_id: "ChIJL-fhCilU4joRwQlbRwzqDPs",
};

function loadSavedPlaces() {
  try {
    const raw = localStorage.getItem(SAVED_PLACES_KEY);
    return raw ? JSON.parse(raw) : { home: null, work: null };
  } catch {
    return { home: null, work: null };
  }
}

function saveSavedPlaces(places) {
  try {
    localStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(places));
  } catch {
    /* quota exceeded */
  }
}

function loadRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches) {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    /* quota exceeded */
  }
}

function addRecentSearch(search) {
  const existing = loadRecentSearches();
  const filtered = existing.filter(
    (s) =>
      s.place_id !== search.place_id &&
      s.formatted_address !== search.formatted_address
  );
  const updated = [search, ...filtered].slice(0, MAX_RECENT);
  saveRecentSearches(updated);
  return updated;
}

export default function LocationPicker({
  pickupAddress,
  dropAddress,
  pickupCoords = null,
  dropCoords = null,
  onPickupSelect,
  onDropSelect,
  onSelectCurrentLocation,
  onSetOnMap,
}) {
  const [activeField, setActiveField] = useState(null);
  const [pickupInputValue, setPickupInputValue] = useState("");
  const [dropInputValue, setDropInputValue] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState(loadSavedPlaces);
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches);
  const [activeSavedPlaceEdit, setActiveSavedPlaceEdit] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const searchTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const pickupInputRef = useRef(null);
  const dropInputRef = useRef(null);

  useEffect(() => {
    setSavedPlaces(loadSavedPlaces());
    setRecentSearches(loadRecentSearches());
  }, []);

  // Sync input values with external address props
  useEffect(() => {
    if (!activeField || activeField !== "pickup") {
      setPickupInputValue(pickupAddress || "");
    }
  }, [pickupAddress, activeField]);

  useEffect(() => {
    if (!activeField || activeField !== "drop") {
      setDropInputValue(dropAddress || "");
    }
  }, [dropAddress, activeField]);

  // Focus input when field becomes active
  useEffect(() => {
    if (activeField === "pickup" && pickupInputRef.current) {
      setTimeout(() => pickupInputRef.current?.focus(), 50);
    }
    if (activeField === "drop" && dropInputRef.current) {
      setTimeout(() => dropInputRef.current?.focus(), 50);
    }
  }, [activeField]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeDropdown();
      }
    };
    if (activeField) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside, { passive: true });
      return () => {
        document.removeEventListener("mousedown", handleOutside);
        document.removeEventListener("touchstart", handleOutside);
      };
    }
  }, [activeField]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeDropdown = useCallback(() => {
    setActiveField(null);
    setPredictions([]);
    setSearching(false);
  }, []);

  const handlePickupFocus = useCallback(() => {
    setActiveField("pickup");
    setPickupInputValue("");
    setPredictions([]);
  }, []);

  const handleDropFocus = useCallback(() => {
    setActiveField("drop");
    setDropInputValue("");
    setPredictions([]);
  }, []);

  const handlePickupChange = useCallback((value) => {
    setPickupInputValue(value);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!value || value.trim().length < 2) {
      setPredictions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await mapsAPI.autocomplete({ input: value.trim() });
        if (data.success && data.data) {
          setPredictions(data.data);
        }
      } catch {
        setPredictions([]);
      } finally {
        setSearching(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const handleDropChange = useCallback((value) => {
    setDropInputValue(value);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!value || value.trim().length < 2) {
      setPredictions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await mapsAPI.autocomplete({ input: value.trim() });
        if (data.success && data.data) {
          setPredictions(data.data);
        }
      } catch {
        setPredictions([]);
      } finally {
        setSearching(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const handleSelectPrediction = useCallback(
    async (prediction) => {
      setSearching(true);
      try {
        const { data } = await mapsAPI.getPlaceDetails({
          placeId: prediction.placeId,
        });
        if (data.success && data.data) {
          const place = {
            place_id: data.data.placeId,
            name: data.data.name,
            formatted_address: data.data.formattedAddress,
            lat: data.data.lat,
            lng: data.data.lng,
          };
          setRecentSearches(addRecentSearch(place));
          if (activeField === "pickup") {
            onPickupSelect(place);
          } else {
            onDropSelect(place);
          }
          closeDropdown();
        }
      } catch {
        const place = {
          place_id: prediction.placeId,
          name: prediction.text,
          formatted_address: prediction.text,
          lat: null,
          lng: null,
        };
        if (activeField === "pickup") {
          onPickupSelect(place);
        } else {
          onDropSelect(place);
        }
        closeDropdown();
      } finally {
        setSearching(false);
      }
    },
    [activeField, onPickupSelect, onDropSelect, closeDropdown]
  );

  const handleSelectSavedPlace = useCallback(
    (type) => {
      const place = savedPlaces[type];
      if (!place) return;
      if (activeField === "pickup") {
        onPickupSelect(place);
      } else if (activeField === "drop") {
        onDropSelect(place);
      } else {
        // No field focused — auto-assign to first empty field
        if (!pickupAddress) {
          onPickupSelect(place);
        } else {
          onDropSelect(place);
        }
      }
      closeDropdown();
    },
    [savedPlaces, activeField, pickupAddress, onPickupSelect, onDropSelect, closeDropdown]
  );

  const handleSelectAirport = useCallback(() => {
    setRecentSearches(addRecentSearch(CHENNAI_AIRPORT));
    if (activeField === "pickup") {
      onPickupSelect(CHENNAI_AIRPORT);
    } else {
      onDropSelect(CHENNAI_AIRPORT);
    }
    closeDropdown();
  }, [activeField, onPickupSelect, onDropSelect, closeDropdown]);

  const handleSelectRecent = useCallback(
    (search) => {
      if (activeField === "pickup") {
        onPickupSelect(search);
      } else {
        onDropSelect(search);
      }
      closeDropdown();
    },
    [activeField, onPickupSelect, onDropSelect, closeDropdown]
  );

  const handleCurrentLocation = useCallback(() => {
    setLocationLoading(true);
    onSelectCurrentLocation();
    closeDropdown();
    setTimeout(() => setLocationLoading(false), 5000);
  }, [onSelectCurrentLocation, closeDropdown]);

  const handleSetOnMap = useCallback(() => {
    onSetOnMap(activeField);
    closeDropdown();
  }, [activeField, onSetOnMap, closeDropdown]);

  const handleSwap = useCallback(() => {
    // Swap full places (names + coordinates) so map markers/labels stay in sync
    const currentPickup = {
      formatted_address: pickupAddress,
      lat: pickupCoords?.lat ?? null,
      lng: pickupCoords?.lng ?? null,
      place_id: "",
    };
    const currentDrop = {
      formatted_address: dropAddress,
      lat: dropCoords?.lat ?? null,
      lng: dropCoords?.lng ?? null,
      place_id: "",
    };
    onPickupSelect(currentDrop);
    onDropSelect(currentPickup);
  }, [pickupAddress, dropAddress, pickupCoords, dropCoords, onPickupSelect, onDropSelect]);

  const handleEditSavedPlace = useCallback(
    (type) => {
      setActiveSavedPlaceEdit(type);
    },
    []
  );

  const handleSaveSavedPlace = useCallback(
    (type, place) => {
      const updated = { ...savedPlaces, [type]: place };
      setSavedPlaces(updated);
      saveSavedPlaces(updated);
      setActiveSavedPlaceEdit(null);
    },
    [savedPlaces]
  );

  const handleRemoveSavedPlace = useCallback(
    (type) => {
      const updated = { ...savedPlaces, [type]: null };
      setSavedPlaces(updated);
      saveSavedPlaces(updated);
      setActiveSavedPlaceEdit(null);
    },
    [savedPlaces]
  );

  const handleClearRecent = useCallback(() => {
    saveRecentSearches([]);
    setRecentSearches([]);
  }, []);

  const hasPickup = !!pickupAddress;
  const hasDrop = !!dropAddress;
  const isPickupActive = activeField === "pickup";
  const isDropActive = activeField === "drop";
  const showDropdown = activeField !== null;

  const inputValue = isPickupActive ? pickupInputValue : dropInputValue;

  return (
    <div className="w-full max-w-full min-w-0" ref={dropdownRef}>
      {/* Location Inputs Card */}
      <div className="bg-white/5 rounded-2xl shadow-sm border border-white/10 overflow-hidden max-w-full">
        <div className="p-4 pb-3">
          <div className="relative flex items-start gap-3 min-w-0">
            {/* Dot indicators */}
            <div className="flex flex-col items-center pt-3 gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-500/30 flex-shrink-0" />
              <div className="w-0.5 h-6 bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-500/30 flex-shrink-0" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {/* Pickup Input - IS the search field */}
              <div className="relative">
                <input
                  ref={pickupInputRef}
                  type="text"
                  placeholder="Pickup location"
                  value={isPickupActive ? pickupInputValue : pickupAddress}
                  onChange={(e) => handlePickupChange(e.target.value)}
                  onFocus={handlePickupFocus}
                  onPointerDown={handlePickupFocus}
                  autoComplete="off"
                  inputMode="text"
                  className={`w-full min-w-0 px-3 py-3 rounded-xl border transition-all duration-150 text-base font-medium outline-none ${
                    isPickupActive
                      ? "border-emerald-400/70 bg-emerald-500/10 text-white ring-2 ring-emerald-500/20 placeholder-gray-400"
                      : pickupAddress
                      ? "border-white/10 bg-white/5 text-white cursor-text"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 cursor-text"
                  }`}
                />
                {isPickupActive && pickupInputValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setPickupInputValue("");
                      setPredictions([]);
                      pickupInputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                )}
              </div>

              {/* Drop Input - IS the search field */}
              <div className="relative">
                <input
                  ref={dropInputRef}
                  type="text"
                  placeholder="Where to?"
                  value={isDropActive ? dropInputValue : dropAddress}
                  onChange={(e) => handleDropChange(e.target.value)}
                  onFocus={handleDropFocus}
                  onPointerDown={handleDropFocus}
                  autoComplete="off"
                  inputMode="text"
                  className={`w-full min-w-0 px-3 py-3 rounded-xl border transition-all duration-150 text-base font-medium outline-none ${
                    isDropActive
                      ? "border-red-400/70 bg-red-500/10 text-white ring-2 ring-red-500/20 placeholder-gray-400"
                      : dropAddress
                      ? "border-white/10 bg-white/5 text-white cursor-text"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 cursor-text"
                  }`}
                />
                {isDropActive && dropInputValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropInputValue("");
                      setPredictions([]);
                      dropInputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Swap Button */}
            {(hasPickup || hasDrop) && !showDropdown && (
              <button
                type="button"
                onClick={handleSwap}
                className="mt-2 p-1.5 rounded-full bg-white/5 border border-white/10 shadow-sm hover:bg-white/10 hover:shadow-md transition-all duration-150 active:scale-95 flex-shrink-0"
                title="Swap locations"
              >
                <ArrowUpDown size={14} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {showDropdown && (
          <Motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mt-2 w-full max-w-full bg-white/5 rounded-2xl shadow-lg border border-white/10 overflow-hidden max-h-[45dvh] sm:max-h-[60vh] overflow-y-auto overscroll-contain"
          >
            {/* Search Results (when typing) */}
            {inputValue && inputValue.length >= 2 && (
              <div className="py-1">
                {searching && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2
                      size={20}
                      className="text-indigo-500 animate-spin"
                    />
                  </div>
                )}

                {!searching && predictions.length === 0 && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-400">
                      No results found. Try a different search.
                    </p>
                  </div>
                )}

                {!searching &&
                  predictions.map((prediction) => (
                    <button
                      key={prediction.placeId}
                      type="button"
                      title={prediction.text}
                      onClick={() => handleSelectPrediction(prediction)}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors duration-100 text-left"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 flex-shrink-0">
                        <MapPin size={16} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {prediction.text}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            )}

            {/* Quick Actions (always visible when dropdown is open) */}
            {!inputValue || inputValue.length < 2 ? (
              <div className="py-1">
                {/* Use Current Location - pickup only */}
                {isPickupActive && (
                  <button
                    type="button"
                    onClick={handleCurrentLocation}
                    disabled={locationLoading}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors duration-100 text-left"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 flex-shrink-0">
                      {locationLoading ? (
                        <Loader2
                          size={18}
                          className="text-blue-600 animate-spin"
                        />
                      ) : (
                        <Navigation size={18} className="text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        Use current location
                      </p>
                    </div>
                  </button>
                )}

                {/* Chennai Airport - drop only */}
                {isDropActive && (
                  <button
                    type="button"
                    onClick={handleSelectAirport}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors duration-100 text-left"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-500/10 flex-shrink-0">
                      <Plane size={18} className="text-sky-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        Chennai International Airport
                      </p>
                      <p className="text-xs text-gray-400">MAA - Chennai</p>
                    </div>
                  </button>
                )}

                {/* Set on Map */}
                <button
                  type="button"
                  onClick={handleSetOnMap}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors duration-100 text-left"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 flex-shrink-0">
                    <Crosshair size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      Set {isPickupActive ? "pickup" : "drop-off"} on map
                    </p>
                  </div>
                </button>
              </div>
            ) : null}

            {/* Saved Places */}
            <div className="border-t border-white/10 py-1">
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Saved places
                </h3>
              </div>

              <SavedPlaceButton
                type="home"
                icon={<Home size={18} className="text-gray-600" />}
                place={savedPlaces.home}
                onSelect={() => handleSelectSavedPlace("home")}
                onEdit={() => handleEditSavedPlace("home")}
                onRemove={() => handleRemoveSavedPlace("home")}
                onSave={handleSaveSavedPlace}
                isEditing={activeSavedPlaceEdit === "home"}
                onStartEdit={() => setActiveSavedPlaceEdit("home")}
                onCancelEdit={() => setActiveSavedPlaceEdit(null)}
              />

              <SavedPlaceButton
                type="work"
                icon={<Building2 size={18} className="text-gray-600" />}
                place={savedPlaces.work}
                onSelect={() => handleSelectSavedPlace("work")}
                onEdit={() => handleEditSavedPlace("work")}
                onRemove={() => handleRemoveSavedPlace("work")}
                onSave={handleSaveSavedPlace}
                isEditing={activeSavedPlaceEdit === "work"}
                onStartEdit={() => setActiveSavedPlaceEdit("work")}
                onCancelEdit={() => setActiveSavedPlaceEdit(null)}
              />
            </div>

            {/* Recent Searches (when no search active) */}
            {(!inputValue || inputValue.length < 2) &&
              recentSearches.length > 0 && (
<div className="border-t border-white/10 py-1">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Recent searches
                    </h3>
                    <button
                      type="button"
                      onClick={handleClearRecent}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>

                  {recentSearches.map((search, index) => (
                    <button
                      key={`${search.place_id || search.formatted_address}-${index}`}
                      type="button"
                      onClick={() => handleSelectRecent(search)}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors duration-100 text-left"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 flex-shrink-0">
                        <Clock size={16} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {search.name || search.formatted_address}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {search.formatted_address}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </Motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function SavedPlaceButton({
  type,
  icon,
  place,
  onSelect,
  onRemove,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSave,
}) {
  const [editValue, setEditValue] = useState("");
  const [editPredictions, setEditPredictions] = useState([]);
  const [editSearching, setEditSearching] = useState(false);
  const editTimerRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      setEditValue(place?.formatted_address || "");
      setEditPredictions([]);
    }
  }, [isEditing, place]);

  const handleEditChange = useCallback((value) => {
    setEditValue(value);
    if (editTimerRef.current) clearTimeout(editTimerRef.current);
    if (!value || value.trim().length < 2) {
      setEditPredictions([]);
      return;
    }
    setEditSearching(true);
    editTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await mapsAPI.autocomplete({ input: value.trim() });
        if (data.success && data.data) setEditPredictions(data.data);
      } catch { setEditPredictions([]); }
      finally { setEditSearching(false); }
    }, 300);
  }, []);

  const handleEditSelect = useCallback(async (prediction) => {
    setEditSearching(true);
    try {
      const { data } = await mapsAPI.getPlaceDetails({ placeId: prediction.placeId });
      if (data.success && data.data) {
        onSave(type, {
          place_id: data.data.placeId,
          name: type === "home" ? "Home" : "Work",
          formatted_address: data.data.formattedAddress,
          lat: data.data.lat,
          lng: data.data.lng,
        });
      }
    } catch {
      onSave(type, {
        place_id: prediction.placeId,
        name: type === "home" ? "Home" : "Work",
        formatted_address: prediction.text,
        lat: null,
        lng: null,
      });
    } finally { setEditSearching(false); }
  }, [type, onSave]);

  const handleEditSaveManual = useCallback(() => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    onSave(type, {
      place_id: place?.place_id || "",
      name: type === "home" ? "Home" : "Work",
      formatted_address: trimmed,
      lat: place?.lat || null,
      lng: place?.lng || null,
    });
  }, [type, editValue, place, onSave]);

  if (isEditing) {
    return (
      <div className="px-4 py-2 border-b border-white/5">
        <p className="text-xs font-medium text-gray-400 mb-1.5">
          {place ? "Edit" : "Add"} {type === "home" ? "Home" : "Work"} address
        </p>
        <div className="relative">
          <input
            type="text"
            value={editValue}
            onChange={(e) => handleEditChange(e.target.value)}
            placeholder={`Search ${type === "home" ? "home" : "work"} address...`}
            autoFocus
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
          />
          {editSearching && (
            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
          )}
        </div>
        {editPredictions.length > 0 && (
          <div className="mt-1 max-h-[150px] overflow-y-auto rounded-lg border border-white/10 bg-gray-900">
            {editPredictions.map((p) => (
              <button
                key={p.placeId}
                type="button"
                onClick={() => handleEditSelect(p)}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-white/5 text-left"
              >
                <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-300 truncate">{p.text}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={handleEditSaveManual} className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition">Save</button>
          {place && <button type="button" onClick={onRemove} className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition">Remove</button>}
          <button type="button" onClick={onCancelEdit} className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => (place ? onSelect() : onStartEdit())}
        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors duration-100 text-left"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">
            {type === "home" ? "Home" : "Work"}
          </p>
          {place ? (
            <p className="text-xs text-gray-400 truncate">
              {place.formatted_address}
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              Add {type === "home" ? "Home" : "Work"}
            </p>
          )}
        </div>
        {place ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            title={`Edit ${type} address`}
          >
            <span className="text-xs text-gray-400">Edit</span>
          </button>
        ) : (
          <Plus size={16} className="text-gray-400" />
        )}
      </button>
    </div>
  );
}
