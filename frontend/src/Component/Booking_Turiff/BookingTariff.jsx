import React, { useState, useRef } from "react";
import { motion as Motion, useInView } from "framer-motion";
import {
  Car,
  Users,
  ArrowRightLeft,
  Timer,
  Wallet,
  Receipt,
  Route,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Clock3,
  Phone,
} from "lucide-react";

const TABS = [
  {
    id: "oneway",
    label: "One-Way (Drop)",
    icon: Car,
    badge: "130 km/day min",
    included:
      "Base fare + distance beyond included km at per-km rate. Minimum billing 130 km per calendar day. Toll & interstate permit at actuals.",
    formula:
      "Total = Base Fare + (chargeable km × per-km) + Driver Bata + Waiting (after 30m) + Toll/Permit",
    bullets: [
      "Minimum: max(actual km, 130 × days)",
      "Total running = travelled × 1 leg",
      "Chargeable = running − base km (0 if ≤ base km)",
    ],
  },
  {
    id: "roundtrip",
    label: "Round Trip",
    icon: ArrowRightLeft,
    badge: "250 km/day · 400 BLR",
    included:
      "Out + return counted. Bengaluru round trips bill 300 km/day, others 250 km/day. Toll, permit, waiting & night not charged.",
    formula:
      "Total = Base Fare + (chargeable km × per-km) + Bata (always ₹400/day × days)",
    bullets: [
      "Running = travelled × 2 legs",
      "Bata is always ₹400/day — 400 km slab never applies",
      "No charge for waiting and night on round trips",
    ],
  },
  {
    id: "extras",
    label: "Driver & Extras",
    icon: Wallet,
    badge: "₹400 / ₹600",
    included:
      "Driver bata covers stay & food. Waiting is one-way only, first 30 min free. State permits & tolls are one-way only, at actuals.",
    formula: "Bata: ₹400/day · ₹600/day only if one-way running > 400 km · Waiting: ₹2.5/min after 30 min",
    bullets: [
      "Bata per-vehicle override if set, else ₹600 high slab",
      "Waiting: billable = max(0, waited − 30) × per-min",
      "Night/airport = 0 on round-trip",
    ],
  },
];

const RULES = [
  {
    icon: Route,
    title: "Minimum billed km",
    desc: "One-way 130 km/day · Round-trip 250 km/day · Bengaluru round-trip 300 km/day. Short rides are billed to the minimum.",
  },
  {
    icon: Wallet,
    title: "Driver bata",
    desc: "₹400/day standard. One-way only: ₹600/day when total running > 400 km (per-vehicle override respected). Round-trip always ₹300/day.",
  },
  {
    icon: Clock3,
    title: "Waiting",
    desc: "One-way only. First 30 min free (food halt). Thereafter ₹2.5/min on per-vehicle rate. Round-trip has no waiting charge.",
  },
  {
    icon: Receipt,
    title: "Toll & permit",
    desc: "One-way only, at actuals. Round-trip pre-includes route costs — no extra toll/permit line.",
  },
  {
    icon: MapPinned,
    title: "Calendar day",
    desc: "1 day = midnight to midnight. Multi-day round-trip = days × per-day minimum & bata.",
  },
  {
    icon: Timer,
    title: "Cancellation",
    desc: "Post-arrival cancel (driver at pickup) → ₹300. Tolls & permits are always extra at actuals for one-way.",
  },
  {
    icon: Users,
    title: "Capacity",
    desc: "Sedan 4 pax / 3 bags · SUV/Innova 6-7 pax / 4-5 bags · Tempo 12 pax / 8 bags. AC included.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent fare",
    desc: "Base + distance + listed extras only. No hidden fees — confirm price is pay price.",
  },
];

const BookingTariff = () => {
  const [active, setActive] = useState("oneway");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const tab = TABS.find((t) => t.id === active);

  return (
    <section
      ref={ref}
      className="relative w-full py-14 sm:py-20 px-4 sm:px-6 bg-black overflow-hidden"
    >
      {/* Glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-1/4 w-[28rem] h-[28rem] bg-green-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[22rem] h-[22rem] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-green-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
            <Sparkles size={12} /> Transparent pricing
          </span>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Booking tariff &amp; charges
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-gray-400 leading-relaxed">
            Same engine as your live fare. One-way and round-trip share one formula — round-trip just skips extras.{" "}
            <span className="hidden sm:inline">Need an estimate? </span>
            <a href="tel:9342830199" className="inline-flex items-center gap-1.5 text-green-400 font-semibold hover:text-green-300">
              <Phone size={14} /> 9342830199
            </a>
          </p>
        </div>

        {/* Tabs — no scroll: stacked mobile, 3-col desktop */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-1.5 rounded-[28px] sm:rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
          {TABS.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`flex items-center justify-between sm:justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-[20px] sm:rounded-full text-sm font-semibold transition-all text-left sm:text-center ${
                  isActive
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_25px_rgba(34,197,94,0.4)]"
                    : "bg-white/[0.03] sm:bg-transparent text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 sm:border-0"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 sm:w-7 sm:h-7 rounded-xl sm:rounded-full flex items-center justify-center shrink-0 ${isActive ? "bg-white/20" : "bg-green-500/10 border border-green-500/20"}`}>
                    <t.icon size={16} className={isActive ? "text-white" : "text-green-400"} />
                  </span>
                  {t.label}
                </span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium shrink-0 ${isActive ? "bg-white/20 text-white" : "bg-white/5 border border-white/10 text-gray-400"}`}>
                  {t.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active panel */}
        <Motion.div
          key={active}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mt-6 sm:mt-8 grid lg:grid-cols-2 gap-4 sm:gap-6"
        >
          <div className="relative bg-white/[0.04] backdrop-blur-xl rounded-[24px] sm:rounded-[30px] border border-white/[0.08] p-6 sm:p-7 overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-green-500/10 blur-[80px] rounded-full" />
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <tab.icon size={18} className="text-green-400" />
              </span>
              <h3 className="font-display text-base sm:text-lg font-bold text-white">What’s included</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{tab.included}</p>
            <ul className="mt-4 space-y-2">
              {tab.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-xs sm:text-sm text-gray-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative bg-gradient-to-br from-green-500/10 via-white/[0.04] to-blue-500/10 backdrop-blur-xl rounded-[24px] sm:rounded-[30px] border border-white/[0.08] p-6 sm:p-7 overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-400/20 to-transparent" />
            <h3 className="font-display text-base sm:text-lg font-bold text-white">How we calculate</h3>
            <div className="mt-3 inline-flex items-start rounded-2xl bg-black/30 border border-white/10 px-4 py-3">
              <code className="text-[11px] sm:text-xs text-emerald-300 leading-relaxed break-words">{tab.formula}</code>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Base = <span className="text-gray-300">{tab.id === "roundtrip" ? "roundTripBaseFare" : "oneWayBaseFare"}</span> · Per-km ={" "}
              <span className="text-gray-300">{tab.id === "roundtrip" ? "roundTripPerKm" : "oneWayPerKm"}</span> · legs ={" "}
              <span className="text-gray-300">{tab.id === "roundtrip" ? "2" : "1"}</span>
            </p>
          </div>
        </Motion.div>

        {/* Rules grid — responsive */}
        <div className="mt-8 sm:mt-10">
          <h3 className="font-display text-lg sm:text-xl font-bold text-white">Note — fare rules</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">These match <span className="text-gray-300">fare.service.js FARE_CONFIG</span> — single source of truth.</p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {RULES.map((r, i) => (
              <Motion.div
                key={r.title}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative bg-white/[0.04] backdrop-blur-xl rounded-[24px] border border-white/[0.08] p-5 hover:border-green-500/30 hover:bg-white/[0.06] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:bg-green-500/15 transition">
                  <r.icon size={18} className="text-green-400" />
                </div>
                <h4 className="mt-3 font-semibold text-white text-sm">{r.title}</h4>
                <p className="mt-1.5 text-xs sm:text-[13px] text-gray-400 leading-relaxed">{r.desc}</p>
              </Motion.div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-gray-500">Night window 22:00–06:00 · Airport surcharge 10% · Vehicle `isActive` only · Prices from live tariff engine</p>
      </div>
    </section>
  );
};

export default BookingTariff;
