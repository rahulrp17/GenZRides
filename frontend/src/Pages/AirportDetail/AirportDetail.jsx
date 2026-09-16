import React from "react";
import SEO from "../../components/SEO"
import { localBusinessJsonLd, breadcrumbJsonLd } from "../../utils/StructuredData";
import { motion as Motion } from "framer-motion";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  Plane,
  ArrowRight,
  ArrowLeft,
  Radar,
  Luggage,
  Clock3,
  BadgeCheck,
  Phone,
} from "lucide-react";
import PageHero from "../../Component/Landing/PageHero";
import { Reveal, SectionHeading, GlowBlobs } from "../../Component/Landing/Reveal";
import { cardHover } from "../../Component/Landing/motion";
import { CoimbatoreAirport, TrichyAirport, MaduraiAirport,  ChennaiAirport, BangaloreAirport } from "../../assets/images";

const AIRPORTS = {
  chennai: {
    city: "Chennai",
    code: "MAA",
    img: ChennaiAirport,
    tag: "Busiest Hub",
    desc: "Flight-tracked pickups with meet-and-greet service at both terminals, day and night.",
    points: ["Flight delay auto-tracking", "Meet & greet at arrivals", "45 min free waiting", "Sedan to SUV fleet"],
  },
  bangalore: {
    city: "Bangalore",
    code: "BLR",
    img: BangaloreAirport,
    tag: "Tech Corridor",
    desc: "KIAB transfers timed to your landing — your chauffeur waits, even when flights don't.",
    points: ["KIAB terminal expertise", "Red-eye arrival specialists", "Corporate billing", "Extra luggage room"],
  },
  coimbatore: {
    city: "Coimbatore",
    code: "CJB",
    img: CoimbatoreAirport,
    tag: "On-Time Promise",
    desc: "Early-morning and late-night CJB runs with buffer-planned routing and terminal drop-off.",
    points: ["Buffer-planned routing", "4 AM departure ready", "Fixed drop fares", "Quiet work cabins"],
  },
  trichy: {
    city: "Trichy",
    code: "TRZ",
    img: TrichyAirport,
    tag: "Home Base",
    desc: "Our home airport — the fastest airport pickups in the city, guaranteed.",
    points: ["Fastest city pickups", "Local chauffeurs", "Temple-town onward trips", "24×7 dispatch"],
  },
  madurai: {
    city: "Madurai",
    code: "IXM",
    img: MaduraiAirport,
    tag: "Temple Gateway",
    desc: "Land and glide straight to the temple city or onward to Rameshwaram.",
    points: ["Onward pilgrim trips", "Family & group cabs", "Patient temple-halt drivers", "Upfront fares"],
  },
};

const PERKS = [
  { icon: Radar, title: "Flight Tracking", desc: "We monitor delays and adjust pickup automatically." },
  { icon: Luggage, title: "Extra Luggage Room", desc: "SUVs and MUVs for heavy baggage, no extra fuss." },
  { icon: Clock3, title: "Zero Wait Stress", desc: "45 minutes of complimentary waiting on pickups." },
  { icon: BadgeCheck, title: "Meet & Greet", desc: "Name-board reception at the arrival gate on request." },
];

const CODE_TO_CITY = { maa: "chennai", blr: "bangalore", cjb: "coimbatore", trz: "trichy", ixm: "madurai" };

const AirportDetail = () => {
  const { code } = useParams();
  const key = (code || "").toLowerCase();
  const airport = AIRPORTS[key] || AIRPORTS[CODE_TO_CITY[key]];

  if (!airport) return <Navigate to="/airport-transfers" replace />;

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO
        title={`${airport.city} Airport Taxi (${airport.code}) — Pickup & Drop`}
        description={`Flight-tracked ${airport.city} airport (${airport.code}) taxi pickups and drops with meet-and-greet, 45 min free waiting and 24/7 service.`}
        keywords={`${airport.city.toLowerCase()} airport taxi, ${airport.code} airport cab pickup, airport transfer Tamil Nadu`}
        path={`/airport/${airport.city.toLowerCase()}`}
        jsonLd={localBusinessJsonLd}
        breadcrumbs={breadcrumbJsonLd([{name:"Home",path:"/"},{name:"Airport Transfers",path:"/airport-transfers"},{name:airport.city,path:`/airport/${airport.city.toLowerCase()}`}])}
      />
      <PageHero
        eyebrow={`${airport.city} Airport (${airport.code})`}
        title={`${airport.city} Airport Taxi`}
        sub={airport.desc}
        img={airport.img}
      />

      <section className="relative py-14 sm:py-20">
        <GlowBlobs />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <Link to="/airport-transfers" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 mb-8 transition-colors">
            <ArrowLeft size={16} /> All airport transfers
          </Link>

          <div className="grid lg:grid-cols-2 gap-5 md:gap-6 mb-7 items-stretch">
            <Reveal>
              <Motion.div
                {...cardHover}
                className="relative h-72 sm:h-96 lg:h-full lg:min-h-[440px] rounded-[30px] overflow-hidden border border-white/10"
              >
                <img
                  src={airport.img}
                  alt={`${airport.city} airport transfer`}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-widest">
                    {airport.code}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-green-500/40 text-green-400 text-[11px] font-semibold uppercase tracking-widest">
                    {airport.tag}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <p className="flex items-center gap-2 text-white font-display text-xl sm:text-2xl font-bold">
                    <Plane size={20} className="text-green-400 shrink-0" /> {airport.city} Airport
                  </p>
                </div>
              </Motion.div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="h-full bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-6 sm:p-8 flex flex-col">
                <span className="inline-flex items-center gap-1.5 text-green-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                  <Plane size={14} /> What&apos;s included
                </span>
                <ul className="space-y-3.5 flex-1">
                  {airport.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm sm:text-[15px] text-gray-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Link to="/booking" className="flex-1">
                    <Motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
                    >
                      Book Airport Cab <ArrowRight size={16} />
                    </Motion.button>
                  </Link>
                  <a href="tel:+91934830199" className="flex-1">
                    <Motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/5 border border-white/15 text-white text-sm font-semibold hover:border-green-500/50 hover:text-green-300 transition-all"
                    >
                      <Phone size={16} /> Call Us
                    </Motion.button>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          <SectionHeading
            eyebrow="Every Transfer"
            title="The airport standard"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 gap-4 md:gap-5 -mt-4">
            {PERKS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.07}>
                <div className="bg-white/5 backdrop-blur-lg rounded-[24px] border border-white/10 p-5 sm:p-6 h-full hover:border-green-500/40 transition-colors">
                  <p.icon size={24} className="text-green-400 mb-3" />
                  <h3 className="font-display text-lg font-bold text-white">{p.title}</h3>
                  <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <SectionHeading
            eyebrow="More Airports"
            title="Other airport transfers"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 -mt-4">
            {Object.entries(AIRPORTS)
              .filter(([key]) => key !== (code || "").toLowerCase())
              .slice(0, 4)
              .map(([key, a], i) => (
                <Reveal key={key} delay={i * 0.07}>
                  <Link to={`/airport/${key}`}>
                    <Motion.div
                      {...cardHover}
                      className="group relative h-44 sm:h-52 rounded-[24px] overflow-hidden border border-white/10"
                    >
                      <img
                        src={a.img}
                        alt={`${a.city} airport`}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between gap-2">
                        <p className="font-display text-base sm:text-lg font-bold text-white">
                          {a.city} <span className="text-gray-400 text-xs font-semibold">{a.code}</span>
                        </p>
                        <ArrowRight size={17} className="text-green-400 shrink-0 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Motion.div>
                  </Link>
                </Reveal>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AirportDetail;
export { AIRPORTS };
