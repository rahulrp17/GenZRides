import React from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Luggage, Snowflake, ArrowRight } from "lucide-react";
import { sedan, innova } from "../../assets/images";
import { Reveal, SectionHeading, GlowBlobs } from "./Reveal";
import { cardHover } from "./motion";

const vehicles = [
  { _id: "mini", name: "Mini", seats: 4, luggage: 2, oneWayBaseFare: 80, oneWayPerKm: 12, isAC: true, isActive: true, description: "Compact and fuel-efficient for city commutes.", image: null },
  { _id: "sedan", name: "Sedan", seats: 4, luggage: 3, oneWayBaseFare: 120, oneWayPerKm: 15, isAC: true, isActive: true, description: "Comfortable sedan for corporate trips and city travel.", image: null },
  { _id: "suv", name: "SUV", seats: 6, luggage: 4, oneWayBaseFare: 180, oneWayPerKm: 20, isAC: true, isActive: true, description: "Spacious SUV for family outings and group travel.", image: null },
  { _id: "innova", name: "Innova", seats: 7, luggage: 5, oneWayBaseFare: 250, oneWayPerKm: 24, isAC: true, isActive: true, description: "Premium MUV for large groups and long-distance journeys.", image: null },
  { _id: "tempo", name: "Tempo Traveller", seats: 12, luggage: 8, oneWayBaseFare: 500, oneWayPerKm: 30, isAC: false, isActive: true, description: "Large capacity for group tours and events.", image: null },
];

const imageFor = (vehicle) => {
  if (vehicle?.image) return vehicle.image;
  const name = (vehicle?.name || "").toLowerCase();
  if (name.includes("innova") || name.includes("suv") || name.includes("ertiga"))
    return innova;
  return sedan;
};

const VehicleShowcase = () => {
  return (
    <section className="relative bg-black py-20 md:py-28 overflow-hidden">
      <GlowBlobs />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <SectionHeading
          eyebrow="Our Fleet"
          title="Premium cars, honest fares"
          sub="Live pricing straight from our tariff — pick the cabin that fits your journey."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {vehicles.map((v, i) => (
            <Reveal key={v._id} delay={(i % 3) * 0.1}>
              <Motion.div
                {...cardHover}
                className="group h-full bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 overflow-hidden hover:border-green-500/40 hover:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition-colors"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={imageFor(v)}
                    alt={v.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  {v.isAC && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-black/60 backdrop-blur-md border border-blue-400/40 text-blue-300 text-[11px] font-semibold px-3 py-1 rounded-full">
                      <Snowflake size={12} /> AC
                    </span>
                  )}
                  <span className="absolute bottom-4 left-5 font-display text-xl font-bold text-white">
                    {v.name}
                  </span>
                </div>
                <div className="p-6">
                  {v.description && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
                      {v.description}
                    </p>
                  )}
                  <div className="flex items-center gap-5 text-sm text-gray-300 mb-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={15} className="text-green-400" /> {v.seats} seats
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Luggage size={15} className="text-green-400" /> {v.luggage} bags
                    </span>
                  </div>
                  <div className="flex items-end justify-between border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-gray-500">Starting from</p>
                      <p className="font-display text-2xl font-bold text-white">
                        ₹{v.oneWayBaseFare}
                        <span className="text-xs font-medium text-gray-400 ml-1.5">
                          + ₹{v.oneWayPerKm}/km
                        </span>
                      </p>
                    </div>
                    <Link
                      to="/booking"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
                    >
                      Book <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </Motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VehicleShowcase;
