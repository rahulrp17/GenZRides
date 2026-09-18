import { toast } from "react-hot-toast";
import { showBrowserNotification } from "./browserPush";
import { playBookingAlert } from "./alertSound";

/* Priority dispatch alerts (driver ride-request, admin new-booking).
   Fires on EVERY channel at once so the event is unmissable regardless
   of tab state:
   - in-app toast when the tab is visible (longer duration than usual),
   - native browser notification whenever permission is granted
     (foreground AND background),
   - audible alert sound (throttled inside playBookingAlert).
   Non-priority events keep the old either/or behavior to avoid noise. */
export const bookingAlert = (title, message, url) => {
  playBookingAlert();
  if (typeof document !== "undefined" && !document.hidden) {
    toast(`${title}${message ? ` — ${message}` : ""}`, {
      duration: 6000,
    });
  }
  showBrowserNotification(title, message, url);
};
