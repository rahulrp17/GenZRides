export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: (err.issues || err.errors || []).map((e) => ({
        field: e.path?.join('.'),
        message: e.message,
      })),
    });
  }
};

export const validateParams = (schema) => (req, res, next) => {
  try {
    schema.parse(req.params);
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

export const validateQuery = (schema) => (req, res, next) => {
  try {
    schema.parse(req.query);
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
