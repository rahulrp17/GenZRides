import { z } from 'zod';

const locationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
});

const createBookingSchema = z.object({
  pickup: locationSchema,
  drop: locationSchema,
  pickupDateTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
    .refine((val) => new Date(val) > new Date(), 'Pickup date must be in the future'),
  tripType: z.enum(['One Way', 'Round Trip', 'Airport Pickup', 'Airport Drop'], {
    errorMap: () => ({ message: 'Trip type must be One Way, Round Trip, Airport Pickup, or Airport Drop' }),
  }),
  days: z.number().int().min(1, 'Days must be at least 1'),
  vehicleType: z.string().length(24, 'Invalid vehicle type ID').regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
  paymentMethod: z.enum(['Cash', 'Online'], {
    errorMap: () => ({ message: 'Payment method must be Cash or Online' }),
  }),
  customerNotes: z.string().max(500, 'Customer notes must be at most 500 characters').optional(),
});

const cancelBookingSchema = z.object({
  cancelReason: z.string().max(500, 'Cancel reason must be at most 500 characters').optional(),
});

const driverCancelBookingSchema = z.object({
  cancelReason: z.string().min(1, 'Cancel reason is required').max(500, 'Cancel reason must be at most 500 characters'),
});

const updatePaymentSchema = z.object({
  paymentStatus: z.enum(['Paid', 'Unpaid'], {
    errorMap: () => ({ message: 'Payment status must be Paid or Unpaid' }),
  }),
});

const addTipSchema = z.object({
  amount: z.number().min(1, 'Tip amount must be at least 1').max(10000, 'Tip amount must be at most 10000'),
});

const bookingIdSchema = z.object({
  id: z
    .string()
    .length(24, 'Booking ID must be 24 characters')
    .regex(/^[0-9a-fA-F]{24}$/, 'Booking ID must be a valid hex string'),
});

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors?.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
};

const guestCreateBookingSchema = z.object({
  pickup: locationSchema,
  drop: locationSchema,
  pickupDateTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
    .refine((val) => new Date(val) > new Date(), 'Pickup date must be in the future'),
  tripType: z.enum(['One Way', 'Round Trip', 'Airport Pickup', 'Airport Drop'], {
    errorMap: () => ({ message: 'Trip type must be One Way, Round Trip, Airport Pickup, or Airport Drop' }),
  }),
  days: z.number().int().min(1, 'Days must be at least 1').optional().default(1),
  // Round Trip also accepts an explicit return date/time; days are derived from it.
  returnDateTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid return date format')
    .optional(),
  vehicleType: z.string().length(24, 'Invalid vehicle type ID').regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
  // Guests pay cash (no account for online verification/refunds).
  paymentMethod: z.literal('Cash'),
  customerNotes: z.string().max(500, 'Customer notes must be at most 500 characters').optional(),
  guestName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  guestEmail: z.string().email('Enter a valid email address'),
  guestPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
}).refine(
  (val) =>
    val.tripType !== 'Round Trip' ||
    !val.returnDateTime ||
    new Date(val.returnDateTime) > new Date(val.pickupDateTime),
  { message: 'Return date must be after pickup date', path: ['returnDateTime'] }
);

// Guests prove ownership of a booking with reference (+ phone); no JWT involved.
const guestLookupSchema = z.object({
  ref: z.string().min(6, 'Booking reference is too short').max(28, 'Booking reference is too long'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});

const guestCancelSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  cancelReason: z.string().max(500, 'Cancel reason must be at most 500 characters').optional(),
});

export {
  createBookingSchema,
  guestCreateBookingSchema,
  cancelBookingSchema,
  driverCancelBookingSchema,
  updatePaymentSchema,
  addTipSchema,
  bookingIdSchema,
  guestLookupSchema,
  guestCancelSchema,
};
