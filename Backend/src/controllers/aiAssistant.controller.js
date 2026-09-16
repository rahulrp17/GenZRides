import { chat } from "../services/aiAssistant.service.js";

export const sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }
    if (message.length > 500) {
      return res.status(400).json({ success: false, message: "Message too long (max 500 characters)" });
    }

    // Last few turns so follow-ups are understood. Locked to user/assistant
    // roles, capped length — never trust client-supplied system prompts.
    const cleanHistory = (Array.isArray(history) ? history : [])
      .filter(
        (h) =>
          h &&
          (h.role === "user" || h.role === "assistant") &&
          typeof h.content === "string" &&
          h.content.trim().length > 0
      )
      .slice(-6)
      .map((h) => ({ role: h.role, content: h.content.slice(0, 500) }));

    const userId = req.user?._id || null;
    const reply = await chat(message.trim(), userId, cleanHistory);

    res.json({ success: true, data: { reply } });
  } catch (error) {
    console.error("AI Assistant error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};
