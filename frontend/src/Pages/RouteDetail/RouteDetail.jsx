import React from "react";
import SEO from "../../components/SEO";
import { motion as Motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  Clock3,
  Route as RouteIcon,
  Wallet,
  ShieldCheck,
  CarFront,
  Phone,
} from "lucide-react";
import PageHero from "../../Component/Landing/PageHero";
import {
  Reveal,
  SectionHeading,
  GlowBlobs,
} from "../../Component/Landing/Reveal";
import { cardHover } from "../../Component/Landing/motion";
import {
  MaduraiTrichy,
  MaduraiRameshwaram,
  ChennaiBangalore,
  ChennaiMadurai,
  TrichyChennai,
  CoimbatoreSalem,
} from "../../assets/images";
const ROUTES = {
  "trichy-to-chennai": {
    from: "Trichy",
    to: "Chennai",
    img: TrichyChennai,
    tag: "Homecoming",
    distance: "≈ 330 km",
    duration: "≈ 6 hrs",
    startFare: "≈ ₹4,290",
    desc: "Our signature home route — rockfort to marina with fares that never surge, day or night.",
    highlights: [
      "Fixed transparent fares",
      "24×7 availability",
      "Airport pickup available",
      "One-way & round-trip",
    ],
  },
  "madurai-to-trichy": {
    from: "Madurai",
    to: "Trichy",
    img: MaduraiTrichy,
    tag: "Temple Connector",
    desc: "A quick temple-town hop between Madurai's Meenakshi shrine and Trichy's Rockfort in air-conditioned comfort.",
    distance: "≈ 135 km",
    duration: "≈ 2.5 hrs",
    startFare: "≈ ₹1,760",
    highlights: [
      "Same-day return friendly",
      "Temple-halt timings",
      "Family & group cabs",
      "Upfront fares",
    ],
  },
  "chennai-to-bangalore": {
    from: "Chennai",
    to: "Bangalore",
    img: ChennaiBangalore,
    tag: "Most Booked",
    desc: "India's favourite tech-corridor run — smooth NH-48 cruising with Wi-Fi-ready sedans and SUVs.",
    distance: "≈ 350 km",
    duration: "≈ 6.5 hrs",
    startFare: "≈ ₹4,550",
    highlights: [
      "One-way & round-trip",
      "Airport pickup available",
      "Corporate billing",
      "Night departures",
    ],
  },
  "chennai-to-madurai": {
    from: "Chennai",
    to: "Madurai",
    img: ChennaiMadurai,
    tag: "Temple Trail",
    desc: "Ride down to the temple city in air-conditioned comfort with experienced highway chauffeurs.",
    distance: "≈ 460 km",
    duration: "≈ 7.5 hrs",
    startFare: "≈ ₹5,980",
    highlights: [
      "Temple tour friendly",
      "Night departures available",
      "Spacious SUVs on request",
      "Upfront fares",
    ],
  },
  "madurai-to-rameshwaram": {
    from: "Madurai",
    to: "Rameshwaram",
    img: MaduraiRameshwaram,
    tag: "Pilgrim Special",
    desc: "A serene coastal pilgrimage with doorstep pickup, patient drivers and flexible temple-halt timings.",
    distance: "≈ 170 km",
    duration: "≈ 3.5 hrs",
    startFare: "≈ ₹2,210",
    highlights: [
      "Halt-friendly trips",
      "Family & group cabs",
      "Pamban Bridge drive",
      "Same-day return",
    ],
  },
  "coimbatore-to-salem": {
    from: "Coimbatore",
    to: "Salem",
    img: CoimbatoreSalem,
    tag: "Business Run",
    desc: "Sharp on-time transfers for the textile-city corridor — laptop-friendly, quiet cabins.",
    distance: "≈ 180 km",
    duration: "≈ 3.5 hrs",
    startFare: "≈ ₹2,340",
    highlights: [
      "Corporate billing",
      "Early-morning slots",
      "Quiet work cabins",
      "On-time promise",
    ],
  },
};

const RouteDetail = () => {
  const { slug } = useParams();
  const route = ROUTES[slug];

  if (!route)
    return (
      <>
        <SEO noindex title="Route Not Found" path={`/routes/${slug}`} />
        <div className="min-h-[60vh] bg-black flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-bold text-white">Route not found</h1>
          <p className="text-gray-400 mt-2">We couldn’t find that route.</p>
          <Link
            to="/popular-routes"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold"
          >
            Popular Routes <ArrowRight size={16} />
          </Link>
        </div>
      </>
    );

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.genzrides.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Popular Routes",
        item: "https://www.genzrides.com/popular-routes",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${route.from} to ${route.to}`,
        item: `https://www.genzrides.com/routes/${slug}`,
      },
    ],
  };

  const routeServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `https://www.genzrides.com/routes/${slug}/#service`,
    name: `${route.from} to ${route.to} Cab`,
    description: route.desc,
    serviceType: "Intercity TaxiService",
    provider: { "@type": "LocalBusiness", name: "GenZRides" },
    areaServed: [
      { "@type": "City", name: route.from },
      { "@type": "City", name: route.to },
    ],
  };

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO
        title={`${route.from} to ${route.to} Cab — Fixed-Fare Taxi`}
        description={`Book a ${route.from.toLowerCase()} to ${route.to.toLowerCase()} cab with verified drivers, transparent fixed fares and 24/7 support. One-way and round-trip available.`}
        keywords={`${route.from.toLowerCase()} to ${route.to.toLowerCase()} cab, ${route.from.toLowerCase()} to ${route.to.toLowerCase()} taxi fare, intercity cab Tamil Nadu`}
        path={`/routes/${slug}`}
        jsonLd={routeServiceJsonLd}
        breadcrumbs={breadcrumbJsonLd}
      />
      <PageHero
        eyebrow={`${route.from} → ${route.to}`}
        title={`${route.from} to ${route.to}`}
        sub={route.desc}
        img={route.img}
      />

      <section className="relative py-14 sm:py-20">
        <GlowBlobs />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <Link
            to="/popular-routes"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> All popular routes
          </Link>

          {/* At-a-glance */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10 md:mb-14">
            {[
              { icon: RouteIcon, label: "Distance", value: route.distance },
              { icon: Clock3, label: "Duration", value: route.duration },
              {
                icon: Wallet,
                label: "Sedan Starting At",
                value: route.startFare,
              },
              { icon: ShieldCheck, label: "Fare Promise", value: "No Surge" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.07}>
                <div className="bg-white/5 backdrop-blur-lg rounded-[24px] border border-white/10 p-5 sm:p-6 text-center h-full hover:border-green-500/40 transition-colors">
                  <s.icon size={22} className="text-green-400 mx-auto mb-2.5" />
                  <p className="font-display text-lg sm:text-2xl font-bold text-white">
                    {s.value}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-5 md:gap-6 mb-10 md:mb-14 items-stretch">
            {/* Route visual */}
            <Reveal>
              <Motion.div
                {...cardHover}
                className="relative h-72 sm:h-96 lg:h-full lg:min-h-[420px] rounded-[30px] overflow-hidden border border-white/10"
              >
                <img
                  src={route.img}
                  alt={`${route.from} to ${route.to}`}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-green-500/40 text-green-400 text-[11px] font-semibold uppercase tracking-widest">
                  {route.tag}
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <p className="flex items-center gap-2 text-sm sm:text-base text-gray-200">
                    <MapPin size={16} className="text-green-400 shrink-0" />{" "}
                    {route.from}
                    <ArrowRight
                      size={16}
                      className="text-green-400 shrink-0"
                    />{" "}
                    {route.to}
                  </p>
                </div>
              </Motion.div>
            </Reveal>

            {/* Highlights + booking */}
            <Reveal delay={0.1}>
              <div className="h-full bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-6 sm:p-8 flex flex-col">
                <span className="inline-flex items-center gap-1.5 text-green-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                  <CarFront size={14} /> Why ride this route with us
                </span>
                <ul className="space-y-3.5 flex-1">
                  {route.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2.5 text-sm sm:text-[15px] text-gray-300 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-5">
                  Fares approx from Sedan ₹15/km tariff. Tolls &amp; permits
                  extra at actuals.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                  <Link to="/booking" className="flex-1">
                    <Motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
                    >
                      Book This Route <ArrowRight size={16} />
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

          {/* Other routes */}
          <SectionHeading
            eyebrow="Keep Exploring"
            title="More popular routes"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 -mt-4">
            {Object.entries(ROUTES)
              .filter(([key]) => key !== slug)
              .slice(0, 3)
              .map(([key, r], i) => (
                <Reveal key={key} delay={i * 0.08}>
                  <Link to={`/routes/${key}`}>
                    <Motion.div
                      {...cardHover}
                      className="group relative h-52 sm:h-60 rounded-[24px] overflow-hidden border border-white/10"
                    >
                      <img
                        src={r.img}
                        alt={`${r.from} to ${r.to}`}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between gap-2">
                        <p className="font-display text-lg sm:text-xl font-bold text-white">
                          {r.from} → {r.to}
                        </p>
                        <ArrowRight
                          size={18}
                          className="text-green-400 shrink-0 transition-transform group-hover:translate-x-1"
                        />
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

export default RouteDetail;
export { ROUTES };
