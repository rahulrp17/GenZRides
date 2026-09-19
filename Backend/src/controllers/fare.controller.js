import * as fareService from "../services/fare.service.js";
import * as googleMapsService from "../services/googleMaps.service.js";

/* ===========================================================
   ESTIMATE FARE
=========================================================== */

export const estimateFare = async (req, res) => {
  try {
    const {
      pickup,
      drop,
      pickupDateTime,
      tripType = "One Way",
      days = 1,
      vehicleType,
      waitingMinutes = 0,
      tollCharges = 0,
      permitCharges = 0,
      destinationCity = "",
      isBengaluru = false,
    } = req.body;

    if (!pickup || !drop) {
      return res.status(400).json({
        success: false,
        message: "Pickup and Drop are required.",
      });
    }

    if (!vehicleType) {
      return res.status(400).json({
        success: false,
        message: "Vehicle type is required.",
      });
    }

    /* ===========================
       GET ROUTE
    ========================== */

    const route = await googleMapsService.getRoute(
      pickup,
      drop
    );

    /* ===========================
       CALCULATE FARE
    ========================== */

    const fare = await fareService.calculateFare({
      vehicleId: vehicleType,
      distance: route.distance,
      pickupDateTime,
      tripType,
      days,
      waitingMinutes,
      tollCharges,
      permitCharges,
      destinationCity: destinationCity || drop?.address || "",
      isBengaluru,
    });

    return res.status(200).json({
      success: true,
      data: {
        distance: route.distance,
        duration: route.duration,
        estimatedFare: fare.estimatedFare,
        // Per-km tariff (oneWayPerKm / roundTripPerKm) so the UI can show
        // "₹X/km" on the trip summary — matches how the fare was computed.
        perKm:
          (tripType === "Round Trip"
            ? Number(fare.vehicle?.roundTripPerKm ?? 0)
            : Number(fare.vehicle?.oneWayPerKm ?? 0)) || 0,
        fareBreakdown: fare.fareBreakdown,
      },
    });
  } catch (error) {
    console.error("Fare Estimation Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
