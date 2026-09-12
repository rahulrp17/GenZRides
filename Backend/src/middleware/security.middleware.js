export const sanitizeInput = (req, res, next) => {
  const BLOCKED_KEYS = ["__proto__", "constructor", "prototype"];

  const sanitize = (obj) => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const key of Object.keys(obj)) {
        // Strip MongoDB operators and prototype-pollution vectors.
        if (
          key.startsWith("$") ||
          key.includes(".") ||
          BLOCKED_KEYS.includes(key)
        ) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(sanitize);
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

export const requestTimeout = (ms = 30000) => (req, res, next) => {
  req.setTimeout(ms, () => {
    if (!res.headersSent) {
      res.status(408).json({ success: false, message: "Request timeout" });
    }
  });
  next();
};

export const envValidator = () => {
  const required = [
    "MONGO_URI",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn("WARNING: JWT_SECRET should be at least 32 characters for security");
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    console.warn("WARNING: JWT_REFRESH_SECRET should be at least 32 characters for security");
  }
};
