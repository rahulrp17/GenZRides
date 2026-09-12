import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
  createLocationSchema,
  updateLocationSchema,
} from "../validators/favoriteLocation.validator.js";
import {
  createLocation,
  getLocations,
  updateLocation,
  deleteLocation,
} from "../controllers/favoriteLocation.controller.js";

const router = express.Router();

router.post("/", authenticate, validate(createLocationSchema), createLocation);
router.get("/", authenticate, getLocations);
router.put(
  "/:id",
  authenticate,
  validateParams(idParamSchema),
  validate(updateLocationSchema),
  updateLocation
);
router.delete(
  "/:id",
  authenticate,
  validateParams(idParamSchema),
  deleteLocation
);

export default router;
