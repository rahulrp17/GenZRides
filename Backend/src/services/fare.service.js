import Vehicle from "../models/Vehicle.js";

/* ===========================================================
   FARE POLICY CONFIG
   Single source of truth for every tunable tariff number.
   Rule 4/5: night window + airport % live here, not inline.
   Per-vehicle overrides (where the Vehicle model has the field)
   take precedence, falling back to these defaults.
=========================================================== */

export const FARE_CONFIG = {
  // Rule 4 — night window [start, end); overnight wrap supported.
  nightChargeStartHour: 22,
  nightChargeEndHour: 6,

  // Rule 5 — airport surcharge as a fraction of base fare.
  airportSurchargePercent: 0.1,

  // Rule 3 — free waiting buffer (food halt), in minutes.
  freeWaitingMinutes: 30,

  // Rule 1 — one-way / drop-trip minimum billable km per day.
  oneWayMinKmPerDay: 130,

  // Rule 2 — round-trip minimum running km per day, applied to the
  // trip total (one-way km × days).
  roundTripMinKmPerDay: 250,
  roundTripMinKmPerDayBengaluru: 300,

  // Rule 1+2 — driver bata (allowance) per day. The high rate
  // applies when total running km exceeds the threshold.
  // One-way / drop uses 400 standard; round-trip is always 400 flat
  // (per fare notes + tests). Separate constants keep the two policies
  // explicit.
  driverBataStandard: 400,
  driverBataRoundTrip: 400,
  driverBataHighDistance: 600,
  driverBataHighDistanceThresholdKm: 400,

  // Rule 3 — fallback waiting rate/min when the vehicle has none set.
  waitingChargePerMinute: 2.5,
};

/* ===========================================================
   CALCULATE FARE — UNIFIED LOGIC
   One-way core formula:
      travelledDistance = max(routeKm, days × minPerDay)
      totalRunningKm  = travelledDistance (1 leg)
   Round-trip core formula:
      totalRunningKm  = max(routeKm × days, days × minPerDay)
      chargeableDist  = max(0, totalRunningKm − roundTripBaseKm)
      distanceFare    = chargeableDist × roundTripPerKm
      driverBata      = ₹400 × days (no slabs, no threshold)
      totalFare       = baseFare + distanceFare + bata (+ extras)

   Round-trip differences:
   • total runs one-way km × days (out + return across the days),
     floored at the per-day minimum — never doubled on top of it
   • driverBataHighDistance threshold is NEVER applied
     (always ₹400/day standard rate)
     • night charge is never added
     • waiting / toll / permit are not charged
=========================================================== */

export const calculateFare = async ({
  vehicleId,
  distance,
  pickupDateTime,
  tripType = "One Way",
  days = 1,
  waitingMinutes = 0,
  tollCharges = 0,
  permitCharges = 0,
  destinationCity = "",
  isBengaluru = false,
}) => {
  /* ===========================
     VALIDATION
  =========================== */

  if (!vehicleId) {
    throw new Error("Vehicle type is required.");
  }

  if (distance <= 0) {
    throw new Error("Invalid trip distance.");
  }

  /* ===========================
     GET VEHICLE
  =========================== */

  const vehicle = await Vehicle.findOne({
    _id: vehicleId,
    isActive: true,
  });

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  const billableDays = Math.max(1, Math.floor(Number(days) || 1));
  const isRoundTrip = tripType === "Round Trip";

  /* ===========================
     MINIMUM DISTANCE (Rules 1+2)
  =========================== */

  const toBengaluru =
    isBengaluru || /(bengaluru|bangalore)/i.test(destinationCity || "");

  const minKmPerDay = isRoundTrip
    ? toBengaluru
      ? FARE_CONFIG.roundTripMinKmPerDayBengaluru
      : FARE_CONFIG.roundTripMinKmPerDay
    : FARE_CONFIG.oneWayMinKmPerDay;

  const travelledDistance = Math.max(distance, billableDays * minKmPerDay);

  /* ===========================
     RESOLVE TRIP-TYPE FIELDS
  =========================== */

  const baseFare = isRoundTrip
    ? (vehicle.roundTripBaseFare ?? 0)
    : (vehicle.oneWayBaseFare ?? 0);

  const baseKm = isRoundTrip
    ? (vehicle.roundTripBaseKm ?? 0)
    : (vehicle.oneWayBaseKm ?? 0);

  const perKm = isRoundTrip
    ? (vehicle.roundTripPerKm ?? 0)
    : (vehicle.oneWayPerKm ?? 0);

  /* ===========================
     UNIFIED DISTANCE FARE
  =========================== */

  // Round trips bill one-way km × days (floored at the daily minimum),
  // so a 2-day 326 km trip totals 652 km — not a doubled minimum.
  const totalRunningKm = isRoundTrip
    ? Math.max(distance * billableDays, billableDays * minKmPerDay)
    : travelledDistance;

  const chargeableDistance = Math.max(0, totalRunningKm - baseKm);
  const distanceFare = chargeableDistance * perKm;

  /* ===========================
     DRIVER BATA
     One-way/drop: high-distance slab (₹600) when total running
       km > 400 km; per-vehicle override via driverBataHighDistance.
   Round trip: ALWAYS standard rate (₹400/day × days).
        The 400 km threshold is never applied.
  =========================== */

  let bataPerDay;

  if (isRoundTrip) {
    bataPerDay = FARE_CONFIG.driverBataRoundTrip;
  } else {
    const highBataRate =
      vehicle.driverBataHighDistance &&
      Number(vehicle.driverBataHighDistance) > 0
        ? Number(vehicle.driverBataHighDistance)
        : FARE_CONFIG.driverBataHighDistance;

    bataPerDay =
      totalRunningKm > FARE_CONFIG.driverBataHighDistanceThresholdKm
        ? highBataRate
        : FARE_CONFIG.driverBataStandard;
  }

  const driverAllowance = bataPerDay * billableDays;

  /* ===========================
     WAITING CHARGE (one-way only)
  =========================== */

  let waitingCharge = 0;

  if (!isRoundTrip) {
    const waitingRate =
      vehicle.waitingChargePerMinute &&
      Number(vehicle.waitingChargePerMinute) > 0
        ? Number(vehicle.waitingChargePerMinute)
        : FARE_CONFIG.waitingChargePerMinute;

    const billableWaitingMinutes = Math.max(
      0,
      Number(waitingMinutes || 0) - FARE_CONFIG.freeWaitingMinutes,
    );

    waitingCharge = billableWaitingMinutes * waitingRate;
  }

  /* ===========================
     NIGHT CHARGE (one-way only)
  =========================== */

  let nightCharge = 0;

  if (!isRoundTrip && pickupDateTime) {
    const hour = new Date(pickupDateTime).getHours();
    const { nightChargeStartHour, nightChargeEndHour } = FARE_CONFIG;

    const inWindow =
      nightChargeStartHour <= nightChargeEndHour
        ? hour >= nightChargeStartHour && hour < nightChargeEndHour
        : hour >= nightChargeStartHour || hour < nightChargeEndHour;

    if (inWindow) {
      nightCharge = vehicle.nightCharge;
    }
  }

  /* ===========================
     AIRPORT TRIPS (one-way only)
  =========================== */

  let airportCharge = 0;

  if (
    !isRoundTrip &&
    (tripType === "Airport Pickup" || tripType === "Airport Drop")
  ) {
    airportCharge = baseFare * FARE_CONFIG.airportSurchargePercent;
  }

  /* ===========================
     TOLL / PERMIT (one-way only)
  =========================== */

  const tollTotal = isRoundTrip ? 0 : Math.max(0, Number(tollCharges) || 0);
  const permitTotal = isRoundTrip ? 0 : Math.max(0, Number(permitCharges) || 0);

  /* ===========================
     ROUNDING
  =========================== */

  const round2 = (n) => Math.round(Number(n || 0) * 100) / 100;

  const rounded = {
    baseFare: round2(baseFare),
    distanceFare: round2(distanceFare),
    driverAllowance: round2(driverAllowance),
    waitingCharge: round2(waitingCharge),
    nightCharge: round2(nightCharge),
    airportCharge: round2(airportCharge),
    tollCharges: round2(tollTotal),
    permitCharges: round2(permitTotal),
  };

  /* ===========================
     TOTAL
  =========================== */

  const estimatedFare = Math.round(
    rounded.baseFare +
      rounded.distanceFare +
      rounded.driverAllowance +
      rounded.waitingCharge +
      // rounded.nightCharge +
      rounded.airportCharge +
      rounded.tollCharges +
      rounded.permitCharges,
  );

  /* ===========================
     RESPONSE
  =========================== */

  return {
    vehicle,
    estimatedFare,
    fareBreakdown: {
      ...rounded,
      // Displayed billed figure: on round trips the running total minus
      // one daily-minimum block (e.g. 652 − 250 = 402). Display only —
      // the charged distance (chargeableDistance) is untouched.
      billedDistanceKm: round2(
        isRoundTrip
          ? Math.max(0, totalRunningKm - minKmPerDay)
          : travelledDistance
      ),
      totalRunningKm: round2(totalRunningKm),
      baseKm,
      chargeableDistance: round2(chargeableDistance),
      billableDays,
      bataPerDay,
      total: estimatedFare,
    },
  };
};
