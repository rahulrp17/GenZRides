import { motion as Motion } from "framer-motion";
import { Car } from "lucide-react";

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-900 flex flex-col items-center justify-center z-[9999] overflow-hidden">

      {/* Moving Cab */}
      <Motion.div
        animate={{
          x: [-150, 150, -150],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-8"
      >
        <Car size={70} className="text-green-500" />
      </Motion.div>

      {/* Logo Text */}
      <Motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
        }}
        className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-400 via-white to-green-400 bg-clip-text text-transparent"
      >
        GenZRides
      </Motion.h1>

      {/* Tagline */}
      <Motion.p
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.5,
        }}
        className="text-gray-400 mt-4 text-lg italic"
      >
        Reliable • Affordable • Everywhere
      </Motion.p>

      {/* Loading Bar */}
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mt-8">
        <Motion.div
          className="h-full bg-green-500"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Loading Text */}
      <Motion.p
        animate={{
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
        className="text-green-400 mt-4"
      >
        Finding your ride...
      </Motion.p>
    </div>
  );
}
