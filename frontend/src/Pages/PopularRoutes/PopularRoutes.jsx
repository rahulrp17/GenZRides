import React from "react";
import SEO from "../../components/SEO";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Clock3, Route } from "lucide-react";
import PageHero from "../../Component/Landing/PageHero";
import { Reveal, SectionHeading, GlowBlobs } from "../../Component/Landing/Reveal";
import { cardHover } from "../../Component/Landing/motion";
import { hero2,  MaduraiRameshwaram, CoimbatoreSalem, ChennaiBangalore, ChennaiMadurai, TrichyChennai } from "../../assets/images";

const ROUTES = [
  {
    from: "Chennai",
    to: "Bangalore",
    img: ChennaiBangalore,
    tag: "Most Booked",
    desc: "India's favourite tech-corridor run — smooth NH-48 cruising with Wi-Fi-ready sedans and SUVs.",
    meta: ["One-way & round-trip", "Airport pickup available"],
  },
  {
    from: "Chennai",
    to: "Madurai",
    img: ChennaiMadurai,
    tag: "Temple Trail",
    desc: "Ride down to the temple city in air-conditioned comfort with experienced highway chauffeurs.",
    meta: ["Temple tour friendly", "Night departures available"],
  },
  {
    from: "Madurai",
    to: "Rameshwaram",
    img: MaduraiRameshwaram,
    tag: "Pilgrim Special",
    desc: "A serene coastal pilgrimage with doorstep pickup, patient drivers and flexible temple-halt timings.",
    meta: ["Halt-friendly trips", "Family & group cabs"],
  },
  {
    from: "Coimbatore",
    to: "Salem",
    img: CoimbatoreSalem,
    tag: "Business Run",
    desc: "Sharp on-time transfers for the textile-city corridor — laptop-friendly, quiet cabins.",
    meta: ["Corporate billing", "Early-morning slots"],
  },
  {
    from: "Trichy",
    to: "Chennai",
    img: TrichyChennai,
    tag: "Homecoming",
    desc: "Our signature home route — rockfort to marina with fares that never surge, day or night.",
    meta: ["Fixed transparent fares", "24×7 availability"],
  },
];

const PopularRoutes = () => (
  <main className="bg-black text-white overflow-x-clip">
    <SEO
      title="Popular Cab Routes — Chennai, Madurai, Bangalore & More"
      description="Top intercity cab routes: Chennai to Bangalore, Madurai, Trichy to Chennai and more. Fixed transparent fares with verified drivers."
      keywords="Chennai to Bangalore cab, Chennai to Madurai taxi, intercity cab Tamil Nadu, popular cab routes"
      path="/popular-routes"
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
          eyebrow="Top 5"
          title="Our most-booked journeys"
          sub="Tap any route to start an instant booking."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {ROUTES.map((r, i) => (
            <Reveal key={`${r.from}-${r.to}`} delay={(i % 3) * 0.1} className={i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}>
              <Motion.div
                {...cardHover}
                className="group relative h-96 sm:h-[26rem] rounded-[30px] overflow-hidden bg-white/5 border border-white/10"
              >
                <img
                  src={r.img}
                  alt={`${r.from} to ${r.to}`}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-green-500/40 text-green-400 text-[11px] font-semibold uppercase tracking-widest">
                  {r.tag}
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <p className="flex items-center gap-1.5 text-green-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
                    <MapPin size={13} /> {r.from}
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {r.to}
                  </h3>
                  <p className="text-gray-300 text-sm mt-2 leading-relaxed">{r.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {r.meta.map((m) => (
                      <span key={m} className="inline-flex items-center gap-1 text-[11px] text-gray-300 bg-white/10 border border-white/10 rounded-full px-2.5 py-1">
                        <Clock3 size={11} className="text-green-400" /> {m}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <Link
                      to={`/routes/${r.from.toLowerCase()}-to-${r.to.toLowerCase()}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-400 hover:text-green-300 transition-colors"
                    >
                      View details
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      to="/booking"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-white group-hover:text-green-300 transition-colors"
                    >
                      Book this route
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
              className="h-96 sm:h-[26rem] rounded-[30px] bg-gradient-to-br from-green-500/15 to-emerald-600/10 border border-green-500/30 backdrop-blur-lg p-6 sm:p-8 flex flex-col justify-center items-start"
            >
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(34,197,94,0.4)]">
                <Route size={22} className="text-white" />
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                Going somewhere else?
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
