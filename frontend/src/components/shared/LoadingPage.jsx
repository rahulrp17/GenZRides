import { motion as Motion } from "framer-motion";
import { Car } from "lucide-react";

/* Premium full-page loader: a car that laps an orbiting track, with a
   rotating conic "circuit" glow and a shimmering progress bar. Fully
   responsive — sizes scale from mobile to desktop. */

const ORBIT_MS = 1.8; // seconds per lap

const CarOrbit = () => (
  <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44">
    {/* Ambient halo */}
    <div
      aria-hidden
      className="absolute inset-2 rounded-full bg-emerald-500/10 blur-2xl animate-pulse"
    />

    {/* Dashed track */}
    <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/10" />

    {/* Rotating conic glow that sweeps around the ring */}
    <Motion.div
      aria-hidden
      className="absolute inset-0 rounded-full"
      style={{
        background:
          "conic-gradient(from 0deg, transparent 0%, transparent 68%, rgba(52,211,153,0.9) 82%, transparent 96%, transparent 100%)",
        WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
        mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: ORBIT_MS, repeat: Infinity, ease: "linear" }}
    />

    {/* Car lapping the track — held upright while the ring turns underneath */}
    <Motion.div
      className="absolute inset-0"
      animate={{ rotate: 360 }}
      transition={{ duration: ORBIT_MS, repeat: Infinity, ease: "linear" }}
    >
      <Motion.div
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: -360 }}
        transition={{ duration: ORBIT_MS, repeat: Infinity, ease: "linear" }}
      >
        <span className="flex w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 border border-white/20 shadow-[0_0_24px_rgba(34,197,94,0.6)]">
          <Car size={20} className="text-white sm:w-[22px] sm:h-[22px] md:w-6 md:h-6" />
        </span>
      </Motion.div>
    </Motion.div>

    {/* Center dot — breathing pulse while the car circles */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)] animate-pulse" />
    </div>
  </div>
);

const LoadingPage = ({ text = "Loading your ride..." }) => (
  <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex flex-col items-center justify-center px-4 sm:px-6 py-12 overflow-hidden">
    {/* Glow blobs */}
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
    </div>

    <Motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center text-center max-w-sm w-full"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.35)]">
        <span className="text-white font-display text-xl sm:text-2xl font-extrabold tracking-tight">G</span>
      </div>
      <h1 className="mt-4 font-display text-lg sm:text-xl font-bold text-white tracking-tight">GenZRides</h1>
      <p className="text-[11px] tracking-[0.2em] uppercase text-green-400 font-semibold mt-1">Premium Rides</p>

      <div className="mt-8 sm:mt-10">
        <CarOrbit />
      </div>

      <div className="mt-10 w-full max-w-[280px] h-1.5 bg-white/10 rounded-full overflow-hidden">
        <Motion.div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "60%" }}
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-white/10 border-t-green-500 animate-spin" />
        <p className="text-sm text-slate-300">{text}</p>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-slate-400">Please wait — preparing your experience</span>
      </div>
    </Motion.div>
  </div>
);

export const InlineLoader = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    {/* Mini car spinner — car laps a small ring, keeps upright */}
    <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-white/15">
      <Motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      >
        <Motion.div
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        >
          <span className="flex w-8 h-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 border border-white/20 shadow-[0_0_18px_rgba(34,197,94,0.55)]">
            <Car size={15} className="text-white" />
          </span>
        </Motion.div>
      </Motion.div>
    </div>
    <p className="text-sm text-slate-400 mt-3">{text}</p>
  </div>
);

export default LoadingPage;