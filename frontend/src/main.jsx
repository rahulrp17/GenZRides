import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppProvider } from "./Context/Context";
import { AuthProvider } from "./Context/AuthContext";
import { SocketProvider } from "./Context/SocketContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Never auto-retry 4xx (400/401/403/404/429): each retry burns rate-limit
// budget and turns one user action into multiple API hits.
const shouldRetry = (failureCount, error) => {
  const status = error?.response?.status;
  if (status && status >= 400 && status < 500) return false;
  return failureCount < 1;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
    mutations: { retry: false },
  },
});

// Service worker for background Web Push (booking/status alerts when the
// tab is hidden or closed). Registration is silent — absence only means
// background push is unavailable; Socket.IO + in-app alerts still work.
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <AuthProvider>
        <SocketProvider>
          <App />
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 3500,
              style: {
                background: "rgba(10, 10, 12, 0.92)",
                color: "#f4f4f5",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "16px",
                backdropFilter: "blur(12px)",
                fontSize: "14px",
                maxWidth: "min(92vw, 420px)",
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#fff" },
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </AppProvider>
  </QueryClientProvider>
);
