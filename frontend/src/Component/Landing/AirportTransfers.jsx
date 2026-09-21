import React from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Plane, ArrowRight, Radar } from "lucide-react";
import {
  ChennaiAirport,
  BangaloreAirport,
  CoimbatoreAirport,
  TrichyAirport,
  MaduraiAirport,
} from "../../assets/images";
import { Reveal, SectionHeading, GlowBlobs } from "./Reveal";
import { cardHover } from "./motion";

const AIRPORTS = [
  {
    city: "Chennai",
    code: "MAA",
    img: ChennaiAirport,
    tag: "Busiest Hub",
    note: "Flight-tracked pickups at both terminals",
    desc: "Meet-and-greet service day and night, 45 minutes of free waiting included.",
  },
  {
    city: "Bangalore",
    code: "BLR",
    img: BangaloreAirport,
    tag: "Tech Corridor",
    note: "Red-eye arrival specialists",
    desc: "KIAB transfers timed to your landing — your chauffeur waits, even when flights don't.",
  },
  {
    city: "Coimbatore",
    code: "CJB",
    img: CoimbatoreAirport,
    tag: "On-Time Promise",
    note: "4 AM departures ready",
    desc: "Buffer-planned routing with early-morning and late-night CJB runs.",
  },
  {
    city: "Trichy",
    code: "TRZ",
    img: TrichyAirport,
    tag: "Home Base",
    note: "Fastest city pickups",
    desc: "Our home airport — the fastest airport pickups in the city, guaranteed.",
  },
  {
    city: "Madurai",
    code: "IXM",
    img: MaduraiAirport,
    tag: "Temple Gateway",
    note: "Onward to Rameshwaram",
    desc: "Land and glide straight to the temple city or onward to Rameshwaram.",
  },
];

const AirportTransfers = () => (
  <section className="relative bg-gradient-to-b from-black via-slate-950 to-black py-20 md:py-28 overflow-hidden">
    <GlowBlobs />
    <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[720px] h-[320px] bg-sky-500/[0.08] blur-[130px] rounded-full" />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
      <SectionHeading
        eyebrow="Airport Transfers"
        title="Never miss a flight again"
        sub="Auto-sliding picks — flight-tracked airport taxis across Tamil Nadu & Bangalore, synced to landing delays."
      />

      {/* Premium auto-slide carousel: 1 card on mobile, up to 3 on desktop */}
      <Reveal>
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          loop
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="routes-swiper !pb-12 !pt-10"
        >
          {AIRPORTS.map((a) => (
            <SwiperSlide key={a.code} className="h-auto">
              <Motion.div
                {...cardHover}
                className="group relative flex flex-col h-full rounded-[30px] overflow-hidden bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-green-400/40 hover:shadow-[0_12px_60px_-16px_rgba(56,189,248,0.35)] transition-all duration-300"
              >
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />
                <div className="relative h-44 sm:h-48 overflow-hidden">
                  <img
                    src={a.img}
                    alt={`${a.city} Airport taxi`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent" />
                  <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-widest">
                    {a.code}
                  </span>
                  <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-green-500/40 text-green-300 text-[11px] font-semibold uppercase tracking-widest">
                    {a.tag}
                  </span>
                </div>
                <div className="relative flex flex-1 flex-col p-5">
                  <p className= "flex items-center gap-1.5 text-green-400 text-[11px] font-semibold uppercase tracking-[0.18em]">
                    <Plane size={13} /> {a.city} Airport
                  </p>
                  <h3 className="font-display text-[26px] font-bold text-white leading-tight mt-1">
                    {a.city} Taxi
                  </h3>
                  <span className="inline-flex items-center gap-1.5 self-start text-[11px] text-gray-300 bg-white/[0.06] border border-white/10 rounded-full px-2.5 py-1 mt-2">
                    <Radar size={11} className="text-green-400" /> {a.note}
                  </span>
                  <p className="text-gray-400 text-[13px] leading-relaxed mt-2 flex-1">{a.desc}</p>
                  <div className="flex gap-2.5 mt-4 pt-4 border-t border-white/10">
                    <Link
                      to={`/airport/${a.city.toLowerCase()}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-white/[0.07] border border-white/15 text-sm font-semibold text-white hover:border-green-400/50 hover:text-green-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.25)] active:scale-[0.98] transition-all"
                    >
                      View Details
                      <ArrowRight size={15} />
                    </Link>
                    <Link
                      to="/booking"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-gradient-to-r from-green-500 to-green-500 text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] active:scale-[0.98] transition-all"
                    >
                      <Plane size={15} /> Book cab
                    </Link>
                  </div>
                </div>
              </Motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </Reveal>
    </div>
  </section>
);

export default AirportTransfers;