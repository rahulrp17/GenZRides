import axios from "axios";
import { getVehicles } from "./vehicle.service.js";
import { calculateFare } from "./fare.service.js";
import { getRoute } from "./googleMaps.service.js";
import { getMyBookings } from "./booking.service.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-chat-v3-0324:free";

const SYSTEM_PROMPT = `You are the GenZRides AI assistant — a friendly, helpful ride-hailing support bot for GenZRides, a premium cab booking service operating across Tamil Nadu, India.

You help customers with:
- Booking rides (pickup/drop locations, vehicle selection, fare estimates)
- Route information (distance, duration between cities)
- Payment options (Cash, Online via Razorpay)
- Cancellation policy and process
- Driver information and ride tracking
- General questions about the service

Available vehicle types with pricing:
{vehicles_data}

Key routes and approximate distances:
- Madurai → Chennai: ~450 km, ~7-8 hrs
- Chennai → Bangalore: ~350 km, ~6-7 hrs
- Trichy → Chennai: ~330 km, ~5-6 hrs
- Madurai → Rameshwaram: ~170 km, ~3-4 hrs
- Coimbatore → Ooty: ~90 km, ~3 hrs
- Chennai → Pondicherry: ~150 km, ~3-4 hrs

Rules:
- Be concise and helpful. Use short paragraphs.
- Use markdown formatting for readability (bold, bullets).
- Never fabricate information. If you don't know something, say so.
- Always be polite and professional.
- If a customer wants to book, guide them to the Book Ride page.
- If a customer asks about their bookings, remind them to log in first.
- For fare estimates, use the actual vehicle pricing data provided above.
- Respond in the same language the customer uses (English, Tamil, etc.).`;

function buildVehicleContext(vehicles) {
  if (!vehicles || vehicles.length === 0) return "Vehicle data currently unavailable.";
  return vehicles.map(
    (v) =>
      `${v.name}: ${v.seats} seats, AC: ${v.isAC ? "Yes" : "No"}, One-way base: ₹${v.oneWayBaseFare} + ₹${v.oneWayPerKm}/km, Round-trip base: ₹${v.roundTripBaseFare} + ₹${v.roundTripPerKm}/km, Driver allowance: ₹${v.driverAllowance}/day`
  ).join("\n");
}

export async function chat(message, userId = null) {
  if (!OPENROUTER_API_KEY) {
    return await fallbackChat(message, userId);
  }

  try {
    const vehicles = await getVehicles();
    const vehicleContext = buildVehicleContext(vehicles);
    const systemMessage = SYSTEM_PROMPT.replace("{vehicles_data}", vehicleContext);

    const messages = [
      { role: "system", content: systemMessage },
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

  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|vanakkam)/i.test(lower)) {
    return "Hey there! 👋 Welcome to **GenZRides**. I can help you with fares, routes, vehicles, and bookings. What would you like to know?";
  }

  if (/\b(vehicle|car|cab|fleet|sedan|suv|innova|traveller|available|type)\b/i.test(lower) && !/\b(fare|price|cost|estimate|how much)\b/i.test(lower)) {
    try {
      const vehicles = await getVehicles();
      if (!vehicles || vehicles.length === 0) return "No vehicles are currently available. Please try again later.";
      const lines = vehicles.map((v) => `• **${v.name}** — ${v.seats} seats, AC: ${v.isAC ? "Yes" : "No"}\n  One-way: ₹${v.oneWayBaseFare} base + ₹${v.oneWayPerKm}/km | Round-trip: ₹${v.roundTripBaseFare} base + ₹${v.roundTripPerKm}/km`);
      return `**Our Fleet:**\n\n${lines.join("\n\n")}\n\nWant a fare estimate? Just tell me your route!`;
    } catch {
      return "I couldn't fetch vehicle data right now. Please try again shortly.";
    }
  }

  if (/\b(fare|price|cost|estimate|how much|charge|rate|tariff)\b/i.test(lower)) {
    const locs = extractLocations(message);
    if (!locs) return "Please tell me your route. For example:\n• \"Fare from Madurai to Chennai\"\n• \"How much from Trichy to Bangalore\"";
    try {
      const route = await getRoute({ address: locs.from }, { address: locs.to });
      if (!route || !route.distance) return `I couldn't find a route from ${locs.from} to ${locs.to}. Please check the locations and try again.`;
      const vehicles = await getVehicles();
      if (!vehicles || vehicles.length === 0) return `The route from ${locs.from} to ${locs.to} is **${route.distance} km** (~${route.duration} min), but I couldn't fetch fare data right now.`;
      const fareLines = [];
      for (const v of vehicles) {
        try {
          const result = await calculateFare({ vehicleId: v._id, distance: route.distance, pickupDateTime: new Date(), tripType: "One Way", days: 1 });
          fareLines.push(`• **${v.name}** (${v.seats} seats): ₹${Math.round(result.estimatedFare)}`);
        } catch {
          fareLines.push(`• **${v.name}** (${v.seats} seats): Estimate unavailable`);
        }
      }
      return `**${locs.from} → ${locs.to}**\n📏 Distance: ${route.distance} km | ⏱ ~${route.duration} min\n\n**Fare Estimates (One Way):**\n${fareLines.join("\n")}\n\n*Final fare may vary based on traffic, route, and waiting time.*`;
    } catch {
      return `I couldn't calculate the fare right now. Please try again.`;
    }
  }

  if (/\b(route|distance|km|kilometer|how far|eta|time|duration|between)\b/i.test(lower)) {
    const locs = extractLocations(message);
    if (!locs) return "Please tell me the two places. For example:\n• \"Distance from Madurai to Chennai\"\n• \"How far is Trichy from Bangalore\"";
    try {
      const route = await getRoute({ address: locs.from }, { address: locs.to });
      if (!route || !route.distance) return `I couldn't find a route from ${locs.from} to ${locs.to}. Please check the location names.`;
      return `**${locs.from} → ${locs.to}**\n\n📏 Distance: **${route.distance} km**\n⏱ Duration: **~${route.duration} min**\n\nWant a fare estimate for this route? Just ask!`;
    } catch {
      return `I couldn't fetch route information right now. Please try again.`;
    }
  }

  if (/\b(cancel|cancellation|refund)\b/i.test(lower)) {
    return "**Cancellation Policy:**\n• Free cancellation up to 1 hour before pickup\n• 10% charge if cancelled within 1 hour of pickup\n• No-show fee: 25% of estimated fare\n• Driver-initiated cancellation: No charge\n\nTo cancel, go to **My Bookings** and tap \"Cancel\" on your active ride.";
  }

  if (/\b(pay|payment|upi|card|cash|invoice|bill)\b/i.test(lower)) {
    return "**Payment Options:**\n• 💵 **Cash** — Pay the driver directly after your ride\n• 💳 **Online** — Pay via Razorpay (UPI, cards, net banking)\n\nAll online payments are secured with industry-standard encryption.";
  }

  if (/\b(my\s*(booking|ride|trips?|history)|show.*booking|booking.*status|track)\b/i.test(lower)) {
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
      return `**Your Recent Bookings:**\n\n${lines.join("\n\n")}\n\nView all bookings in the **My Bookings** section.`;
    } catch {
      return "I couldn't fetch your bookings right now. Please try again.";
    }
  }

  if (/\b(book|ride|booking|reserve|schedule)\b/i.test(lower)) {
    return "**How to Book a Ride:**\n1. Go to **Book Ride** from the menu\n2. Enter your pickup and drop locations\n3. Select a vehicle type (Sedan, SUV, etc.)\n4. Review the fare estimate and tap **Book Ride**\n5. Wait for a driver to accept — you'll be notified instantly!\n\nYou can also book as a guest without creating an account.";
  }

  if (/\b(help|what can you|how to|guide|support)\b/i.test(lower)) {
    return "I'm the GenZRides AI assistant. I can help you with:\n\n• **Available vehicles** — See our fleet and pricing\n• **Fare estimates** — Get a price quote for your trip\n• **Route info** — Distance and ETA between two places\n• **My bookings** — Check your ride history (login required)\n• **General help** — How to book, payment options, cancellation policy\n\nJust type your question or tap a suggestion below!";
  }

  if (/\b(thank|thanks|ok|great|awesome|nice|cool)\b/i.test(lower)) {
    return "You're welcome! 😊 Is there anything else I can help you with?";
  }

  return "I'm not sure how to help with that. Here are some things I can do:\n\n• **Vehicles** — \"What vehicles are available?\"\n• **Fare** — \"Fare from Madurai to Chennai\"\n• **Route** — \"Distance from Chennai to Bangalore\"\n• **Bookings** — \"Show my bookings\"\n• **Help** — \"How do I book a ride?\"";
}

function extractLocations(message) {
  const patterns = [
    /(?:from|between)\s+(.+?)\s+(?:to|and)\s+(.+)/i,
    /(.+?)\s+(?:to|and)\s+(.+)/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m) return { from: m[1].trim(), to: m[2].trim() };
  }
  if (message.includes(" to ")) {
    const parts = message.split(/\s+to\s+/i);
    if (parts.length >= 2) return { from: parts[0].trim(), to: parts.slice(1).join(" ").trim() };
  }
  return null;
}
