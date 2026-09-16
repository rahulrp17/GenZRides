import React, { useRef } from "react";
import SEO from "../../components/SEO";
import { localBusinessJsonLd, breadcrumbJsonLd } from "../../utils/StructuredData";
import { motion as Motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  CarFront,
  Users,
  Briefcase,
  Snowflake,
  Fuel,
  ShieldCheck,
  BadgeIndianRupee,
  Luggage,
} from "lucide-react";
import sedan from "../../assets/images/sedan.jpg";
import innova from "../../assets/images/innova.jpg";
import SUV from "../../assets/images/SUV.jpg";
import TempoTraveller from "../../assets/images/TempoTraveller.jpg";
import { hero2 } from "../../assets/images";
import { Link } from "react-router-dom";
import { vehicleAPI } from "../../services/endpoints";
import PageHero from "../../Component/Landing/PageHero";
import { Reveal, GlowBlobs } from "../../Component/Landing/Reveal";


const vehicles = [
  {
    name: "Sedan",
    image: sedan,
    
    seats: "4 Seats",
    luggage: "3 Bags",
    ac: "AC",
    fuel: "Diesel",
    price: "₹12/km",
    desc: "Comfortable rides for city & outstation travel.",
  },
  {
    name: "SUV",
    image: SUV,
    seats: "7 Seats",
    luggage: "5 Bags",
    ac: "AC",
    fuel: "Diesel",
    price: "₹18/km",
    desc: "Perfect for family trips and group travel.",
  },
  {
    name: "Innova Crysta",
    image: innova,
    seats: "7 Seats",
    luggage: "6 Bags",
    ac: "Premium AC",
    fuel: "Diesel",
    price: "₹20/km",
    desc: "Premium luxury cab with spacious interiors.",
  },
  {
    name: "Tempo Traveller",
    image: TempoTraveller,
    seats: "7 Seats",
    luggage: "6 Bags",
    ac: "Premium AC",
    fuel: "Diesel",
    price: "₹20/km",
    desc: "Premium luxury cab with spacious interiors.",
  },
  {
    name:"Mini",
    image: hero2,
    seats: "4 Seats",
    luggage: "3 Bags",
    ac: "AC",
    fuel: "Diesel",
    price: "₹12/km",
    desc: "Comfortable rides for city & outstation travel.",
  }
];

const imageForVehicle = (vehicle, fallback) => {
  if (vehicle?.image) return vehicle.image;
  const name = (vehicle?.name || fallback || "").toLowerCase();
  if (name.includes("Innova Crysta") || name.includes("suv") || name.includes("Sedan") || name.includes("Tempo Traveller"))
    return innova;
  return sedan;
};

const cardVariants = {
  hidden: { opacity: 0, y: 80 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

const VehicleCard = ({ vehicle, index, isInView }) => (
  <Motion.div
    custom={index}
    variants={cardVariants}
    initial="hidden"
    animate={isInView ? "visible" : "hidden"}
    whileHover={{ y: -12, scale: 1.02 }}
    className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl hover:shadow-[0_0_40px_rgba(34,197,94,0.25)]"
  >
    {/* Image */}
    <div className="relative overflow-hidden h-72">
      <img
        src={vehicle.image}
        alt={vehicle.name}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      {/* Price */}
      {/* <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
        {vehicle.price}
      </div>

      {vehicle.perKm && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/15 text-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold">
          + {vehicle.perKm}
        </div>
      )} */}

      {/* Vehicle Name */}
      <div className="absolute bottom-5 left-5 right-5">
        <h3 className="font-display text-3xl font-bold text-white">
          {vehicle.name}
        </h3>

        <p className="text-gray-300 text-sm mt-1">{vehicle.desc}</p>
      </div>
    </div>

    {/* Details */}
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-gray-300">
          <Users className="text-green-400" size={18} />
          <span>{vehicle.seats}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <Briefcase className="text-green-400" size={18} />
          <span>{vehicle.luggage}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <Snowflake className="text-green-400" size={18} />
          <span>{vehicle.ac}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <Fuel className="text-green-400" size={18} />
          <esel>Diesel</esel>
        </div>
      </div>

      {/* Features */}
      <div className="flex items-center gap-2 mb-5 text-sm text-gray-400">
        <ShieldCheck className="text-green-400" size={18} />
        Professional Driver Included
      </div>

      {/* Button */}

      <Motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{
          scale: 1.03,
          boxShadow: "0px 0px 25px rgba(34,197,94,0.5)",

        }}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold flex items-center justify-center gap-2"

      >
        <Link to="/booking" className="text-xl">
          Book Your Ride
        </Link>
      </Motion.button>

    </div>

    {/* Floating Border Effect */}
    <div className="absolute inset-0 rounded-[30px] border border-transparent group-hover:border-green-400/40 transition duration-500 pointer-events-none" />
  </Motion.div>
);

const AttachVehicle = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const { data: liveData } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await vehicleAPI.getAll();
      return data;
    },
  });
  const liveVehicles = (liveData?.vehicles || []).filter((v) => v.isActive !== false);

  // Live backend fleet first; existing catalogue as the offline fallback.
  const displayVehicles =
    liveVehicles.length > 0
      ? liveVehicles.map((v) => ({
          name: v.name,
          image: imageForVehicle(v),
          seats: `${v.seats ?? 4} Seats`,
          luggage: `${v.luggage ?? 2} Bags`,
          ac: v.isAC ? "AC" : "Non-AC",
          fuel: "Petrol",
          price: `₹${v.oneWayBaseFare ?? 0} base`,
          perKm: v.oneWayPerKm != null || v.roundTripPerKm != null
            ? `₹{v.oneWayPerKm ?? '—'}/km one-way · ₹{v.roundTripPerKm ?? '—'}/km round`
            : null,
          desc: v.description || "Chauffeur-driven comfort for every trip.",
        }))
      : vehicles;

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO
        title="Our Fleet — Sedan, SUV & Premium Cabs"
        description="Choose your perfect ride: AC sedans, spacious SUVs and premium cars with professional drivers. Upfront fares, Tamil Nadu-wide service."
        keywords="sedan taxi, SUV cab booking, premium cars hire, Innova taxi Tamil Nadu"
        path="/vehicles"
        jsonLd={localBusinessJsonLd}
        breadcrumbs={breadcrumbJsonLd([{name:"Home",path:"/"},{name:"Our Fleet",path:"/vehicles"}])}
      />
      <PageHero
        eyebrow="Our Fleet"
        title="Choose Your Perfect Ride"
        sub="Affordable rides, premium comfort, and professional drivers — crafted for your smooth travel experience."
        img={hero2}
      />

      <section
        ref={ref}
        className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6"
      >
        {/* Glow Background */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/20 blur-[120px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Vehicle Cards */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 md:gap-8">
            {displayVehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.name}
                vehicle={vehicle}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>

          {/* Bottom Section */}
          <Reveal className="mt-16 md:mt-20 text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-gray-300 backdrop-blur-lg">
              <CarFront className="text-green-400" />
              Trusted by 10,000+ Happy Customers Across Tamil Nadu
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <Luggage size={15} className="text-green-400" /> Ample luggage space
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Snowflake size={15} className="text-green-400" /> Climate-controlled cabins
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeIndianRupee size={15} className="text-green-400" /> Upfront fares
              </span>
            </div>
          </Reveal>
        </div>
        <GlowBlobs />
      </section>
    </main>
  );
};

export default AttachVehicle;
