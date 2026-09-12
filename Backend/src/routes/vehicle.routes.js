import express from "express";

import {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicle.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "../validators/admin.validator.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createVehicleSchema),
  createVehicle
);

router.get("/", getVehicles);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateParams(idParamSchema),
  validate(updateVehicleSchema),
  updateVehicle
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateParams(idParamSchema),
  deleteVehicle
);

export default router;
