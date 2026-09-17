import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "../hooks/useAuth";
import { useSocket } from "../Context/SocketContext";

// Recovers the app after long background periods (minimized tab/phone):
// revalidates the session, refetches all active queries immediately
// (React Query won't do it — refetchOnWindowFocus is off), and forces a
// fresh socket connection. Without this, returning users sit on stale
// data with a dead socket until they manually reload.
const BACKGROUND_THRESHOLD_MS = 2 * 60 * 1000;

const SessionResume = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const { reconnect } = useSocket();
  const hiddenAtRef = useRef(0);

  useEffect(() => {
    const resume = () => {
      // Logged out → nothing to recover.
      if (!localStorage.getItem("accessToken")) return;
      // Fire-and-forget: each leg retries on its own (query retry,
      // socket backoff). Never blocks the UI.
      refreshUser();
      queryClient.invalidateQueries();
      reconnect();
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }
      // Only a real background stint triggers recovery — normal tab
      // switches shouldn't refetch the world.
      if (Date.now() - hiddenAtRef.current >= BACKGROUND_THRESHOLD_MS) {
        hiddenAtRef.current = 0;
        resume();
      }
    };

    const onOnline = () => resume();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
    };
  }, [queryClient, refreshUser, reconnect]);

  return null;
};

export default SessionResume;
