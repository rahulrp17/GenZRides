import React, { useState } from "react";
import SEO from "../../components/SEO";
import { motion as Motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  CarFront,
  ShieldCheck,
  BadgeDollarSign,
  MapPinned,
  Clock3,
  IndianRupee,
  ArrowRight,
  Building2,
  Plane,
  Mountain,
  KeyRound,
  Users,
  Luggage,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { vehicleAPI } from "../../services/endpoints";
import { sedan, innova } from "../../assets/images";
import PageHero from "../../Component/Landing/PageHero";
import { Reveal, SectionHeading, GlowBlobs } from "../../Component/Landing/Reveal";
import { cardHover } from "../../Component/Landing/motion";
import { hero4 } from "../../assets/images";


const tariffData = [
  {
    id: 1,
    title: "Sedan",
    price: "₹15/km",
    icon: <CarFront size={34} />,
    color: "from-green-500 to-emerald-700",
    features: [
      "Comfortable 4 Seater",
      "AC Included",
      "Fuel Included",
      "Driver Bata Extra",
    ],
  },
  {
    id: 2,
    title: "SUV",
    price: "₹20/km",
    icon: <ShieldCheck size={34} />,
    color: "from-blue-500 to-indigo-700",
    features: [
      "Spacious 7 Seater",
      "Luxury Interior",
      "Extra Luggage Space",
      "Perfect For Family Trips",
    ],
  },
  {
    id: 3,
    title: "Innova Crysta",
    price: "₹21/km",
    icon: <BadgeDollarSign size={34} />,
    color: "from-yellow-500 to-orange-600",
    features: [
      "Premium 7 Seater",
      "Premium AC",
      "Extra Luggage Space",
      "Luxurious Interior",
    ],
  },
];

const notes = [
  {
    icon: <MapPinned />,
    text: "Toll fees & interstate permits are extra.",
  },
  {
    icon: <Clock3 />,
    text: "Waiting charge ₹2.5/min after 30 mins.",
  },
  {
    icon: <IndianRupee />,
    text: "Driver bata ₹400/day for round trips.",
  },
];

const PACKAGES = [
  {
    icon: Building2,
    name: "City Rides",
    desc: "Point-to-point travel within the city with upfront per-km fares.",
    plans: ["Sedan ₹15/km", "SUV ₹20/km", "Premium ₹25/km"],
  },
  {
    icon: Plane,
    name: "Airport Transfers",
    desc: "Fixed, flight-synced pickups and drops with meet-and-greet service.",
    plans: ["Sedan ₹15/km", "SUV ₹20/km", "Premium ₹25/km"],
  },
  {
    icon: Mountain,
    name: "Outstation",
    desc: "One-way and round-trip intercity journeys in highway-ready cars.",
    plans: ["Sedan ₹15/km", "SUV ₹20/km", "Premium ₹25/km"],
  },
  {
    icon: KeyRound,
    name: "Rentals / Hourly",
    desc: "Chauffeur packs by the hour for shopping, events and full-day plans.",
    plans: ["Sedan ₹15/km", "SUV ₹20/km", "Premium ₹25/km"],
  },
];

const imageForVehicle = (vehicle, fallback) => {
  if (vehicle?.image) return vehicle.image;
  const name = (vehicle?.name || fallback || "").toLowerCase();
  if (name.includes("innova") || name.includes("suv") || name.includes("ertiga"))
    return innova;
  return sedan;
};

const TariffChart = () => {
  const [activeCard, setActiveCard] = useState(1);

  const { data: liveData } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await vehicleAPI.getAll();
      return data;
    },
  });
  const liveVehicles = (liveData?.vehicles || []).filter((v) => v.isActive !== false);

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO
        title="Cab Tariff Chart — Sedan, SUV & Premium Per-Km Fares"
        description="Transparent cab tariff: Sedan from ₹15/km, SUV ₹20/km, Innova ₹21/km. No hidden charges. City, airport, outstation and rental fares."
        keywords="cab tariff, taxi fare per km Tamil Nadu, sedan SUV fare rates, outstation taxi price"
        path="/tariff"
      />
      <PageHero
        eyebrow="Transparent Pricing"
        title="Cab Tariff Plans"
        sub="Affordable pricing with no hidden charges. Choose your perfect ride for city, airport, and outstation travel."
        img={hero4}
      />
       {/* Live fleet pricing (backend data, static fallback) */}
      <section className="relative py-14 md:py-20 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden">
        <GlowBlobs />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeading
            eyebrow="Live Fleet Fares"
            title="Straight from our tariff engine"
            sub="Base fares and per-km rates exactly as configured for each vehicle."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {(liveVehicles.length > 0
              ? liveVehicles.map((v) => ({
                  key: v._id,
                  name: v.name,
                  img: imageForVehicle(v),
                  oneWayBase: v.oneWayBaseFare,
                  roundTripBase: v.roundTripBaseFare,
                  oneWayPerKm: v.oneWayPerKm,
                  roundTripPerKm: v.roundTripPerKm ?? null,
                  oneWayBaseKm: v.oneWayBaseKm ?? 0,
                  roundTripBaseKm: v.roundTripBaseKm ?? 0,
                  seats: v.seats,
                  luggage: v.luggage,
                }))
              : tariffData.map((t) => ({
                  key: t.id,
                  name: t.title,
                  img: imageForVehicle({ name: t.title }),
                  oneWayBase: null,
                  roundTripBase: null,
                  oneWayPerKm: t.price.replace("/km", ""),
                  roundTripPerKm: null,
                  oneWayBaseKm: 0,
                  roundTripBaseKm: 0,
                  seats: null,
                  luggage: null,
                }))
            ).map((row, i) => (
              <Reveal key={row.key} delay={(i % 3) * 0.1}>
                <Motion.div
                  whileHover={{ y: -8, scale: 1.02, borderColor: "#22c55e" }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="group relative bg-white/[0.04] backdrop-blur-xl rounded-[30px] border border-white/[0.08] overflow-hidden hover:shadow-[0_8px_40px_rgba(34,197,94,0.12)] transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-44 sm:h-48 overflow-hidden">
                    <img
                      src={row.img}
                      alt={`${row.name} cab tariff Tamil Nadu ${row.oneWayPerKm}/km`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Name overlay */}
                    <div className="absolute bottom-4 left-5 right-5">
                      <p className="font-display text-xl font-bold text-white drop-shadow-lg">
                        {row.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {row.seats != null && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-300">
                            <Users size={12} className="text-green-400" /> {row.seats} seats
                          </span>
                        )}
                        {row.luggage != null && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-300">
                            <Luggage size={12} className="text-green-400" /> {row.luggage} bags
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing card */}
                  <div className="p-5 sm:p-6">
                    {row.oneWayBase != null ? (
                      <div className="space-y-3">
                        {/* One-way */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">One-Way</p>
                            <p className="font-display text-xl font-bold text-white">
                              ₹{row.oneWayBase?.toLocaleString('en-IN')}
                              <span className="text-xs font-medium text-gray-400 ml-1.5">base</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">per km</p>
                            <p className="font-display text-lg font-bold text-green-400">₹{row.oneWayPerKm}</p>
                          </div>
                        </div>
                        {row.oneWayBaseKm > 0 && (
                          <p className="text-[11px] text-gray-500">Includes {row.oneWayBaseKm} km</p>
                        )}

                        {/* Divider */}
                        <div className="border-t border-white/[0.06]" />

                        {/* Round-trip */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">Round-Trip</p>
                            <p className="font-display text-xl font-bold text-white">
                              ₹{row.roundTripBase?.toLocaleString('en-IN')}
                              <span className="text-xs font-medium text-gray-400 ml-1.5">base</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">per km</p>
                            <p className="font-display text-lg font-bold text-emerald-400">₹{row.roundTripPerKm ?? row.oneWayPerKm}</p>
                          </div>
                        </div>
                        {row.roundTripBaseKm > 0 && (
                          <p className="text-[11px] text-gray-500">Includes {row.roundTripBaseKm} km</p>
                        )}
                      </div>
                    ) : (
                      /* Static fallback — single rate */
                      <div className="text-center">
                        <p className="font-display text-2xl font-bold text-green-400">
                          ₹{row.oneWayPerKm}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">per km</p>
                      </div>
                    )}

                    {/* Book CTA */}
                    <Link to="/booking" className="block mt-4">
                      <Motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 text-sm font-semibold hover:from-green-500/30 hover:to-emerald-500/30 hover:text-white hover:border-green-500/50 transition-all duration-200"
                      >
                        Book Now
                      </Motion.button>
                    </Link>
                  </div>
                </Motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="relative py-14 md:py-20">
        <GlowBlobs />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeading
            eyebrow="Packages"
            title="One tariff, every journey"
            sub="The same honest per-km rates across city rides, airport transfers, outstation trips and rentals."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PACKAGES.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08}>
                <Motion.div
                  {...cardHover}
                  className="h-full bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-7 hover:border-green-500/40 hover:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition-colors"
                >
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-green-500/25 to-emerald-600/25 border border-green-500/30 flex items-center justify-center mb-5">
                    <p.icon size={26} className="text-green-400" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">{p.name}</h3>
                  <p className="text-gray-400 text-sm mt-2 leading-relaxed">{p.desc}</p>
                  <ul className="mt-4 space-y-1.5">
                    {p.plans.map((plan) => (
                      <li key={plan} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 size={14} className="text-green-400 shrink-0" /> {plan}
                      </li>
                    ))}
                  </ul>
                </Motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle tariff cards (existing data) */}
      <section className="relative py-14 md:py-20 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeading
            eyebrow="Vehicle-wise"
            title="Pick your cabin"
            sub="Starting per-km fares with everything that matters included."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {tariffData.map((item, index) => (
              <Reveal key={item.id} delay={index * 0.12}>
                <Motion.div
                  whileHover={{ y: -12, scale: 1.02, borderColor: "#22c55e" }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  onClick={() => setActiveCard(item.id)}
                  className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-lg cursor-pointer"
                >
                  <div className={`bg-gradient-to-r ${item.color} p-8 text-center`}>
                    <Motion.div
                      animate={{ rotate: activeCard === item.id ? [0, 10, -10, 0] : 0 }}
                      transition={{ duration: 0.7 }}
                      className="w-20 h-20 mx-auto rounded-3xl bg-white/20 flex items-center justify-center mb-5"
                    >
                      {item.icon}
                    </Motion.div>
                    <h3 className="text-3xl font-bold text-white">{item.title}</h3>
                    <p className="text-5xl font-extrabold mt-4 text-white">{item.price}</p>
                    <span className="text-sm text-white/80">Starting Price</span>
                  </div>

                  <div className="p-8">
                    <ul className="space-y-4 mb-8">
                      {item.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300">
                          <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link to="/booking" className="block">
                      <Motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
                      >
                        Book Now <ArrowRight size={18} />
                      </Motion.button>
                    </Link>
                  </div>
                </Motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

     

      {/* Fare explanation + extra charges (existing notes, verbatim) */}
      <section className="relative py-14 md:py-20 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeading
            eyebrow="No surprises"
            title="How your fare works"
            sub="Distance fare plus base fare. Everything else is listed here — read before confirming your booking."
          />
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {notes.map((note, index) => (
              <Reveal key={index} delay={index * 0.1}>
                <Motion.div
                  whileHover={{ scale: 1.03, borderColor: "#22c55e" }}
                  className="bg-black/40 border border-white/10 rounded-[30px] p-7 transition-all h-full"
                >
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center mb-5">
                    {note.icon}
                  </div>
                  <p className="text-gray-300 leading-relaxed">{note.text}</p>
                </Motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10">
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-[30px] p-8 sm:p-10 text-center backdrop-blur-xl">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Transparent pricing, always
              </h3>
              <p className="text-gray-400 mt-2 max-w-xl mx-auto">
                The fare you confirm is the fare you pay — tolls, permits and waiting
                extras are the only additions, listed above.
              </p>
              <Link to="/booking" className="inline-block mt-6">
                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-[0_0_35px_rgba(34,197,94,0.55)] transition-all"
                >
                  Book Your Ride <ArrowRight size={19} />
                </Motion.button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
};

export default TariffChart;
