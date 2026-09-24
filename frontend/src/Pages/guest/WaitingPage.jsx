import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Clock3,
  CheckCircle2,
  ArrowRight,
  Home,
  Phone,
  MapPin,
  Navigation,
  CalendarDays,
  CarFront,
  Repeat,
  Route,
  Timer,
  Wallet,
  User,
  Mail,
} from "lucide-react";
import SEO from "../../components/SEO";
import Navbar from "../../Component/Navbar/Navbar";
import Footer from "../../Component/Footer/Footer";
import PageHero from "../../Component/Landing/PageHero";
import { hero2 } from "../../assets/images";
import { Reveal } from "../../Component/Landing/Reveal";
import { formatTripDuration } from "../../utils/formatDuration";
import { BookingStatusBadge } from "../../utils/bookingStatus";
import { guestAPI } from "../../services/endpoints";

const LIVE_POLL_MS = 10_000;

const BANNER_TONES = {
  amber: "border-amber-500/25 shadow-[0_0_50px_rgba(245,158,11,0.12)]",
  red: "border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.12)]",
  green: "border-emerald-500/25 shadow-[0_0_50px_rgba(16,185,129,0.12)]",
  blue: "border-sky-500/30 shadow-[0_0_50px_rgba(56,189,248,0.12)]",
};

const BANNER_DOT = {
  amber: "bg-amber-500/15 border-amber-500/40 text-amber-400",
  red: "bg-rose-500/15 border-rose-500/40 text-rose-400",
  green: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
  blue: "bg-sky-500/15 border-sky-500/40 text-sky-400",
};

const readJSON = (raw) => {
  try {
    const val = JSON.parse(raw);
    return val && typeof val === "object" ? val : null;
  } catch {
    return null;
  }
};

const fmtWhen = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const WaitingPage = () => {
  const location = useLocation();

  let storedRef = null;
  let storedName = "";
  let storedBooking = null;
  try {
    storedRef = JSON.parse(sessionStorage.getItem("guestBookingDone") || "null");
    storedName = sessionStorage.getItem("guestBookingName") || "";
    storedBooking = readJSON(sessionStorage.getItem("guestBookingSummary"));
  } catch {
    // ignore
  }

  const ref = location.state?.ref || storedRef;
  const name = location.state?.name || storedName;
  const note = (location.state?.note || location.state?.booking?.note || storedBooking?.note || "").trim();
  const booking = location.state?.booking || storedBooking || null;

  // Live status: guests have no socket session, so the approval/driver
  // state is polled from the backend lookup (ref + phone prove ownership).
  let storedPhone = "";
  try {
    storedPhone = localStorage.getItem("guestBookingPhone") || "";
  } catch {
    // ignore — page stays static
  }
  const lookupRef = ref ? String(ref).slice(-8).toUpperCase() : null;
  const [live, setLive] = useState(null);
  const terminal = ["Completed", "Cancelled"].includes(live?.bookingStatus);

  useEffect(() => {
    if (!lookupRef || !storedPhone || terminal) return;
    let stop = false;
    const fetchStatus = async () => {
      try {
        const { data } = await guestAPI.lookup({
          ref: lookupRef,
          phone: storedPhone,
        });
        if (!stop && data.success) setLive(data.booking);
      } catch {
        // keep the last known state
      }
    };
    fetchStatus();
    const t = setInterval(fetchStatus, LIVE_POLL_MS);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [lookupRef, storedPhone, terminal]);

  const statusBanner = (() => {
    if (!live) return null;
    const approval = live.approvalStatus || "Approved";
    const st = live.bookingStatus;
    if (st === "Cancelled")
      return {
        tone: "red",
        title: "Booking cancelled",
        sub: live.cancelReason
          ? `Reason: ${live.cancelReason}`
          : "This booking was cancelled.",
      };
    if (approval === "Rejected")
      return {
        tone: "red",
        title: "Booking not approved",
        sub: "Sorry, this request was not approved. Call us and we'll arrange your ride right away.",
      };
    if (st === "Completed")
      return {
        tone: "green",
        title: "Trip completed",
        sub: "Thanks for riding with GenZRides!",
      };
    if (["Started", "Reached"].includes(st))
      return {
        tone: "green",
        title: "Trip in progress",
        sub: "Have a safe journey!",
      };
    if (live.driver && ["Accepted", "On The Way", "Arrived"].includes(st)) {
      const bits = [
        live.driver.vehicleBrand,
        live.driver.vehicleModel,
        live.driver.vehicleNumber,
      ].filter(Boolean);
      return {
        tone: "green",
        title: `Driver assigned — ${live.driver.name || "your driver"}`,
        sub: `${live.driver.phone || ""}${bits.length ? ` · ${bits.join(" ")}` : ""}`.trim(),
      };
    }
    if (approval === "Pending Approval")
      return {
        tone: "amber",
        title: "Waiting for approval",
        sub: "Our team is reviewing your request — this usually takes a few minutes.",
      };
    return {
      tone: "blue",
      title: "Approved — finding your driver",
      sub: "Your request is approved. A driver will accept it shortly.",
    };
  })();

  try {
    if (location.state?.ref) {
      sessionStorage.setItem("guestBookingDone", JSON.stringify(location.state.ref));
      sessionStorage.setItem("guestBookingName", location.state?.name || "");
      if (location.state?.booking) {
        sessionStorage.setItem("guestBookingSummary", JSON.stringify(location.state.booking));
      }
    }
  } catch {
    // ignore
  }

  const infoChips = [
    {
      icon: CalendarDays,
      color: "text-blue-400",
      bg: "bg-blue-500/15 border-blue-500/30",
      label: "Date & Time",
      value: booking?.pickupDateTime ? fmtWhen(booking.pickupDateTime) : "",
    },
    {
      icon: CarFront,
      color: "text-green-400",
      bg: "bg-green-500/15 border-green-500/30",
      label: "Vehicle",
      value: booking?.vehicleName || "",
    },
    {
      icon: booking?.tripType === "Round Trip" ? Repeat : ArrowRight,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15 border-emerald-500/30",
      label: "Trip",
      value: booking?.tripType
        ? `${booking.tripType}${booking.tripType === "Round Trip" && booking.days > 1 ? ` · ${booking.days} day${booking.days > 1 ? "s" : ""}` : ""}`
        : "",
    },
    {
      icon: Timer,
      color: "text-sky-400",
      bg: "bg-sky-500/15 border-sky-500/30",
      label: "Distance",
      value: booking?.distance
        ? `${Number(booking.distance).toFixed(1)} km${booking.duration != null ? ` · ${formatTripDuration(booking.duration)}` : ""}`
        : "",
    },
  ];

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO noindex title="Booking Received" description="Thanks for booking with GenZRides — your ride request is with our dispatch team." path="/booking/waiting" />
      <Navbar />
      <PageHero
        eyebrow="Booking Received"
        title="Waiting for Booking Confirmation"
        sub={name ? `Thanks ${name.split(" ")[0]} — your ride request is with our dispatch team.` : "Your ride request is with our dispatch team."}
        img={hero2}
      />

      <section className="relative py-14 md:py-20">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <Reveal className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-amber-500/25 p-6 sm:p-8 md:p-10 text-center shadow-[0_0_50px_rgba(245,158,11,0.12)]">
            <Motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mx-auto mb-5"
            >
              <Clock3 size={32} className="text-amber-400 sm:w-9 sm:h-9" />
            </Motion.div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Waiting for Booking Confirmation
            </h2>
            <p className="text-gray-400 mt-3 leading-relaxed text-sm sm:text-base">
              A driver will accept your ride shortly. You will receive a call on
              your registered phone number once confirmed.
            </p>
          </Reveal>

          {/* Booking details — premium trip card */}
           {statusBanner && (
            <Reveal
              delay={0.04}
              className={`mt-5 md:mt-6 bg-white/5 backdrop-blur-lg rounded-[30px] border p-5 sm:p-6 text-left ${BANNER_TONES[statusBanner.tone]}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${BANNER_DOT[statusBanner.tone]}`}
                >
                  {statusBanner.tone === "green" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Clock3 size={18} />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-base sm:text-lg font-bold text-white">
                      {statusBanner.title}
                    </p>
                    <BookingStatusBadge status={live.bookingStatus} size="sm" />
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5 break-words">
                    {statusBanner.sub}
                  </p>
                </div>
              </div>
            </Reveal>
          )}

           {booking && (
            <Reveal delay={0.08} className="mt-5 md:mt-6 bg-gradient-to-br from-emerald-500/10 via-white/5 to-transparent backdrop-blur-lg rounded-[30px] border border-emerald-500/20 p-6 sm:p-8 overflow-hidden">
              <div className="flex items-end justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white">Your booking details</h3>
                  <p className="text-sm text-gray-400 mt-1">Everything you need while the driver is assigned.</p>
                </div>
                {ref && (
                  <span className="inline-flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-full px-3.5 py-1.5 text-xs sm:text-sm">
                    <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                    <span className="text-gray-300">
                      Ref: <span className="font-mono font-semibold text-white">#{String(ref).slice(-8).toUpperCase()}</span>
                    </span>
                  </span>
                )}
              </div>

              {/* Route timeline */}
              <div className="relative pl-6 sm:pl-7 mt-6 space-y-5">
                <span aria-hidden className="absolute left-[10px] sm:left-[14px] top-2 bottom-2 w-px bg-gradient-to-b from-green-400/70 via-white/15 to-red-400/70" />
                <div className="relative">
                  <span aria-hidden className="absolute left-[-22px] sm:left-[-26px] top-1.5 w-[9px] h-[9px] rounded-full bg-green-400 ring-4 ring-green-400/20" />
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-1.5">
                    <MapPin size={12} className="text-green-400" /> Pickup
                  </p>
                  <p className="text-sm sm:text-base font-medium text-white break-words">{booking.pickupAddress}</p>
                </div>
                <div className="relative">
                  <span aria-hidden className="absolute left-[-22px] sm:left-[-26px] top-1.5 w-[9px] h-[9px] rounded-full bg-red-400 ring-4 ring-red-400/20" />
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-1.5">
                    <Navigation size={12} className="text-red-400" /> Drop
                  </p>
                  <p className="text-sm sm:text-base font-medium text-white break-words">{booking.dropAddress}</p>
                </div>
              </div>

              {/* Info chips */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {infoChips.map(
                  (c) =>
                    c.value && (
                      <div key={c.label} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 min-w-0 ${c.bg}`}>
                        <span className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                          <c.icon size={14} className={c.color} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">{c.label}</p>
                          <p className="text-[13px] text-white font-medium truncate">{c.value}</p>
                        </div>
                      </div>
                    )
                )}
              </div>

              {(booking.guestName || booking.guestPhone || booking.guestEmail) && (
                <div className="mt-6">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2.5">Contact for the driver</p>
                  <div className="flex flex-wrap gap-2.5">
                    {booking.guestName && (
                      <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-[13px] text-gray-200">
                        <User size={13} className="text-green-400 shrink-0" /> {booking.guestName}
                      </span>
                    )}
                    {booking.guestPhone && (
                      <a href={`tel:${booking.guestPhone}`} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-[13px] text-gray-200 hover:border-green-500/50 hover:text-green-300 transition">
                        <Phone size={13} className="text-green-400 shrink-0" /> {booking.guestPhone}
                      </a>
                    )}
                    {booking.guestEmail && (
                      <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-[13px] text-gray-200 min-w-0">
                        <Mail size={13} className="text-blue-400 shrink-0" /> <span className="truncate">{booking.guestEmail}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Fare */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10 pt-5">
                <div className="flex items-center gap-2 text-gray-300 min-w-0">
                  <Wallet size={16} className="text-emerald-400 shrink-0" />
                  <span className="text-sm">
                    Fare estimate · pay cash to the driver
                    <span className="hidden sm:inline text-gray-500"> — tolls &amp; permits at actuals</span>
                  </span>
                </div>
                <span className="font-display text-2xl sm:text-3xl font-bold text-emerald-300">₹{Number(booking.estimatedFare ?? 0).toLocaleString("en-IN")}</span>
              </div>

              {note && (
                <div className="mt-5 bg-black/25 border border-amber-500/25 rounded-2xl px-4 py-3 text-left">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-1.5">
                    <Route size={12} className="text-amber-400" /> Note for the driver
                  </p>
                  <p className="text-sm text-gray-200 mt-1 break-words">{note}</p>
                </div>
              )}
            </Reveal>
          )}

          {/* Actions */}
          <Reveal delay={0.14} className="mt-5 md:mt-6 bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-6 sm:p-8 text-center">
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {ref && (
                <Link to="/booking/my-booking">
                  <Motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/5 border border-emerald-500/40 text-emerald-300 font-semibold hover:border-emerald-400 hover:text-emerald-200 transition-all"
                  >
                    <Clock3 size={18} /> Track My Booking
                  </Motion.button>
                </Link>
              )}
              <Link to="/booking">
                <Motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(34,197,94,0.55)] transition-all"
                >
                  Book Another Ride <ArrowRight size={18} />
                </Motion.button>
              </Link>
              <Link to="/">
                <Motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/5 border border-white/15 text-white font-semibold hover:border-green-500/50 hover:text-green-300 transition-all"
                >
                  <Home size={18} /> Home
                </Motion.button>
              </Link>
            </div>

            <a href="tel:+91934830199" className="inline-flex items-center gap-1.5 mt-6 text-sm text-gray-400 hover:text-green-400 transition-colors">
              <Phone size={15} /> Need help? +91 93483 0199
            </a>
          </Reveal>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default WaitingPage;