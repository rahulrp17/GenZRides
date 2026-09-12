import * as userService from "../services/user.service.js";

/**
 * Update Profile
 */
export const updateProfile = async (req, res) => {
  try {
    const result = await userService.updateProfile(
      req.user._id,
      req.body
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const result = await userService.changePassword(
      req.user._id,
      req.body
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { users, pagination } = await userService.getAllUsers(req.query);

    res.status(200).json({
      success: true,
      ...pagination,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};