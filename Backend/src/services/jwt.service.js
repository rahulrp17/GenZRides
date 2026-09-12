import jwt from "jsonwebtoken";
import crypto from "crypto";

/* ===========================================================
   GENERATE ACCESS TOKEN
=========================================================== */

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES || "7d",
    }
  );
};

/* ===========================================================
   GENERATE REFRESH TOKEN
=========================================================== */

export const generateRefreshToken = (
  user
) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      jti: crypto.randomUUID(),
    },
    process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_REFRESH_EXPIRES ||
        "30d",
    }
  );
};

/* ===========================================================
   GENERATE ACCESS + REFRESH TOKEN
=========================================================== */

export const generateTokenPair = (
  user
) => {
  return {
    accessToken: generateToken(user),
    refreshToken:
      generateRefreshToken(user),
  };
};

/* ===========================================================
   VERIFY ACCESS TOKEN
=========================================================== */

export const verifyToken = (
  token
) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET
  );
};

/* ===========================================================
   VERIFY REFRESH TOKEN
=========================================================== */

export const verifyRefreshToken = (
  token
) => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_SECRET
  );
};

/* ===========================================================
   DECODE TOKEN (WITHOUT VERIFY)
=========================================================== */

export const decodeToken = (
  token
) => {
  return jwt.decode(token);
};

/* ===========================================================
   HASH A TOKEN FOR AT-REST STORAGE
   Refresh tokens are stored hashed (SHA-256) so a database
   compromise never exposes usable raw refresh tokens. The raw
   token is only ever held in memory / sent to the client.
=========================================================== */

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};