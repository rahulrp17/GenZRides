import * as googleMapsService from "../services/googleMaps.service.js";

/* ===========================================================
   GET ROUTE
=========================================================== */

export const getRoute = async (req, res) => {
  try {
    const { origin, destination } = req.body;

    const route = await googleMapsService.getRoute(
      origin,
      destination
    );

    return res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   GET ETA
=========================================================== */

export const getETA = async (req, res) => {
  try {
    const { origin, destination } = req.body;

    const eta = await googleMapsService.getETA(
      origin,
      destination
    );

    return res.status(200).json({
      success: true,
      data: eta,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   REVERSE GEOCODE
=========================================================== */

export const reverseGeocode = async (
  req,
  res
) => {
  try {
    const { latitude, longitude } = req.body;

    const address =
      await googleMapsService.reverseGeocode(
        latitude,
        longitude
      );

    return res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   PLACE AUTOCOMPLETE
=========================================================== */

export const autocomplete = async (
  req,
  res
) => {
  try {
    const { input } = req.query;

    const places =
      await googleMapsService.getPlaceSuggestions(
        input
      );

    return res.status(200).json({
      success: true,
      data: places,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   PLACE DETAILS
=========================================================== */

export const getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.query;

    const details = await googleMapsService.getPlaceDetails(placeId);

    if (!details) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};