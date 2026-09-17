import React, { useEffect, useRef, useState } from "react";
import { motion as Motion, useInView, animate } from "framer-motion";
import { ArrowRight, ShieldCheck, Star, ChevronDown, Sparkles, Plane, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import GuestBookingForm from "../../Pages/guest/GuestBookingForm";
import { about2 } from "../../assets/images";

const Counter = ({ to, decimals = 0, suffix = "", prefix = "", duration = 2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const ROUTE_TICKER = [
  "Chennai → Bangalore",
  "Trichy → Chennai",
  "Madurai → Rameshwaram",
  "Coimbatore → Salem",
  "Chennai → Madurai",
  "Madurai → Trichy",
];

const Hero = () => {
  const scrollToBooking = () => {
    document.getElementById("book-ride")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-black lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
      {/* Cinematic background — slow ken-burns + atmosphere */}
      <div className="absolute inset-0">
        <Motion.img
          src={about2}
          alt="Premium cab journey on an open road"
          className="w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
          loading="eager"
          width={1920}
          height={1080}
          sizes="100vw"
          style={{ aspectRatio: "1920 / 1080" }}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      {/* Ambient glow mesh */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="landing-drift absolute top-1/4 -left-24 w-96 h-96 bg-green-500/20 blur-[130px] rounded-full" />
        <div className="landing-drift-slow absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/20 blur-[130px] rounded-full" />
        <div className="landing-drift absolute top-10 right-1/4 w-72 h-72 bg-emerald-400/10 blur-[110px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-16 lg:items-center pt-24 pb-10 lg:pt-32 lg:pb-16">

        {/* LEFT — headline */}
        <div className="flex flex-col justify-center">
          <Motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-wrap items-center gap-2.5"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-lg border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(34,197,94,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              Trusted Cab Booking Service
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-lg border border-white/15 text-xs font-semibold text-amber-300">
              <Star size={12} className="text-amber-400" fill="currentColor" />
              4.9 rated
            </span>
          </Motion.div>

          <Motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-editorial mt-6 text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl font-bold text-white tracking-tight"
          >
            Every Journey Deserves a{" "}
            <span className="relative inline-block italic text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-400 to-teal-300">
              Better Ride.
              <Motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-green-500/80 to-transparent"
              />
            </span>
          </Motion.h1>

          <Motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl"
          >
            Chauffeured city rides, airport transfers and outstation escapes
            with verified drivers, transparent fares and 24/7 human support —
            all in one premium booking experience.
          </Motion.p>

          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex gap-4 mt-8 flex-wrap"
          >
            <Motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={scrollToBooking}
              className="group px-8 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold flex items-center gap-2 shadow-[0_10px_40px_rgba(34,197,94,0.35)] hover:shadow-[0_0_35px_rgba(34,197,94,0.55)] transition-all"
            >
              Book Ride
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Motion.button>

            <Link to="/tariff">
              <Motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-4 rounded-full bg-white/5 backdrop-blur-lg border border-white/15 text-white font-semibold hover:border-green-500/50 hover:text-green-300 transition-all"
              >
                View Tariff
              </Motion.button>
            </Link>
          </Motion.div>

          {/* Trust statistics — glass cards */}
          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-3 gap-3 sm:gap-4 mt-10 max-w-lg"
          >
            <div className="rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 px-4 py-3.5 hover:border-green-500/30 transition-colors">
              <p className="font-display text-2xl sm:text-3xl font-bold text-white">
                <Counter to={50} suffix="K+" />
              </p>
              <p className="text-gray-400 text-[11px] sm:text-xs mt-1 uppercase tracking-wider">Happy Riders</p>
            </div>
            <div className="rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 px-4 py-3.5 hover:border-green-500/30 transition-colors">
              <p className="font-display text-2xl sm:text-3xl font-bold text-white">24×7</p>
              <p className="text-gray-400 text-[11px] sm:text-xs mt-1 uppercase tracking-wider">Live Support</p>
            </div>
            <div className="rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 px-4 py-3.5 hover:border-green-500/30 transition-colors">
              <p className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center gap-1.5">
                <Counter to={4.9} decimals={1} />
                <Star size={18} className="text-amber-400" fill="currentColor" />
              </p>
              <p className="text-gray-400 text-[11px] sm:text-xs mt-1 uppercase tracking-wider">Avg Rating</p>
            </div>
          </Motion.div>

          {/* Guarantee chips */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="flex flex-wrap gap-2 mt-5"
          >
            {[
              { icon: ShieldCheck, label: "Verified chauffeurs" },
              { icon: BadgeCheck, label: "No surge pricing" },
              { icon: Sparkles, label: "Free cancellation" },
            ].map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-300 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5"
              >
                <c.icon size={12} className="text-green-400" />
                {c.label}
              </span>
            ))}
          </Motion.div>
        </div>

        {/* RIGHT — floating glass booking widget (guest flow, no login required) */}
        <Motion.div
          id="book-ride"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="relative scroll-mt-28 pb-12 lg:pb-0"
        >
          <div aria-hidden className="absolute -inset-4 bg-gradient-to-br from-green-500/25 via-transparent to-blue-500/20 blur-2xl rounded-[40px]" />
          <div className="relative rounded-[30px] bg-gradient-to-b from-white/15 to-white/5 p-[1.5px] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            <div className="bg-black/60 backdrop-blur-xl rounded-[28.5px] p-4 sm:p-6">
              <div className="flex items-center justify-between px-2 pb-4">
                <div>
                  <p className="font-display text-lg font-bold text-white">Instant Booking</p>
                  <p className="text-xs text-gray-400 mt-0.5">One-way &amp; round-trip cabs</p>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-400 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                  </span>
                  LIVE
                </span>
              </div>
              <GuestBookingForm />
            </div>
          </div>

          {/* Floating perk cards */}
          <Motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:flex absolute -left-10 top-16 items-center gap-2.5 bg-black/70 backdrop-blur-xl border border-white/15 rounded-2xl px-4 py-3 shadow-2xl"
          >
            <span className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Plane size={16} className="text-blue-400" />
            </span>
            <span>
              <span className="block text-xs font-bold text-white">Flight-tracked pickups</span>
              <span className="block text-[11px] text-gray-400">45-min free airport wait</span>
            </span>
          </Motion.div>
          <Motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="hidden md:flex absolute -right-6 bottom-20 items-center gap-2.5 bg-black/70 backdrop-blur-xl border border-white/15 rounded-2xl px-4 py-3 shadow-2xl"
          >
            <span className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <ShieldCheck size={16} className="text-green-400" />
            </span>
            <span>
              <span className="block text-xs font-bold text-white">Verified drivers</span>
              <span className="block text-[11px] text-gray-400">GPS-tracked every trip</span>
            </span>
          </Motion.div>
        </Motion.div>
      </div>

      {/* Route ticker */}
      <div className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        <div className="hero-marquee flex w-max items-center gap-8 py-3.5 pr-8">
          {[...ROUTE_TICKER, ...ROUTE_TICKER].map((route, i) => (
            <span key={i} className="flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 whitespace-nowrap">
              {route}
              <span className="text-green-500">✦</span>
            </span>
          ))}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent" />
      </div>

      {/* Scroll cue */}
      <Motion.button
        onClick={scrollToBooking}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 text-gray-400 hover:text-green-400 transition-colors hidden lg:block"
        aria-label="Scroll to booking"
      >
        <ChevronDown size={28} />
      </Motion.button>
    </section>
  );
};

export default Hero;
