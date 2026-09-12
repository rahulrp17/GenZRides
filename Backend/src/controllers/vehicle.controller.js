import * as vehicleService from "../services/vehicle.service.js";

export const createVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully.",
      vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getVehicles();

    res.json({
      success: true,
      vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.updateVehicle(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Vehicle updated successfully.",
      vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);

    res.json({
      success: true,
      message: "Vehicle deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};