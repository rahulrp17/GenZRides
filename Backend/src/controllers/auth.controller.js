import * as authService from "../services/auth.service.js";
import { decodeToken } from "../services/jwt.service.js";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const result = await authService.registerCustomer(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const registerDriver = async (req, res) => {
  try {
    const result = await authService.registerDriver(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Driver Register Error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const userAgent = req.headers["user-agent"] || "";
    const result = await authService.loginUser(req.body.email, req.body.password, userAgent);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required." });
    }

    const tokens = await authService.rotateRefreshToken(refreshToken);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      ...tokens,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(200).json({ success: true, message: "Logged out successfully." });
    }

    const decoded = decodeToken(refreshToken);
    if (!decoded?.id) {
      return res.status(200).json({ success: true, message: "Logged out successfully." });
    }

    await authService.logoutUser(decoded.id, refreshToken);
    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutAll = async (req, res) => {
  try {
    await authService.logoutAllDevices(req.user._id);
    return res.status(200).json({ success: true, message: "Logged out from all devices." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const result = await authService.requestPasswordReset(req.body.email);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const result = await authService.verifyResetOtp(req.body.email, req.body.otp);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPasswordWithOtp(req.body.email, req.body.otp, req.body.newPassword);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
