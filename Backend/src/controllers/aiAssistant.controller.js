import { chat } from "../services/aiAssistant.service.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }
    if (message.length > 500) {
      return res.status(400).json({ success: false, message: "Message too long (max 500 characters)" });
    }

    const userId = req.user?._id || null;
    const reply = await chat(message.trim(), userId);

    res.json({ success: true, data: { reply } });
  } catch (error) {
    console.error("AI Assistant error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};
