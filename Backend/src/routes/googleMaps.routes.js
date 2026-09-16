import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import { guestSearchLimiter } from "../config/redisRateLimiter.js";
import {
  cacheMiddleware,
  queryCacheKey,
} from "../middleware/cache.middleware.js";
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
// Same query → same Google suggestions for every user: cached 1h (saves
// Google quota + latency). Never cache route/eta (live traffic data).
const autocompleteCache = cacheMiddleware(
  (req) => queryCacheKey("maps:autocomplete", req.query),
  3600
);
const placeDetailsCache = cacheMiddleware(
  (req) => queryCacheKey("maps:place-details", req.query),
  3600
);
router.get("/autocomplete", authenticate, validateQuery(autocompleteSchema), autocompleteCache, autocomplete);
router.get("/place-details", authenticate, validateQuery(placeDetailsSchema), placeDetailsCache, getPlaceDetails);

// Public guest Places search (no JWT; same controllers/services/validation)
router.get("/guest/autocomplete", guestSearchLimiter, validateQuery(autocompleteSchema), autocompleteCache, autocomplete);
router.get("/guest/place-details", guestSearchLimiter, validateQuery(placeDetailsSchema), placeDetailsCache, getPlaceDetails);

export default router;
