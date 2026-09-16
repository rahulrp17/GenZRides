import express from "express";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getVapidPublicKey,
  savePushSubscription,
  removePushSubscription,
} from "../controllers/notification.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { cacheMiddleware } from "../middleware/cache.middleware.js";
import { validateParams } from "../middleware/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";

const router = express.Router();

router.use(authenticate);

// Browser push (Web Push). Registered before `/:id` routes so the static
// paths are never captured as an id param.
// Vapid key is identical for every user → cached 1h (changes only on key rotation).
router.get("/vapid-public-key", cacheMiddleware("push:vapid-public-key", 3600), getVapidPublicKey);
router.post("/push-subscriptions", savePushSubscription);
router.delete("/push-subscriptions", removePushSubscription);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", validateParams(idParamSchema), markAsRead);
router.delete("/:id", validateParams(idParamSchema), deleteNotification);

export default router;
