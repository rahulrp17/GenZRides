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
const { chat } = await import("../src/services/aiAssistant.service.js");
const {
  detectLanguage,
  normalizeLocations,
  extractTanglishRoute,
  extractTamilRoute,
  extractTamilWhen,
} = await import("../src/services/tamilLanguage.js");

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

  const mkVehicle = (name, seats, perKm) =>
    Vehicle.create({
      name,
      seats,
      oneWayBaseFare: 100,
      roundTripBaseFare: 100,
      oneWayBaseKm: 0,
      roundTripBaseKm: 0,
      oneWayPerKm: perKm,
      roundTripPerKm: perKm,
      minimumDistance: 1,
      isActive: true,
    });
  await mkVehicle("Test Sedan", 4, 12);
  await mkVehicle("Test SUV", 6, 18);
  await mkVehicle("Test Innova", 7, 10);

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
        data: { routes: [{ distanceMeters: 330000, duration: "21600s", polyline: {} }] },
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

describe("detectLanguage", () => {
  it("detects the four request examples + English", () => {
    expect(detectLanguage("Trichy airport la irundhu Chennai ku cab venum")).toBe("tanglish");
    expect(detectLanguage("Trichy to Madurai cab price enna?")).toBe("tanglish");
    expect(detectLanguage("Naalaiku morning Chennai poganum")).toBe("tanglish");
    expect(detectLanguage("எனக்கு திருச்சியிலிருந்து சென்னை கேப் வேண்டும்")).toBe("ta");
    expect(detectLanguage("Fare from Madurai to Chennai")).toBe("en");
    expect(detectLanguage("Is airport pickup available?")).toBe("en");
  });
});

describe("normalizeLocations", () => {
  it("maps Tamil script + Tanglish variants to English", () => {
    expect(normalizeLocations("திருச்சி")).toBe("Trichy");
    expect(normalizeLocations("Tiruchy to Madras")).toBe("Trichy to Chennai");
    expect(normalizeLocations("Kovai airport")).toBe("Coimbatore airport");
    expect(normalizeLocations("சென்னைக்கு")).toBe("Chennai");
  });
});

describe("route extraction", () => {
  it("Tanglish la-irundhu-ku shape", () => {
    expect(extractTanglishRoute("Trichy airport la irundhu Chennai ku cab venum")).toEqual({
      from: "Trichy airport",
      to: "Chennai",
    });
  });

  it("Tamil-script suffix shape", () => {
    expect(extractTamilRoute("எனக்கு திருச்சியிலிருந்து சென்னை கேப் வேண்டும்")).toEqual({
      from: "Trichy",
      to: "Chennai",
    });
  });

  it("relative day + time", () => {
    expect(extractTamilWhen("Naalaiku morning Chennai poganum")).toEqual({
      day: "tomorrow",
      time: "morning",
    });
  });
});

describe("end-to-end Tanglish/Tamil fare + booking (mocked HTTP, real DB/APIs)", () => {
  it("Trichy airport → Chennai booking request replies in Tanglish with real fare", async () => {
    const reply = await chat("Trichy airport la irundhu Chennai ku cab venum");
    expect(reply).toMatch(/₹/);
    expect(reply).toMatch(/Book Ride/);
    expect(reply).toMatch(/sollunga/i);
    expect(reply).not.toMatch(/couldn't calculate/i);
  }, 30000);

  it("Trichy → Madurai price question replies in Tanglish", async () => {
    const reply = await chat("Trichy to Madurai cab price enna?");
    expect(reply).toMatch(/₹/);
    expect(reply).toMatch(/330/);
    expect(reply).not.toMatch(/couldn't calculate/i);
  }, 30000);

  it("tomorrow-morning trip without places asks only the missing detail", async () => {
    const reply = await chat("Naalaiku morning Chennai poganum");
    expect(reply).toMatch(/Pickup enga/i);
    expect(reply).not.toMatch(/₹/);
  });

  it("Tamil-script request gets fare + booking CTA", async () => {
    const reply = await chat("எனக்கு திருச்சியிலிருந்து சென்னை கேப் வேண்டும்");
    expect(reply).toMatch(/₹/);
    expect(reply).toMatch(/Book Ride/);
    expect(reply).toMatch(/சொல்லுங்க|sollunga/i);
  }, 30000);

  it("English still replies in English", async () => {
    const reply = await chat("Fare from Madurai to Chennai");
    expect(reply).toMatch(/Fare Estimates/);
    expect(reply).not.toMatch(/sollunga/i);
  }, 30000);
});
