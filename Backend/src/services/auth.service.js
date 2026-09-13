import bcrypt from "bcryptjs";
import User from "../models/User.js";
import DriverProfile from "../models/DriverProfile.js";
import { generateToken, generateTokenPair, hashToken } from "./jwt.service.js";

const REFRESH_TOKEN_EXPIRY_DAYS = 30;

/**
 * Compare a presented (raw) refresh token against a stored value.
 * Stored values are SHA-256 hashes; a legacy raw value may also match
 * so already-issued tokens keep working across the rollout.
 */
const tokenMatches = (stored, presented) =>
  stored != null &&
  (stored === hashToken(presented) || stored === presented);

export const registerCustomer = async (data) => {
  let { name, email, phone, password } = data;
  name = name.trim();
  email = email.trim().toLowerCase();
  phone = phone.trim();

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    if (existingUser.email === email) throw new Error("Email already exists.");
    if (existingUser.phone === phone) throw new Error("Phone number already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: "customer",
  });

  const tokenPair = generateTokenPair(user);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  user.refreshTokens = [{
    token: hashToken(tokenPair.refreshToken),
    createdAt: new Date(),
    expiresAt,
  }];
  await user.save();

  return {
    success: true,
    message: "Registration successful.",
    ...tokenPair,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
    },
  };
};

export const registerDriver = async (data) => {
  let { name, email, phone, password } = data;
  name = name.trim();
  email = email.trim().toLowerCase();
  phone = phone.trim();

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    if (existingUser.email === email) throw new Error("Email already exists.");
    if (existingUser.phone === phone) throw new Error("Phone number already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: "driver",
  });

  const tokenPair = generateTokenPair(user);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  user.refreshTokens = [{
    token: hashToken(tokenPair.refreshToken),
    createdAt: new Date(),
    expiresAt,
  }];
  await user.save();

  return {
    success: true,
    message: "Driver registration successful.",
    ...tokenPair,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
    },
  };
};

export const loginUser = async (email, password, userAgent = "") => {
  email = email.trim().toLowerCase();

  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user) throw new Error("Invalid email or password.");
  if (user.isBlocked) throw new Error("Your account has been blocked.");

  const match = await user.comparePassword(password);
  if (!match) throw new Error("Invalid email or password.");

  let driverProfile = null;
  if (user.role === "driver") {
    driverProfile = await DriverProfile.findOne({ user: user._id })
      .populate("vehicleType", "name seats image");

    if (!driverProfile) throw new Error("Driver profile not found.");
    if (driverProfile.approvalStatus === "Pending") {
      throw new Error("Your account is waiting for admin approval.");
    }
    if (driverProfile.approvalStatus === "Rejected") {
      throw new Error("Your driver account has been rejected.");
    }
  }

  const tokenPair = generateTokenPair(user);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  if (!user.refreshTokens) user.refreshTokens = [];

  // Remove expired tokens
  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.expiresAt && t.expiresAt > new Date()
  );

  // Limit stored refresh tokens to 5
  if (user.refreshTokens.length >= 5) {
    user.refreshTokens = user.refreshTokens.slice(-4);
  }

  user.refreshTokens.push({
    token: hashToken(tokenPair.refreshToken),
    createdAt: new Date(),
    expiresAt,
    userAgent,
  });

  await user.save();

  user.password = undefined;

  return {
    success: true,
    message: "Login successful.",
    ...tokenPair,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
    },
    driverProfile,
  };
};

export const rotateRefreshToken = async (oldRefreshToken) => {
  const { verifyRefreshToken, generateTokenPair } = await import("./jwt.service.js");

  const payload = verifyRefreshToken(oldRefreshToken);

  const user = await User.findById(payload.id).select("+refreshTokens +refreshTokens.token");
  if (!user) throw new Error("User not found.");
  if (user.isBlocked) throw new Error("Your account has been blocked.");

  const tokenIndex = user.refreshTokens?.findIndex(
    (t) => tokenMatches(t.token, oldRefreshToken)
  );

  if (tokenIndex === undefined || tokenIndex === -1) {
    // Token reuse detected - revoke all tokens
    user.refreshTokens = [];
    await user.save();
    throw new Error("Refresh token reuse detected. Please login again.");
  }

  const tokenEntry = user.refreshTokens[tokenIndex];
  if (tokenEntry.expiresAt && tokenEntry.expiresAt < new Date()) {
    user.refreshTokens.splice(tokenIndex, 1);
    await user.save();
    throw new Error("Refresh token expired. Please login again.");
  }

  // Remove old token
  user.refreshTokens.splice(tokenIndex, 1);

  // Generate new token pair
  const tokenPair = generateTokenPair(user);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  if (!user.refreshTokens) user.refreshTokens = [];

  user.refreshTokens.push({
    token: hashToken(tokenPair.refreshToken),
    createdAt: new Date(),
    expiresAt,
  });

  await user.save();

  return tokenPair;
};

export const logoutUser = async (userId, refreshToken) => {
  const user = await User.findById(userId).select("+refreshTokens +refreshTokens.token");
  if (!user) return;

  if (refreshToken) {
    const presentedHash = hashToken(refreshToken);
    user.refreshTokens = (user.refreshTokens || []).filter(
      (t) => t.token !== presentedHash && t.token !== refreshToken
    );
  } else {
    user.refreshTokens = [];
  }
  await user.save();
};

export const logoutAllDevices = async (userId) => {
  const user = await User.findById(userId).select("+refreshTokens +refreshTokens.token");
  if (!user) return;
  user.refreshTokens = [];
  await user.save();
};

export const requestPasswordReset = async (email) => {
  const clean = String(email || "").trim().toLowerCase();
  const user = await User.findOne({ email: clean });
  if (!user) throw new Error("No account found with this email.");
  if (user.isBlocked) throw new Error("Your account has been blocked.");

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = expiry;
  await user.save();

  // Best-effort email: if SMTP not configured, log OTP and still succeed (dev convenience)
  try {
    const { getEmailConfig } = await import("./email.service.js");
    const cfg = getEmailConfig();
    if (cfg.host && cfg.user && cfg.pass) {
      const { default: nodemailer } = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        requireTLS: !cfg.secure,
        family: 4,
        auth: { user: cfg.user, pass: cfg.pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        tls: { rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false", servername: cfg.host },
      });
      await transporter.sendMail({
        from: cfg.from,
        to: user.email,
        subject: "GenZRides — Password Reset OTP",
        text: `Your GenZRides OTP is ${otp}. It expires in 10 minutes. If you didn't request this, ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a0f0d;color:#fff;border-radius:16px;">
          <h2 style="color:#10b981;margin:0 0 12px;">GenZRides</h2>
          <p style="color:#d1d5db;">Your OTP for password reset is:</p>
          <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#10b981;background:#111827;padding:16px;text-align:center;border-radius:12px;margin:16px 0;">${otp}</div>
          <p style="color:#9ca3af;font-size:13px;">Expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>`,
      });
    } else {
      console.log(`[auth] OTP for ${clean}: ${otp} (SMTP not configured)`);
    }
  } catch (e) {
    console.log(`[auth] OTP for ${clean}: ${otp} (email send failed: ${e.message})`);
  }

  return { success: true, message: "OTP sent to your email. It expires in 10 minutes.", ...(process.env.NODE_ENV !== "production" ? { otp } : {}) };
};

export const verifyResetOtp = async (email, otp) => {
  const clean = String(email || "").trim().toLowerCase();
  const user = await User.findOne({ email: clean }).select("+password");
  if (!user) throw new Error("No account found with this email.");
  if (!user.otp || !user.otpExpiry) throw new Error("No OTP found. Please request a new one.");
  if (user.otpExpiry < new Date()) throw new Error("OTP expired. Please request a new one.");
  if (String(user.otp) !== String(otp).trim()) throw new Error("Invalid OTP.");
  return { success: true, message: "OTP verified." };
};

export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  const clean = String(email || "").trim().toLowerCase();
  const user = await User.findOne({ email: clean }).select("+password");
  if (!user) throw new Error("No account found with this email.");
  if (!user.otp || !user.otpExpiry) throw new Error("No OTP found. Please request a new one.");
  if (user.otpExpiry < new Date()) throw new Error("OTP expired. Please request a new one.");
  if (String(user.otp) !== String(otp).trim()) throw new Error("Invalid OTP.");

  const hashed = await bcrypt.hash(newPassword, 12);
  user.password = hashed;
  user.otp = null;
  user.otpExpiry = null;
  user.refreshTokens = [];
  await user.save();

  return { success: true, message: "Password reset successful. Please login with your new password." };
};
