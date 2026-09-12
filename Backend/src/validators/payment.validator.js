import { z } from 'zod';

const createOrderSchema = z.object({
  bookingId: z
    .string()
    .length(24, 'Booking ID must be 24 characters')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay signature is required'),
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
  createOrderSchema,
  verifyPaymentSchema,
};
