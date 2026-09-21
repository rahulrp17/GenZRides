import React, { useEffect, useRef, useState } from "react";
import { motion as Motion, useInView, animate } from "framer-motion";
import { ArrowRight, Star, ChevronDown, Car } from "lucide-react";
import { Link } from "react-router-dom";
import GuestBookingForm from "../../Pages/guest/GuestBookingForm";
import { about2 } from "../../assets/images";

const Counter = ({
  to,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 2,
}) => {
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

// Masked line reveal — editorial motion primitive.
const RevealLine = ({ children, delay = 0, className = "" }) => (
  <span className={`block overflow-hidden ${className}`}>
    <Motion.span
      className="block"
      initial={{ y: "110%" }}
      animate={{ y: "0%" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Motion.span>
  </span>
);

const Hero = () => {
  const scrollToBooking = () => {
    document
      .getElementById("book-ride")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-black lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
      {/* Cinematic road grade */}
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
          initial={{ scale: 1.06 }}
          animate={{ scale: [1.06, 1.14, 1.06] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent" />
        {/* Horizon road-glow */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-emerald-500/[0.07] to-transparent" />
      </div>

      {/* Giant watermark */}
      <div
        aria-hidden
        className="pointer-events-none hidden absolute inset-0  items-center justify-center overflow-hidden"
      >
        <span
          className="font-display font-extrabold uppercase tracking-tight whitespace-nowrap select-none text-[26vw] lg:text-[19vw] leading-none"
          style={{
            WebkitTextStroke: "1px rgba(255,255,255,0.07)",
            color: "transparent",
          }}
        >
          Riding
        </span>
      </div>

      {/* Ambient glow mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="landing-drift absolute top-1/4 -left-24 w-96 h-96 bg-green-500/15 blur-[130px] rounded-full" />
        <div className="landing-drift-slow absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-emerald-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="min-h-screen relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-[1.08fr_0.92fr] gap-10 lg:gap-14 lg:items-center pt-24 pb-10 lg:pt-24 lg:pb-14">
        {/* LEFT — editorial headline */}
        <div className="  flex flex-col justify-center">
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-wrap items-center gap-x-4 gap-y-2"
          >
            <span className="inline-flex items-center gap-2 text-green-400 text-[11px] font-bold uppercase tracking-[0.28em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              Tamil Nadu · Puducherry · Bangalore
            </span>
            <span className="hidden  items-center gap-1.5 text-[11px] font-semibold text-amber-300">
              <Star size={11} className="text-amber-400" fill="currentColor" />
              4.9 — 50K+ riders
            </span>
          </Motion.div>

          <h1 className="font-editorial mt-5 text-[3rem] leading-[0.98] sm:text-7xl lg:text-[5.4rem] font-bold text-white tracking-tight">
            <RevealLine delay={0.15} className="lg:pb-3 md:pb-2 pb-1 ">Every Journey</RevealLine>
            <RevealLine delay={0.28}>
              <span className="italic font-semibold lg:text-[5.4rem] md:text-7xl text-[1.7rem] text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-400 to-teal-300">
                Deserves a Better Ride.
              </span>
            </RevealLine>
          </h1>

          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="lg:block md:flex "
          >
            <p className="mt-6 text-base sm:text-lg text-gray-300/90 leading-relaxed max-w-xl">
              Chauffeured city rides, airport transfers and outstation escapes —
              verified drivers, transparent fares, 24/7 human support.
            </p>

            {/* Road-line motif with a car driving across it */}
            <div
              className="relative mt-7 h-10 max-w-xl overflow-hidden"
              aria-hidden
            >
              {/* road */}
              <div className="absolute bottom-1 left-0 right-0 h-[5px] rounded-full bg-white/10">
                <div
                  className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 opacity-60"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 12px, transparent 12px 26px)",
                  }}
                />
              </div>
              {/* moving car with light trail */}
              <Motion.span
                className="absolute bottom-0 flex items-center"
                animate={{ x: ["-4rem", "37rem"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                <span className="h-[3px] w-14 rounded-full bg-gradient-to-l from-green-400/80 to-transparent" />
                <Car
                  size={30}
                  className="text-green-300 drop-shadow-[0_0_12px_rgba(74,222,128,0.8)]"
                />
              </Motion.span>
            </div>

            <div className="flex gap-4 mt-7 flex-wrap">
              <Link to="/booking">
              <Motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                
                className="group px-9 py-4 rounded-full cursor-pointer bg-green-300 text-black !font-extrabold flex items-center gap-2 hover:bg-green-400 hover:shadow-[0_0_40px_rgba(74,222,128,0.45)] transition-all"
              >
                Book Now
                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Motion.button>
              </Link>

              <Link to="/tariff">
                <Motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-9 py-4 cursor-pointer rounded-full border border-white/25 text-white !font-extrabold hover:border-green-400/70 hover:text-green-300 backdrop-blur-sm transition-all"
                >
                  View Tariff
                </Motion.button>
              </Link>
            </div>

            {/* Editorial stat row */}
            <div className="flex items-stretch gap-6 sm:gap-9 mt-10">
              <div>
                <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                  <Counter to={50} suffix="K+" />
                </p>
                <p className="text-gray-500 text-[11px] sm:text-xs mt-1 uppercase tracking-[0.2em]">
                  Happy riders
                </p>
              </div>
              <div className="w-px bg-white/10" aria-hidden />
              <div>
                <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                  24×7
                </p>
                <p className="text-gray-500 text-[11px] sm:text-xs mt-1 uppercase tracking-[0.2em]">
                  Human support
                </p>
              </div>
              <div className="w-px bg-white/10" aria-hidden />
              <div>
                <p className="font-display text-3xl sm:text-4xl font-bold text-white flex items-center gap-1.5">
                  <Counter to={4.9} decimals={1} />
                  <Star
                    size={19}
                    className="text-amber-400"
                    fill="currentColor"
                  />
                </p>
                <p className="text-gray-500 text-[11px] sm:text-xs mt-1 uppercase tracking-[0.2em]">
                  Avg rating
                </p>
              </div>
            </div>
          </Motion.div>
        </div>

        {/* RIGHT — booking panel */}
        <Motion.div
          id="book-ride"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="relative scroll-mt-28 pb-12 lg:pb-0"
        >
          <div className="relative bg-black/55 backdrop-blur-2xl border border-white/12 rounded-[28px] p-4 sm:p-6 shadow-[0_40px_90px_rgba(0,0,0,0.65)] overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-green-400/70 to-transparent"
            />
            <div className="flex items-center justify-between px-2 pb-4">
              <div>
                <p className="font-display text-lg font-bold text-white tracking-tight">
                  Instant Booking
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  One-way &amp; round-trip · no login needed
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest border-green-400 border-1 bg-green-500/5 rounded-full px-4 py-2 text-green-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                </span>
                LIVE
              </span>
            </div>
            <GuestBookingForm />
          </div>
        </Motion.div>
      </div>

      {/* Route ticker */}
      <div className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        <div className="hero-marquee flex w-max items-center gap-8 py-3.5 pr-8">
          {[...ROUTE_TICKER, ...ROUTE_TICKER].map((route, i) => (
            <span
              key={i}
              className="flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 whitespace-nowrap"
            >
              {route}
              <span className="text-green-500">✦</span>
            </span>
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent"
        />
      </div>

      {/* Scroll cue */}
      <Motion.button
        onClick={scrollToBooking}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 text-gray-400 hover:text-green-400 transition-colors hidden "
        aria-label="Scroll to booking"
      >
        <ChevronDown size={28} />
      </Motion.button>
    </section>
  );
};

export default Hero;
