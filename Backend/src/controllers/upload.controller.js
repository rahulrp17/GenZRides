import { uploadImage } from "../services/upload.service.js";
import User from "../models/User.js";

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded.",
      });
    }

    const result = await uploadImage(
      req.file.buffer,
      "profile-images"
    );

    const user = await User.findById(req.user._id);

    user.profileImage = result.secure_url;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully.",
      profileImage: result.secure_url,
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

