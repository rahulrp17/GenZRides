import DriverProfile from "../models/DriverProfile.js";
import { uploadDriverDocument } from "../services/driverUpload.service.js";

/* ===========================================================
   UPLOAD SINGLE DOCUMENT
=========================================================== */

export const uploadDriverDocumentFile = async (req, res) => {
  try {
    const { type } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const allowedTypes = [
      "profilePhoto",
      "drivingLicense",
      "aadhaarFront",
      "aadhaarBack",
      "rcBook",
      "insurance",
      "pollutionCertificate",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document type.",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed.",
      });
    }

    const driver = await DriverProfile.findOne({
      user: req.user._id,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    const result = await uploadDriverDocument(
      req.file.buffer,
      `drivers/${type}`
    );

    driver.documents[type] = result.url;

    // Re-verification required
    driver.documents.documentVerification = "Pending";
    driver.documents.rejectionReason = "";

    await driver.save();

    const updatedDriver = await DriverProfile.findById(driver._id)
      .populate("user", "name phone email profileImage")
      .populate("vehicleType");

    res.status(200).json({
      success: true,
      message: `${type} uploaded successfully.`,
      url: result.url,
      driver: updatedDriver,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   UPLOAD VEHICLE IMAGES
=========================================================== */

export const uploadVehicleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded.",
      });
    }

    const driver = await DriverProfile.findOne({
      user: req.user._id,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      if (!file.mimetype.startsWith("image/")) {
        continue;
      }

      const result = await uploadDriverDocument(
        file.buffer,
        "drivers/vehicle-images"
      );

      uploadedImages.push(result.url);
    }

    driver.documents.vehicleImages.push(...uploadedImages);

    driver.documents.documentVerification = "Pending";
    driver.documents.rejectionReason = "";

    await driver.save();

    const updatedDriver = await DriverProfile.findById(driver._id)
      .populate("user", "name phone email profileImage")
      .populate("vehicleType");

    res.status(200).json({
      success: true,
      message: "Vehicle images uploaded successfully.",
      images: uploadedImages,
      driver: updatedDriver,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};