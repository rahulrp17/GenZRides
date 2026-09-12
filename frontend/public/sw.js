/* GenZRides service worker: background Web Push + notification clicks.
   Shown for real booking/status pushes sent by the backend (never faked
   client-side). Served from the site root so it controls all pages. */
/* global clients */

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    try {
      data = { body: event.data ? event.data.text() : "" };
    } catch {
      data = {};
    }
  }

  const title = data.title || "GenZRides";
  const options = {
    body: data.body || "",
    icon: "/logo5.png",
    badge: "/logo5.png",
    tag: `genzrides-${data.bookingId || Date.now()}`,
    renotify: true,
    requireInteraction: false,
    data: {
      url: data.url || "/",
      bookingId: data.bookingId || null,
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    (event.notification &&
      event.notification.data &&
      event.notification.data.url) ||
    "/";

  event.waitUntil(
    (async () => {
      const windows = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windows) {
        try {
          if (
            client.url &&
            client.url.indexOf(self.location.origin) === 0
          ) {
            await client.focus();
            try {
              await client.navigate(url);
            } catch {
              // Same-tab navigation blocked — focused tab is enough.
            }
            return;
          }
        } catch {
          // ignore and try the next client
        }
      }

      try {
        await clients.openWindow(url);
      } catch {
        // ignore — user can open the app manually
      }
    })()
  );
});
