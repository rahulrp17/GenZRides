import { useEffect } from "react";
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
