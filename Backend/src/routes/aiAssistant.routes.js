import express from "express";
import { sendMessage } from "../controllers/aiAssistant.controller.js";
import { authenticateOptional } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/chat", authenticateOptional, sendMessage);

export default router;
