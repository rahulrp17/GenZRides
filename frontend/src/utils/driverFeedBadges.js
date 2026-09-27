import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../Context/SocketContext";
import { bookingAPI } from "../services/endpoints";

// Driver-side mirror of the admin "seen badges + fresh flash" system
// (see Pages/admin/bookingUtils.js). Each request feed tracks the booking
// ids its driver has already seen in localStorage; the sidebar badge shows
// the unseen delta, and newly arrived cards flash for a few seconds.

const LS_PREFIX = "seenDriverFeed:";
const MAX_STORED = 300;
const SEEN_EVENT = "driver-feed-seen";

const seenKey = (key) => `${LS_PREFIX}${key}`;

export const getSeenIds = (key) => {
  try {
    const raw = JSON.parse(localStorage.getItem(seenKey(key)) || "[]");
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
};

const notifySeenChanged = () => {
  try {
    window.dispatchEvent(new Event(SEEN_EVENT));
  } catch {
    // non-DOM context — badges refresh on the next poll
  }
};

export const markFeedSeen = (key, ids) => {
  try {
    const seen = getSeenIds(key);
    let changed = false;
    (Array.isArray(ids) ? ids : []).forEach((id) => {
      if (id && !seen.has(id)) {
        seen.add(id);
        changed = true;
      }
    });
    if (!changed) return;
    const trimmed = [...seen].slice(-MAX_STORED);
    localStorage.setItem(seenKey(key), JSON.stringify(trimmed));
    notifySeenChanged();
  } catch {
    // private mode — badges simply never clear
  }
};

// Call inside a feed page with its current ids; viewing marks them seen,
// including arrivals that stream in while the page is open.
export const useMarkFeedSeen = (key, ids) => {
  const idKey = Array.isArray(ids) ? ids.join("|") : "";
  useEffect(() => {
    if (Array.isArray(ids) && ids.length > 0) markFeedSeen(key, ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, idKey]);
};

export const unseenCount = (list, key) => {
  const seen = getSeenIds(key);
  return (Array.isArray(list) ? list : []).filter((b) => {
    const id = typeof b === "string" ? b : b?._id;
    return id && !seen.has(String(id));
  }).length;
};

// Live unseen counts for the two request feeds. Uses the SAME react-query
// keys as the feed pages, so layout + page share one cache (no extra
// fetches) and badges stay correct while browsing.
export const useDriverFeedBadges = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [, setSeenVersion] = useState(0);

  useEffect(() => {
    const bump = () => setSeenVersion((v) => v + 1);
    try {
      window.addEventListener(SEEN_EVENT, bump);
    } catch {
      // ignore
    }
    return () => {
      try {
        window.removeEventListener(SEEN_EVENT, bump);
      } catch {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["driverInstantBookings"] });
      queryClient.invalidateQueries({ queryKey: ["driverCustomerRequests"] });
    };
    const events = [
      "ride-request",
      "booking-updated",
      "ride-status-updated",
      "instant-booking-pending",
      "admin-counts-updated",
    ];
    events.forEach((e) => socket.on(e, refresh));
    return () => events.forEach((e) => socket.off(e, refresh));
  }, [socket, queryClient]);

  const instant = useQuery({
    queryKey: ["driverInstantBookings"],
    queryFn: async () => {
      const { data } = await bookingAPI.getAvailable({ scope: "instant" });
      return data;
    },
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });

  const customer = useQuery({
    queryKey: ["driverCustomerRequests"],
    queryFn: async () => {
      const { data } = await bookingAPI.getAvailable({ scope: "customer" });
      return data;
    },
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });

  return {
    driverInstantBookings: unseenCount(
      instant.data?.bookings,
      "driverInstantBookings"
    ),
    driverCustomerRequests: unseenCount(
      customer.data?.bookings,
      "driverCustomerRequests"
    ),
  };
};

// Tracks ids that arrive AFTER the first real load so the UI can flash
// them for a few seconds. An empty first paint (loading skeleton) is never
// a baseline — otherwise every visit flashes the whole feed.
export const useFreshIds = (ids, ttlMs = 3000) => {
  const list = Array.isArray(ids) ? ids : [];
  const key = list.join("|");
  const knownRef = useRef(null);
  const [fresh, setFresh] = useState(() => new Set());
  const timersRef = useRef([]);

  useEffect(() => {
    if (knownRef.current === null) {
      if (list.length === 0) return;
      knownRef.current = new Set(list);
      return;
    }
    const added = list.filter((id) => id && !knownRef.current.has(id));
    if (added.length === 0) return;
    added.forEach((id) => knownRef.current.add(id));
    setFresh((prev) => {
      const next = new Set(prev);
      added.forEach((id) => next.add(id));
      return next;
    });
    const t = setTimeout(() => {
      setFresh((prev) => {
        const next = new Set(prev);
        added.forEach((id) => next.delete(id));
        return next;
      });
    }, ttlMs);
    timersRef.current.push(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
    },
    []
  );

  return (id) => fresh.has(id);
};
