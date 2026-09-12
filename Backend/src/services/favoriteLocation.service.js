import FavoriteLocation from "../models/FavoriteLocation.js";

const toGeoJSON = (lng, lat) => ({
  type: "Point",
  coordinates: [Number(lng), Number(lat)],
});

/* ===========================================================
   CREATE FAVORITE LOCATION
=========================================================== */

export const createLocation = async (userId, data) => {
  const {
    label,
    address,
    latitude,
    longitude,
  } = data;

  if (!label || !address) {
    throw new Error("Label and address are required.");
  }

  // Home & Work should always be unique
  if (["Home", "Work"].includes(label)) {
    const existing = await FavoriteLocation.findOne({
      user: userId,
      label,
    });

    if (existing) {
      existing.address = address.trim();
      existing.latitude = latitude;
      existing.longitude = longitude;
      existing.location = toGeoJSON(longitude, latitude);

      await existing.save();

      return existing;
    }
  }

  // Prevent duplicate "Other" address
  if (label === "Other") {
    const existing = await FavoriteLocation.findOne({
      user: userId,
      address: address.trim(),
    });

    if (existing) {
      throw new Error("Location already exists.");
    }
  }

  return await FavoriteLocation.create({
    user: userId,
    label,
    address: address.trim(),
    latitude,
    longitude,
    location: toGeoJSON(longitude, latitude),
  });
};

/* ===========================================================
   GET ALL FAVORITE LOCATIONS
=========================================================== */

export const getLocations = async (userId) => {
  return await FavoriteLocation.find({
    user: userId,
  }).sort({
    createdAt: -1,
  });
};

/* ===========================================================
   GET SINGLE LOCATION
=========================================================== */

export const getLocationById = async (
  locationId,
  userId
) => {
  const location = await FavoriteLocation.findOne({
    _id: locationId,
    user: userId,
  });

  if (!location) {
    throw new Error("Location not found.");
  }

  return location;
};

/* ===========================================================
   UPDATE LOCATION
=========================================================== */

export const updateLocation = async (
  locationId,
  userId,
  data
) => {
  const location =
    await FavoriteLocation.findOne({
      _id: locationId,
      user: userId,
    });

  if (!location) {
    throw new Error("Location not found.");
  }

  if (data.label) {
    location.label = data.label;
  }

  if (data.address) {
    location.address = data.address.trim();
  }

  if (data.latitude !== undefined) {
    location.latitude = data.latitude;
  }

  if (data.longitude !== undefined) {
    location.longitude = data.longitude;
  }

  // Keep the GeoJSON field in sync with the plain lat/lng fields.
  if (data.latitude !== undefined || data.longitude !== undefined) {
    location.location = toGeoJSON(
      data.longitude ?? location.longitude,
      data.latitude ?? location.latitude
    );
  }

  await location.save();

  return location;
};

/* ===========================================================
   DELETE LOCATION
=========================================================== */

export const deleteLocation = async (
  locationId,
  userId
) => {
  const location =
    await FavoriteLocation.findOneAndDelete({
      _id: locationId,
      user: userId,
    });

  if (!location) {
    throw new Error("Location not found.");
  }

  return {
    success: true,
    message: "Location deleted successfully.",
  };
};