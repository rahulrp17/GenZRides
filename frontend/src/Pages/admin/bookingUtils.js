import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../../Context/SocketContext";
import { adminAPI, vehicleAPI } from "../../services/endpoints";

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const customerName = (b) =>
  b.customer?.name || b.guestName || "Guest";

export const customerPhone = (b) =>
  b.customer?.phone || b.guestPhone || "";

// Live sidebar badge counts for the two request queues. Refetches on every
// booking-lifecycle socket event so badges never go stale.
export const useAdminCounts = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const query = useQuery({
    queryKey: ["adminCounts"],
    queryFn: async () => {
      const { data } = await adminAPI.getCounts();
      return data.counts || { pendingCustomerRequests: 0, pendingInstantRequests: 0 };
    },
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!socket) return;
    const refresh = () =>
      queryClient.invalidateQueries({ queryKey: ["adminCounts"] });
    const events = [
      "admin-counts-updated",
      "new-booking",
      "booking-created",
      "booking-updated",
      "ride-status-updated",
      "visitor-created",
      "visitor-updated",
      "instant-booking-pending",
    ];
    events.forEach((e) => socket.on(e, refresh));
    return () => events.forEach((e) => socket.off(e, refresh));
  }, [socket, queryClient]);

  return query;
};

// Live count of incomplete visitor bookings (abandoned holds: the guest
// took no further action inside the 10-minute window, so the sweep marked
// them Expired). Uses the existing visitors list endpoint — page 1,
// limit 1 — and reads only its `total`, so no new API is needed.
export const useIncompleteVisitorCount = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const query = useQuery({
    queryKey: ["incompleteVisitorCount"],
    queryFn: async () => {
      const { data } = await adminAPI.getVisitors({
        page: 1,
        limit: 1,
        status: "Expired",
      });
      return data.total || 0;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!socket) return;
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["incompleteVisitorCount"] });
      queryClient.invalidateQueries({ queryKey: ["adminVisitors"] });
    };
    const events = [
      "visitor-created",
      "visitor-updated",
      "instant-booking-pending",
      "admin-counts-updated",
    ];
    events.forEach((e) => socket.on(e, refresh));
    return () => events.forEach((e) => socket.off(e, refresh));
  }, [socket, queryClient]);

  return query;
};

// "New arrivals" badges: each queue badge shows liveTotal − seenTotal,
// so visiting a page clears its badge (same for request queues and the
// visitors feed). Seen markers live in localStorage per queue key.
const seenKey = (key) => `seenBadge:${key}`;

export const getSeen = (key) => {
  try {
    return Number(localStorage.getItem(seenKey(key)) || 0);
  } catch {
    return 0;
  }
};

export const markSeen = (key, total) => {
  try {
    localStorage.setItem(seenKey(key), String(Number(total) || 0));
  } catch {
    // private mode — badge simply won't clear
  }
};

// Call inside a queue page with its live total; marks everything seen,
// including arrivals that stream in while the page is open.
export const useMarkSeen = (key, total) => {
  useEffect(() => {
    if (typeof total === "number") markSeen(key, total);
  }, [key, total]);
};

const displayDelta = (live, key) => Math.max(0, Number(live || 0) - getSeen(key));

// Merged sidebar badge counts (deltas, not totals).
export const useBadgeCounts = () => {
  const { data: counts } = useAdminCounts();
  const { data: incompleteVisitors } = useIncompleteVisitorCount();
  return {
    pendingCustomerRequests: displayDelta(counts?.pendingCustomerRequests, "pendingCustomerRequests"),
    pendingInstantRequests: displayDelta(counts?.pendingInstantRequests, "pendingInstantRequests"),
    incompleteVisitors: displayDelta(incompleteVisitors, "incompleteVisitors"),
  };
};

// Tracks ids that arrive AFTER the first load so the UI can flash them
// for a few seconds. Returns isFresh(id); entries auto-expire.
export const useFreshIds = (ids, ttlMs = 3000) => {
  const list = Array.isArray(ids) ? ids : [];
  const key = list.join("|");
  const knownRef = useRef(null);
  const [fresh, setFresh] = useState(() => new Set());
  const timersRef = useRef([]);

  useEffect(() => {
    if (knownRef.current === null) {
      // First load seeds the baseline — nothing flashes on entry.
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

export const useVehicles = () => {
  const { data } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await vehicleAPI.getAll();
      return data;
    },
    staleTime: 300_000,
  });
  return data?.vehicles || [];
};

export const useApprovedDrivers = () => {
  const { data } = useQuery({
    queryKey: ["approvedDrivers"],
    queryFn: async () => {
      const { data } = await adminAPI.getApprovedDrivers();
      return data;
    },
    staleTime: 30_000,
  });
  return data?.drivers || data || [];
};
