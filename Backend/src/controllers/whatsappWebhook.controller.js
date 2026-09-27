import {
  parseIncomingMessages,
  handleAdminMessage,
  verifyMetaSignature,
} from "../services/whatsappInbound.service.js";

/* ===========================================================
   META WHATSAPP WEBHOOK (admin quick actions)
   GET  /api/webhooks/whatsapp — one-time verification handshake
   POST /api/webhooks/whatsapp — button taps + typed commands
   NOTE: app.js mounts these routes behind express.raw(), so req.body
   is a Buffer here (parsed manually, like the razorpay handler).
   ========================================================== */

// One-time Meta handshake: echo hub.challenge when the verify token matches.
export const verifyWhatsappWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const expected = (process.env.WHATSAPP_VERIFY_TOKEN || "").trim();

  if (mode === "subscribe" && token && expected && token === expected) {
    return res.status(200).send(challenge);
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

export const handleWhatsappWebhook = async (req, res) => {
  try {
    const raw = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : JSON.stringify(req.body || {});

    // Authenticity first (enforced only once WHATSAPP_APP_SECRET is set —
    // until then Meta cannot sign and we warn loudly instead of blocking).
    const signature = req.headers["x-hub-signature-256"];
    const appSecret = (process.env.WHATSAPP_APP_SECRET || "").trim();
    if (appSecret) {
      if (!verifyMetaSignature(raw, signature, appSecret)) {
        console.error("[whatsapp-inbound] invalid Meta signature");
        return res.status(401).json({ success: false, message: "Invalid signature" });
      }
    } else {
      console.warn(
        "[whatsapp-inbound] WHATSAPP_APP_SECRET unset — accepting unsigned webhook (set it in Meta App dashboard → .env)"
      );
    }

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return res.status(200).json({ success: true, message: "Ignored" });
    }

    const messages = parseIncomingMessages(payload);
    for (const msg of messages) {
      // Awaited in series: Meta retries whole deliveries, and per-message
      // dedupe makes replays safe. NEVER throws (see service).
      // eslint-disable-next-line no-await-in-loop
      await handleAdminMessage(msg);
    }

    // Always 200 (even on per-message failures) so Meta stops retrying.
    return res.status(200).json({ success: true, handled: messages.length });
  } catch (error) {
    console.error("[whatsapp-inbound] webhook error:", error?.message || error);
    return res.status(200).json({ success: false });
  }
};
