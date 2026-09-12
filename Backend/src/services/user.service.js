import User from "../models/User.js";
import bcrypt from "bcryptjs";

/**
 * Update User Profile
 */
export const updateProfile = async (userId, data) => {
  const { name, profileImage } = data;

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  if (name) {
    user.name = name;
  }

  if (profileImage) {
    user.profileImage = profileImage;
  }

  await user.save();

  return {
    success: true,
    message: "Profile updated successfully.",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
    },
  };
};

export const changePassword = async (userId, data) => {
  const { currentPassword, newPassword } = data;

  if (!currentPassword || !newPassword) {
    throw new Error("Current password and new password are required.");
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new Error("User not found.");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new Error("Current password is incorrect.");
  }

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();

  return {
    success: true,
    message: "Password changed successfully.",
  };
};

export const getAllUsers = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find()
      .select("-password -refreshToken -otp -otpExpiry")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};