import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSocket } from "../Context/SocketContext";
import useAuth from "../hooks/useAuth";
import { showBrowserNotification } from "../utils/browserPush";

const detailsUrlFor = (role, bookingId) => {
  if (!bookingId) return null;
  if (role === "driver") return `/driver/bookings/${bookingId}`;
  if (role === "admin") return `/admin/bookings/${bookingId}`;
  return `/customer/bookings/${bookingId}`;
};

const bookingIdOf = (payload) => {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  const id = payload.booking?._id || payload.booking || payload._id;
  return id ? String(id) : null;
};

const routeSummary = (booking) => {
  if (!booking || typeof booking !== "object") return "";
  const from = booking.pickup?.address || "";
  const to = booking.drop?.address || "";
  if (from && to) return `${from} → ${to}`;
  return from || to || "";
};

// App-wide listener: turns real booking-related Socket.IO events into
// user-visible feedback. Foreground tab → in-app toast; hidden tab →
// native browser notification (via the service worker when registered).
// Mounted once per dashboard layout; no UI of its own. Nothing here is
// fabricated — every alert maps to a server-emitted event.
const PushListener = () => {
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;
    const role = user.role;

    const alert = (title, message, bookingId) => {
      if (
        typeof document !== "undefined" &&
        document.hidden
      ) {
        showBrowserNotification(
          title,
          message,
          detailsUrlFor(role, bookingId)
        );
      } else {
        toast(`${title}${message ? ` — ${message}` : ""}`, {
          duration: 4500,
        });
      }
    };

    const handleNotification = (n) => {
      if (!n) return;
      alert(
        n.title || "New notification",
        n.message || "",
        bookingIdOf(n)
      );
    };

    const handleBookingUpdated = (data) => {
      const status = data?.bookingStatus;
      if (!status) return;
      alert(
        `Booking ${status}`,
        `${routeSummary(data) || "Your ride"} is now: ${status}. Tap to view details.`,
        bookingIdOf(data)
      );
    };

    const handleRideStatusUpdated = (data) => {
      const status = data?.bookingStatus;
      if (!status) return;
      alert(
        `Ride ${status}`,
        `${routeSummary(data) || "Trip"} update: ${status}. Tap to view details.`,
        bookingIdOf(data)
      );
    };

    // Driver-only: a booking was dispatched to this driver.
    const handleRideRequest = (booking) => {
      if (role !== "driver" || !booking) return;
      const cab = booking.vehicleType?.name
        ? ` (${booking.vehicleType.name})`
        : "";
      const fare = booking.estimatedFare
        ? ` · ₹${booking.estimatedFare}`
        : "";
      alert(
        "New ride request",
        `${routeSummary(booking) || "A customer needs a ride"}${cab}${fare}. Tap to view.`,
        bookingIdOf(booking)
      );
    };

    // Admin-only: a new guest/customer booking entered the queue.
    const handleNewBooking = (booking) => {
      if (role !== "admin") return;
      alert(
        "New booking request",
        `${routeSummary(booking) || "A new booking"} needs a driver. Tap to review.`,
        bookingIdOf(booking)
      );
    };

    socket.on("notification", handleNotification);
    socket.on("booking-updated", handleBookingUpdated);
    socket.on("ride-status-updated", handleRideStatusUpdated);
    socket.on("ride-request", handleRideRequest);
    socket.on("new-booking", handleNewBooking);
    socket.on("booking-created", handleNewBooking);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("booking-updated", handleBookingUpdated);
      socket.off("ride-status-updated", handleRideStatusUpdated);
      socket.off("ride-request", handleRideRequest);
      socket.off("new-booking", handleNewBooking);
      socket.off("booking-created", handleNewBooking);
    };
  }, [socket, user]);

  return null;
};

export default PushListener;
