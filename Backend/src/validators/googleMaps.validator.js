import { z } from 'zod';

const latLngSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
});

const getRouteSchema = z.object({
  origin: latLngSchema,
  destination: latLngSchema,
});

const reverseGeocodeSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
});

const autocompleteSchema = z.object({
  input: z.string().min(1, 'Input is required'),
});

const placeDetailsSchema = z.object({
  placeId: z.string().min(1, 'Place ID is required'),
});

export {
  getRouteSchema,
  reverseGeocodeSchema,
  autocompleteSchema,
  placeDetailsSchema,
};
