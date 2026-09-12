/* ===========================================================
   AUTHORIZE USER ROLES
=========================================================== */

export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      /* ===========================
         CHECK AUTHENTICATION
      ========================== */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Unauthorized. Please login first.",
        });
      }

      /* ===========================
         CHECK ROLE
      ========================== */

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You do not have permission to perform this action.",
        });
      }

      next();
    } catch (error) {
      console.error(
        "Authorization Error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "An error occurred during authorization.",
      });
    }
  };
};