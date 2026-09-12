import React from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import {
  MapPin,
  ArrowRight,
  Building2,
  Plane,
  Mountain,
  KeyRound,
  Route as RouteIcon,
} from "lucide-react";
import { ChennaiBangalore,TrichyChennai, CoimbatoreOoty, ChennaiMadurai, ChennaiRameshwaram, ChennaiCoimbatore } from "../../assets/images";
import { Reveal, SectionHeading, GlowBlobs } from "./Reveal";
import { cardHover } from "./motion";
import FareNotes from "../../components/shared/FareNotes";

const ROUTES = [
  {
    from: "Chennai",
    to: "Bangalore",
    tag: "Most Booked",
    img: ChennaiBangalore,
    note: "One-way & round-trip cabs on NH-48",
  },
  {
    from: "Chennai",
    to: "Madurai",
    tag: "Temple Trail",
    img: ChennaiMadurai,
    note: "Comfortable long-distance cruising",
  },
  {
    from: "Coimbatore",
    to: "Ooty",
    tag: "Hill Escape",
    img: CoimbatoreOoty,
    note: "Ghat-ready cars with expert drivers",
  },
  {
    from: "Trichy",
    to: "Chennai",
    tag: "Business Run",
    img: TrichyChennai,
    note: "On-time airport & city transfers",
  },
  {
    from:"Chennai",
    to:"Rameshwaram",
    tag:"Temple Trail",
    img: ChennaiRameshwaram,
    note: "Comfortable long-distance cruising",
  },
  {
    from:"Chennai",
    to:"Coimbatore",
    tag:"Hill Escape",
    img: ChennaiCoimbatore,
    note: "Ghat-ready cars with expert drivers",  
  }
  
];

export const PopularRoutes = () => (
  <section className="relative bg-gradient-to-b from-black via-slate-950 to-black py-20 md:py-28 overflow-hidden">
    <GlowBlobs />
    <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[720px] h-[320px] bg-emerald-500/[0.07] blur-[130px] rounded-full" />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
      <SectionHeading
        eyebrow="Popular Routes"
        title="Journeys our riders love"
        sub="Handpicked corridors served daily by verified GenZRides chauffeurs."
      />

      {/* Premium Swiper carousel: exactly 1 card on mobile, up to 4 on xl */}
      <Reveal>
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          loop
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1280: { slidesPerView: 4 },
          }}
          className="routes-swiper !pb-10 !pt-10  " 
        >
          {ROUTES.map((r) => (
            <SwiperSlide key={`${r.from}-${r.to}`} className="h-auto">
              <Motion.div
                {...cardHover}
                className="group relative flex flex-col h-full rounded-[30px] overflow-hidden bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-emerald-400/40 hover:shadow-[0_8px_50px_-12px_rgba(16,185,129,0.35)] transition-all duration-300"
              >
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
              <div className="relative h-44 sm:h-48 overflow-hidden">
                <img
                  src={r.img}
                  alt={`${r.from} to ${r.to}`}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent" />
                
                <span className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center">
                  <RouteIcon size={14} className="text-emerald-300" />
                </span>
              </div>
              <div className="relative flex flex-1 flex-col p-5">
                <p className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  <MapPin size={13} />
                  {r.from}
                  <ArrowRight size={13} className="text-gray-500" />
                </p>
                <h3 className="font-display text-[26px] font-bold text-white leading-tight mt-1">
                  {r.to}
                </h3>
                <span className="absolute top-3.5 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold uppercase tracking-widest">
                  {r.tag}
                </span>
                <p className="text-gray-400 text-[13px] leading-relaxed mt-1.5 flex-1">{r.note}</p>
                <Link
                  to="/booking"
                  className="inline-flex items-center justify-center gap-1.5 mt-4 w-full py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all"
                >
                  Book this route
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              </Motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </Reveal>

      <Reveal delay={0.15} className="mt-6 md:mt-8">
        <FareNotes />
      </Reveal>
    </div>
  </section>
);

const SERVICES = [
  {
    icon: Building2,
    title: "City Rides",
    desc: "Swift pickups across town with live tracking and upfront fares — day or night.",
  },
  {
    icon: Plane,
    title: "Airport Transfers",
    desc: "Flight-synced pickups, meet-and-greet service and zero waiting-time stress.",
  },
  {
    icon: Mountain,
    title: "Outstation",
    desc: "Intercity escapes in road-trip-ready cars driven by highway experts.",
  },
  {
    icon: KeyRound,
    title: "Rentals",
    desc: "Hourly chauffeur packs for shopping, weddings and full-day itineraries.",
  },
];

export const Services = () => (
  <section className="relative bg-gradient-to-b from-black via-slate-950 to-black py-20 md:py-28 overflow-hidden">
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
      <SectionHeading
        eyebrow="What we do"
        title="One app for every kind of trip"
        sub="From daily commutes to once-in-a-lifetime road trips — pick your ride."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {SERVICES.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.1}>
            <Motion.div
              {...cardHover}
              className="h-full bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-7 hover:border-green-500/40 hover:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/25 to-emerald-600/25 border border-green-500/30 flex items-center justify-center mb-5">
                <s.icon size={26} className="text-green-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2.5">
                {s.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              <Link
                to="/booking"
                className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-green-400 hover:text-green-300 transition-colors"
              >
                Book now <ArrowRight size={15} />
              </Link>
            </Motion.div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
