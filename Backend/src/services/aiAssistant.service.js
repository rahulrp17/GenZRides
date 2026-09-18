import axios from "axios";
import { getVehicles } from "./vehicle.service.js";
import { calculateFare } from "./fare.service.js";
import { getRoute, geocodeAddress } from "./googleMaps.service.js";
import { getMyBookings } from "./booking.service.js";
import {
  detectLanguage,
  normalizeLocations,
  extractTanglishRoute,
  extractTamilRoute,
  extractTamilWhen,
  cleanRouteEnds,
  whenPhrase,
  tamilIntentSignals,
  T,
} from "./tamilLanguage.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-chat-v3-0324:free";

const SYSTEM_PROMPT = `You are GenZRides AI Cab Assistant.

Help customers with:
- Cab booking (guest booking without account, logged-in booking)
- Pickup/drop locations
- Fare information (per-vehicle estimates, extras, round-trip rules)
- Vehicle availability (fleet, seats, luggage, AC)
- One-way/round-trip and scheduled (later) rides
- Booking status, driver status and live tracking
- Payment status and methods, refunds
- Cancellation and booking history
- Ride details, invoices, support and complaints

{genzrides_knowledge}

Available vehicle types with live pricing:
{vehicles_data}

Key routes and approximate distances:
- Trichy → Chennai: ~330 km, ~6 hrs
- Madurai → Trichy: ~135 km, ~2.5 hrs
- Chennai → Bangalore: ~350 km, ~6.5 hrs
- Chennai → Madurai: ~460 km, ~7.5 hrs
- Madurai → Rameshwaram: ~170 km, ~3.5 hrs
- Coimbatore → Salem: ~180 km, ~3.5 hrs

Rules:
- Understand natural language, spelling mistakes and short messages.
- The customer may write in English, Tamil script, or Tanglish (romanized
  Tamil, e.g. "Trichy airport la irundhu Chennai ku cab venum" or "Trichy
  to Madurai cab price enna?"). ALWAYS reply in the user's own
  language and style: Tamil script → Tamil; Tanglish → friendly Tanglish
  (e.g. "Sure! Trichy Airport → Chennai cab book panna mudiyum. 😊
  Travel date and pickup time sollunga."); English → English.
- Common mappings: venum = want, poganum = go, enna/evlo = what/how much,
  vilai = price, naalaiku = tomorrow, cab/taxi = vehicle request.
- When a booking or action is required, use the EXISTING backend data and flows only.
- Never invent fares, drivers, bookings, locations or API responses. If you don't know something, say so or point to support.
- For fare and booking-status questions, rely on real backend data provided above.
- Ask only for the missing information required to complete the action (e.g. route for a fare).
- If the customer is not logged in, explain what works as a guest (booking, fares) and what needs login (history, tracking, wallet).
- Keep responses short, friendly and professional.
- Never expose backend, API or database details.
- Respond in the same language the customer uses (English, Tamil, etc.).`;

/* ===========================================================
   PROJECT KNOWLEDGE — single source of truth for bot answers.
   Every fact below mirrors a real page (AirportTransfers,
   FareNotes, Info policies, footer/contact). The same text feeds
   the OpenRouter system prompt AND the offline fallback router.
=========================================================== */

const KNOWLEDGE = `GenZRides service facts:
- Airport pickup & drop at 5 airports: Chennai (MAA), Bangalore (BLR), Coimbatore (CJB), Trichy (TRZ), Madurai (IXM). Flight-tracked pickups, 45 minutes of free waiting on pickups, meet-and-greet name-board on request, SUVs/MUVs for heavy luggage. Book via /booking or the Airport Transfers page.
- Trip types: One-way (city + outstation), Round-trip, Airport Pickup, Airport Drop. Guest booking in 3 steps with no login: trip → car → confirm.
- Fare extras: one-way bills minimum 130 km/day; round-trip minimum 250 km/day (300 for Bengaluru). Driver bata ₹400/day (₹600/day on one-way trips running over 400 km). One-way waiting: first 30 min free after arrival, then ₹2.5/min. Toll and interstate permit at actuals. Small night allowance may apply 11 PM–5 AM, shown upfront. Cancelling after the driver arrives: ₹300.
- Cancellation: free any time before the ride starts. Started trips pay for distance covered. Driver cancels → priority reassignment with instant notification. Online-payment refunds reach the source in 5–7 working days.
- Payments: Cash to driver (pay after you arrive), or Online via Razorpay (UPI, cards, net banking). Failed online payments: check the Payments page — a failed charge is auto-voided by the bank; a deducted-but-unconfirmed payment refunds in 5–7 working days.
- Scheduled rides: yes — pick any future pickup date and time while booking (guest and logged-in). Advance booking recommended for airport and early-morning trips.
- Support 24×7: call +91 93483 0199, email support@genzrides.com. Office: 1/86 Ambalakara Street, Nehru Play Ground, Vengaimandalam, Trichy 621005, Tamil Nadu.
- Lost something in the cab? Call support with your booking ID — the team traces it with the driver.
- Every ride: verified chauffeurs, GPS live tracking shared with the trip, 24×7 human support.`;

function buildVehicleContext(vehicles) {
  if (!vehicles || vehicles.length === 0) return "Vehicle data currently unavailable.";
  return vehicles.map(
    (v) =>
      `${v.name}: ${v.seats} seats, AC: ${v.isAC ? "Yes" : "No"}, One-way base: ₹${v.oneWayBaseFare} + ₹${v.oneWayPerKm}/km, Round-trip base: ₹${v.roundTripBaseFare} + ₹${v.roundTripPerKm}/km, Driver allowance: ₹${v.driverAllowance}/day`
  ).join("\n");
}

/* Price every active vehicle for a distance (shared by fare branches). */
async function fareRowsFor(distance) {
  const vehicles = await getVehicles();
  if (!vehicles || vehicles.length === 0) return { rows: [], vehicles };
  const rows = [];
  for (const v of vehicles) {
    try {
      const result = await calculateFare({ vehicleId: v._id, distance, pickupDateTime: new Date(), tripType: "One Way", days: 1 });
      rows.push({ name: v.name, seats: v.seats, fare: Math.round(result.estimatedFare) });
    } catch {
      rows.push({ name: v.name, seats: v.seats, fare: null });
    }
  }
  return { rows, vehicles };
}

/* ===========================================================
   CITY NAMES → ROUTE (geocode first!)
   getRoute() needs {latitude, longitude} — passing raw city
   names always threw, which is why fare questions answered
   "couldn't calculate the fare". Throws user-facing Errors.
=========================================================== */

async function resolveRoute(from, to) {
  const [fromGeo, toGeo] = await Promise.all([
    geocodeAddress(from),
    geocodeAddress(to),
  ]);

  if (!fromGeo) {
    throw new Error(`I couldn't find "${from}" on the map. Please check the spelling and try again.`);
  }
  if (!toGeo) {
    throw new Error(`I couldn't find "${to}" on the map. Please check the spelling and try again.`);
  }

  let route;
  try {
    route = await getRoute(fromGeo, toGeo);
  } catch {
    route = null;
  }
  if (!route || !route.distance) {
    throw new Error(`I couldn't find a driving route from ${fromGeo.formattedAddress} to ${toGeo.formattedAddress}. Please try nearby cities.`);
  }

  return { route, fromLabel: fromGeo.formattedAddress, toLabel: toGeo.formattedAddress };
}

/* Most recent non-terminal booking (the one the customer means by
   "my ride" / "my driver"), or null. */
async function getActiveBooking(userId) {
  try {
    const result = await getMyBookings(userId, { page: 1, limit: 5 });
    const bookings = result?.bookings || [];
    return bookings.find((b) => !["Completed", "Cancelled"].includes(b.bookingStatus)) || null;
  } catch {
    return null;
  }
}

/* Real fare table for a from→to pair. markCheapest flags the lowest
   line so route fares and "cheapest" answers share one engine. */
async function computeFareReply(from, to, { markCheapest = false } = {}) {
  const { route, fromLabel, toLabel } = await resolveRoute(from, to);
  const { rows, vehicles } = await fareRowsFor(route.distance);
  if (!vehicles || vehicles.length === 0) {
    return {
      text: `The route from ${fromLabel} to ${toLabel} is **${route.distance} km** (~${route.duration} min), but I couldn't fetch fare data right now.`,
      cheapest: null,
    };
  }
  const priced = rows.filter((r) => r.fare != null);
  const cheapest = priced.length ? priced.reduce((a, b) => (b.fare < a.fare ? b : a)) : null;
  const lines = rows.map((r) =>
    r.fare == null
      ? `• **${r.name}** (${r.seats} seats): Estimate unavailable`
      : `• **${r.name}** (${r.seats} seats): ₹${r.fare}${markCheapest && cheapest && r.name === cheapest.name ? " ← cheapest" : ""}`
  );
  return {
    text:
      `**${fromLabel} → ${toLabel}**\n📏 Distance: ${route.distance} km | ⏱ ~${route.duration} min\n\n` +
      `**Fare Estimates (One Way):**\n${lines.join("\n")}\n\n*Final fare may vary based on traffic, route, and waiting time.*`,
    cheapest,
  };
}

export async function chat(message, userId = null, history = []) {
  if (!OPENROUTER_API_KEY) {
    return await fallbackChat(message, userId);
  }

  try {
    const vehicles = await getVehicles();
    const vehicleContext = buildVehicleContext(vehicles);
    const systemMessage = SYSTEM_PROMPT.replace("{vehicles_data}", vehicleContext).replace(
      "{genzrides_knowledge}",
      KNOWLEDGE
    );

    // Last few turns so follow-ups ("and for SUV?", "what about return?")
    // are understood. Sanitized: roles locked, content capped.
    const historyMessages = (Array.isArray(history) ? history : [])
      .filter((h) => h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string")
      .slice(-6)
      .map((h) => ({ role: h.role, content: h.content.slice(0, 500) }));

    const messages = [
      { role: "system", content: systemMessage },
      ...historyMessages,
      { role: "user", content: message },
    ];

    const response = await axios.post(
      OPENROUTER_BASE_URL,
      {
        model: MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://genzrides.vercel.app",
          "X-Title": "GenZRides AI Assistant",
        },
        timeout: 30000,
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content;
    if (reply) return reply.trim();

    return await fallbackChat(message, userId);
  } catch (error) {
    console.error("OpenRouter API error:", error.message);
    return await fallbackChat(message, userId);
  }
}

async function fallbackChat(message, userId) {
  const lang = detectLanguage(message);
  // Normalize Tamil/Tanglish place spellings so geocoding + the English
  // router below understand Tiruchy/Madras/திருச்சி etc. too.
  const normalizedMsg = normalizeLocations(message);
  const lower = normalizedMsg.toLowerCase().trim();
  // Tamil/Tanglish "X la irundhu Y ku" shapes carry from→to explicitly —
  // prefer them over the generic extractor for non-English input.
  const tamilRoute =
    lang === "ta"
      ? extractTamilRoute(message)
      : lang === "tanglish"
        ? extractTanglishRoute(normalizedMsg)
        : null;
  const locs = tamilRoute || extractLocations(normalizedMsg);
  const when = lang === "en" ? null : extractTamilWhen(message);
  const fareWords = /\b(fare|price|cost|estimate|how much|charge|rate|tariff)\b/i.test(lower);

  // 0. Localized greeting (before the English one)
  if (lang !== "en" && /^(hi+|hello|hey|vanakkam|வணக்கம்)[!.…]*$/i.test(lower) && lower.length < 30) {
    return T.greeting[lang];
  }

  // Tamil/Tanglish fast path: fare or booking intent with a route →
  // real Google distance + real fare engine, replied in kind.
  if (lang !== "en") {
    const signals = tamilIntentSignals(message);
    const from = locs?.from ? cleanRouteEnds(locs.from) : "";
    const to = locs?.to ? cleanRouteEnds(locs.to) : "";
    if ((signals.wantsFare || signals.wantsBooking) && from && to) {
      try {
        const { route, fromLabel, toLabel } = await resolveRoute(from, to);
        const { rows, vehicles } = await fareRowsFor(route.distance);
        if (!vehicles || vehicles.length === 0) {
          return lang === "ta"
            ? `**${fromLabel} → ${toLabel}** route teriyudhu, aana fare data ippo kidaikala. Konjam wait panni try pannunga.`
            : `Route **${fromLabel} → ${toLabel}** kandupidichiten, aana fare data ippo illa. Konjam wait panni try pannunga.`;
        }
        const lines = rows.map((r) =>
          r.fare == null
            ? `• **${r.name}** (${r.seats} seats): —`
            : `• **${r.name}** (${r.seats} seats): ₹${r.fare}`
        );
        const head =
          lang === "ta"
            ? `**${fromLabel} → ${toLabel}**\n📏 தூரம்: ${route.distance} கி.மீ | ⏱ ~${route.duration} நிமிடம்\n\n**கட்டண மதிப்பீடு (One Way):**`
            : `**${fromLabel} → ${toLabel}**\n📏 Distance: ${route.distance} km | ⏱ ~${route.duration} min\n\n**Fare Estimates (One Way):**`;
        const tail = signals.wantsBooking
          ? T.bookCTA[lang] + whenPhrase(when, lang)
          : T.fareNote[lang] + whenPhrase(when, lang);
        return `${head}\n${lines.join("\n")}\n\n${tail}`;
      } catch (err) {
        return err?.message || T.askRoute[lang];
      }
    }
    // Booking intent but route incomplete → ask ONLY the missing detail.
    if (signals.wantsBooking) return T.askBookingDetails[lang];
    if (signals.wantsFare) return T.askRoute[lang];
    // Otherwise fall through: normalized English loanwords let the
    // generic router below handle airport/cancel/vehicles questions.
  }

  // 1. Greeting — only when the message IS a greeting (never hijack
  // "hey, is airport pickup available?").
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|vanakkam)[!.]*$/i.test(lower) && lower.length < 30) {
    return "Hey there! 👋 Welcome to **GenZRides**. I can help you with fares, airport pickups, routes, vehicles, and bookings. What would you like to know?";
  }

  // 2. Live tracking — where is my driver / cab right now.
  // Skips problem reports ("problem with my ride") for the support branch.
  const hasProblemWords = /\b(report|complaint|problem|issue)\b/i.test(lower);
  if (!hasProblemWords && /\bwhere('s| is)? (my|the) (driver|cab|car|ride)\b|where.*\bdriver\b|\bdriver\b.*\b(where|location|on the way|arrived|reached|coming|nearby|late|delayed)\b|\btrack\b.*\b(cab|ride|trip|driver|booking)\b|is my driver|has .* arrived|\b(eta|live location|live tracking)\b|(pickup|drop).*(location|address|where)/i.test(lower)) {
    if (!userId) return "Please **log in** to track your ride — live driver location appears on the **Current Ride** page once a driver accepts.";
    try {
      const active = await getActiveBooking(userId);
      if (!active) {
        const result = await getMyBookings(userId, { page: 1, limit: 1 });
        const last = result?.bookings?.[0];
        if (!last) return "You don't have any bookings yet. Ready to book your first ride? 🚗";
        return `No active ride right now. Your last trip (**#${String(last._id).slice(-6).toUpperCase()}**) is *${last.bookingStatus}*. Details live under **Ride History**.`;
      }
      const drv = active.driver?.user;
      const status = active.bookingStatus || "Pending";
      const driverLine = drv?.name
        ? `🚗 Driver: **${drv.name}**${drv.phone ? ` (${drv.phone})` : ""}`
        : "🚗 Driver: assigning — you'll be notified the moment one accepts.";
      const pickupLine = active.pickup?.address ? `📍 Pickup: ${active.pickup.address}` : "";
      return `**Live status: ${status}**\n\n${driverLine}\n${pickupLine}\n\nOpen **Current Ride** to watch the cab move on the map in real time.`;
    } catch {
      return "I couldn't fetch your ride right now. Please try again.";
    }
  }

  // 3. Booking status, driver details, history (not problem reports)
  if (!hasProblemWords && /\bstatus\b.*booking|booking.*\bstatus\b|waiting for|who.*driver|driver.*(name|phone|number|contact|details|info)|my (driver|ride|trip)|previous|past (booking|ride|trip)|last (trip|ride|booking)|history|completed.*(detail|invoice|receipt|bill)|show.*booking/i.test(lower)) {
    if (!userId) return "Please **log in** to view bookings. As a guest you can still book and get fares — history, tracking and invoices need an account.";
    try {
      const active = await getActiveBooking(userId);
      if (active) {
        const drv = active.driver?.user;
        const driverLine = drv?.name
          ? `Driver: **${drv.name}**${drv.phone ? ` (${drv.phone})` : ""}`
          : "Driver: assigning — you'll be notified on accept.";
        return `**Booking #${String(active._id).slice(-6).toUpperCase()}** — *${active.bookingStatus}*\n${active.pickup?.address || ""} → ${active.drop?.address || ""}\n${driverLine}\nFare: ₹${active.finalFare || active.estimatedFare || "N/A"}${active.paymentStatus ? ` (${active.paymentStatus})` : ""}\n\nFull details under **My Bookings**.`;
      }
      const result = await getMyBookings(userId, { page: 1, limit: 5 });
      const bookings = result?.bookings || [];
      if (bookings.length === 0) return "You don't have any bookings yet. Ready to book your first ride? 🚗";
      const lines = bookings.map((b) => {
        const status = b.bookingStatus || "Unknown";
        const pickup = b.pickup?.address || "N/A";
        const drop = b.drop?.address || "N/A";
        return `• **#${String(b._id).slice(-6).toUpperCase()}** — ${pickup} → ${drop}\n  Status: ${status} | ₹${b.finalFare || b.estimatedFare || "N/A"}`;
      });
      return `**Your Recent Bookings:**\n\n${lines.join("\n\n")}\n\nReceipts and full history live under **Ride History**.`;
    } catch {
      return "I couldn't fetch your bookings right now. Please try again.";
    }
  }

  // 3. Cancellation & refunds (mirrors the Information page policy)
  if (/\b(cancel|cancellation|refund)\b/i.test(lower)) {
    return "**Cancellation Policy:**\n• **Free cancellation** any time before the ride starts — cancel from My Bookings\n• Started trips pay only for the distance covered\n• If a **driver cancels**, you are reassigned on priority and notified instantly\n• Online-payment refunds reach the source in **5–7 working days**\n• Cancelling after the driver arrives at pickup: **₹300**";
  }

  // 4. Airport pickup & drop (fare questions with a route fall through
  // to the fare engine below instead of getting generic info)
  if (/\b(airport|flight|terminal|maa|blr|cjb|trz|ixm)\b|meet\s*-?\s*greet/i.test(lower) && !(fareWords && locs)) {
    return "**✈️ Yes — airport pickup & drop are available 24×7** at 5 airports:\n• **Chennai (MAA)** • **Bangalore (BLR)** • **Coimbatore (CJB)** • **Trichy (TRZ)** • **Madurai (IXM)**\n\n• **Flight tracking** — we adjust for delays automatically\n• **45 min free waiting** on pickups\n• **Meet & greet** name-board on request\n• SUVs/MUVs for heavy luggage\n\nJust book with your flight number on the **Book Ride** page.";
  }

  // 5. Payment problems (failed / deducted / charged-but-incomplete) —
  // checked BEFORE generic methods so "my payment failed" troubleshoots.
  if (/payment failed|failed.*payment|charg(ed|es).*(but|without|not)|deduct|money.*(gone|deduct|taken)|paid.*(not|failed)|transaction (failed|failure)|refund.*(not|pending|delay|status)/i.test(lower)) {
    return "**Payment trouble? Here's what happens:**\n• A **failed** online payment is auto-voided by your bank — nothing is deducted\n• **Deducted but booking unconfirmed?** It auto-refunds to source in **5–7 working days**\n• Check the final status on the **Payments** page first\n• Still stuck? Call **+91 93483 0199** with your booking ID and payment reference";
  }

  // 6. Payment methods (pay after arrival included)
  if (/\b(pay|payment|upi|card|cash|invoice|bill|razorpay|online payment)\b/i.test(lower)) {
    return "**Payment Options:**\n• 💵 **Cash** — yes, pay the driver directly **after you reach**\n• 💳 **Online** — pay via Razorpay (UPI, cards, net banking) before or after the trip\n\nAll online payments are secured with industry-standard encryption.";
  }

  // 7. Report a problem (ride issues, lost items, overcharging)
  if (/\breport\b|complaint|problem|issue|bad (ride|driver|trip|experience)|driver.*(rude|rash|drunk|late|unprofessional|misbehav)|wrong.*(fare|charge|amount|bill)|overcharg|scam|lost.*(phone|bag|belonging|item|luggage)|left.*(in|inside).*(cab|car|taxi)/i.test(lower)) {
    return "**Sorry about that — let's fix it:**\n• 📞 Call **+91 93483 0199** (24×7) with your **booking ID**\n• 📧 Or write to **support@genzrides.com**\n• Lost something in the cab? Share the booking ID — the team traces it with the driver right away\n• Fare dispute? Keep the invoice from **Ride History** handy";
  }

  // 6. Contact / human support
  if (/\b(contact|support|phone|number|call (us|me)?|human|agent|email|address|office|timing|working hours|helpline|complaint|help me|talk to)\b/i.test(lower)) {
    return "**Reach us 24×7:**\n• 📞 Call: **+91 93483 0199**\n• 📧 Email: **support@genzrides.com**\n• 📍 1/86 Ambalakara Street, Nehru Play Ground, Vengaimandalam, Trichy 621005\n\nOur support team replies within minutes.";
  }

  // 8. Real fare estimate — needs both places (computed, never guessed)
  if (fareWords && locs) {
    try {
      const { text } = await computeFareReply(locs.from, locs.to, { markCheapest: true });
      return text;
    } catch (err) {
      return err?.message || `I couldn't calculate the fare right now. Please try again.`;
    }
  }

  // 9. "Book a cab from A to B" — fare plus a direct booking path
  if (locs && /\b(book|reserve|need.*(cab|car|taxi)|want.*(cab|car|taxi))\b/i.test(lower)) {
    try {
      const { text } = await computeFareReply(locs.from, locs.to, { markCheapest: true });
      return `${text}\n\nReady? Continue on the **Book Ride** page — no login needed, pickup any future date and time.`;
    } catch (err) {
      return err?.message || `I couldn't calculate the fare right now. Please try again.`;
    }
  }

  // 10. Scheduled / later rides
  if (/\bschedul|book.*later|later.*book|tomorrow|day after|in advance|advance booking|pre.book|\b\d{1,2}\s*(am|pm)\b|next week|tonight|this evening/i.test(lower)) {
    return "**Yes — schedule any ride in advance:**\n• Pick any **future date and time** while booking (works as guest too)\n• Recommended for **airport transfers** and early-morning trips\n• Free cancellation any time **before the ride starts**\n\nTell me your route and I'll estimate the fare for it.";
  }

  // 12. Extra charges (bata, night, waiting, toll) — matches Fare Notes
  if (/\b(bata|night|waiting|toll|permit|extra (charge|cost|fee)|hidden|minimum billing|km\/day|allowance)\b/i.test(lower)) {
    return "**Fare extras, upfront — no hidden charges:**\n• One-way bills minimum **130 km/day**; round-trip **250 km/day** (300 for Bengaluru)\n• Driver bata **₹400/day** (₹600/day on one-way trips running over 400 km)\n• One-way waiting: **first 30 min free**, then ₹2.5/min\n• Toll + interstate permit at **actuals**\n• Small night allowance may apply **10 PM–6 AM**, always shown before you confirm";
  }

  // 13. Cheapest cab — computed when a route is known, ranked live otherwise
  if (/\bcheapest\b|lowest (fare|price|cost)|\bbudget\b|economical|best value|which.*(cheap|affordable)/i.test(lower)) {
    try {
      const vehicles = await getVehicles();
      if (!vehicles || vehicles.length === 0) return "I couldn't fetch vehicle data right now. Please try again shortly.";
      if (locs) {
        const { text } = await computeFareReply(locs.from, locs.to, { markCheapest: true });
        return text;
      }
      const ranked = [...vehicles]
        .filter((v) => v.oneWayPerKm != null)
        .sort((a, b) => a.oneWayPerKm - b.oneWayPerKm);
      if (!ranked.length) return "I couldn't compare fares right now. Tell me your route and I'll price every cab.";
      const lines = ranked.map(
        (v, i) => `${i === 0 ? "• **" : "• "}${v.name}${i === 0 ? "** ← cheapest per km" : ""} — ₹${v.oneWayPerKm}/km one-way (${v.seats} seats)`
      );
      return `**Cheapest first (per-km one-way rate):**\n${lines.join("\n")}\n\nGive me your route for exact totals on each.`;
    } catch (err) {
      return err?.message || "I couldn't compare fares right now. Please try again.";
    }
  }

  // 14. How the fare is calculated
  if (/how.*(fare|price).*calculat|(fare|price).*(work|structure|breakup|bifurcat|formula|components|split)/i.test(lower)) {
    return "**How your fare is built:**\n• **Base fare** for the cab type\n• **+ distance charge** — (trip km − included base km) × per-km rate\n• **+ driver bata** ₹400/day (₹600/day on one-way runs over 400 km)\n• **+ extras** — waiting after 30 free min, toll/permit at actuals, night allowance 10 PM–6 AM\n• Round trips bill both legs with a 250 km/day minimum (300 for Bengaluru)\n\nYou always see the full breakup **before** confirming — no surprises.";
  }

  // 15. Seat fit — "6-seater", "5 people with luggage" (live fleet data).
  // Before the generic fleet branch so fit questions recommend, not list.
  if (/(\d+)\s*-?\s*seater|seats?.*(for|need|with)|people with|luggage|spacious|family.*(car|cab|taxi)/i.test(lower)) {
    try {
      const vehicles = await getVehicles();
      if (!vehicles || vehicles.length === 0) return "I couldn't fetch vehicle data right now. Please try again shortly.";
      const needMatch = lower.match(/(\d+)\s*-?\s*seater|(\d+)\s+people/);
      const need = needMatch ? parseInt(needMatch[1] || needMatch[2], 10) : 0;
      const fits = need > 0 ? vehicles.filter((v) => (v.seats || 0) >= need) : [...vehicles].sort((a, b) => (b.seats || 0) - (a.seats || 0));
      if (!fits.length) return `No cab in our fleet seats ${need}. The largest available is **${[...vehicles].sort((a, b) => (b.seats || 0) - (a.seats || 0))[0].name}** (${[...vehicles].sort((a, b) => (b.seats || 0) - (a.seats || 0))[0].seats} seats). For bigger groups, book two cabs or call **+91 93483 0199**.`;
      const lines = fits.map((v) => `• **${v.name}** — ${v.seats} seats${v.luggage ? `, luggage for ~${v.luggage}` : ""}, AC: ${v.isAC ? "Yes" : "No"}`);
      const head = need > 0 ? `**Cabs fitting ${need}+ people:**` : "**Our roomiest cabs:**";
      return `${head}\n${lines.join("\n")}\n\nTell me your route and I'll price them for you.`;
    } catch {
      return "I couldn't fetch vehicle data right now. Please try again shortly.";
    }
  }

  // 15b. Guest booking — before the generic fleet branch so
  // "book a cab without an account" explains guest flow, not cars.
  if (/\bguest\b|without.*(account|signing|signup|login|register)|no account|no signup|sign.?up.*required/i.test(lower)) {
    return "**Yes — no account needed:**\n• Book as **guest** with just name + phone on the **Book Ride** page\n• Same cars, same live fares, same verified drivers\n• Create a free account later for **history, live tracking, wallet and invoices**\n\nWant a price first? Just tell me your route.";
  }

  // 16. Fleet — specific vehicle words only ("available" alone no longer hijacks)
  if (/\b(vehicle|car|cab|fleet|sedan|suv|innova|traveller|hatchback|etios|swift|dzire|crysta|tempo|muv|premium)\b/i.test(lower) && !fareWords) {
    try {
      const vehicles = await getVehicles();
      if (!vehicles || vehicles.length === 0) return "No vehicles are currently available. Please try again later.";
      const lines = vehicles.map((v) => `• **${v.name}** — ${v.seats} seats, AC: ${v.isAC ? "Yes" : "No"}\n  One-way: ₹${v.oneWayBaseFare} base + ₹${v.oneWayPerKm}/km | Round-trip: ₹${v.roundTripBaseFare} base + ₹${v.roundTripPerKm}/km`);
      return `**Our Fleet:**\n\n${lines.join("\n\n")}\n\nWant a fare estimate? Just tell me your route!`;
    } catch {
      return "I couldn't fetch vehicle data right now. Please try again shortly.";
    }
  }

  if (/\b(route|distance|km|kilometer|how far|eta|time|duration|between)\b/i.test(lower)) {
    if (!locs) return "Please tell me the two places. For example:\n• \"Distance from Madurai to Chennai\"\n• \"How far is Trichy from Bangalore\"";
    try {
      const { route, fromLabel, toLabel } = await resolveRoute(locs.from, locs.to);
      return `**${fromLabel} → ${toLabel}**\n\n📏 Distance: **${route.distance} km**\n⏱ Duration: **~${route.duration} min**\n\nWant a fare estimate for this route? Just ask!`;
    } catch (err) {
      return err?.message || `I couldn't fetch route information right now. Please try again.`;
    }
  }

  // 18. Trip types / outstation info (before the fare-route prompt so
  // "does the fare change for round trips?" answers instead of asking)
  if (/\b(outstation|round[\s-]?trips?|one[\s-]?ways?|drop trip|multiday|long trip)\b/i.test(lower)) {
    return "**Trip types we run:**\n• **One-way** — city + outstation, minimum billing 130 km/day\n• **Round-trip** — out-and-back, minimum 250 km/day (300 for Bengaluru); yes, the total differs from one-way because both legs + bata are billed\n• **Airport Pickup / Drop** — flight-tracked, 45 min free waiting\n\nTell me your route and I'll estimate the exact fare.";
  }

  // 19. Fare words but no places found — ask for the route
  if (fareWords) {
    return "Please tell me your route. For example:\n• \"Fare from Madurai to Chennai\"\n• \"How much from Trichy to Bangalore\"";
  }

  if (/\b(book|ride|booking|reserve|schedule)\b/i.test(lower)) {
    return "**How to Book a Ride — no account needed:**\n1. Open **Book Ride** and enter pickup + drop (any future date/time for scheduled rides)\n2. Choose your car — live fares for one-way or round-trip\n3. Confirm as **guest** (name + phone only) or log in for history, tracking and invoices\n\nA verified driver accepts and you track them live under **Current Ride**.";
  }

  // 12. Thanks — only when that's all they said
  if (/^(thank(s| you)?|ok(ay)?|great|awesome|nice|cool|perfect)[!.]*$/i.test(lower)) {
    return "You're welcome! 😊 Is there anything else I can help you with?";
  }

  if (/\b(help|what can you|how to|guide|support)\b/i.test(lower)) {
    return "I'm the GenZRides AI assistant. I can help you with:\n\n• **Airport pickup** — \"Is airport pickup available?\"\n• **Fare estimates** — \"Fare from Madurai to Chennai\"\n• **Extra charges** — bata, night, waiting, toll\n• **Cancellation & refunds**\n• **My bookings** — ride history (login required)\n• **Contact support** — 24×7 helpline\n\nJust type your question!";
  }

  if (lang !== "en") return T.default[lang];

  return "I'm not sure how to help with that. Here are some things I can do:\n\n• **Airport** — \"Is airport pickup available?\"\n• **Fare** — \"Fare from Madurai to Chennai\"\n• **Vehicles** — \"What vehicles do you have?\"\n• **Bookings** — \"Show my bookings\"\n• **Support** — \"How do I contact support?\"";
}

/* ===========================================================
   Extract "from → to" places from free text. Strips leading
   command words ("calculate", "how much", ...) and leftover
   nouns ("fare", "price", "distance") so "calculate the fare
   chennai to madurai" yields chennai → madurai, not
   "calculate the fare chennai" → madurai.
=========================================================== */

function cleanPlace(s) {
  return (s || "")
    .replace(/\b(the\s+)?(fares?|prices?|costs?|charges?|rates?|tariffs?|estimates?|estimations?|distances?|durations?)\b/gi, "")
    .replace(/[?.!,;:'"]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractLocations(message) {
  const text = String(message || "")
    .replace(/^(please\s+)?(can you\s+)?(tell me|give me|show me|get|calculate|calculating|estimate|estimating|what'?s|what is|how much( is)?( does it cost)?|how far( is)?)\b[\s,]*/i, "")
    .trim();
  const patterns = [
    /(?:from|between)\s+(.+?)\s+(?:to|and)\s+(.+)/i,
    /(.+?)\s+(?:to|and)\s+(.+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const from = cleanPlace(m[1]);
      const to = cleanPlace(m[2]);
      if (from && to) return { from, to };
    }
  }
  return null;
}
