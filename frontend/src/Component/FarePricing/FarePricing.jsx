import { FaCarSide, FaShuttleVan, FaCheckCircle } from "react-icons/fa";
import { motion as Motion } from "framer-motion";

const rows = [
  { label: "One Way Drop", sedan: "₹15 /Per Km", suv: "₹20 /Per Km" },
  { label: "Round Trip Per Day", sedan: "₹14 /Per Km", suv: "₹19 /Per Km" },
  { label: "Driver Bata", sedan: "₹400", suv: "₹400" },
];

const FarePricing = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative bg-black py-16 sm:py-20 px-4 sm:px-6 flex flex-col items-center overflow-hidden">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-green-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 blur-[130px] rounded-full" />
      </div>

      <Motion.div
        className="relative text-center mb-10 sm:mb-12 px-2"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: true, amount: 0.2, margin: "-100px" }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
          Transparent Pricing
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Fare Plans That Fit Your Ride
        </h2>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mt-3">
          Transparent. Reliable. Affordable. Whether it’s a short drop or a long
          round trip, we’ve got you covered.
        </p>
      </Motion.div>

      {/* Desktop / tablet table */}
      <div className="relative hidden md:block w-full max-w-6xl rounded-[30px] backdrop-blur-xl bg-white/5 shadow-2xl overflow-hidden border border-white/10">
        <div className="grid grid-cols-3 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border-b border-white/10 text-white text-lg font-semibold text-center">
          <div className="py-4">Vehicle Type</div>
          <div className="py-4 flex justify-center items-center gap-2">
            <FaCarSide className="text-green-400 text-xl" />
            Sedan
          </div>
          <div className="py-4 flex justify-center items-center gap-2">
            <FaShuttleVan className="text-green-400 text-xl" />
            SUV
          </div>
        </div>

        {rows.map((row, idx) => (
          <Motion.div
            key={row.label}
            className="grid grid-cols-3 text-center text-gray-200 text-md font-medium hover:bg-white/5 transition border-b border-white/5 last:border-0"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.15 + idx * 0.1, duration: 0.5 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="py-5 text-white font-semibold">{row.label}</div>
            <div className="py-5 flex justify-center items-center gap-2">
              <FaCheckCircle className="text-green-400 shrink-0" />
              {row.sedan}
            </div>
            <div className="py-5 flex justify-center items-center gap-2">
              <FaCheckCircle className="text-green-400 shrink-0" />
              {row.suv}
            </div>
          </Motion.div>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="relative md:hidden w-full max-w-md space-y-4">
        {rows.map((row, idx) => (
          <Motion.div
            key={row.label}
            className="rounded-[24px] backdrop-blur-xl bg-white/5 border border-white/10 p-5 shadow-xl"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.1 + idx * 0.1, duration: 0.5 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="text-white font-semibold text-base mb-3">{row.label}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/40 border border-white/10 px-3 py-3 text-center">
                <p className="flex items-center justify-center gap-1.5 text-green-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <FaCarSide /> Sedan
                </p>
                <p className="flex items-center justify-center gap-1.5 text-gray-200 font-semibold">
                  <FaCheckCircle className="text-green-400 shrink-0" />
                  {row.sedan}
                </p>
              </div>
              <div className="rounded-2xl bg-black/40 border border-white/10 px-3 py-3 text-center">
                <p className="flex items-center justify-center gap-1.5 text-green-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <FaShuttleVan /> SUV
                </p>
                <p className="flex items-center justify-center gap-1.5 text-gray-200 font-semibold">
                  <FaCheckCircle className="text-green-400 shrink-0" />
                  {row.suv}
                </p>
              </div>
            </div>
          </Motion.div>
        ))}
      </div>
    </div>
  );
};

export default FarePricing;
