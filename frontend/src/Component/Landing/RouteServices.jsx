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
  Eye,
  Wallet,
} from "lucide-react";
import {
  ChennaiBangalore,
  TrichyChennai,
  CoimbatoreOoty,
  ChennaiMadurai,
  ChennaiRameshwaram,
  ChennaiCoimbatore,
  MaduraiRameshwaram,
  CoimbatoreSalem,
} from "../../assets/images";
import { Reveal, SectionHeading, GlowBlobs } from "./Reveal";
import { cardHover } from "./motion";
import FareNotes from "../../components/shared/FareNotes";

const slugOf = (from, to) => `${from.toLowerCase()}-to-${to.toLowerCase()}`;

const ROUTES = [
  {
    from: "Chennai",
    to: "Bangalore",
    tag: "Most Booked",
    img: ChennaiBangalore,
    note: "One-way & round-trip cabs on NH-48",
    distance: "≈ 354 km",
    fare: "≈ ₹5,719",
  },
  {
    from: "Chennai",
    to: "Madurai",
    tag: "Temple Trail",
    img: ChennaiMadurai,
    note: "Comfortable long-distance cruising",
    distance: "≈ 451 km",
    fare: "≈ ₹7,361",
  },
  {
    from: "Coimbatore",
    to: "Ooty",
    tag: "Hill Escape",
    img: CoimbatoreOoty,
    note: "Ghat-ready cars with expert drivers",
    distance: "≈ 90 km",
    fare: "≈ ₹2,350",
  },
  {
    from: "Trichy",
    to: "Chennai",
    tag: "Business Run",
    img: TrichyChennai,
    note: "On-time airport & city transfers",
    distance: "≈ 326 km",
    fare: "≈ ₹5,289",
  },
  {
    from: "Chennai",
    to: "Rameshwaram",
    tag: "Pilgrim Special",
    img: ChennaiRameshwaram,
    note: "Temple-run comfort all the way",
    distance: "≈ 554 km",
    fare: "≈ ₹8,908",
  },
  {
    from: "Chennai",
    to: "Coimbatore",
    tag: "Cross-State",
    img: ChennaiCoimbatore,
    note: "Ghat-aware drivers with refreshment stops",
    distance: "≈ 503 km",
    fare: "≈ ₹8,149",
  },
  {
    from: "Madurai",
    to: "Rameshwaram",
    tag: "Coastal Run",
    img: MaduraiRameshwaram,
    note: "Temple trail through the Pamban bridge",
    distance: "≈ 173 km",
    fare: "≈ ₹2,989",
  },
  {
    from: "Coimbatore",
    to: "Salem",
    tag: "Quick Hop",
    img: CoimbatoreSalem,
    note: "Brisk highway sprints, day and night",
    distance: "≈ 166 km",
    fare: "≈ ₹2,896",
  },
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

      {/* Premium auto-slide Swiper carousel: compact cards, 1 on mobile up to 4 on xl */}
      <Reveal>
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{
            delay: 3200,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{ clickable: true }}
          loop
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="routes-swiper !pb-10 !pt-6"
        >
          {ROUTES.map((r) => (
            <SwiperSlide key={`${r.from}-${r.to}`} className="h-auto">
              <Motion.div
                {...cardHover}
                className="group relative flex flex-col h-full rounded-[22px] overflow-hidden bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-emerald-400/40 hover:shadow-[0_10px_40px_-12px_rgba(16,185,129,0.4)] transition-all duration-300"
              >
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                <div className="relative h-43 sm:h-33 overflow-hidden">
                  <img
                    src={r.img}
                    alt={`${r.from} to ${r.to}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent" />
                  <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center">
                    <RouteIcon size={12} className="text-emerald-300" />
                  </span>
                  <span className="absolute top-2.5 left-2.2 px-2 py-[3px] rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[9.5px] font-semibold uppercase tracking-wider">
                    {r.tag}
                  </span>
                </div>
                <div className="relative flex flex-1 flex-col p-4 pt-3">
                  <p className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold uppercase tracking-[0.16em]">
                    <MapPin size={11} />
                    {r.from}
                    <ArrowRight size={11} className="text-gray-500" />
                    <MapPin size={11} />
                    {r.to}
                  </p>
                  <h3 className="font-display text-[19px] font-bold text-white leading-tight mt-0.5">
                    {r.from} → {r.to}
                  </h3>
                  <p className="text-gray-400 text-[12px] leading-snug mt-1 line-clamp-2 flex-1">
                    {r.note}
                  </p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2.5 py-1">
                      <Wallet size={11} /> {r.fare}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-300 bg-white/[0.06] border border-white/10 rounded-full px-2.5 py-1">
                      <RouteIcon size={11} className="text-gray-400" />{" "}
                      {r.distance}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                    <Link
                      to={`/routes/${slugOf(r.from, r.to)}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.07] border border-white/15 text-[12px] font-semibold text-white hover:border-emerald-400/50 hover:text-emerald-300 hover:shadow-[0_0_16px_rgba(16,185,129,0.25)] active:scale-[0.98] transition-all"
                    >
                      <Eye size={12} /> Details
                    </Link>
                    <Link
                      to="/booking"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[12px] font-semibold hover:shadow-[0_0_20px_rgba(16,185,129,0.45)] active:scale-[0.98] transition-all"
                    >
                      Book
                      <ArrowRight size={12} />
                    </Link>
                  </div>
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
