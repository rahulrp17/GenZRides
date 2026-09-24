import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { hero4, hero8, hero10 } from "../../assets/images";

const AUTH_SLIDES = [
  {
    img: hero10,
    title: "Every Journey Deserves a Better Ride",
    sub: "Premium cabs, verified chauffeurs, transparent fares.",
  },
  {
    img: hero8,
    title: "Airport runs, perfected",
    sub: "Flight-synced pickups across Tamil Nadu, day and night.",
  },
  {
    img: hero4,
    title: "Outstation escapes",
    sub: "Highway-ready cars for temple trails and hill stations.",
  },
];

/**
 * Shared split-screen shell for all auth pages.
 * Left: auto-sliding cinematic imagery (desktop only).
 * Right: the page's own form (logic untouched by this shell).
 */
const AuthSplit = ({ children, eyebrow = "GenZRides" }) => (
  <div className="min-h-screen bg-black grid lg:grid-cols-2">
    {/* LEFT — hero slider (desktop only) */}
    <div className="hidden lg:block relative overflow-hidden min-h-screen">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1200}
        loop
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        allowTouchMove={false}
        className="absolute inset-0 w-full h-full"
      >
        {AUTH_SLIDES.map((s) => (
          <SwiperSlide key={s.title}>
            <div className="relative w-full h-full">
              <img
                src={s.img}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Overlay content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-10 xl:p-14 pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-3 w-fit">
          <img
            src="/logo5.png"
            alt="logo"
            className="w-11 h-11 rounded-full object-cover ring-1 ring-green-500/40"
          />
          <div className="leading-tight">
            <p className="font-display text-lg font-bold text-white tracking-tight">
              GenZRides
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-green-400">
              Premium Rides
            </p>
          </div>
        </Link>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400 mb-3">
            {eyebrow}
          </p>
          <p className="font-editorial text-3xl xl:text-4xl font-bold text-white leading-tight max-w-md">
            Every Journey Deserves a Better Ride.
          </p>
          <div className="flex items-center gap-6 mt-6 text-sm text-gray-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> 50K+ riders
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> 4.9 rating
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> 24×7 support
            </span>
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div aria-hidden className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="landing-drift absolute -bottom-24 -left-24 w-96 h-96 bg-green-500/20 blur-[120px] rounded-full" />
      </div>
    </div>

    {/* RIGHT — form side */}
    <div className="relative flex items-center justify-center px-4 sm:px-8 py-10 bg-gradient-to-br from-slate-950 via-black to-slate-950 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="landing-drift absolute -top-24 right-0 w-80 h-80 bg-green-500/10 blur-[120px] rounded-full" />
        <div className="landing-drift-slow absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Clickable brand logo — mobile only (desktop shows it on the hero panel) */}
        <Link to="/" aria-label="GenZRides home" className="lg:hidden flex items-center justify-center gap-2.5 mb-6 w-fit mx-auto">
          <img
            src="/logo5.png"
            alt="GenZRides logo"
            className="w-11 h-11 rounded-2xl object-cover ring-1 ring-green-500/40 shadow-[0_0_24px_rgba(34,197,94,0.35)]"
          />
          <span className="text-left leading-tight">
            <span className="block font-display text-lg font-bold text-white tracking-tight">
              Gen<span className="text-green-400">Z</span>Rides
            </span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-green-400">
              Premium Rides
            </span>
          </span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
        {children}
      </Motion.div>
    </div>
  </div>
);

export default AuthSplit;
