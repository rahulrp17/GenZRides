import Vehicle from "../models/Vehicle.js";
import { withCache, invalidateCache } from "../config/redis.js";

export const createVehicle = async (data) => {
  const vehicle = await Vehicle.create(data);
  await invalidateCache("vehicles:*");
  return vehicle;
};

export const getVehicles = async () => {
  return await withCache("vehicles:active:list", 300, async () => {
    return await Vehicle.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  });
};

export const getVehicleById = async (id) => {
  return await Vehicle.findById(id);
};

export const updateVehicle = async (id, data) => {
  const v = await Vehicle.findByIdAndUpdate(id, data, { new: true });
  await invalidateCache("vehicles:*");
  return v;
};

export const deleteVehicle = async (id) => {
  const v = await Vehicle.findByIdAndDelete(id);
  await invalidateCache("vehicles:*");
  return v;
};