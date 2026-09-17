import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const mockGet = jest.fn();
const mockPost = jest.fn();

jest.unstable_mockModule("axios", () => ({
  __esModule: true,
  default: { get: mockGet, post: mockPost },
}));

const Vehicle = (await import("../src/models/Vehicle.js")).default;
const { chat, extractLocations } = await import(
  "../src/services/aiAssistant.service.js"
);

let mongoServer;

const COORDS = {
  chennai: { lat: 13.0827, lng: 80.2707, label: "Chennai, Tamil Nadu, India" },
  madurai: { lat: 9.9252, lng: 78.1198, label: "Madurai, Tamil Nadu, India" },
  trichy: { lat: 10.7905, lng: 78.7047, label: "Tiruchirappalli, Tamil Nadu, India" },
};

const coordsFor = (address) => {
  const a = String(address || "").toLowerCase();
  return Object.entries(COORDS).find(([city]) => a.includes(city))?.[1] || null;
};

beforeAll(async () => {
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  await Vehicle.create({
    name: "Test Sedan",
    seats: 4,
    luggage: 2,
    oneWayBaseFare: 100,
    roundTripBaseFare: 100,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 12,
    roundTripPerKm: 12,
    minimumDistance: 1,
    isActive: true,
  });

  await Vehicle.create({
    name: "Test SUV",
    seats: 6,
    luggage: 4,
    oneWayBaseFare: 200,
    roundTripBaseFare: 200,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 18,
    roundTripPerKm: 18,
    minimumDistance: 1,
    isActive: true,
  });

  await Vehicle.create({
    name: "Test Innova",
    seats: 7,
    luggage: 5,
    oneWayBaseFare: 150,
    roundTripBaseFare: 150,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 10,
    roundTripPerKm: 10,
    minimumDistance: 1,
    isActive: true,
  });

  // Fake only the HTTP layer: geocode + routes endpoints.
  mockGet.mockImplementation(async (url, { params } = {}) => {
    if (String(url).includes("geocode")) {
      const hit = coordsFor(params?.address);
      if (!hit) return { data: { results: [] } };
      return {
        data: {
          results: [
            {
              geometry: { location: { lat: hit.lat, lng: hit.lng } },
              formatted_address: hit.label,
            },
          ],
        },
      };
    }
    return { data: {} };
  });

  mockPost.mockImplementation(async (url) => {
    if (String(url).includes("computeRoutes")) {
      return {
        data: {
          routes: [
            { distanceMeters: 460000, duration: "27000s", polyline: {} },
          ],
        },
      };
    }
    return { data: {} };
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("extractLocations", () => {
  it("strips command words: 'calculate the fare chennai to madurai'", () => {
    expect(extractLocations("calculate the fare chennai to madurai")).toEqual({
      from: "chennai",
      to: "madurai",
    });
  });

  it("handles 'Fare from Madurai to Chennai'", () => {
    expect(extractLocations("Fare from Madurai to Chennai")).toEqual({
      from: "Madurai",
      to: "Chennai",
    });
  });

  it("handles 'How much from Trichy to Bangalore?'", () => {
    expect(extractLocations("How much from Trichy to Bangalore?")).toEqual({
      from: "Trichy",
      to: "Bangalore",
    });
  });
});

describe("AI fare fallback (no OpenRouter key in tests)", () => {
  it("calculates Chennai → Madurai fare instead of 'couldn't calculate'", async () => {
    const reply = await chat("calculate the fare chennai to madurai");
    expect(reply).not.toMatch(/couldn't calculate/i);
    expect(reply).toMatch(/460/); // mocked 460 km route
    expect(reply).toMatch(/₹/); // real fare line from calculateFare
    expect(reply).toMatch(/Test Sedan/);
  });

  it("answers distance queries via geocode + route", async () => {
    const reply = await chat("distance from trichy to madurai");
    expect(reply).toMatch(/460/);
  });

  it("gives a friendly message for unknown places", async () => {
    const reply = await chat("fare from asdfghjkl to madurai");
    expect(reply).toMatch(/couldn't find "asdfghjkl"/i);
  });

  it("book-with-route computes fare + booking path", async () => {
    const reply = await chat("Can you book a cab from chennai to madurai");
    expect(reply).toMatch(/460/);
    expect(reply).toMatch(/Book Ride/);
  });

  it("airport fare falls through to the fare engine", async () => {
    const reply = await chat("What is the fare from Trichy Airport to Trichy");
    expect(reply).toMatch(/460/);
    expect(reply).toMatch(/₹/);
  });
});

describe("AI cheapest + seat fit (live fleet)", () => {
  it("ranks cheapest per km without a route", async () => {
    const reply = await chat("Which cab is cheapest");
    expect(reply).toMatch(/cheapest per km/i);
    const innovaIdx = reply.indexOf("Test Innova");
    const suvIdx = reply.indexOf("Test SUV");
    expect(innovaIdx).toBeGreaterThanOrEqual(0);
    expect(suvIdx).toBeGreaterThanOrEqual(0);
    expect(innovaIdx).toBeLessThan(suvIdx); // 10/km before 18/km
  });

  it("flags cheapest on a routed fare", async () => {
    const reply = await chat("cheapest fare from chennai to madurai");
    expect(reply).toMatch(/cheapest/);
  });

  it("recommends 6+ seaters for 'I need a 6-seater'", async () => {
    const reply = await chat("I need a 6-seater");
    expect(reply).toMatch(/6\+ people/);
    expect(reply).toMatch(/Test SUV/);
    expect(reply).toMatch(/Test Innova/);
    expect(reply).not.toMatch(/Test Sedan/);
  });

  it("suggests roomy cabs for 5 people with luggage", async () => {
    const reply = await chat("Which vehicle is suitable for 5 people with luggage");
    expect(reply).toMatch(/Test SUV|Test Innova/);
    expect(reply).toMatch(/luggage/i);
  });
});

describe("AI tracking + status with login (live bookings)", () => {
  let customerId;

  beforeAll(async () => {
    const User = (await import("../src/models/User.js")).default;
    const DriverProfile = (await import("../src/models/DriverProfile.js")).default;
    const Booking = (await import("../src/models/Booking.js")).default;
    const Vehicle = (await import("../src/models/Vehicle.js")).default;

    const customer = await User.create({
      name: "AI Track Cust",
      email: "aitrack@test.com",
      phone: "9876543300",
      password: "Password123",
      role: "customer",
    });
    customerId = customer._id;
    const driverUser = await User.create({
      name: "AI Track Driver",
      email: "aitrackdriver@test.com",
      phone: "9876543301",
      password: "Password123",
      role: "driver",
    });
    const sedan = await Vehicle.findOne({ name: "Test Sedan" });
    const profile = await DriverProfile.create({
      user: driverUser._id,
      aadhaarNumber: "999999999999",
      licenseNumber: "DLAITRACK001",
      vehicleType: sedan._id,
      vehicleBrand: "Test",
      vehicleModel: "Model",
      vehicleColor: "White",
      vehicleYear: 2022,
      vehicleNumber: "KA01AI0001",
      approvalStatus: "Approved",
      isOnline: true,
      isAvailable: false,
    });
    const loc = (address) => ({ address, latitude: 13.0, longitude: 80.2 });
    await Booking.create({
      customer: customer._id,
      driver: profile._id,
      pickup: loc("Track Pickup"),
      drop: loc("Track Drop"),
      pickupDateTime: new Date(),
      vehicleType: sedan._id,
      bookingStatus: "Started",
      estimatedFare: 500,
    });
  });

  it("answers 'where is my driver' with driver + status", async () => {
    const reply = await chat("Where is my driver", String(customerId));
    expect(reply).toMatch(/AI Track Driver/);
    expect(reply).toMatch(/Started/);
    expect(reply).toMatch(/Current Ride/);
  });

  it("answers driver phone queries", async () => {
    const reply = await chat("Give me my driver's phone number", String(customerId));
    expect(reply).toMatch(/9876543301/);
  });

  it("shows booking status with fare", async () => {
    const reply = await chat("What is the status of my booking", String(customerId));
    expect(reply).toMatch(/Started/);
    expect(reply).toMatch(/500/);
  });
});
