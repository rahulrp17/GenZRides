import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Vehicle from "../src/models/Vehicle.js";
import {
  calculateFare,
  FARE_CONFIG,
} from "../src/services/fare.service.js";

let mongoServer;
let vehicle;

const noonISO = () => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};

const nightISO = () => {
  const d = new Date();
  d.setHours(23, 0, 0, 0);
  return d.toISOString();
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
  process.env.JWT_REFRESH_SECRET =
    "test-jwt-refresh-secret-min-32-characters";
  process.env.MONGO_URI = "";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  vehicle = await Vehicle.create({
    name: "Fare Sedan",
    seats: 4,
    oneWayBaseFare: 100,
    roundTripBaseFare: 100,
    oneWayBaseKm: 0,
    roundTripBaseKm: 0,
    oneWayPerKm: 12,
    roundTripPerKm: 12,
    minimumDistance: 1,
    waitingChargePerMinute: 2,
    nightCharge: 200,
    isActive: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Fare policy (calculateFare)", () => {
  it("one-way over 400 km gets the high driver bata slab", async () => {
    const fare = await calculateFare({
      vehicleId: vehicle._id,
      distance: 450,
      pickupDateTime: noonISO(),
      tripType: "One Way",
      days: 1,
    });

    expect(fare.fareBreakdown.driverAllowance).toBe(600);
    // 100 base + 450*12 distance + 600 bata
    expect(fare.estimatedFare).toBe(6100);
  });

  it("one-way under 130 km bills the 130 km daily minimum", async () => {
    const fare = await calculateFare({
      vehicleId: vehicle._id,
      distance: 100,
      pickupDateTime: noonISO(),
      tripType: "One Way",
      days: 1,
    });

    expect(fare.fareBreakdown.distanceFare).toBe(130 * 12);
    // 100 base + 1560 distance + 400 bata (130 km <= 400 slab, one-way standard)
    expect(fare.estimatedFare).toBe(2060);
  });

  it("one-way minimum scales with days", async () => {
    const fare = await calculateFare({
      vehicleId: vehicle._id,
      distance: 100,
      pickupDateTime: noonISO(),
      tripType: "One Way",
      days: 3,
    });

    // max(100, 3*130) = 390 km; running 390 <= 400 so standard bata (400/day one-way)
    expect(fare.fareBreakdown.distanceFare).toBe(390 * 12);
    expect(fare.fareBreakdown.driverAllowance).toBe(400 * 3);
  });

  it("round trip to Bengaluru bills the 300 km/day minimum", async () => {
    const fare = await calculateFare({
      vehicleId: vehicle._id,
      distance: 200,
      pickupDateTime: noonISO(),
      tripType: "Round Trip",
      days: 1,
      destinationCity: "Bengaluru, Karnataka",
    });

    // Round-trip total = max(200*1, 1*300) = 300 totalRunningKm
    // chargeableDistance = 300 - 0 = 300, distanceFare = 300 * 12 = 3600
    expect(fare.fareBreakdown.totalRunningKm).toBe(300);
    expect(fare.fareBreakdown.distanceFare).toBe(300 * 12);
    // Round trips always use the flat bata rate (no slabs, no threshold)
    expect(fare.fareBreakdown.driverAllowance).toBe(400);
    // 100 base + 3600 distance + 400 bata
    expect(fare.estimatedFare).toBe(4100);
  });

  it("round trip to Bengaluru also matches the Bangalore spelling and the flag", async () => {
    for (const extra of [
      { destinationCity: "Bangalore" },
      { isBengaluru: true },
    ]) {
      const fare = await calculateFare({
        vehicleId: vehicle._id,
        distance: 200,
        pickupDateTime: noonISO(),
        tripType: "Round Trip",
        days: 1,
        ...extra,
      });
      expect(fare.fareBreakdown.distanceFare).toBe(300 * 12);
    }
  });

  it("round trip applies the 250 km/day minimum and bata from day 1", async () => {
    const fare = await calculateFare({
      vehicleId: vehicle._id,
      distance: 100,
      pickupDateTime: noonISO(),
      tripType: "Round Trip",
      days: 2,
    });

    // Round-trip total = max(100*2, 2*250) = 500 totalRunningKm
    // chargeableDistance = 500 - 0 = 500, distanceFare = 500 * 12 = 6000
    expect(fare.fareBreakdown.totalRunningKm).toBe(500);
    expect(fare.fareBreakdown.distanceFare).toBe(500 * 12);
    // Round trips always use the flat bata rate (400/day, no slabs), 2 days
    expect(fare.fareBreakdown.driverAllowance).toBe(400 * 2);
    // 100 base + 6000 distance + 800 bata
    expect(fare.estimatedFare).toBe(6900);
  });

  it("prices Chennai–Trichy 2-day round trip exactly per the tariff example", async () => {
    const sedanLike = await Vehicle.create({
      name: "Fare Sedan Tariff",
      seats: 4,
      oneWayBaseFare: 1300,
      roundTripBaseFare: 2700,
      oneWayBaseKm: 130,
      roundTripBaseKm: 200,
      oneWayPerKm: 14,
      roundTripPerKm: 14,
      minimumDistance: 1,
      isActive: true,
    });

    const fare = await calculateFare({
      vehicleId: sedanLike._id,
      distance: 326,
      pickupDateTime: noonISO(),
      tripType: "Round Trip",
      days: 2,
    });

    // 326 × 2 days = 652 total (above the 2×250 minimum, so no floor);
    // 652 − 200 baseKm = 452 chargeable; 452 × 14 = 6328 distance fare;
    // bata = 400 × 2 = 800; total = 2700 + 6328 + 800 = 9828.
    // Displayed billed figure = 652 − 250 = 402 (money untouched).
    expect(fare.fareBreakdown.totalRunningKm).toBe(652);
    expect(fare.fareBreakdown.billedDistanceKm).toBe(402);
    expect(fare.fareBreakdown.chargeableDistance).toBe(452);
    expect(fare.fareBreakdown.distanceFare).toBe(6328);
    expect(fare.fareBreakdown.driverAllowance).toBe(800);
    expect(fare.estimatedFare).toBe(9828);
  });

  it("waiting under 30 min is free; 45 min bills 15 min", async () => {
    const free = await calculateFare({
      vehicleId: vehicle._id,
      distance: 450,
      pickupDateTime: noonISO(),
      tripType: "One Way",
      days: 1,
      waitingMinutes: 20,
    });
    expect(free.fareBreakdown.waitingCharge).toBe(0);

    const billed = await calculateFare({
      vehicleId: vehicle._id,
      distance: 450,
      pickupDateTime: noonISO(),
      tripType: "One Way",
      days: 1,
      waitingMinutes: 45,
    });
    expect(billed.fareBreakdown.waitingCharge).toBe(15 * 2);
  });

  it("airport pickup includes the configured surcharge", async () => {
    const fare = await calculateFare({
      vehicleId: vehicle._id,
      distance: 100,
      pickupDateTime: noonISO(),
      tripType: "Airport Pickup",
      days: 1,
    });

    expect(fare.fareBreakdown.airportCharge).toBe(
      100 * FARE_CONFIG.airportSurchargePercent
    );
    expect(fare.fareBreakdown.airportCharge).toBe(10);
  });

  it("toll and permit charges pass through as their own line items", async () => {
    const fare = await calculateFare({
      vehicleId: vehicle._id,
      distance: 450,
      pickupDateTime: noonISO(),
      tripType: "One Way",
      days: 1,
      tollCharges: 50,
      permitCharges: 100,
    });

    expect(fare.fareBreakdown.tollCharges).toBe(50);
    expect(fare.fareBreakdown.permitCharges).toBe(100);
    expect(fare.estimatedFare).toBe(6100 + 150);
  });

  it("night window applies the vehicle night charge", async () => {
    const fare = await calculateFare({
      vehicleId: vehicle._id,
      distance: 450,
      pickupDateTime: nightISO(),
      tripType: "One Way",
      days: 1,
    });

    expect(fare.fareBreakdown.nightCharge).toBe(200);
    expect(fare.estimatedFare).toBe(6100);
  });

  it("round trip NEVER adds night charge even at night", async () => {
    const fare = await calculateFare({
      vehicleId: vehicle._id,
      distance: 450,
      pickupDateTime: nightISO(),
      tripType: "Round Trip",
      days: 1,
    });

    // Night charge must be 0 for round trips
    expect(fare.fareBreakdown.nightCharge).toBe(0);
  });

  it("exposes billed distance, day count and bata rate for the UI", async () => {
    const fare = await calculateFare({
      vehicleId: vehicle._id,
      distance: 100,
      pickupDateTime: noonISO(),
      tripType: "Round Trip",
      days: 2,
      destinationCity: "Bengaluru",
    });

    // Displayed billed figure = total − one minimum block: 600 − 300 = 300
    expect(fare.fareBreakdown.billedDistanceKm).toBe(300);
    expect(fare.fareBreakdown.billableDays).toBe(2);
    // Round trips always use the flat bata rate (400), not high-distance
    expect(fare.fareBreakdown.bataPerDay).toBe(400);
  });

  it("uses the per-vehicle high-distance bata override when set", async () => {
    const overrideVehicle = await Vehicle.create({
      name: "Fare SUV Override",
      seats: 6,
      oneWayBaseFare: 200,
      roundTripBaseFare: 200,
      oneWayPerKm: 20,
      roundTripPerKm: 20,
      driverBataHighDistance: 800,
      isActive: true,
    });

    const fare = await calculateFare({
      vehicleId: overrideVehicle._id,
      distance: 450,
      pickupDateTime: noonISO(),
      tripType: "One Way",
      days: 1,
    });

    expect(fare.fareBreakdown.driverAllowance).toBe(800);
    expect(fare.fareBreakdown.bataPerDay).toBe(800);
  });

  it("keeps the legacy response shape with additive fields only", async () => {
    const fare = await calculateFare({
      vehicleId: vehicle._id,
      distance: 450,
      pickupDateTime: noonISO(),
      tripType: "One Way",
      days: 1,
    });

    expect(fare).toHaveProperty("vehicle");
    expect(fare).toHaveProperty("estimatedFare");
    expect(fare.fareBreakdown).toEqual(
      expect.objectContaining({
        baseFare: expect.any(Number),
        distanceFare: expect.any(Number),
        billedDistanceKm: expect.any(Number),
        totalRunningKm: expect.any(Number),
        baseKm: expect.any(Number),
        chargeableDistance: expect.any(Number),
        billableDays: expect.any(Number),
        bataPerDay: expect.any(Number),
        driverAllowance: expect.any(Number),
        waitingCharge: expect.any(Number),
        nightCharge: expect.any(Number),
        airportCharge: expect.any(Number),
        tollCharges: expect.any(Number),
        permitCharges: expect.any(Number),
        total: fare.estimatedFare,
      })
    );
  });
});

describe("Package-inclusive base fare (baseKm)", () => {
  let baseKmVehicle;

  beforeAll(async () => {
    baseKmVehicle = await Vehicle.create({
      name: "Fare Sedan Included",
      seats: 4,
      oneWayBaseFare: 1000,
      roundTripBaseFare: 1000,
      oneWayBaseKm: 50,
      roundTripBaseKm: 50,
      oneWayPerKm: 15,
      roundTripPerKm: 15,
      minimumDistance: 1,
      nightCharge: 200,
      isActive: true,
    });
  });

  it("baseKm 0 (default) charges full distance — legacy behavior", async () => {
    const defaultVehicle = await Vehicle.create({
      name: "Fare Sedan Default",
      seats: 4,
      oneWayBaseFare: 100,
      roundTripBaseFare: 100,
      oneWayBaseKm: 0,
      roundTripBaseKm: 0,
      oneWayPerKm: 12,
      roundTripPerKm: 12,
      minimumDistance: 1,
      nightCharge: 200,
      isActive: true,
    });

    const fare = await calculateFare({
      vehicleId: defaultVehicle._id,
      distance: 200,
      pickupDateTime: noonISO(),
      tripType: "One Way",
      days: 1,
    });

    // 200km > 130km minimum, so billed = 200
    expect(fare.fareBreakdown.baseKm).toBe(0);
    expect(fare.fareBreakdown.chargeableDistance).toBe(200);
    expect(fare.fareBreakdown.distanceFare).toBe(200 * 12);
  });

  it("one-way 320km with baseKm 50 charges only 270km", async () => {
    const fare = await calculateFare({
      vehicleId: baseKmVehicle._id,
      distance: 320,
      pickupDateTime: noonISO(),
      tripType: "One Way",
      days: 1,
    });

    // 320km > 130km minimum, baseKm 50 → chargeable = 320 - 50 = 270
    expect(fare.fareBreakdown.billedDistanceKm).toBe(320);
    expect(fare.fareBreakdown.baseKm).toBe(50);
    expect(fare.fareBreakdown.chargeableDistance).toBe(270);
    expect(fare.fareBreakdown.distanceFare).toBe(270 * 15);
    // 1000 base + 4050 distance + 400 bata (one-way standard)
    expect(fare.estimatedFare).toBe(5450);
  });

  it("round trip bills one-way km × days minus baseKm once", async () => {
    const fare = await calculateFare({
      vehicleId: baseKmVehicle._id,
      distance: 350,
      pickupDateTime: noonISO(),
      tripType: "Round Trip",
      days: 1,
    });

    // max(350*1, 1*250) = 350 total running km;
    // baseKm 50 applied once → 300 chargeable
    // distanceFare = 300 * 15 = 4500
    // displayed billed figure = 350 − 250 = 100 (chargeable untouched)
    expect(fare.fareBreakdown.totalRunningKm).toBe(350);
    expect(fare.fareBreakdown.billedDistanceKm).toBe(100);
    expect(fare.fareBreakdown.chargeableDistance).toBe(300);
    expect(fare.fareBreakdown.distanceFare).toBe(300 * 15);
  });

  it("trip below baseKm still applies the per-day minimum floor", async () => {
    const fare = await calculateFare({
      vehicleId: baseKmVehicle._id,
      distance: 30,
      pickupDateTime: noonISO(),
      tripType: "One Way",
      days: 1,
    });

    // 30km requested, but 130km/day minimum applies → billedDistance = 130
    // chargeable = max(0, 130 - 50) = 80
    expect(fare.fareBreakdown.billedDistanceKm).toBe(130);
    expect(fare.fareBreakdown.chargeableDistance).toBe(80);
    expect(fare.fareBreakdown.distanceFare).toBe(80 * 15);
  });
});

describe("Fare breakdown rounding", () => {
  it("every monetary field is rounded to exactly 2 decimal places", async () => {
    const fare = await calculateFare({
      vehicleId: vehicle._id,
      distance: 450,
      pickupDateTime: nightISO(),
      tripType: "One Way",
      days: 1,
      waitingMinutes: 45,
      tollCharges: 120.678,
      permitCharges: 50.123,
    });

    const monetaryFields = [
      "baseFare",
      "distanceFare",
      "driverAllowance",
      "waitingCharge",
      "nightCharge",
      "airportCharge",
      "tollCharges",
      "permitCharges",
    ];

    for (const field of monetaryFields) {
      const val = fare.fareBreakdown[field];
      expect(typeof val).toBe("number");
      // Assert value equals its own 2-decimal rounding — catches floats
      // like 4794.599999999999 that don't collapse cleanly.
      expect(Number(val.toFixed(2))).toBe(val);
    }

    expect(typeof fare.estimatedFare).toBe("number");
    expect(Number(fare.estimatedFare.toFixed(2))).toBe(fare.estimatedFare);
  });
});
