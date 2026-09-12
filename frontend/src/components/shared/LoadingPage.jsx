import { motion as Motion } from "framer-motion";

const LoadingPage = ({ text = "Loading your ride..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex flex-col items-center justify-center px-4 sm:px-6 py-12 overflow-hidden">
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

      <div className="mt-8 w-full max-w-[280px] h-1.5 bg-white/10 rounded-full overflow-hidden">
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
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-green-500 animate-spin" />
    </div>
    <p className="text-sm text-slate-400 mt-3">{text}</p>
  </div>
);

export default LoadingPage;
