import React from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  IndianRupee,
  Clock3,
  Star,
  MapPin,
  CalendarCheck,
  CarFront,
  ArrowRight,
} from "lucide-react";
import { hero4 } from "../../assets/images";
import { Reveal, SectionHeading, GlowBlobs } from "./Reveal";
import { cardHover } from "./motion";

const WHY = [
  {
    icon: ShieldCheck,
    title: "Verified Chauffeurs",
    desc: "Background-checked, trained drivers with 4.8+ average ratings on every trip.",
  },
  {
    icon: IndianRupee,
    title: "Transparent Fares",
    desc: "Upfront tariff with zero surge surprises — the price you see is the price you pay.",
  },
  {
    icon: Clock3,
    title: "On Time, Every Time",
    desc: "Flight tracking, early arrivals and 24/7 dispatch that keeps you moving.",
  },
  {
    icon: Star,
    title: "Premium Comfort",
    desc: "Sanitised, air-conditioned cabins with bottled water and phone chargers.",
  },
];

export const WhyChooseUs = () => (
  <section className="relative bg-gradient-to-b from-black via-slate-950 to-black py-20 md:py-28 overflow-hidden">
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
      <SectionHeading
        eyebrow="Why GenZRides"
        title="The premium way to move"
        sub="We obsess over the details other cab companies ignore."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {WHY.map((w, i) => (
          <Reveal key={w.title} delay={i * 0.1}>
            <Motion.div
              {...cardHover}
              className="h-full bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-7 hover:border-green-500/40 hover:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/25 to-emerald-600/25 border border-green-500/30 flex items-center justify-center mb-5">
                <w.icon size={26} className="text-green-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2.5">{w.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{w.desc}</p>
            </Motion.div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const AboutSection = () => (
  <section className="relative bg-black py-20 md:py-28 overflow-hidden">
    <GlowBlobs />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <Reveal className="relative order-2 lg:order-1">
        <Motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="relative rounded-[30px] overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        >
          <img
            src={hero4}
            alt="Joyful road trip with GenZRides"
            loading="lazy"
            className="w-full h-[420px] md:h-[520px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-center gap-4 bg-black/55 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
              <MapPin size={22} className="text-white" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white leading-tight">
                120+ towns &amp; cities
              </p>
              <p className="text-gray-300 text-sm">Across Tamil Nadu &amp; beyond</p>
            </div>
          </div>
        </Motion.div>
      </Reveal>

      <div className="order-1 lg:order-2">
        <Reveal>
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">
            About GenZRides
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Born on the highways of Tamil Nadu
          </h2>
          <p className="mt-5 text-gray-400 text-base sm:text-lg leading-relaxed">
            From Trichy to every corner of the state, we&apos;ve spent years
            perfecting the art of the perfect ride — courteous chauffeurs,
            spotless cars and fares that never play games.
          </p>
          <p className="mt-4 text-gray-400 text-base sm:text-lg leading-relaxed">
            Whether it&apos;s a 4 AM airport run or a week-long temple trail,
            one booking puts a premium car and a professional driver at your door.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link to="/about">
              <Motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all inline-flex items-center gap-2"
              >
                Our Story <ArrowRight size={18} />
              </Motion.button>
            </Link>
            <Link to="/vehicles">
              <Motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-7 py-3.5 rounded-full bg-white/5 backdrop-blur-lg border border-white/15 text-white font-semibold hover:border-green-500/50 hover:text-green-300 transition-all"
              >
                Explore Fleet
              </Motion.button>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

const STEPS = [
  {
    n: "01",
    icon: MapPin,
    title: "Tell us where",
    desc: "Enter pickup and drop — smart suggestions find your exact spot in seconds.",
  },
  {
    n: "02",
    icon: CalendarCheck,
    title: "Pick your ride",
    desc: "Choose your car, see the upfront fare and confirm. No haggling, ever.",
  },
  {
    n: "03",
    icon: CarFront,
    title: "Ride in comfort",
    desc: "Track your chauffeur live, sink into a clean cabin and arrive relaxed.",
  },
];

export const HowItWorks = () => (
  <section className="relative bg-gradient-to-b from-black via-slate-950 to-black py-20 md:py-28 overflow-hidden">
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
      <SectionHeading
        eyebrow="Effortless"
        title="From search to backseat in 3 steps"
        sub="Booking a premium cab takes less than a minute."
      />
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        <div aria-hidden className="hidden md:block absolute top-16 left-[18%] right-[18%] border-t-2 border-dashed border-green-500/30" />
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.12}>
            <Motion.div
              {...cardHover}
              className="relative h-full bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-8 text-center hover:border-green-500/40 hover:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition-colors"
            >
              <span className="font-editorial text-6xl font-bold text-white/10 absolute top-5 right-7 select-none">
                {s.n}
              </span>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(34,197,94,0.45)]">
                <s.icon size={28} className="text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2.5">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </Motion.div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
