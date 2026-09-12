import * as favoriteService from "../services/favoriteLocation.service.js";

export const createLocation = async (
  req,
  res
) => {
  try {
    const location =
      await favoriteService.createLocation(
        req.user._id,
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Location saved successfully.",
      location,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLocations = async (
  req,
  res
) => {
  try {
    const locations =
      await favoriteService.getLocations(
        req.user._id
      );

    res.json({
      success: true,
      locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLocation = async (
  req,
  res
) => {
  try {
    const location =
      await favoriteService.updateLocation(
        req.params.id,
        req.user._id,
        req.body
      );

    res.json({
      success: true,
      message: "Updated successfully.",
      location,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteLocation = async (
  req,
  res
) => {
  try {
    await favoriteService.deleteLocation(
      req.params.id,
      req.user._id
    );

    res.json({
      success: true,
      message: "Deleted successfully.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};