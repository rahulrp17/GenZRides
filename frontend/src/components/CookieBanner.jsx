import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { getConsent, setConsent, initGA } from "../utils/analytics";

// GDPR-style cookie banner. Shows once until the visitor chooses.
// Accept => loads GA4 (if VITE_GA_MEASUREMENT_ID is set). Decline => no tracking.
const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
    if (getConsent() === "accepted") initGA();
  }, []);

  if (!visible) return null;

  const choose = (accepted) => {
    setConsent(accepted);
    if (accepted) initGA();
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[60] px-3 pb-3 sm:px-6 sm:pb-5"
    >
      <div className="mx-auto max-w-3xl bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
            <Cookie size={18} className="text-green-400" />
          </span>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            We use cookies to improve your booking experience and measure site
            traffic. Read our{" "}
            <Link to="/info/privacy" className="text-green-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2 shrink-0 sm:ml-auto">
          <button
            onClick={() => choose(false)}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-white/5 border border-white/15 text-white text-sm font-semibold hover:border-white/30 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => choose(true)}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
