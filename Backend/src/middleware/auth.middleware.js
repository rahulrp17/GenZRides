import User from "../models/User.js";
import { verifyToken } from "../services/jwt.service.js";
import { withCache } from "../config/redis.js";

const getCachedUser = async (id) => {
  return await withCache(`user:${id}`, 60, async () => {
    const u = await User.findById(id).select("-password").lean();
    return u;
  });
};

/* ===========================================================
   AUTHENTICATE USER
=========================================================== */

export const authenticate = async (
  req,
  res,
  next
) => {
  try {
    let token;

    /* ===========================
       GET TOKEN
    ========================== */

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith(
        "Bearer "
      )
    ) {
      token =
        req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Access denied. No token provided.",
      });
    }

    /* ===========================
       VERIFY TOKEN
    ========================== */

    const decoded = verifyToken(token);

    /* ===========================
       FIND USER
    ========================== */

    const user = await getCachedUser(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been blocked.",
      });
    }

    /* ===========================
       ATTACH USER
    ========================== */

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Authentication Error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token.",
    });
  }
};

/* ===========================================================
   AUTHENTICATE OPTIONAL — sets req.user if token present
   but never blocks the request
=========================================================== */

export const authenticateOptional = async (req, _res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      const decoded = verifyToken(token);
      const user = await getCachedUser(decoded.id);
      if (user && !user.isBlocked) req.user = user;
    }
  } catch {
    // silently ignore — guest request
  }
  next();
};