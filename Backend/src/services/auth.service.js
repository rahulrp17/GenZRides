import bcrypt from "bcryptjs";
import crypto from "crypto";
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
    // Only verified (approved) drivers may log in or use the driver app.
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

  // Store only the hash — a database leak must never expose usable OTPs.
  // Attempts reset on every new code.
  user.otp = hashToken(otp);
  user.otpExpiry = expiry;
  user.otpAttempts = 0;
  await user.save();

  // Best-effort email: try HTTPS API first (Resend/Brevo, never blocked),
  // then fall back to SMTP. Log OTP if all channels fail (dev convenience).
  let emailWarning = null;
  try {
    const { getEmailConfig } = await import("./email.service.js");
    const cfg = getEmailConfig();
    const otpSubject = "GenZRides — Password Reset OTP";
    const otpText = `Your GenZRides OTP is ${otp}. It expires in 10 minutes. If you didn't request this, ignore this email.`;
    const otpHtml = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a0f0d;color:#fff;border-radius:16px;">
      <h2 style="color:#10b981;margin:0 0 12px;">GenZRides</h2>
      <p style="color:#d1d5db;">Your OTP for password reset is:</p>
      <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#10b981;background:#111827;padding:16px;text-align:center;border-radius:12px;margin:16px 0;">${otp}</div>
      <p style="color:#9ca3af;font-size:13px;">Expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    </div>`;

    const mailOpts = { from: cfg.from, to: user.email, subject: otpSubject, text: otpText, html: otpHtml };

    let sent = false;
    let lastError = null;

    // 1. Try HTTPS API (Resend / Brevo) — port 443, never blocked
    if (!sent) {
      try {
        const { sendViaHttpApi } = await import("./email.service.js");
        await sendViaHttpApi(cfg, mailOpts);
        sent = true;
        console.log(`[auth] OTP email sent via HTTPS API to ${user.email}`);
      } catch (e) {
        lastError = e;
        console.warn(`[auth] HTTPS API failed for ${user.email}: ${e.message}`);
      }
    }

    // 2. Fallback: SMTP transport
    if (!sent && cfg.host && cfg.user && cfg.pass) {
      try {
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
        await transporter.sendMail(mailOpts);
        sent = true;
        console.log(`[auth] OTP email sent via SMTP to ${user.email}`);
      } catch (e) {
        lastError = e;
        console.warn(`[auth] SMTP failed for ${user.email}: ${e.message}`);
      }
    }

    if (!sent) {
      emailWarning = "Email delivery failed. Please try again later or contact support.";
      console.error(`[auth] ALL EMAIL CHANNELS FAILED for ${user.email}. Last error: ${lastError?.message || 'no channel configured'}`);
    }
  } catch (e) {
    console.error(`[auth] OTP email send failed for ${clean}: ${e.message}`);
    if (e.stack) console.error(`[auth] stack: ${e.stack.split('\n').slice(0, 3).join(' | ')}`);
  }

  return {
    success: true,
    message: "OTP sent to your email. It expires in 10 minutes.",
    ...(process.env.NODE_ENV !== "production" ? { otp } : {}),
    ...(emailWarning ? { emailWarning } : {}),
  };
};

// Max wrong guesses per OTP code before it is voided (force re-request).
const MAX_OTP_ATTEMPTS = 5;

const assertOtpUsable = (user) => {
  if (!user.otp || !user.otpExpiry) {
    throw new Error("No OTP found. Please request a new one.");
  }
  if (user.otpExpiry < new Date()) throw new Error("OTP expired. Please request a new one.");
  if ((user.otpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
    throw new Error("Too many wrong attempts. Please request a new OTP.");
  }
};

const otpMatches = (storedHash, input) => {
  try {
    const a = Buffer.from(String(storedHash || ""), "utf8");
    const b = Buffer.from(hashToken(String(input || "").trim()), "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

const registerOtpAttempt = async (user) => {
  user.otpAttempts = (user.otpAttempts || 0) + 1;
  if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    // Void the code — guessing window closed until a fresh OTP is issued.
    user.otp = null;
    user.otpExpiry = null;
  }
  await user.save();
};

export const verifyResetOtp = async (email, otp) => {  const clean = String(email || "").trim().toLowerCase();
  const user = await User.findOne({ email: clean }).select("+password +otp +otpExpiry +otpAttempts");
  if (!user) throw new Error("No account found with this email.");
  assertOtpUsable(user);
  if (!otpMatches(user.otp, otp)) {
    await registerOtpAttempt(user);
    throw new Error("Invalid OTP.");
  }
  return { success: true, message: "OTP verified." };
};

export const resetPasswordWithOtp = async (email, otp, newPassword) => {  const clean = String(email || "").trim().toLowerCase();
  const user = await User.findOne({ email: clean }).select("+password +otp +otpExpiry +otpAttempts");
  if (!user) throw new Error("No account found with this email.");
  assertOtpUsable(user);
  if (!otpMatches(user.otp, otp)) {
    await registerOtpAttempt(user);
    throw new Error("Invalid OTP.");
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  user.password = hashed;
  user.otp = null;
  user.otpExpiry = null;
  user.otpAttempts = 0;
  user.refreshTokens = [];
  await user.save();

  return { success: true, message: "Password reset successful. Please login with your new password." };
};
