// Place-name helpers for booking pickup/drop locations.
// Displayed/stored addresses must always be real place names — never raw
// "lat,lng" strings and never objects. Coordinates stay numeric-only and
// are used for fare calculation, routing and live tracking.

const COORD_PAIR_RE = /^-?\d{1,3}(?:\.\d+)?\s*,\s*-?\d{1,3}(?:\.\d+)?$/;

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Google prefixes plus-codes (e.g. "RP5J+X95, ...") onto formatted_address
// for POIs that don't have a street address — cryptic for a cab pickup.
const PLUS_CODE_PREFIX_RE = /^\s*[0-9A-Z]{4,6}\+[0-9A-Z]{2,4},\s*/;

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

// Best human label for a picked suggestion. Google's formatted_address for
// many places — especially small-town stores/shops — drops the establishment
// name (or is just the locality / a plus-code), so the input can look like it
// "only kept the main place" (e.g. "Trichy" or "Thuraiyur"). Keep the place
// name in front when it isn't already part of the address, and strip a
// leading plus-code token so the exact spot stays readable and pinned.
export const buildPlaceDisplayName = ({
  name = "",
  formattedAddress = "",
  fallback = "",
} = {}) => {
  const nameT = String(name ?? "").trim();
  let addrT = String(formattedAddress ?? "").trim().replace(PLUS_CODE_PREFIX_RE, "");
  if (!addrT) {
    return nameT || String(fallback ?? "").trim();
  }
  if (nameT && !new RegExp(escapeRegExp(nameT), "i").test(addrT)) {
    return `${nameT}, ${addrT}`;
  }
  return addrT;
};
