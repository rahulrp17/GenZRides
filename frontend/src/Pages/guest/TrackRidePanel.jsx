import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Search,
  CheckCircle2,
  Phone,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const readLs = (key) => {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
};

/**
 * Track Ride step of the guest booking form. It has NO own <form> element:
 * it lives inside the booking form, so malformed nested forms (and their
 * submit events) are avoided entirely. Validation happens here, then the
 * guest is sent to the dedicated tracking page (/booking/my-booking).
 */
const TrackRidePanel = () => {
  const navigate = useNavigate();
  const [ref, setRef] = useState(readLs("guestBookingRef"));
  const [phone, setPhone] = useState(readLs("guestBookingPhone"));

  const handleTrack = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const cleanRef = ref.trim().replace(/^#/, "");
    const cleanPhone = phone.trim();

    if (cleanRef.length < 6) {
      toast.error("Enter the booking reference from your confirmation.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error("Enter the 10-digit mobile number you booked with.");
      return;
    }

    try {
      localStorage.setItem("guestBookingRef", cleanRef);
      localStorage.setItem("guestBookingPhone", cleanPhone);
    } catch {
      // ignore — the tracking page still accepts manual entry
    }

    navigate("/booking/my-booking", { state: { ref: cleanRef, phone: cleanPhone } });
  };

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <Search size={16} className="text-emerald-400" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">
            Track your existing booking
          </p>
          <p className="text-xs text-gray-400">
            Enter your reference + phone — we'll open live status for you.
          </p>
        </div>
      </div>

      <div className="grid  hide gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-400" /> Booking ID
            </label>
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value.slice(0, 24))}
              onKeyDown={(e) => e.key === "Enter" && handleTrack(e)}
              placeholder="e.g. 0D81F495 (from #ref)"
              autoComplete="off"
              className="w-full mt-1.5 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition text-[15px] font-mono"
            />
          </div>
          <div className="min-w-0">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
              <Phone size={14} className="text-green-400" /> Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              onKeyDown={(e) => e.key === "Enter" && handleTrack(e)}
              placeholder="10-digit number you booked with"
              autoComplete="off"
              className="w-full mt-1.5 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition text-[15px]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleTrack}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-6 py-3.5 rounded-2xl hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
        >
          Track my ride <ArrowRight size={18} />
        </button>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-gray-500 mt-4 leading-relaxed">
        <ShieldCheck size={13} className="text-green-500 shrink-0 mt-0.5" />
        Fetching live from our server — ref + phone are the only keys, so only
        you can view or cancel this ride.
      </p>
    </div>
  );
};

export default TrackRidePanel;