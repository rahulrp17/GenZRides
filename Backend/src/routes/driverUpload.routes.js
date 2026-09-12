import express from "express";
import upload from "../middleware/upload.middleware.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validateParams } from "../middleware/validate.middleware.js";
import { typeParamSchema } from "../validators/common.validator.js";

import {
  uploadDriverDocumentFile,
  uploadVehicleImages,
} from "../controllers/driverUpload.controller.js";

const router = express.Router();

// Static routes MUST come before parameterized routes to avoid being captured
// by /:type. Express matches routes in registration order.
router.post(
  "/vehicle-images",
  authenticate,
  authorize("driver"),
  upload.array("images", 5),
  uploadVehicleImages
);

router.post(
  "/:type",
  authenticate,
  authorize("driver"),
  validateParams(typeParamSchema),
  upload.single("image"),
  uploadDriverDocumentFile
);

export default router;
