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
    oneWayBaseFare: 100,
    roundTripBaseFare: 100,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 12,
    roundTripPerKm: 12,
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
});
