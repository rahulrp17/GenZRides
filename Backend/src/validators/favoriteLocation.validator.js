import { z } from 'zod';

const createLocationSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other'], {
    errorMap: () => ({ message: 'Label must be Home, Work, or Other' }),
  }),
  address: z.string().min(1, 'Address is required'),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  nickname: z.string().max(50, 'Nickname must be at most 50 characters').optional(),
});

const updateLocationSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other'], {
    errorMap: () => ({ message: 'Label must be Home, Work, or Other' }),
  }).optional(),
  address: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  nickname: z.string().max(50, 'Nickname must be at most 50 characters').optional(),
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
  createLocationSchema,
  updateLocationSchema,
};
