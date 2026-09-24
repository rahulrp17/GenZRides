import React, { useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Car,
  MapPin,
  Navigation,
  Flag,
  XCircle,
} from 'lucide-react';

const STAGES = [
  { key: 'Accepted', label: 'Driver Assigned', sublabel: 'Ride confirmed', icon: CheckCircle, tsKey: 'acceptedAt' },
  { key: 'On The Way', label: 'Driver On The Way', sublabel: 'Heading to pickup', icon: Car, tsKey: 'onTheWayAt' },
  { key: 'Arrived', label: 'Driver Arrived', sublabel: 'Driver is here', icon: MapPin, tsKey: 'arrivedAt' },
  { key: 'Started', label: 'Ride Started', sublabel: 'Enjoy your ride', icon: Navigation, tsKey: 'startedAt' },
  { key: 'Reached', label: 'Reached Destination', sublabel: 'Verifying payment', icon: MapPin, tsKey: 'reachedAt' },
  { key: 'Completed', label: 'Ride Completed', sublabel: 'Payment done, trip finished', icon: Flag, tsKey: 'completedAt' },
];

function formatTime(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Premium animated ride timeline (shared by customer + driver).
 * Props preserve existing API: booking { bookingStatus, ...timestamps }, currentStatusIndex.
 */
const RideTimeline = ({ booking, currentStatusIndex }) => {
  const isCancelled = booking?.bookingStatus === 'Cancelled';
  const isCompleted = booking?.bookingStatus === 'Completed';

  const progress = useMemo(() => {
    if (isCancelled) return 0;
    if (currentStatusIndex < 0) return 0;
    return Math.round((currentStatusIndex / (STAGES.length - 1)) * 100);
  }, [currentStatusIndex, isCancelled]);

  const activeLabel = isCancelled
    ? 'Booking Cancelled'
    : isCompleted
      ? 'Ride Completed'
      : STAGES[currentStatusIndex]?.label || 'Booking Pending';

  return (
    <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-5 shadow-sm border border-white/10 overflow-hidden min-w-0">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/15 blur-[80px]"
      />
      <div className="relative flex items-center justify-between gap-3 mb-4 min-w-0">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-white tracking-tight truncate">
            Live Ride Timeline
          </h3>
          <p className="text-xs text-slate-200/70 mt-0.5 truncate">
            {isCancelled
              ? 'This ride was cancelled'
              : isCompleted
                ? 'Trip finished — thank you for riding'
                : 'Follow every milestone in real time'}
          </p>
        </div>
        <span
          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isCancelled
              ? 'bg-red-500/15 text-red-300 border-red-500/30'
              : isCompleted
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          }`}
        >
          {!isCancelled && !isCompleted && (
            <span className="relative flex w-1.5 h-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
          )}
          {activeLabel}
        </span>
      </div>

      {/* progress highway */}
      <div className="relative mb-5">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-200/70 mb-1.5">
          <span>Journey progress</span>
          <span className="font-mono text-emerald-300">{progress}%</span>
        </div>
        <div className="relative h-2.5 rounded-full bg-white/10 overflow-hidden">
          <Motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          />
          <div className="ride-shimmer absolute inset-y-0 left-0 w-full overflow-hidden rounded-full" />
        </div>
        {/* travelling car */}
        {!isCancelled && currentStatusIndex >= 0 && (
          <Motion.div
            className="absolute -top-3.5 z-10"
            initial={{ left: '0%' }}
            animate={{ left: `calc(${progress}% - 14px)` }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          >
            <Motion.div
              className="ride-glow w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center border-2 border-white/80"
              animate={!isCompleted ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Car size={13} className="text-white" />
            </Motion.div>
          </Motion.div>
        )}
      </div>

      {isCancelled ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5">
          <XCircle size={20} className="text-red-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Ride cancelled</p>
            <p className="text-xs text-slate-200/70 truncate">
              No further milestones will update for this trip.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative pl-1">
          <div aria-hidden className="absolute left-[23px] top-2 bottom-2 w-0.5 rounded-full bg-white/10" />
          <Motion.div
            aria-hidden
            className="absolute left-[23px] top-2 w-0.5 rounded-full bg-gradient-to-b from-emerald-400 via-green-400 to-teal-400"
            initial={{ height: 0 }}
            animate={{ height: `calc(${progress}% * 0.92)` }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          />
          <div className="relative space-y-1">
            {STAGES.map((stage, i) => {
              const done = i < currentStatusIndex || isCompleted;
              const current = !isCompleted && stage.key === booking?.bookingStatus;
              const time = formatTime(booking?.[stage.tsKey]);
           
              
              const Icon = done ? CheckCircle : stage.icon;
              return (
                <div key={stage.key} className="relative flex items-start gap-3.5 py-2 min-w-0">
                  <div className="relative  flex-shrink-0">
                    <Motion.div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-colors duration-300 ${
                        done
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-400/50 text-white shadow-[0_0_18px_rgba(52,211,153,0.35)]'
                          : current
                            ? 'ride-glow bg-gray-700 border-emerald-400/60 text-emerald-300'
                            : 'bg-gray-800 border-white/10 text-slate-200/40'
                      }`}
                      initial={false}
                      whileTap={current ? { scale: 0.94 } : {}}
                    >
                      <AnimatePresence mode="wait">
                        <Motion.div
                          key={done ? 'done' : current ? 'live' : 'todo'}
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.4, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <Icon size={17} />
                        </Motion.div>
                      </AnimatePresence>
                    </Motion.div>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            done || current ? 'text-white' : 'text-slate-200/50'
                          }`}
                        >
                          {stage.label}
                        </p>
                        <p className="text-xs text-slate-200/60 truncate mt-0.5">
                          {stage.sublabel}
                        </p>
                      </div>
                      {time && (
                        <span
                          className={`flex-shrink-0 text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                            done || current
                              ? 'text-emerald-200 border-emerald-500/30 bg-emerald-500/10'
                              : 'text-slate-200/40 border-white/10 bg-white/5'
                          }`}
                        >
                          {time}
                        </span>
                      )}
                    </div>
                    {current && (
                      <Motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1"
                      >
                        <span className="relative flex w-1.5 h-1.5">
                          <span className="animate-ping  absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative  inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-200">
                          LIVE NOW
                        </span>
                      </Motion.div>
                    )}
                    {done && !current && (
                      <p className="mt-1 text-[11px] font-medium text-emerald-300/80">
                        Completed
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RideTimeline;
