import axios from "axios";
import { getVehicles } from "./vehicle.service.js";
import { calculateFare } from "./fare.service.js";
import { getRoute, geocodeAddress } from "./googleMaps.service.js";
import { getMyBookings } from "./booking.service.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-chat-v3-0324:free";

const SYSTEM_PROMPT = `You are the GenZRides AI assistant — a friendly, helpful ride-hailing support bot for GenZRides, a premium cab booking service operating across Tamil Nadu, Puducherry, Bangalore (India).

{genzrides_knowledge}

Available vehicle types with pricing:
{vehicles_data}

Key routes and approximate distances:
- Trichy → Chennai: ~330 km, ~6 hrs
- Madurai → Trichy: ~135 km, ~2.5 hrs
- Chennai → Bangalore: ~350 km, ~6.5 hrs
- Chennai → Madurai: ~460 km, ~7.5 hrs
- Madurai → Rameshwaram: ~170 km, ~3.5 hrs
- Coimbatore → Salem: ~180 km, ~3.5 hrs

Rules:
- Be concise and helpful. Use short paragraphs.
- Use markdown formatting for readability (bold, bullets).
- Never fabricate information. If you don't know something, say so — or point to the Information page and support number below.
- Always be polite and professional.
- If a customer wants to book, guide them to the Book Ride page (/booking, no login needed).
- If a customer asks about their bookings, remind them to log in first.
- For fare estimates, use the actual vehicle pricing data provided above.
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
- Payments: Cash to driver, or Online via Razorpay (UPI, cards, net banking).
- Support 24×7: call +91 93483 0199, email support@genzrides.com. Office: 1/86 Ambalakara Street, Nehru Play Ground, Vengaimandalam, Trichy 621005, Tamil Nadu.
- Every ride: verified chauffeurs, GPS live tracking shared with the trip, 24×7 human support.`;

function buildVehicleContext(vehicles) {
  if (!vehicles || vehicles.length === 0) return "Vehicle data currently unavailable.";
  return vehicles.map(
    (v) =>
      `${v.name}: ${v.seats} seats, AC: ${v.isAC ? "Yes" : "No"}, One-way base: ₹${v.oneWayBaseFare} + ₹${v.oneWayPerKm}/km, Round-trip base: ₹${v.roundTripBaseFare} + ₹${v.roundTripPerKm}/km, Driver allowance: ₹${v.driverAllowance}/day`
  ).join("\n");
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
  const lower = message.toLowerCase().trim();
  const locs = extractLocations(message);
  const fareWords = /\b(fare|price|cost|estimate|how much|charge|rate|tariff)\b/i.test(lower);

  // 1. Greeting — only when the message IS a greeting (never hijack
  // "hey, is airport pickup available?").
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|vanakkam)[!.]*$/i.test(lower) && lower.length < 30) {
    return "Hey there! 👋 Welcome to **GenZRides**. I can help you with fares, airport pickups, routes, vehicles, and bookings. What would you like to know?";
  }

  // 2. My bookings / tracking
  if (/\b(my\s*(booking|ride|trips?|history)|show.*booking|booking.*status|track(ing)? (my|the)?\s*(ride|cab|trip|booking)?|where('s| is) (my|the) (driver|cab|car))\b/i.test(lower)) {
    if (!userId) return "Please **log in** to view your bookings. You can sign in from the login page.";
    try {
      const result = await getMyBookings(userId, { page: 1, limit: 5 });
      const bookings = result?.bookings || [];
      if (bookings.length === 0) return "You don't have any bookings yet. Ready to book your first ride? 🚗";
      const lines = bookings.map((b) => {
        const status = b.bookingStatus || "Unknown";
        const pickup = b.pickup?.address || "N/A";
        const drop = b.drop?.address || "N/A";
        return `• **#${String(b._id).slice(-6).toUpperCase()}** — ${pickup} → ${drop}\n  Status: ${status} | ₹${b.estimatedFare || "N/A"}`;
      });
      return `**Your Recent Bookings:**\n\n${lines.join("\n\n")}\n\nTrack the live location from **Current Ride** while a trip is active.`;
    } catch {
      return "I couldn't fetch your bookings right now. Please try again.";
    }
  }

  // 3. Cancellation & refunds (mirrors the Information page policy)
  if (/\b(cancel|cancellation|refund)\b/i.test(lower)) {
    return "**Cancellation Policy:**\n• **Free cancellation** any time before the ride starts — cancel from My Bookings\n• Started trips pay only for the distance covered\n• If a **driver cancels**, you are reassigned on priority and notified instantly\n• Online-payment refunds reach the source in **5–7 working days**\n• Cancelling after the driver arrives at pickup: **₹300**";
  }

  // 4. Airport pickup & drop
  if (/\b(airport|flight|terminal|maa|blr|cjb|trz|ixm)\b|meet\s*-?\s*greet/i.test(lower)) {
    return "**✈️ Yes — airport pickup & drop are available 24×7** at 5 airports:\n• **Chennai (MAA)** • **Bangalore (BLR)** • **Coimbatore (CJB)** • **Trichy (TRZ)** • **Madurai (IXM)**\n\n• **Flight tracking** — we adjust for delays automatically\n• **45 min free waiting** on pickups\n• **Meet & greet** name-board on request\n• SUVs/MUVs for heavy luggage\n\nJust book with your flight number on the **Book Ride** page.";
  }

  // 5. Payments
  if (/\b(pay|payment|upi|card|cash|invoice|bill|razorpay|online payment)\b/i.test(lower)) {
    return "**Payment Options:**\n• 💵 **Cash** — Pay the driver directly after your ride\n• 💳 **Online** — Pay via Razorpay (UPI, cards, net banking)\n\nAll online payments are secured with industry-standard encryption.";
  }

  // 6. Contact / human support
  if (/\b(contact|support|phone|number|call (us|me)?|human|agent|email|address|office|timing|working hours|helpline|complaint|help me|talk to)\b/i.test(lower)) {
    return "**Reach us 24×7:**\n• 📞 Call: **+91 93483 0199**\n• 📧 Email: **support@genzrides.com**\n• 📍 1/86 Ambalakara Street, Nehru Play Ground, Vengaimandalam, Trichy 621005\n\nOur support team replies within minutes.";
  }

  // 7. Real fare estimate — needs both places (computed, never guessed)
  if (fareWords && locs) {
    try {
      const { route, fromLabel, toLabel } = await resolveRoute(locs.from, locs.to);
      const vehicles = await getVehicles();
      if (!vehicles || vehicles.length === 0) return `The route from ${fromLabel} to ${toLabel} is **${route.distance} km** (~${route.duration} min), but I couldn't fetch fare data right now.`;
      const fareLines = [];
      for (const v of vehicles) {
        try {
          const result = await calculateFare({ vehicleId: v._id, distance: route.distance, pickupDateTime: new Date(), tripType: "One Way", days: 1 });
          fareLines.push(`• **${v.name}** (${v.seats} seats): ₹${Math.round(result.estimatedFare)}`);
        } catch {
          fareLines.push(`• **${v.name}** (${v.seats} seats): Estimate unavailable`);
        }
      }
      return `**${fromLabel} → ${toLabel}**\n📏 Distance: ${route.distance} km | ⏱ ~${route.duration} min\n\n**Fare Estimates (One Way):**\n${fareLines.join("\n")}\n\n*Final fare may vary based on traffic, route, and waiting time.*`;
    } catch (err) {
      return err?.message || `I couldn't calculate the fare right now. Please try again.`;
    }
  }

  // 8. Extra charges (bata, night, waiting, toll) — matches Fare Notes
  if (/\b(bata|night|waiting|toll|permit|extra (charge|cost|fee)|hidden|minimum billing|km\/day|allowance)\b/i.test(lower)) {
    return "**Fare extras, upfront — no hidden charges:**\n• One-way bills minimum **130 km/day**; round-trip **250 km/day** (300 for Bengaluru)\n• Driver bata **₹400/day** (₹600/day on one-way trips running over 400 km)\n• One-way waiting: **first 30 min free**, then ₹2.5/min\n• Toll + interstate permit at **actuals**\n• Small night allowance may apply **11 PM–5 AM**, always shown before you confirm";
  }

  // 9. Fleet — specific vehicle words only ("available" alone no longer hijacks)
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

  // 10. Fare words but no places found — ask for the route
  if (fareWords) {
    return "Please tell me your route. For example:\n• \"Fare from Madurai to Chennai\"\n• \"How much from Trichy to Bangalore\"";
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

  // 11. Trip types / outstation info
  if (/\b(outstation|round[\s-]?trip|one[\s-]?way|drop trip|multiday|long trip)\b/i.test(lower)) {
    return "**Trip types we run:**\n• **One-way** — city + outstation, minimum billing 130 km/day\n• **Round-trip** — out-and-back, minimum 250 km/day (300 for Bengaluru)\n• **Airport Pickup / Drop** — flight-tracked, 45 min free waiting\n\nTell me your route and I'll estimate the exact fare.";
  }

  if (/\b(book|ride|booking|reserve|schedule)\b/i.test(lower)) {
    return "**How to Book a Ride (no login needed):**\n1. Open **Book Ride** and enter pickup + drop\n2. Choose your car — fares shown live\n3. Confirm — a verified driver accepts and you track them live on the map!\n\nAlready booked? Follow it under **Current Ride**.";
  }

  // 12. Thanks — only when that's all they said
  if (/^(thank(s| you)?|ok(ay)?|great|awesome|nice|cool|perfect)[!.]*$/i.test(lower)) {
    return "You're welcome! 😊 Is there anything else I can help you with?";
  }

  if (/\b(help|what can you|how to|guide|support)\b/i.test(lower)) {
    return "I'm the GenZRides AI assistant. I can help you with:\n\n• **Airport pickup** — \"Is airport pickup available?\"\n• **Fare estimates** — \"Fare from Madurai to Chennai\"\n• **Extra charges** — bata, night, waiting, toll\n• **Cancellation & refunds**\n• **My bookings** — ride history (login required)\n• **Contact support** — 24×7 helpline\n\nJust type your question!";
  }

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
