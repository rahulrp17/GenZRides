import React, { useCallback, useEffect, useState } from "react";
import { BellRing, BellOff, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  isPushSupported,
  isPushApiSupported,
  getPushPermission,
  requestPushPermission,
  registerServiceWorker,
  getExistingSubscription,
  subscribeForPush,
  unsubscribeFromPush,
} from "../utils/browserPush";
import { notificationAPI } from "../services/endpoints";

// Opt-in button for notification pages. Full lifecycle:
// permission → service-worker registration → Push API subscription →
// backend stores the subscription so booking/status pushes reach this
// browser even when the tab is hidden or closed. Toggling off removes
// both the local subscription and the server copy.
const PushToggle = () => {
  const [permission, setPermission] = useState(() => getPushPermission());
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await registerServiceWorker();
        const sub = await getExistingSubscription();
        if (mounted) setSubscribed(!!sub);
      } catch {
        // unsupported — button stays in permission-request mode
      } finally {
        if (mounted) setChecked(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleEnable = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await requestPushPermission();
      setPermission(result);
      if (result !== "granted") {
        if (result === "denied") {
          toast.error(
            "Notifications blocked — allow them in your browser settings"
          );
        }
        return;
      }

      await registerServiceWorker();

      // Server-issued VAPID key; 503 means browser push isn't configured —
      // Socket.IO + in-app notifications still work, so this is a warning.
      let publicKey = null;
      try {
        const { data } = await notificationAPI.getVapidKey();
        publicKey = data?.publicKey || null;
      } catch (err) {
        if (err?.response?.status === 503) {
          toast.success("Browser notifications enabled for this session");
          return;
        }
        throw err;
      }

      const sub = await subscribeForPush(publicKey);
      const json = sub.toJSON();
      await notificationAPI.savePushSubscription({
        endpoint: json.endpoint,
        keys: json.keys,
        userAgent: navigator.userAgent,
      });
      setSubscribed(true);
      toast.success("Push notifications enabled — even with the tab closed");
    } catch {
      toast.error("Could not enable push on this browser");
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const handleDisable = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const sub = await getExistingSubscription();
      const endpoint = sub?.endpoint || null;
      await unsubscribeFromPush();
      try {
        await notificationAPI.removePushSubscription({ endpoint });
      } catch {
        // server copy cleanup is best-effort
      }
      setSubscribed(false);
      toast.success("Push notifications turned off");
    } catch {
      toast.error("Could not turn off push");
    } finally {
      setBusy(false);
    }
  }, [busy]);

  if (!isPushSupported()) return null;

  if (busy || !checked) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 rounded-xl">
        <Loader2 size={14} className="animate-spin" />
        {busy ? "Working…" : "Checking push…"}
      </span>
    );
  }

  if (subscribed && permission === "granted") {
    return (
      <button
        onClick={handleDisable}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition"
        title="Push is on — click to turn off background alerts"
      >
        <BellRing size={14} /> Push on
      </button>
    );
  }

  // Push API unavailable (or denied): still allow session-level permission
  // so live-tab Socket.IO alerts can use the Notification API.
  if (!isPushApiSupported()) {
    if (permission === "granted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <BellRing size={14} /> Push on
        </span>
      );
    }
    return (
      <button
        onClick={handleEnable}
        disabled={permission === "denied"}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition disabled:opacity-50"
        title={
          permission === "denied"
            ? "Blocked in browser settings"
            : "Get booking alerts even when this tab is hidden"
        }
      >
        <BellOff size={14} /> Enable push
      </button>
    );
  }

  return (
    <button
      onClick={handleEnable}
      disabled={permission === "denied"}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition disabled:opacity-50"
      title={
        permission === "denied"
          ? "Blocked in browser settings"
          : "Get booking alerts even when this tab is hidden"
      }
    >
      <BellOff size={14} /> Enable push
    </button>
  );
};

export default PushToggle;
