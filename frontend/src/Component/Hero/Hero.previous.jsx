import React, { useEffect, useRef, useState } from "react";
import { motion as Motion, useInView, animate } from "framer-motion";
import { ArrowRight, ShieldCheck, Star, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import GuestBookingForm from "../../Pages/guest/GuestBookingForm";
import {about2} from "../../assets/images";

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

const Hero = () => {
  const scrollToBooking = () => {
    document.getElementById("book-ride")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-black lg:min-h-screen lg:flex lg:items-center">
      {/* Cinematic background */}
      <div className="absolute inset-0">
        <img
          src={about2}
          alt="Premium cab journey on an open road"
          className="w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
          loading="eager"
          width={1920}
          height={1080}
          sizes="100vw"
          style={{ aspectRatio: '1920 / 1080' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="landing-drift absolute top-1/4 -left-24 w-96 h-96 bg-green-500/20 blur-[130px] rounded-full" />
        <div className="landing-drift-slow absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/20 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-16 lg:items-center">

        {/* LEFT — headline — full viewport on mobile */}
        <div className=" flex flex-col justify-center pt-20 pb-8 lg:min-h-0 lg:pt-32 lg:pb-24">
          <Motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-lg border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-[0.2em]">
              <ShieldCheck size={14} />
              Trusted Cab Booking Service
            </span>
          </Motion.div>

          <Motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-editorial mt-6 text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-white"
          >
            Every Journey Deserves a{" "}
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              Better Ride.
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
            className="flex gap-4 mt-8  flex-wrap"
          >
            <Motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={scrollToBooking}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold flex items-center gap-2 hover:shadow-[0_0_35px_rgba(34,197,94,0.55)] transition-all"
            >
              Book Ride
              <ArrowRight size={20} />
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

          {/* Trust statistics */}
          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-3 gap-6 sm:gap-8 mt-12 max-w-lg"
          >
            <div>
              <p className="font-display text-2xl sm:text-4xl font-bold text-white">
                <Counter to={50} suffix="K+" />
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Happy Riders</p>
            </div>
            <div className="border-l border-white/10 pl-6">
              <p className="font-display text-2xl sm:text-4xl font-bold text-white">24×7</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Live Support</p>
            </div>
            <div className="border-l border-white/10 pl-6">
              <p className="font-display text-2xl sm:text-4xl font-bold text-white flex items-center gap-1.5">
                <Counter to={4.9} decimals={1} />
                <Star size={20} className="text-green-400" fill="currentColor" />
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Customer Rating</p>
            </div>
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
          <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-[30px] p-4 sm:p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between px-2 pb-4">
              <div>
                <p className="font-display text-lg font-bold text-white">Instant Booking</p>
                <p className="text-xs text-gray-400 mt-0.5">One-way &amp; round-trip cabs</p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-400 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <GuestBookingForm />
          </div>
        </Motion.div>
      </div>

      {/* Scroll cue */}
      <Motion.button
        onClick={scrollToBooking}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-gray-400 hover:text-green-400 transition-colors"
        aria-label="Scroll to booking"
      >
        <ChevronDown size={28} />
      </Motion.button>
    </section>
  );
};

export default Hero;
