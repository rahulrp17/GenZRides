// Consent-gated Google Analytics 4.
// GA only loads when BOTH conditions hold:
//   1. VITE_GA_MEASUREMENT_ID is set (empty in dev/local by default)
//   2. the visitor accepted cookies in <CookieBanner /> (stored as
//      genzrides_cookie_consent=accepted). Decline/neither => zero tracking.
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const CONSENT_KEY = "genzrides_cookie_consent";

let initialized = false;

export const getConsent = () => {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
};

export const hasConsented = () => getConsent() === "accepted";

export const setConsent = (accepted) => {
  try {
    localStorage.setItem(CONSENT_KEY, accepted ? "accepted" : "declined");
  } catch {
    // private mode — consent simply won't persist
  }
};

export function initGA() {
  if (initialized || !GA_ID || !hasConsented()) return;
  if (typeof document === "undefined") return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
  initialized = true;
}

export function trackPageview(path) {
  if (!initialized || typeof window.gtag !== "function" || !GA_ID) return;
  window.gtag("config", GA_ID, { page_path: path });
}

export function trackEvent(name, params = {}) {
  if (!initialized || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
