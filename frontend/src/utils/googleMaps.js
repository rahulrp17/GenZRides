// Single source of truth for the Google Maps JS API loader.
//
// @react-google-maps/api loads the script ONCE per page and THROWS
// ("Loader must not be called again with different options") if any second
// useJsApiLoader/LoadScript call passes different options. Every map surface
// (BookRide, RideMap, CurrentRideCustomer, driver CurrentRide, Booking form)
// must therefore use THESE exact exports — never an inline libraries array
// (inline arrays also break referential equality and cause reload loops).
export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// Union of everything the app needs:
//   marker — AdvancedMarkerElement (live driver/customer pins)
//   places — Autocomplete + geocoding in booking forms
export const GOOGLE_MAPS_LIBRARIES = Object.freeze(["marker", "places"]);
