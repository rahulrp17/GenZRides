import { z } from 'zod';

const rateDriverSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  review: z.string().max(500, 'Review must be at most 500 characters').optional(),
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

export { rateDriverSchema };
