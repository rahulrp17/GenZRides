import React from "react";
import SEO from "../../components/SEO";
import { localBusinessJsonLd, breadcrumbJsonLd } from "../../utils/StructuredData";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Clock3, Route, Wallet, Eye } from "lucide-react";
import PageHero from "../../Component/Landing/PageHero";
import { Reveal, SectionHeading, GlowBlobs } from "../../Component/Landing/Reveal";
import { cardHover } from "../../Component/Landing/motion";
import { hero2, MaduraiRameshwaram, CoimbatoreSalem, ChennaiBangalore, ChennaiMadurai, TrichyChennai, ChennaiCoimbatore, MaduraiTrichy } from "../../assets/images";

const slugOf = (from, to) => `${from.toLowerCase()}-to-${to.toLowerCase()}`;

const ROUTES = [
  {
    from: "Chennai",
    to: "Bangalore",
    img: ChennaiBangalore,
    tag: "Most Booked",
    desc: "India's favourite tech-corridor run — smooth NH-48 cruising with Wi-Fi-ready sedans and SUVs.",
    meta: ["One-way & round-trip", "Airport pickup available"],
    distance: "≈ 350 km",
    fare: "≈ ₹4,550",
  },
  {
    from: "Chennai",
    to: "Madurai",
    img: ChennaiMadurai,
    tag: "Temple Trail",
    desc: "Ride down to the temple city in air-conditioned comfort with experienced highway chauffeurs.",
    meta: ["Temple tour friendly", "Night departures available"],
    distance: "≈ 460 km",
    fare: "≈ ₹5,980",
  },
  {
    from: "Madurai",
    to: "Rameshwaram",
    img: MaduraiRameshwaram,
    tag: "Pilgrim Special",
    desc: "A serene coastal pilgrimage with doorstep pickup, patient drivers and flexible temple-halt timings.",
    meta: ["Halt-friendly trips", "Family & group cabs"],
    distance: "≈ 170 km",
    fare: "≈ ₹2,210",
  },
  {
    from: "Coimbatore",
    to: "Salem",
    img: CoimbatoreSalem,
    tag: "Business Run",
    desc: "Sharp on-time transfers for the textile-city corridor — laptop-friendly, quiet cabins.",
    meta: ["Corporate billing", "Early-morning slots"],
    distance: "≈ 180 km",
    fare: "≈ ₹2,340",
  },
  {
    from: "Trichy",
    to: "Chennai",
    img: TrichyChennai,
    tag: "Homecoming",
    desc: "Our signature home route — rockfort to marina with fares that never surge, day or night.",
    meta: ["Fixed transparent fares", "24×7 availability"],
    distance: "≈ 330 km",
    fare: "≈ ₹4,290",
  },
  {
    from: "Trichy",
    to: "Madurai",
    img: MaduraiTrichy,
    tag: "Temple Run",
    desc: "Meenakshi shrine from Trichy in under three hours — same-day return friendly.",
    meta: ["Same-day return", "Temple-halt timings"],
    distance: "≈ 130 km",
    fare: "≈ ₹1,690",
  },
  {
    from: "Trichy",
    to: "Coimbatore",
    img: ChennaiCoimbatore,
    tag: "Industrial Run",
    desc: "Straight shot to the textile city — crisp departures and quiet, laptop-ready cabins.",
    meta: ["Corporate billing", "On-time promise"],
    distance: "≈ 290 km",
    fare: "≈ ₹3,770",
  },
  {
    from: "Trichy",
    to: "Rameshwaram",
    img: MaduraiRameshwaram,
    tag: "Pilgrim Special",
    desc: "Rameshwaram from Trichy direct — Pamban Bridge sunrise, halt-friendly drivers ready.",
    meta: ["Pamban Bridge drive", "Family & group cabs"],
    distance: "≈ 380 km",
    fare: "≈ ₹4,940",
  },
];

const RouteCard = ({ r, i }) => (
  <Reveal key={`${r.from}-${r.to}`} delay={(i % 3) * 0.1} className="h-full">
    <Motion.div
      {...cardHover}
      className="group relative flex flex-col h-full min-h-[28rem] rounded-[30px] overflow-hidden bg-white/[0.05] backdrop-blur-xl border border-white/10 hover:border-green-500/40 hover:shadow-[0_12px_60px_-16px_rgba(16,185,129,0.35)] transition-all duration-300"
    >
      {/* top accent line */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent z-10" />

      {/* image */}
      <div className="relative h-44 sm:h-48 overflow-hidden shrink-0">
        <img
          src={r.img}
          alt={`${r.from} to ${r.to}`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent" />
        <span className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center">
          <Route size={15} className="text-emerald-300" />
        </span>
        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[9px] font-semibold uppercase tracking-widest">
          {r.tag}
        </span>
      </div>

      {/* body */}
      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <p className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <MapPin size={13} />
          {r.from}
          <ArrowRight size={13} className="text-gray-500" />
          <MapPin size={13} />
          {r.to}
        </p>
        <h3 className="font-display text-2xl font-bold text-white leading-tight mt-1.5">
          {r.from} → {r.to}
        </h3>
        <p className="text-gray-400 text-[13px] leading-relaxed mt-1.5">{r.desc}</p>

        <div className="flex flex-wrap gap-2 mt-3">
          {r.meta.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1 text-[11px] text-gray-300 bg-white/[0.06] border border-white/10 rounded-full px-2.5 py-1"
            >
              <Clock3 size={11} className="text-emerald-400" /> {m}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-3.5 flex-1">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1.5">
            <Wallet size={12} /> {r.fare}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-300 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5">
            <Route size={12} className="text-gray-400" /> {r.distance}
          </span>
        </div>

        {/* action buttons */}
        <div className="flex flex-col xs:flex-row sm:flex-row gap-2.5 mt-4 pt-4 border-t border-white/10">
          <Link
            to={`/routes/${slugOf(r.from, r.to)}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-white/[0.07] border border-white/15 text-sm font-semibold text-white hover:border-emerald-500/50 hover:text-emerald-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] active:scale-[0.98] transition-all"
          >
            <Eye size={15} /> View Details
          </Link>
          <Link
            to="/booking"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] active:scale-[0.98] transition-all"
          >
            Book This Route <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </Motion.div>
  </Reveal>
);

const PopularRoutes = () => (
  <main className="bg-black text-white overflow-x-clip">
    <SEO
      title="Popular Cab Routes — Chennai, Madurai, Bangalore & More"
      description="Top intercity cab routes: Chennai to Bangalore, Madurai, Trichy to Chennai and more. Fixed transparent fares with verified drivers."
      keywords="Chennai to Bangalore cab, Chennai to Madurai taxi, intercity cab Tamil Nadu, popular cab routes"
      path="/popular-routes"
      jsonLd={localBusinessJsonLd}
      breadcrumbs={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Popular Routes", path: "/popular-routes" }])}
    />
    <PageHero
      eyebrow="Popular Routes"
      title="Routes riders love"
      sub="Handpicked corridors served daily by verified GenZRides chauffeurs — transparent fares, zero surge."
      img={hero2}
    />

    <section className="relative py-14 sm:py-20">
      <GlowBlobs />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <SectionHeading
          eyebrow="Top journeys"
          title="Our most-booked routes"
          sub="Tap any card to view route details or start an instant booking."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-stretch">
          {ROUTES.map((r, i) => (
            <RouteCard key={`${r.from}-${r.to}`} r={r} i={i} />
          ))}

          {/* CTA tile */}
          <Reveal delay={0.2} className="h-full">
            <Motion.div
              {...cardHover}
              className="relative flex flex-col justify-center items-start h-full min-h-[28rem] rounded-[30px] bg-gradient-to-br from-green-500/15 to-emerald-600/10 border border-green-500/30 backdrop-blur-lg p-6 sm:p-8 overflow-hidden"
            >
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(34,197,94,0.4)]">
                <Route size={22} className="text-white" />
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                Make Your Own Journey!
              </h3>
              <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                120+ towns served across Tamil Nadu and beyond. If there&apos;s a road, we&apos;ll drive it.
              </p>
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
              >
                Book Custom Trip <ArrowRight size={16} />
              </Link>
            </Motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  </main>
);

export default PopularRoutes;