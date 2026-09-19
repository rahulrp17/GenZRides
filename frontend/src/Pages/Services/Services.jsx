import React from "react";
import SEO from "../../components/SEO"
import { localBusinessJsonLd, breadcrumbJsonLd } from "../../utils/StructuredData";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Building2,
  Plane,
  PlaneTakeoff,
  Mountain,
  KeyRound,
  Repeat,
  ArrowRight,
  CheckCircle2,
  MapPin,
  CalendarCheck,
  CarFront,
} from "lucide-react";
import PageHero from "../../Component/Landing/PageHero";
import {
  Reveal,
  SectionHeading,
  GlowBlobs,
} from "../../Component/Landing/Reveal";
import { cardHover as cardHoverMotion } from "../../Component/Landing/motion";
import {
  AirportPickup,
  AirportDrop,
  RoundTrip,
  hero2,
  hero4,
  SUV,
  sedan,
  innova,
} from "../../assets/images";

const SERVICES = [
  {
    icon: Building2,
    img: hero2,
    name: "One Way",
    tag: "One-Way",
    desc: "Swift doorstep pickups across town — commutes, errands, dinners and nights out with upfront fares and live tracking.",
    points: [
      "Instant booking",
      "Upfront city fares",
      "Live trip tracking",
      "24×7 availability",
    ],
  },
  {
    icon: Repeat,
    img: RoundTrip,
    name: "Round Trips",
    tag: "Return",
    desc: "Go and return on your schedule with the same trusted car and chauffeur waiting for you.",
    points: [
      "Same car both ways",
      "Flexible return timing",
      "Driver bata included options",
      "Multi-day packages",
    ],
  },
  {
    icon: PlaneTakeoff,
    img: AirportPickup,
    name: "Airport Pickup",
    tag: "Arrivals",
    desc: "Land to a waiting chauffeur with meet-and-greet service, flight tracking and zero waiting-time stress.",
    points: [
      "Flight-synced arrival",
      "Meet & greet",
      "Extra luggage space",
      "Toll-inclusive options",
    ],
  },
  {
    icon: Plane,
    img: AirportDrop,
    name: "Airport Drop",
    tag: "Departures",
    desc: "On-time departures with early arrivals, terminal guidance and buffer-planned routing.",
    points: [
      "On-time promise",
      "Terminal drop-off",
      "Early-morning availability",
      "Fixed drop fares",
    ],
  },
  {
    icon: Mountain,
    img: hero4,
    name: "Outstation Trips",
    tag: "Intercity",
    desc: "Temple trails, hill stations and highway escapes in road-trip-ready cars with expert drivers.",
    points: [
      "One-way & round-trip",
      "Ghat-experienced drivers",
      "Transparent per-km tariff",
      "Night-halt clarity",
    ],
  },
  {
    icon: KeyRound,
    img: sedan,
    name: "Hourly Rentals",
    tag: "Chauffeur Packs",
    desc: "A car at your disposal by the hour — shopping, weddings, business days and full itineraries.",
    points: [
      "Hourly chauffeur packs",
      "Multi-stop itineraries",
      "Premium cabin options",
      "Priority support",
    ],
  },
];

const FLEET_STRIP = [
  { img: sedan, name: "Sedan" },
  { img: SUV, name: "SUV " },
  { img: innova, name: "MUV" },
];

const Services = () => (
  <main className="bg-black text-white overflow-x-clip">
    <SEO
      title="Our Cab Services — City, Airport, Outstation & Rentals"
      description="City rides, airport transfers, outstation trips and hourly rentals with verified drivers and upfront fares across Tamil Nadu."
      keywords="cab services, airport transfer taxi, outstation cab booking, hourly car rental with driver"
      path="/services"
        jsonLd={localBusinessJsonLd}
        breadcrumbs={breadcrumbJsonLd([{name:"Home",path:"/"},{name:"Services",path:"/services"}])}
      />
    <PageHero
      eyebrow="Our Services"
      title="Every trip, perfected"
      sub="Six signature services, one promise — a premium car with a professional chauffeur, booked in under a minute."
      img={hero2}
    />

    {/* Service details */}
    <section className="relative py-16 md:py-24">
      <GlowBlobs />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 space-y-8 md:space-y-12">
        {SERVICES.map((s, i) => (
          <Reveal key={s.name}>
            <div className="grid lg:grid-cols-2 gap-0 bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 overflow-hidden hover:border-green-500/30 transition-colors">
              <div
                className={`relative h-64 sm:h-80 lg:h-auto overflow-hidden ${i % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <img
                  src={s.img}
                  alt={s.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:bg-gradient-to-r" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-green-500/40 text-green-400 text-[11px] font-semibold uppercase tracking-widest">
                  {s.tag}
                </span>
              </div>
              <div className="p-7 sm:p-10 flex flex-col justify-center">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-green-500/25 to-emerald-600/25 border border-green-500/30 flex items-center justify-center mb-5">
                  <s.icon size={26} className="text-green-400" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {s.name}
                </h2>
                <p className="mt-3 text-gray-400 leading-relaxed">{s.desc}</p>
                <ul className="grid sm:grid-cols-2 gap-2.5 mt-5">
                  {s.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2 text-sm text-gray-300"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-green-400 shrink-0"
                      />{" "}
                      {p}
                    </li>
                  ))}
                </ul>
                <Link to="/booking" className="mt-6 w-fit">
                  <Motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
                  >
                    Book {s.name} <ArrowRight size={16} />
                  </Motion.button>
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>

    {/* Fleet strip */}
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <SectionHeading
          eyebrow="Matched Fleet"
          title="The right car for every service"
          sub="Sedans for the city, spacious MUVs for the highway — all air-conditioned and chauffeur-driven."
        />
        <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 max-w-7xl mx-auto">
          {FLEET_STRIP.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.1}>
              <Motion.div
                {...cardHoverMotion}
                className="group relative h-64 sm:h-72 rounded-[30px] overflow-hidden border border-white/10 hover:border-green-500/40 transition-colors"
              >
                <img
                  src={f.img}
                  alt={f.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <p className="absolute bottom-5 left-6 font-display text-2xl font-bold text-white">
                  {f.name}
                </p>
              </Motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Process */}
    <section className="relative py-16 md:py-24">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <SectionHeading
          eyebrow="How it works"
          title="Book any service in 3 steps"
        />
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: MapPin,
              t: "Tell us where",
              d: "Enter pickup and drop with smart address suggestions.",
            },
            {
              icon: CalendarCheck,
              t: "Pick your service",
              d: "Choose the service, car and schedule that fits.",
            },
            {
              icon: CarFront,
              t: "Ride in comfort",
              d: "Track your chauffeur live and arrive relaxed.",
            },
          ].map((s, i) => (
            <Reveal key={s.t} delay={i * 0.1}>
              <div className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-7 text-center h-full">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(34,197,94,0.4)]">
                  <s.icon size={24} className="text-white" />
                </div>
                <p className="text-xs font-bold text-green-400 tracking-widest mb-1">
                  STEP {i + 1}
                </p>
                <h3 className="font-display text-xl font-bold text-white">
                  {s.t}
                </h3>
                <p className="text-gray-400 text-sm mt-2">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="text-center mt-10">
          <Link to="/booking">
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-[0_0_35px_rgba(34,197,94,0.55)] transition-all"
            >
              Book Your Ride <ArrowRight size={19} />
            </Motion.button>
          </Link>
        </Reveal>
      </div>
    </section>
  </main>
);

export default Services;
