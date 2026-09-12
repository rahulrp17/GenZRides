import { z } from 'zod';

const createVehicleSchema = z.object({
  name: z.string().min(1, 'Vehicle name is required'),
  seats: z.number().int().min(1, 'Seats must be at least 1').max(20, 'Seats must be at most 20'),
  oneWayBaseFare: z.number().min(0, 'One-way base fare must be at least 0'),
  roundTripBaseFare: z.number().min(0, 'Round-trip base fare must be at least 0'),
  oneWayBaseKm: z.number().min(0, 'One-way base km must be at least 0').nullish(),
  roundTripBaseKm: z.number().min(0, 'Round-trip base km must be at least 0').nullish(),
  oneWayPerKm: z.number().min(0, 'One-way per km must be at least 0'),
  roundTripPerKm: z.number().min(0, 'Round-trip per km must be at least 0'),
  luggage: z.number().min(0, 'Luggage capacity must be at least 0'),
  waitingChargePerMinute: z.number().min(0, 'Waiting charge per minute must be at least 0'),
  driverAllowance: z.number().min(0, 'Driver allowance must be at least 0'),
  nightCharge: z.number().min(0, 'Night charge must be at least 0'),
  minimumDistance: z.number().min(1, 'Minimum distance must be at least 1'),
  image: z.string().optional(),
  driverBataHighDistance: z.number().min(0, 'High-distance bata must be at least 0').nullish(),
  isAC: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const updateVehicleSchema = z.object({
  name: z.string().min(1).optional(),
  seats: z.number().int().min(1).max(20).optional(),
  oneWayBaseFare: z.number().min(0).optional(),
  roundTripBaseFare: z.number().min(0).optional(),
  oneWayBaseKm: z.number().min(0).nullish(),
  roundTripBaseKm: z.number().min(0).nullish(),
  oneWayPerKm: z.number().min(0).optional(),
  roundTripPerKm: z.number().min(0).optional(),
  luggage: z.number().min(0).optional(),
  waitingChargePerMinute: z.number().min(0).optional(),
  driverAllowance: z.number().min(0).optional(),
  nightCharge: z.number().min(0).optional(),
  minimumDistance: z.number().min(1).optional(),
  image: z.string().optional(),
  driverBataHighDistance: z.number().min(0, 'High-distance bata must be at least 0').nullish(),
  isAC: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const rejectDriverSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

const rejectBookingSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

const cancelBookingSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
});

const idParamSchema = z.object({
  id: z
    .string()
    .length(24, 'ID must be 24 characters')
    .regex(/^[0-9a-fA-F]{24}$/, 'ID must be a valid hex string'),
});

const assignDriverSchema = z.object({
  driverId: z
    .string()
    .length(24, 'Driver ID must be 24 characters')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
});

const rejectWithdrawalSchema = z.object({
  remarks: z.string().min(1, 'Remarks are required'),
});

export {
  createVehicleSchema,
  updateVehicleSchema,
  rejectDriverSchema,
  rejectBookingSchema,
  cancelBookingSchema,
  paginationSchema,
  idParamSchema,
  assignDriverSchema,
  rejectWithdrawalSchema,
};
