import React from "react";
import SEO from "../../components/SEO";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plane, ArrowRight, Radar, Luggage, Clock3, BadgeCheck } from "lucide-react";
import PageHero from "../../Component/Landing/PageHero";
import { Reveal, SectionHeading, GlowBlobs } from "../../Component/Landing/Reveal";
import { cardHover } from "../../Component/Landing/motion";
import { CoimbatoreAirport, TrichyAirport, MaduraiAirport, hero4, hero10,  } from "../../assets/images";

const AIRPORTS = [
  {
    city: "Chennai",
    code: "MAA",
    img: hero10,
    tag: "Busiest Hub",
    desc: "Flight-tracked pickups with meet-and-greet service at both terminals, day and night.",
  },
  {
    city: "Bangalore",
    code: "BLR",
    img: hero4,
    tag: "Tech Corridor",
    desc: "KIAB transfers timed to your landing — your chauffeur waits, even when flights don't.",
  },
  {
    city: "Coimbatore",
    code: "CJB",
    img: CoimbatoreAirport,
    tag: "On-Time Promise",
    desc: "Early-morning and late-night CJB runs with buffer-planned routing and terminal drop-off.",
  },
  {
    city: "Trichy",
    code: "TRZ",
    img: TrichyAirport,
    tag: "Home Base",
    desc: "Our home airport — the fastest airport pickups in the city, guaranteed.",
  },
  {
    city: "Madurai",
    code: "IXM",
    img: MaduraiAirport,
    tag: "Temple Gateway",
    desc: "Land and glide straight to the temple city or onward to Rameshwaram.",
  },
];

const PERKS = [
  { icon: Radar, title: "Flight Tracking", desc: "We monitor delays and adjust pickup automatically." },
  { icon: Luggage, title: "Extra Luggage Room", desc: "SUVs and MUVs for heavy baggage, no extra fuss." },
  { icon: Clock3, title: "Zero Wait Stress", desc: "45 minutes of complimentary waiting on pickups." },
  { icon: BadgeCheck, title: "Meet & Greet", desc: "Name-board reception at the arrival gate on request." },
];

const AirportTransfers = () => (
  <main className="bg-black text-white overflow-x-clip">
    <SEO
      title="Airport Taxi Transfers — Chennai, Bangalore, Coimbatore & More"
      description="Flight-tracked airport pickups and drops at MAA, BLR, CJB, TRZ and IXM. Meet-and-greet, 45 min free waiting, 24/7 service."
      keywords="Chennai airport taxi, Bangalore airport cab, airport pickup drop taxi, flight tracking cab"
      path="/airport-transfers"
    />
    <PageHero
      eyebrow="Airport Transfers"
      title="Never miss a flight again"
      sub="Flight-synced airport taxis across Tamil Nadu and Bangalore — early arrivals, zero waiting-time stress."
      img={hero10}
    />

    <section className="relative py-14 sm:py-20">
      <GlowBlobs />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <SectionHeading
          eyebrow="Airports Served"
          title="Five airports, one standard"
          sub="The same premium pickup experience at every terminal."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {AIRPORTS.map((a, i) => (
            <Reveal key={a.code} delay={(i % 3) * 0.1}>
              <Motion.div
                {...cardHover}
                className="group relative h-80 sm:h-96 rounded-[30px] overflow-hidden bg-white/5 border border-white/10"
              >
                <img
                  src={a.img}
                  alt={`${a.city} Airport taxi`}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-widest">
                    {a.code}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-green-500/40 text-green-400 text-[11px] font-semibold uppercase tracking-widest">
                    {a.tag}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <p className="flex items-center gap-1.5 text-green-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
                    <Plane size={13} /> {a.city} Airport Taxi
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">{a.desc}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <Link
                      to={`/airport/${a.city.toLowerCase()}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                    >
                      View details
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      to="/booking"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-white group-hover:text-green-300 transition-colors"
                    >
                      Book airport cab
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </Motion.div>
            </Reveal>
          ))}

          {/* CTA tile */}
          <Reveal delay={0.2}>
            <Motion.div
              {...cardHover}
              className="h-80 sm:h-96 rounded-[30px] bg-gradient-to-br from-green-500/15 to-emerald-600/10 border border-green-500/30 backdrop-blur-lg p-6 sm:p-8 flex flex-col justify-center items-start"
            >
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(34,197,94,0.4)]">
                <Plane size={22} className="text-white" />
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                Flying tonight?
              </h3>
              <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                Red-eye arrivals and 4 AM departures are our specialty. Book in under a minute.
              </p>
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
              >
                Book Now <ArrowRight size={16} />
              </Link>
            </Motion.div>
          </Reveal>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mt-10 md:mt-14">
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="bg-white/5 backdrop-blur-lg rounded-[24px] border border-white/10 p-5 sm:p-6 h-full hover:border-green-500/40 transition-colors">
                <p.icon size={24} className="text-green-400 mb-3" />
                <h3 className="font-display text-lg font-bold text-white">{p.title}</h3>
                <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default AirportTransfers;
