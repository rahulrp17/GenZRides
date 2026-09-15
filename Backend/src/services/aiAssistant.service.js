import { getVehicles } from "./vehicle.service.js";
import { calculateFare } from "./fare.service.js";
import { getRoute, getPlaceSuggestions } from "./googleMaps.service.js";
import { getMyBookings } from "./booking.service.js";

const HELP_TEXT = `I'm the GenZRides AI assistant. I can help you with:

• **Available vehicles** — See our fleet and pricing
• **Fare estimates** — Get a price quote for your trip
• **Route info** — Distance and ETA between two places
• **My bookings** — Check your ride history (login required)
• **General help** — How to book, payment options, cancellation policy

Just type your question or tap a suggestion below!`;

const CANCELLATION_POLICY = `**Cancellation Policy:**
• Free cancellation up to 1 hour before pickup
• 10% charge if cancelled within 1 hour of pickup
• No-show fee: 25% of estimated fare
• Driver-initiated cancellation: No charge

To cancel, go to **My Bookings** and tap "Cancel" on your active ride.`;

const PAYMENT_INFO = `**Payment Options:**
• 💵 **Cash** — Pay the driver directly after your ride
• 💳 **Online** — Pay via Razorpay (UPI, cards, net banking)

All online payments are secured with industry-standard encryption. You'll receive an invoice via email after every ride.`;

const BOOKING_HELP = `**How to Book a Ride:**
1. Go to **Book Ride** from the menu
2. Enter your pickup and drop locations
3. Select a vehicle type (Sedan, SUV, etc.)
4. Review the fare estimate and tap **Book Ride**
5. Wait for a driver to accept — you'll be notified instantly!

You can also book as a guest without creating an account.`;

const ROUTE_EXAMPLES = [
  { from: "Madurai", to: "Chennai" },
  { from: "Chennai", to: "Bangalore" },
  { from: "Trichy", to: "Coimbatore" },
  { from: "Madurai", to: "Rameshwaram" },
  { from: "Coimbatore", to: "Ooty" },
  { from: "Chennai", to: "Pondicherry" },
];

function detectIntent(message) {
  const lower = message.toLowerCase().trim();

  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|vanakkam)/i.test(lower)) {
    return "greeting";
  }
  if (/\b(vehicle|car|cab|fleet|sedan|suv|innova|traveller|available|type)\b/i.test(lower) && !/\b(fare|price|cost|estimate|how much)\b/i.test(lower)) {
    return "vehicles";
  }
  if (/\b(fare|price|cost|estimate|how much|charge|rate|tariff)\b/i.test(lower)) {
    return "fare_estimate";
  }
  if (/\b(route|distance|km|kilometer|how far|eta|time|duration|between)\b/i.test(lower)) {
    return "route_info";
  }
  if (/\b(book|ride|booking|reserve|schedule)\b/i.test(lower) && !/\b(cancel|status|history|my|show|list)\b/i.test(lower)) {
    return "booking_help";
  }
  if (/\b(cancel|cancellation|refund)\b/i.test(lower)) {
    return "cancellation";
  }
  if (/\b(pay|payment|upi|card|cash|invoice|bill)\b/i.test(lower)) {
    return "payment";
  }
  if (/\b(my\s*(booking|ride|trips?|history)|show.*booking|booking.*status|track)\b/i.test(lower)) {
    return "my_bookings";
  }
  if (/\b(help|what can you|how to|guide|support)\b/i.test(lower)) {
    return "help";
  }
  if (/\b(thank|thanks|ok|great|awesome|nice|cool)\b/i.test(lower)) {
    return "acknowledgement";
  }

  return "unknown";
}

function extractLocations(message) {
  const lower = message.toLowerCase();
  const patterns = [
    /(?:from|between)\s+(.+?)\s+(?:to|and)\s+(.+)/i,
    /(.+?)\s+(?:to|and)\s+(.+)/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m) return { from: m[1].trim(), to: m[2].trim() };
  }
  if (lower.includes(" to ")) {
    const parts = message.split(/\s+to\s+/i);
    if (parts.length >= 2) return { from: parts[0].trim(), to: parts.slice(1).join(" ").trim() };
  }
  return null;
}

async function handleVehicles() {
  try {
    const vehicles = await getVehicles();
    if (!vehicles || vehicles.length === 0) {
      return "No vehicles are currently available. Please try again later.";
    }
    const lines = vehicles.map((v) =>
      `• **${v.name}** — ${v.seats} seats, AC: ${v.isAC ? "Yes" : "No"}\n  One-way: ₹${v.oneWayBaseFare} base + ₹${v.oneWayPerKm}/km | Round-trip: ₹${v.roundTripBaseFare} base + ₹${v.roundTripPerKm}/km`
    );
    return `**Our Fleet:**\n\n${lines.join("\n\n")}\n\nWant a fare estimate? Just tell me your route!`;
  } catch {
    return "I couldn't fetch vehicle data right now. Please try again shortly.";
  }
}

async function handleFareEstimate(message) {
  const locs = extractLocations(message);
  if (!locs) {
    return "Please tell me your route. For example:\n• \"Fare from Madurai to Chennai\"\n• \"How much from Trichy to Bangalore\"";
  }
  try {
    const route = await getRoute(
      { address: locs.from },
      { address: locs.to }
    );
    if (!route || !route.distance) {
      return `I couldn't find a route from ${locs.from} to ${locs.to}. Please check the locations and try again.`;
    }
    const vehicles = await getVehicles();
    if (!vehicles || vehicles.length === 0) {
      return `The route from ${locs.from} to ${locs.to} is **${route.distance} km** (~${route.duration} min), but I couldn't fetch fare data right now.`;
    }
    const fareLines = [];
    for (const v of vehicles) {
      try {
        const result = await calculateFare({
          vehicleId: v._id,
          distance: route.distance,
          pickupDateTime: new Date(),
          tripType: "One Way",
          days: 1,
        });
        fareLines.push(`• **${v.name}** (${v.seats} seats): ₹${Math.round(result.estimatedFare)}`);
      } catch {
        fareLines.push(`• **${v.name}** (${v.seats} seats): Estimate unavailable`);
      }
    }
    return `**${locs.from} → ${locs.to}**\n📏 Distance: ${route.distance} km | ⏱ ~${route.duration} min\n\n**Fare Estimates (One Way):**\n${fareLines.join("\n")}\n\n*Final fare may vary based on traffic, route, and waiting time.*`;
  } catch {
    return `I couldn't calculate the fare right now. The route from ${locs.from} to ${locs.to} might be temporarily unavailable. Please try again.`;
  }
}

async function handleRouteInfo(message) {
  const locs = extractLocations(message);
  if (!locs) {
    return "Please tell me the two places. For example:\n• \"Distance from Madurai to Chennai\"\n• \"How far is Trichy from Bangalore\"";
  }
  try {
    const route = await getRoute(
      { address: locs.from },
      { address: locs.to }
    );
    if (!route || !route.distance) {
      return `I couldn't find a route from ${locs.from} to ${locs.to}. Please check the location names.`;
    }
    return `**${locs.from} → ${locs.to}**\n\n📏 Distance: **${route.distance} km**\n⏱ Duration: **~${route.duration} min**\n\nWant a fare estimate for this route? Just ask!`;
  } catch {
    return `I couldn't fetch route information right now. Please try again.`;
  }
}

async function handleMyBookings(userId) {
  if (!userId) {
    return "Please **log in** to view your bookings. You can sign in from the login page.";
  }
  try {
    const result = await getMyBookings(userId, { page: 1, limit: 5 });
    const bookings = result?.bookings || [];
    if (bookings.length === 0) {
      return "You don't have any bookings yet. Ready to book your first ride? 🚗";
    }
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

function handleUnknown() {
  const example = ROUTE_EXAMPLES[Math.floor(Math.random() * ROUTE_EXAMPLES.length)];
  return `I'm not sure how to help with that. Here are some things I can do:\n\n• **Vehicles** — "What vehicles are available?"\n• **Fare** — "Fare from ${example.from} to ${example.to}"\n• **Route** — "Distance from ${example.from} to ${example.to}"\n• **Bookings** — "Show my bookings"\n• **Help** — "How do I book a ride?"`;
}

export async function chat(message, userId = null) {
  const intent = detectIntent(message);

  switch (intent) {
    case "greeting":
      return "Hey there! 👋 Welcome to **GenZRides**. I'm your AI assistant. I can help you with fares, routes, vehicles, and bookings. What would you like to know?";

    case "vehicles":
      return await handleVehicles();

    case "fare_estimate":
      return await handleFareEstimate(message);

    case "route_info":
      return await handleRouteInfo(message);

    case "booking_help":
      return BOOKING_HELP;

    case "cancellation":
      return CANCELLATION_POLICY;

    case "payment":
      return PAYMENT_INFO;

    case "my_bookings":
      return await handleMyBookings(userId);

    case "help":
      return HELP_TEXT;

    case "acknowledgement":
      return "You're welcome! 😊 Is there anything else I can help you with?";

    default:
      return handleUnknown();
  }
}
