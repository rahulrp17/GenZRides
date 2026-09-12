import { useEffect, useRef } from "react";
import useAuth from "../hooks/useAuth";
import {
  isPushApiSupported,
  getPushPermission,
  getExistingSubscription,
  subscribeForPush,
  registerServiceWorker,
  getReadyRegistration,
} from "../utils/browserPush";
import { notificationAPI } from "../services/endpoints";

/**
 * Silent one-time push restore.
 * - Runs only when user is logged in (driver/customer/admin).
 * - If Notification permission is already "granted" and Push API is supported,
 *   ensures a PushSubscription exists locally AND on the server, without
 *   ever calling Notification.requestPermission() again.
 * - If permission is "default" or "denied", does nothing (no re-prompt).
 * - Handles browser-close case: service worker + subscription persist via
 *   PushSubscription collection, so web-push delivers even when socket offline.
 * - Verbose logging when VITE_DEBUG_PUSH=true or in DEV.
 */
const AutoPushSync = () => {
  const { user } = useAuth();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!user) {
      ranRef.current = false;
      return;
    }
    // Only once per login session
    if (ranRef.current) return;
    ranRef.current = true;

    let cancelled = false;

    const log = (...args) => {
      if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_PUSH === "true") {
        console.log("[AutoPushSync]", ...args);
      }
    };

    const sync = async () => {
      try {
        if (!isPushApiSupported()) {
          log("Push API not supported");
          return;
        }
        const perm = getPushPermission();
        if (perm !== "granted") {
          log(`permission=${perm}, skipping auto-sync (no re-prompt)`);
          return;
        }

        // Ensure SW is registered (main.jsx also does, but ensure ready)
        try {
          await registerServiceWorker();
        } catch {
          // ignore
        }

        const reg = await getReadyRegistration();
        if (!reg?.pushManager) {
          log("No pushManager after SW ready");
          return;
        }

        let sub = await getExistingSubscription();
        let publicKey = null;

        try {
          const { data } = await notificationAPI.getVapidKey();
          publicKey = data?.publicKey || null;
        } catch (err) {
          if (err?.response?.status === 503) {
            log("VAPID not configured (503), skipping subscribe");
            return;
          }
          log("getVapidKey failed", err?.message);
          return;
        }

        if (!publicKey) {
          log("No VAPID public key");
          return;
        }

        // If no local subscription but permission granted, create silently
        if (!sub) {
          log("No existing subscription, creating silently");
          try {
            sub = await subscribeForPush(publicKey);
          } catch (e) {
            log("subscribeForPush failed", e?.message);
            return;
          }
        } else {
          log("Found existing subscription", sub.endpoint.slice(0, 40) + "...");
        }

        if (cancelled) return;

        // Ensure backend has it (idempotent upsert by endpoint)
        try {
          const json = sub.toJSON();
          await notificationAPI.savePushSubscription({
            endpoint: json.endpoint,
            keys: json.keys,
            userAgent: navigator.userAgent,
          });
          log("Subscription synced to backend");
        } catch (e) {
          log("savePushSubscription failed", e?.message);
        }
      } catch (e) {
        log("AutoPushSync error", e?.message);
      }
    };

    // Delay slightly so AuthContext/socket already settled
    const t = setTimeout(sync, 1200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [user]);

  return null;
};

export default AutoPushSync;
