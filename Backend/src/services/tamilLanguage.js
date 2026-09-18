/* ===========================================================
   TAMIL + TANGLISH UNDERSTANDING
   Detects English / Tamil-script / Tanglish (romanized Tamil),
   normalizes spelling variations + Tamil place names to English
   for geocoding, and extracts route/date/vehicle/trip-type intent.
   Existing booking/fare/vehicle APIs are reused untouched —
   this module only translates the HUMAN side.
=========================================================== */

const TAMIL_RANGE = /[\u0B80-\u0BFF]/;

const TANGLISH_MARKERS =
  /\b(venum|vendum|venam|venu|poganum|pogalam|poren|poga|varanum|varalam|sollunga|sollu|enna|evlo|evvalavu|vilai|eppo|eppadi|enga|enge|yaaru|naalaiku|inniku|kaalaila|saayangal|irukka|irukku|kidaikuma|pannunga|pannu|theriyuma|aama|illa|konjam|romba|mattum|udane)\b/i;

export function detectLanguage(message) {
  const text = String(message || "");
  if (TAMIL_RANGE.test(text)) return "ta";
  if (TANGLISH_MARKERS.test(text)) return "tanglish";
  return "en";
}

/* Tamil-script city stems → English (suffixes stripped by regex). */
const TA_CITIES = {
  "திருச்சி": "Trichy",
  "திருச்சிராப்பள்ளி": "Trichy",
  "சென்னை": "Chennai",
  "மதுரை": "Madurai",
  "கோயம்புத்தூர்": "Coimbatore",
  "கோவை": "Coimbatore",
  "சேலம்": "Salem",
  "பெங்களூர்": "Bangalore",
  "பெங்களூரு": "Bangalore",
  "வேலூர்": "Vellore",
  "தஞ்சாவூர்": "Thanjavur",
  "ஈரோடு": "Erode",
  "திருநெல்வேலி": "Tirunelveli",
  "புதுச்சேரி": "Puducherry",
  "பாண்டிச்சேரி": "Puducherry",
  "ஊட்டி": "Ooty",
  "உதகமண்டலம்": "Ooty",
  "கன்னியாகுமரி": "Kanyakumari",
  "ராமேஸ்வரம்": "Rameshwaram",
};

/* Tanglish/English spelling variations → canonical English. */
const TANGLISH_CITIES = {
  trichy: "Trichy",
  tiruchy: "Trichy",
  tiruchi: "Trichy",
  trichi: "Trichy",
  tiruchirappalli: "Trichy",
  chennai: "Chennai",
  madras: "Chennai",
  madurai: "Madurai",
  coimbatore: "Coimbatore",
  kovai: "Coimbatore",
  salem: "Salem",
  bangalore: "Bangalore",
  bengaluru: "Bangalore",
  vellore: "Vellore",
  thanjavur: "Thanjavur",
  tanjore: "Thanjavur",
  erode: "Erode",
  tirunelveli: "Tirunelveli",
  nellai: "Tirunelveli",
  puducherry: "Puducherry",
  pondicherry: "Puducherry",
  pondy: "Puducherry",
  ooty: "Ooty",
  kanyakumari: "Kanyakumari",
  rameshwaram: "Rameshwaram",
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Tamil case suffixes: from (-ilirundhu), to (-kku), at (-il), acc (-ai).
   Note "க்கு" (doubled-k, as in சென்னைக்கு), not "ுக்கு". */
const TA_SUFFIX = "(?:யிலிருந்து|லிருந்து|இலிருந்து|க்கு|கு|யில்|இல்|ல்|ஐ)?";

export function normalizeLocations(message) {
  let text = String(message || "");
  const stems = Object.keys(TA_CITIES).sort((a, b) => b.length - a.length);
  for (const stem of stems) {
    const re = new RegExp(stem + TA_SUFFIX, "g");
    text = text.replace(re, TA_CITIES[stem]);
  }
  const variants = Object.keys(TANGLISH_CITIES).sort((a, b) => b.length - a.length);
  for (const v of variants) {
    const re = new RegExp(`\\b${escapeRegExp(v)}\\b`, "gi");
    text = text.replace(re, TANGLISH_CITIES[v]);
  }
  return text.replace(/\s+/g, " ").trim();
}

/* "X la irundhu Y ku ..." / "Xil irundhu Yku" → { from: X, to: Y }. */
export function extractTanglishRoute(message) {
  const text = String(message || "");
  const m = text.match(/(.+?)\s+(?:la\s+|lerundhu\s+|ilirundhu\s+)?irundhu\s+(.+)/i);
  if (!m) return null;
  const from = cleanPlaceName(m[1]);
  const rest = m[2];
  // Destination = first known city in the remainder (before ku/cab words).
  const lowerRest = ` ${rest.toLowerCase()} `;
  let to = null;
  for (const [variant, english] of Object.entries(TANGLISH_CITIES)) {
    const idx = lowerRest.indexOf(` ${variant} `);
    if (idx !== -1 && (to === null || idx < to.idx)) {
      to = { name: english, idx };
    }
  }
  // "... Chennai ku cab venum": city followed by ku with trailing words.
  if (!to) {
    const ku = rest.match(/(\S+?)\s*kku?\b/i);
    if (ku) to = { name: cleanPlaceName(ku[1]), idx: 0 };
  }
  if (!from || !to?.name) return null;
  return { from, to: to.name };
}

/* Tamil-script "Xil irundhu Ykku" (suffixes carry from/to). */
export function extractTamilRoute(message) {
  const text = String(message || "");
  const fromMatch = text.match(/(\S+?)(?:யிலிருந்து|லிருந்து|இலிருந்து)/);
  if (!fromMatch) return null;
  const fromStem = fromMatch[1].replace(/^(எனக்கு|எனக்க)?\s*/, "").trim().split(/\s+/).pop();
  const from = TA_CITIES[fromStem] || cleanPlaceName(fromStem);
  const rest = text.slice(fromMatch.index + fromMatch[0].length);
  // Destination = first known Tamil city stem in the remainder.
  let to = null;
  let toIdx = Infinity;
  for (const [stem, english] of Object.entries(TA_CITIES)) {
    const idx = rest.indexOf(stem);
    if (idx !== -1 && idx < toIdx) {
      to = english;
      toIdx = idx;
    }
  }
  if (!from || !to) return null;
  return { from, to };
}

const ROUTE_JUNK = new Set([
  "cab", "cabs", "taxi", "taxis", "car", "cars", "vandi", "vandi",
  "fare", "fares", "price", "prices", "cost", "costs", "estimate",
  "enna", "evlo", "evvalavu", "vilai", "ku", "kku", "la",
  "venum", "vendum", "venam", "poganum", "sollunga",
  "please", "calculate", "tell", "me", "the", "a", "an", "for",
  "charge", "charges", "rate", "rates", "tariff", "cost",
]);

/* Strip trailing/leading filler words so "Madurai cab price enna?"
   geocodes as plain "Madurai". Keeps single-word names intact. */
export function cleanRouteEnds(s) {
  const parts = String(s || "").split(/\s+/).filter(Boolean);
  const isJunk = (w) => ROUTE_JUNK.has(w.toLowerCase().replace(/[?.!,;:'"]+$/g, ""));
  while (parts.length > 1 && isJunk(parts[parts.length - 1])) parts.pop();
  while (parts.length > 1 && isJunk(parts[0])) parts.shift();
  return parts.join(" ").replace(/[?.!,;:'"]+$/g, "").trim();
}

function cleanPlaceName(s) {
  return String(s || "")
    .replace(/\b(la|ku|kku|irundhu|lerundhu|cab|taxi|car|venum|vendum|venam|price|fare|enna|evlo|ku\b)\b/gi, " ")
    .replace(/[?.!,;:'"]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(the|oru|my)\s+/i, "");
}

/* Relative day + time-of-day / clock time, any of the 3 languages. */
export function extractTamilWhen(message) {
  const text = String(message || "");
  let day = null;
  if (/naalaiku|நாளைக்கு|\btomorrow\b/i.test(text)) day = "tomorrow";
  else if (/inniku|இன்னிக்கு|இன்று|\btoday\b/i.test(text)) day = "today";

  let time = null;
  const clock = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (clock) {
    time = `${clock[1]}${clock[2] ? `:${clock[2]}` : ""} ${clock[3].toUpperCase()}`;
  } else if (/morning|kaalaila|காலை/i.test(text)) time = "morning";
  else if (/evening|saayangal|மாலை/i.test(text)) time = "evening";
  else if (/\bnight\b|இரவு/i.test(text)) time = "night";
  if (!day && !time) return null;
  return { day, time };
}

export function extractVehicleMention(message) {
  const m = String(message || "").match(/\b(sedan|suv|innova)\b/i);
  return m ? m[1].toLowerCase() : null;
}

export function extractTripTypeMention(message) {
  if (/round[\s-]?trips?/i.test(message)) return "Round Trip";
  if (/one[\s-]?ways?/i.test(message)) return "One Way";
  return null;
}

/* Intent signals in Tamil / Tanglish (English covered by main router). */
export function tamilIntentSignals(message) {
  const text = String(message || "");
  return {
    wantsFare:
      /enna|evlo|evvalavu|vilai|என்ன|எவ்வளவு|விலை|\bfare\b|\bprice\b|\bcost\b/i.test(
        text
      ),
    wantsBooking:
      /venum|vendum|venam|poganum|pogalam|poren|வேண்டும்|போகணும்|\bbook\b/i.test(
        text
      ),
  };
}

/* Localized reply templates. Numbers/routes stay universal. */
export const T = {
  greeting: {
    en: null, // handled by existing English branch
    tanglish:
      "Vanakkam! 👋 **GenZRides**-ku welcome! Fare, route, vandi — enna venum, sollunga!",
    ta: "வணக்கம்! 👋 **GenZRides**-க்கு welcome! கட்டணம், route, வண்டி — என்ன வேணும், சொல்லுங்க!",
  },
  askRoute: {
    tanglish:
      "Endha route-ku fare venum? E.g.:\n• \"Trichy to Chennai fare enna\"\n• \"Madurai to Bangalore cab price?\"",
    ta: "எந்த route-க்கு கட்டணம் வேணும்? E.g.:\n• \"Trichy to Chennai fare enna\"\n• \"Madurai to Bangalore cab price?\"",
  },
  askBookingDetails: {
    tanglish:
      "Sure! 😊 Book panna mudiyum. **Pickup enga, drop enga?** Travel date + pickup time-um sollunga.",
    ta: "Sure! 😊 Book பண்ண முடியும். **Pickup எங்க, drop எங்க?** Travel date + pickup time-ம் சொல்லுங்க.",
  },
  bookCTA: {
    tanglish:
      "\n\nBook panna **Book Ride** page-ku ponga — login vendaam. Travel date and pickup time sollunga. 😊",
    ta: "\n\nBook பண்ண **Book Ride** page-க்கு போங்க — login வேண்டாம். Travel date and pickup time சொல்லுங்க. 😊",
  },
  fareNote: {
    tanglish: "*Traffic, route, waiting poruthu fare konjam maaralam.*",
    ta: "*போக்குவரத்து / பாதை / waiting பொறுத்து கட்டணம் கொஞ்சம் மாறலாம்.*",
  },
  default: {
    tanglish:
      "Puriyala... 😅 Fare venumna route sollunga (e.g. \"Trichy to Madurai fare enna\"), illa \"help\" nu type pannunga.",
    ta: "புரியல... 😅 கட்டணம் வேணும்னா route சொல்லுங்க, இல்ல \"help\" type பண்ணுங்க.",
  },
};

export function whenPhrase(when, lang) {
  if (!when || (!when.day && !when.time)) return "";
  const parts = [];
  if (when.day === "tomorrow") parts.push(lang === "ta" ? "நாளைக்கு" : "naalaiku");
  if (when.day === "today") parts.push(lang === "ta" ? "இன்னிக்கு" : "inniku");
  if (when.time) parts.push(when.time);
  if (!parts.length) return "";
  return lang === "ta"
    ? `\n\n📅 ${parts.join(" ")} payanam — Book Ride page-la date/time select pannunga.`
    : `\n\n📅 ${parts.join(" ")} payanam — Book Ride page-la date/time select pannunga.`;
}
