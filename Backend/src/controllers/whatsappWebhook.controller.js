import {
  parseIncomingMessages,
  handleAdminMessage,
  verifyMetaSignature,
} from "../services/whatsappInbound.service.js";

export const verifyWhatsappWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  
  // Fallback to genzrides123 if env not set - prevents Forbidden
  const expected = (process.env.WHATSAPP_VERIFY_TOKEN || "genzrides123").trim();
  

  console.log("VERIFY ATTEMPT:", { mode, token, expected, challenge });

  if (mode === "subscribe" && token === expected) {
    console.log("WEBHOOK VERIFIED OK");
    return res.status(200).send(challenge);
  }

  console.log("VERIFY FAILED");
  return res.sendStatus(403); // Return plain 403, not JSON
};

export const handleWhatsappWebhook = async (req, res) => {
  try {
    const raw = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : JSON.stringify(req.body || {});

    console.log("RAW WEBHOOK:", raw.substring(0, 1000)); // Log first 1000 chars

    const signature = req.headers["x-hub-signature-256"];
    const appSecret = (process.env.WHATSAPP_APP_SECRET || "").trim();
    
    if (appSecret) {
      if (!verifyMetaSignature(raw, signature, appSecret)) {
        console.error("[whatsapp-inbound] invalid signature");
        return res.sendStatus(401);
      }
    } else {
      console.log("[whatsapp-inbound] No APP_SECRET, skipping signature check");
    }

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return res.status(200).json({ success: true, message: "Ignored" });
    }

    const messages = parseIncomingMessages(payload);
    console.log(`Parsed ${messages.length} messages`, JSON.stringify(messages, null, 2));

    for (const msg of messages) {
      await handleAdminMessage(msg);
    }

    return res.status(200).json({ success: true, handled: messages.length });
  } catch (error) {
    console.error("[whatsapp-inbound] error:", error);
    return res.status(200).json({ success: false });
  }
};