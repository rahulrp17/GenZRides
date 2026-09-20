import { z } from "zod";

const objectId = z
  .string()
  .length(24, "ID must be 24 characters")
  .regex(/^[0-9a-fA-F]{24}$/, "ID must be a valid hex string");

export const idParamSchema = z.object({
  id: objectId,
});

export const bookingIdParamSchema = z.object({
  bookingId: objectId,
});

export const typeParamSchema = z.object({
  type: z.enum([
    "profilePhoto",
    "drivingLicense",
    "aadhaarFront",
    "aadhaarBack",
    "rcBook",
    "insurance",
    "pollutionCertificate",
  ]),
});

// Permissive pagination/query schema. Unknown keys are stripped from the
// parsed output only; `req.query` itself is never mutated, so controllers
// reading extra params continue to work.
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  vehicleType: z.string().optional(),
  sortBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  rating: z.string().optional(),
  driver: z.string().optional(),
  customer: z.string().optional(),
  hidden: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const fareEstimateSchema = z.object({
  pickup: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  drop: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  pickupDateTime: z.string().optional(),
  tripType: z
    .enum(["One Way", "Round Trip", "Airport Pickup", "Airport Drop"])
    .optional(),
  days: z.number().int().min(1).optional(),
  vehicleType: objectId,
  waitingMinutes: z.number().min(0).optional(),
  tollCharges: z.number().min(0).optional(),
  permitCharges: z.number().min(0).optional(),
  destinationCity: z.string().optional(),
  isBengaluru: z.boolean().optional(),
});
