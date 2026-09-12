// Place-name helpers for booking pickup/drop locations.
// Displayed/stored addresses must always be real place names — never raw
// "lat,lng" strings and never objects. Coordinates stay numeric-only and
// are used for fare calculation, routing and live tracking.

const COORD_PAIR_RE = /^-?\d{1,3}(?:\.\d+)?\s*,\s*-?\d{1,3}(?:\.\d+)?$/;

export const isCoordinateLike = (value) =>
  typeof value === "string" && COORD_PAIR_RE.test(value.trim());

// Normalize any address candidate to a displayable place name:
// real names pass through trimmed; place objects resolve via their name
// fields; missing / coordinate-like / non-string values become `fallback`.
export const toDisplayAddress = (value, fallback = "") => {
  if (value && typeof value === "object") {
    const named =
      value.formatted_address ||
      value.formattedAddress ||
      value.name ||
      value.address;
    if (
      typeof named === "string" &&
      named.trim() &&
      !isCoordinateLike(named)
    ) {
      return named.trim();
    }
    return fallback;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed && !isCoordinateLike(trimmed)) return trimmed;
  }
  return fallback;
};

export const isValidCoords = (coords) => {
  const lat = Number(coords?.lat);
  const lng = Number(coords?.lng);
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
};

// Backend-safe location payload: real place name + numeric coordinates.
export const buildLocationPayload = (address, coords, fallback = "") => ({
  address: toDisplayAddress(address, fallback),
  latitude: Number(coords?.lat),
  longitude: Number(coords?.lng),
});
