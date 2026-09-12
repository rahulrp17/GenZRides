import * as notificationService from "../services/notification.service.js";
import * as pushService from "../services/push.service.js";

/* ===========================================================
   GET VAPID PUBLIC KEY (browser push opt-in)
=========================================================== */

export const getVapidPublicKey = async (req, res) => {
  try {
    const publicKey = pushService.getVapidPublicKey();

    if (!publicKey) {
      return res.status(503).json({
        success: false,
        message: "Browser push is not configured.",
      });
    }

    res.status(200).json({
      success: true,
      publicKey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   SAVE PUSH SUBSCRIPTION (opt-in)
=========================================================== */

export const savePushSubscription = async (req, res) => {
  try {
    const { endpoint, keys, userAgent } = req.body || {};

    const subscription = await pushService.saveSubscription(
      req.user._id,
      { endpoint, keys, userAgent }
    );

    res.status(201).json({
      success: true,
      message: "Push subscription saved.",
      data: { id: subscription._id },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   REMOVE PUSH SUBSCRIPTION (opt-out)
=========================================================== */

export const removePushSubscription = async (req, res) => {
  try {
    const endpoint =
      req.body?.endpoint || req.query?.endpoint || null;

    await pushService.removeSubscription(
      req.user._id,
      endpoint
    );

    res.status(200).json({
      success: true,
      message: "Push subscription removed.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   GET MY NOTIFICATIONS
=========================================================== */

export const getNotifications = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const result =
      await notificationService.getNotifications(
        req.user._id,
        page,
        limit
      );

    res.status(200).json({
      success: true,
      count: result.notifications.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: result.notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   GET UNREAD COUNT
=========================================================== */

export const getUnreadCount = async (req, res) => {
  try {
    const count =
      await notificationService.getUnreadCount(
        req.user._id
      );

    res.status(200).json({
      success: true,
      unread: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   MARK AS READ
=========================================================== */

export const markAsRead = async (req, res) => {
  try {
    const notification =
      await notificationService.markAsRead(
        req.params.id,
        req.user._id
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   MARK ALL AS READ
=========================================================== */

export const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================================
   DELETE NOTIFICATION
=========================================================== */

export const deleteNotification = async (req, res) => {
  try {
    const notification =
      await notificationService.deleteNotification(
        req.params.id,
        req.user._id
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};