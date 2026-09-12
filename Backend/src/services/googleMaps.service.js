import axios from "axios";

const REQUEST_TIMEOUT = 10000; // 10 seconds

const GOOGLE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
const GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const GOOGLE_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";

const headers = (fieldMask) => ({
  "Content-Type": "application/json",
  "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
  "X-Goog-FieldMask": fieldMask,
});

const requestRoute = async (origin, destination, fieldMask) => {
  const response = await axios.post(
    GOOGLE_ROUTES_URL,
    {
      origin: {
        location: { latLng: { latitude: origin.latitude, longitude: origin.longitude } },
      },
      destination: {
        location: { latLng: { latitude: destination.latitude, longitude: destination.longitude } },
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      languageCode: "en-US",
      units: "METRIC",
    },
    { headers: headers(fieldMask), timeout: REQUEST_TIMEOUT }
  );

  if (!response.data.routes || response.data.routes.length === 0) {
    throw new Error("No route found.");
  }

  return response.data.routes[0];
};

export const getRoute = async (origin, destination) => {
  try {
    const route = await requestRoute(
      origin,
      destination,
      "routes.distanceMeters,routes.duration,routes.polyline"
    );

    return {
      distance: Number((route.distanceMeters / 1000).toFixed(2)),
      duration: Math.ceil(Number(route.duration.replace("s", "")) / 60),
      polyline: route.polyline?.encodedPolyline || "",
    };
  } catch (error) {
    console.error("Google Route Error:", error.response?.data || error.message);
    throw new Error("Unable to calculate route.");
  }
};

export const getETA = async (origin, destination) => {
  try {
    const route = await requestRoute(
      origin,
      destination,
      "routes.distanceMeters,routes.duration"
    );

    return {
      distance: route.distanceMeters,
      duration: Number(route.duration.replace("s", "")),
    };
  } catch (error) {
    console.error("ETA Error:", error.response?.data || error.message);
    throw new Error("Unable to calculate ETA.");
  }
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(GOOGLE_GEOCODE_URL, {
      params: { latlng: `${latitude},${longitude}`, key: process.env.GOOGLE_MAPS_API_KEY },
      timeout: REQUEST_TIMEOUT,
    });

    if (!response.data.results || response.data.results.length === 0) return null;
    return response.data.results[0].formatted_address;
  } catch (error) {
    console.error("Reverse Geocode Error:", error.response?.data || error.message);
    return null;
  }
};

export const getPlaceSuggestions = async (input) => {
  try {
    const response = await axios.post(
      GOOGLE_AUTOCOMPLETE_URL,
      { input },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
        },
        timeout: REQUEST_TIMEOUT,
      }
    );

    return (
      response.data.suggestions?.map((item) => ({
        placeId: item.placePrediction.placeId,
        text: item.placePrediction.text.text,
      })) || []
    );
  } catch (error) {
    console.error("Autocomplete Error:", error.response?.data || error.message);
    return [];
  }
};

export const getPlaceDetails = async (placeId) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: placeId,
          key: process.env.GOOGLE_MAPS_API_KEY,
          fields: "geometry.location,formatted_address,name,place_id",
        },
        timeout: REQUEST_TIMEOUT,
      }
    );

    if (!response.data.result) return null;

    const { result } = response.data;
    return {
      placeId: result.place_id,
      name: result.name,
      formattedAddress: result.formatted_address,
      lat: result.geometry?.location?.lat,
      lng: result.geometry?.location?.lng,
    };
  } catch (error) {
    console.error("Place Details Error:", error.response?.data || error.message);
    return null;
  }
};

export const calculateDistance = async (origin, destination) => {
  const route = await getRoute(origin, destination);
  return route.distance;
};
