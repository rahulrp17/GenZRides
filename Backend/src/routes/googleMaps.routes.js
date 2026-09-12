import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import { guestSearchLimiter } from "../config/redisRateLimiter.js";
import { getRouteSchema, reverseGeocodeSchema, autocompleteSchema, placeDetailsSchema } from "../validators/googleMaps.validator.js";
import {
  getRoute,
  getETA,
  reverseGeocode,
  autocomplete,
  getPlaceDetails,
} from "../controllers/googleMaps.controller.js";

const router = express.Router();

router.post("/route", authenticate, validate(getRouteSchema), getRoute);
router.post("/eta", authenticate, validate(getRouteSchema), getETA);
router.post("/reverse-geocode", authenticate, validate(reverseGeocodeSchema), reverseGeocode);
router.get("/autocomplete", authenticate, validateQuery(autocompleteSchema), autocomplete);
router.get("/place-details", authenticate, validateQuery(placeDetailsSchema), getPlaceDetails);

// Public guest Places search (no JWT; same controllers/services/validation)
router.get("/guest/autocomplete", guestSearchLimiter, validateQuery(autocompleteSchema), autocomplete);
router.get("/guest/place-details", guestSearchLimiter, validateQuery(placeDetailsSchema), getPlaceDetails);

export default router;
