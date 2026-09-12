// Browser push notifications for booking-related realtime events.
// Two channels, both driven only by real backend events:
//  1. Foreground/live tab  — Socket.IO events handled in PushListener
//     (in-app toast; native Notification when the tab is hidden).
//  2. Background/closed tab — Web Push via the service worker
//     (public/sw.js), fed by backend notifyUser → push.service.
// No fake notifications are ever created client-side.

export const isPushSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

export const isPushApiSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window;

export const getPushPermission = () => {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
};

export const requestPushPermission = async () => {
  if (!isPushSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

/* ================= Service worker ================= */

export const registerServiceWorker = async () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
};

export const getReadyRegistration = async () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
};

/* ================= Push subscription ================= */

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
};

export const getExistingSubscription = async () => {
  const reg = await getReadyRegistration();
  if (!reg?.pushManager) return null;
  try {
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
};

export const subscribeForPush = async (vapidPublicKey) => {
  if (!vapidPublicKey) throw new Error("Push is not configured.");
  const reg =
    (await getReadyRegistration()) || (await registerServiceWorker());
  if (!reg?.pushManager) {
    throw new Error("Push is not supported on this browser.");
  }
  const existing = await reg.pushManager
    .getSubscription()
    .catch(() => null);
  if (existing) return existing;
  return await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
};

export const unsubscribeFromPush = async () => {
  const sub = await getExistingSubscription();
  if (sub) {
    try {
      await sub.unsubscribe();
    } catch {
      // already gone — treat as unsubscribed
    }
  }
  return true;
};

/* ================= Show a local notification =================
   Used for live Socket.IO events while the app is open. Prefers the
   service worker's showNotification (visible when the tab is hidden);
   falls back to the page-level Notification API. */

export const showBrowserNotification = async (title, body, url) => {
  if (!isPushSupported() || Notification.permission !== "granted") {
    return null;
  }
  const text = title || "GenZRides";
  const content = body || "";

  try {
    const reg = await getReadyRegistration();
    if (reg?.showNotification) {
      await reg.showNotification(text, {
        body: content,
        icon: "/logo5.png",
        badge: "/logo5.png",
        tag: `genzrides-${Date.now()}`,
        renotify: true,
        data: { url: url || null },
      });
      return true;
    }
  } catch {
    // fall through to the page-level API
  }

  try {
    const notification = new Notification(text, {
      body: content,
      icon: "/logo5.png",
      tag: `genzrides-${Date.now()}`,
    });
    notification.onclick = () => {
      try {
        window.focus();
      } catch {
        // ignore focus errors
      }
      if (url) window.location.href = url;
      notification.close();
    };
    return notification;
  } catch {
    return null;
  }
};
