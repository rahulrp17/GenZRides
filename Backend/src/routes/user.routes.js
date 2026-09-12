import express from "express";
import {
  updateProfile,
  getAllUsers,
  changePassword,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import { updateProfileSchema, changePasswordSchema } from "../validators/user.validator.js";
import { paginationQuerySchema } from "../validators/common.validator.js";

const router = express.Router();

router.put("/profile", authenticate, validate(updateProfileSchema), updateProfile);
router.put("/change-password", authenticate, validate(changePasswordSchema), changePassword);
router.get("/", authenticate, authorize("admin"), validateQuery(paginationQuerySchema), getAllUsers);

export default router;
