import express from "express";
import upload from "../middleware/upload.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadProfileImage } from "../controllers/upload.controller.js";

const router = express.Router();

router.post(
  "/profile-image",
  authenticate,
  upload.single("image"),
  uploadProfileImage
);

export default router;  