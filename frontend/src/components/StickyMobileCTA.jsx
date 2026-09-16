import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarCheck, Phone } from "lucide-react";

// Sticky mobile CTA bar (public marketing pages only — hidden on booking
// flow, auth and dashboards where a CTA would cover form actions).
const HIDDEN_PREFIXES = ["/booking", "/customer", "/driver", "/admin", "/login", "/signup", "/forgot", "/verify", "/new-password", "/reset"];

const StickyMobileCTA = () => {
  const { pathname } = useLocation();
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex gap-2 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <a
          href="tel:+91934830199"
          aria-label="Call GenZRides support"
          className="flex items-center justify-center w-12 rounded-xl bg-white/5 border border-white/15 text-green-400 shrink-0"
        >
          <Phone size={20} />
        </a>
        <Link
          to="/booking"
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold"
        >
          <CalendarCheck size={18} /> Book Your Cab
        </Link>
      </div>
    </div>
  );
};

export default StickyMobileCTA;
