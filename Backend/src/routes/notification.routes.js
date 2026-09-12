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
import { validateParams } from "../middleware/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";

const router = express.Router();

router.use(authenticate);

// Browser push (Web Push). Registered before `/:id` routes so the static
// paths are never captured as an id param.
router.get("/vapid-public-key", getVapidPublicKey);
router.post("/push-subscriptions", savePushSubscription);
router.delete("/push-subscriptions", removePushSubscription);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", validateParams(idParamSchema), markAsRead);
router.delete("/:id", validateParams(idParamSchema), deleteNotification);

export default router;
