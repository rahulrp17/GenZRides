import { z } from 'zod';

const currentYear = new Date().getFullYear();

const createProfileSchema = z.object({
  aadhaarNumber: z
    .string()
    .length(12, 'Aadhaar number must be 12 digits')
    .regex(/^\d{12}$/, 'Aadhaar number must be 12 digits'),
  licenseNumber: z.string().min(1, 'License number is required'),
  vehicleType: z.string().length(24, 'Invalid vehicle type ID').regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
  vehicleBrand: z.string().min(1, 'Vehicle brand is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  vehicleColor: z.string().min(1, 'Vehicle color is required'),
  vehicleYear: z
    .number()
    .int()
    .min(1990, 'Vehicle year must be 1990 or later')
    .max(currentYear + 1, `Vehicle year must be ${currentYear + 1} or earlier`),
  vehicleNumber: z
    .string()
    .regex(
      /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,2}\s?\d{4}$/,
      'Vehicle number must be in Indian format (e.g., TN 01 AB 1234)'
    ),
  seats: z.number().int().min(1).max(10).optional(),
});

const updateLocationSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
});

const requestWithdrawalSchema = z.object({
  amount: z.number().min(1, 'Withdrawal amount must be at least 1'),
  bankName: z.string().min(1, 'Bank name is required'),
  accountHolder: z.string().min(1, 'Account holder name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'IFSC code must be in format: 4 letters, 0, then 6 alphanumeric characters'),
});

const updateProfileSchema = z.object({
  vehicleBrand: z.string().min(1).optional(),
  vehicleModel: z.string().min(1).optional(),
  vehicleColor: z.string().min(1).optional(),
  vehicleYear: z
    .number()
    .int()
    .min(1990, 'Vehicle year must be 1990 or later')
    .max(currentYear + 1, `Vehicle year must be ${currentYear + 1} or earlier`)
    .optional(),
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

export {
  createProfileSchema,
  updateLocationSchema,
  requestWithdrawalSchema,
  updateProfileSchema,
};
