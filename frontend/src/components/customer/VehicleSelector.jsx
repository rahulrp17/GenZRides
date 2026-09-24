import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { Car, Users, Luggage, Snowflake, ChevronDown, ChevronUp, Loader2, Receipt } from "lucide-react";
import { sedan, innova } from "../../assets/images";
import { formatTripDuration } from "../../utils/formatDuration";

// Real vehicle imagery: backend `image` first, then a local asset matched
// by cab type (sedan.jpg for Mini/Sedan, innova.jpg for SUV/Innova/MUV and
// larger people-movers). The icon remains only as a load-failure fallback.
const LARGE_CAB_RE = /suv|innova|muv|tempo|traveller|crysta|ertiga|xuv|scorpio|7|12/i;

const vehicleImageFor = (vehicle) => {
  if (vehicle?.image) return vehicle.image;
  const name = vehicle?.name || "";
  return LARGE_CAB_RE.test(name) ? innova : sedan;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

const SkeletonCard = () => (
  <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4 animate-pulse min-w-[200px]">
    <div className="h-20 bg-white/10 rounded-lg mb-3" />
    <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
    <div className="h-3 bg-white/10 rounded w-1/2 mb-3" />
    <div className="flex gap-3">
      <div className="h-3 bg-white/10 rounded w-12" />
      <div className="h-3 bg-white/10 rounded w-12" />
    </div>
    <div className="h-5 bg-white/10 rounded w-16 mt-3" />
  </div>
);

const formatCurrency = (n) =>
  `₹${Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const perKmLabel = (n) =>
  n == null
    ? "—"
    : `₹${Number(n) % 1 === 0 ? Number(n).toFixed(0) : Number(n).toFixed(2)}/km`;

const VehicleSelector = ({
  vehicles = [],
  selectedVehicle,
  onSelect,
  fareEstimate,
  fareEstimates = {},
  estimating = false,
  pickupSet = false,
  dropSet = false,
  tripType = "One Way",
  days = 1,
}) => {
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const bothSet = pickupSet && dropSet;
  const hasAnyFare = Object.keys(fareEstimates || {}).length > 0;

  if (!bothSet) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 text-center">
        <Car className="mx-auto mb-3 text-slate-300" size={36} />
        <p className="text-gray-400 text-sm font-medium">
          Set pickup and drop locations to see fares
        </p>
      </div>
    );
  }

  if (estimating && !hasAnyFare) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const fareBreakdown = fareEstimate?.fareBreakdown;

  // Billed figure comes straight from the backend (billedDistanceKm
  // already nets the daily-minimum block on round trips). totalRunningKm
  // is only used for the minimum-floor check.
  const vsLegs = tripType === "Round Trip" ? 2 : 1;
  const vsBilledTotal =
    fareBreakdown?.billedDistanceKm ??
    fareBreakdown?.totalRunningKm ??
    fareEstimate?.distance;
  const vsRunningTotal =
    fareBreakdown?.totalRunningKm ??
    fareBreakdown?.billedDistanceKm ??
    fareEstimate?.distance;
  const vsMinimumApplied =
    (fareEstimate?.distance ?? 0) > 0 &&
    (vsRunningTotal ?? 0) > vsLegs * fareEstimate.distance;

  return (
    <div>
      <Motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-2 md:overflow-x-visible"
      >
        {vehicles.map((vehicle) => {
          const isSelected = selectedVehicle === vehicle._id;
          const imgSrc = vehicleImageFor(vehicle);
          // Each card shows its own calculated total from the per-vehicle
          // estimate map; base fare only until its estimate arrives.
          const cardEstimate = fareEstimates?.[vehicle._id] || null;
          const cardTotal =
            cardEstimate?.fareBreakdown?.total ??
            cardEstimate?.estimatedFare ??
            null;

          return (
            <Motion.div
              key={vehicle._id}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(vehicle._id)}
              className={`
                relative flex-shrink-0 w-[200px] md:w-[230px] bg-white/5 backdrop-blur-lg rounded-xl border-2 p-4 cursor-pointer
                transition-colors duration-200 select-none
                ${isSelected ? "border-green-500 bg-green-500/10 shadow-md" : "border-white/10 hover:border-white/20 hover:shadow"}
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="h-20 flex items-center justify-center mb-3">
                <img
                  src={imgSrc}
                  alt={vehicle.name}
                  className="h-full w-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  className="items-center justify-center hidden"
                >
                  <Car
                    size={40}
                    className={isSelected ? "text-green-400" : "text-slate-300"}
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-1.5">
                <h3 className={`font-bold text-sm ${isSelected ? "text-green-400" : "text-white"}`}>
                  {vehicle.name}
                </h3>
                {vehicle.isAC && (
                  <span className="inline-flex items-center gap-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                    <Snowflake size={10} /> AC
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="inline-flex items-center gap-1">
                  <Users size={12} /> {vehicle.seats}{""} Seats
                </span>
                <span className="inline-flex items-center gap-1">
                  <Luggage size={12} /> {vehicle.luggage}{""} Luggage
                </span>
              </div>

              <div className="border-t border-white/10 pt-2">
                {cardTotal != null ? (
                  <p className={`text-lg font-bold ${isSelected ? "text-green-400" : "text-white"}`}>₹{Number(cardTotal ?? 0).toLocaleString("en-IN")}</p>
                ) : (
                  <p className="text-sm font-semibold text-gray-300">
                    ₹{Number(vehicle.oneWayBaseFare ?? 0).toLocaleString("en-IN")} <span className="text-xs font-normal text-gray-500">base</span>
                  </p>
                )}
              </div>

              {cardTotal != null && (
                <p className="text-[10px] text-gray-500 mt-0.5">
                  ₹{vehicle.oneWayPerKm ?? '—'}/km one-way
                  {vehicle.roundTripPerKm
                    ? ` · ₹${vehicle.roundTripPerKm}/km round`
                    : ''}
                </p>
              )}
            </Motion.div>
          );
        })}
      </Motion.div>

      {fareEstimate && fareBreakdown && selectedVehicle && (
        <Motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-4 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setBreakdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-300">Fare Breakdown</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-green-400">₹{Number(fareBreakdown.total ?? 0).toLocaleString("en-IN")}</span>
              {breakdownOpen ? (
                <ChevronUp size={16} className="text-gray-500" />
              ) : (
                <ChevronDown size={16} className="text-gray-500" />
              )}
            </div>
          </button>

          {breakdownOpen && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4 text-sm"
            >
              
              <div className="flex items-center justify-between gap-3 pb-2 pt-3 border-b border-dashed border-white/15">
                <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
                  <Receipt size={13} className="text-emerald-400" /> Trip invoice
                </span>
                <span className="text-[11px] text-gray-500 tabular-nums">
                  {fareEstimate.distance?.toFixed(1)} km · {formatTripDuration(fareEstimate.duration)}
                </span>
              </div>
              {tripType === "Round Trip" && days > 1 && (
                  <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                    <span className="text-gray-300">Total distance ({days} days){vsMinimumApplied ? " (minimum applied)" : ""}
                      <span className="block text-[11px] text-gray-500 font-normal">{fareEstimate.distance?.toFixed(1)} km * {days} days</span>
                    </span>
                    <span className="text-gray-200 font-medium tabular-nums shrink-0">{(vsRunningTotal ?? 0).toFixed(1)} km</span>
                  </div>
                )}
               {(tripType === "Round Trip" || vsMinimumApplied) && vsBilledTotal != null && (
                  <div className="flex justify-between gap-3 py-1.5 border-b-2  border-white/30">
                    <span className="text-gray-300">
                      Billed distance
                      
                        <span className="block text-[11px] text-gray-500 font-normal">{vsRunningTotal?.toFixed(1)} km - {fareBreakdown.baseKm} Km</span>
                      
                    </span>
                    <span className="text-gray-200 font-medium tabular-nums shrink-0">{Number(vsBilledTotal).toFixed(1)} km</span>
                  </div>
                )}
              <div className="py-1">
                <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                  <span className="text-gray-300">
                    Base fare
                    {fareBreakdown.baseKm > 0 && (
                      <span className="block text-[11px] text-gray-500 font-normal">first {fareBreakdown.baseKm} km included</span>
                    )}
                  </span>
                  <span className="text-gray-200 font-medium tabular-nums shrink-0">{formatCurrency(fareBreakdown.baseFare)}</span>
                </div>
                <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                  <span className="text-gray-300">
                    Distance fare
                    {fareBreakdown.chargeableDistance > 0 && fareEstimate.perKm != null && (
                      <span className="block text-[11px] text-gray-500 font-normal">{fareBreakdown.chargeableDistance} km × {perKmLabel(fareEstimate.perKm)}</span>
                    )}
                  </span>
                  <span className="text-gray-200 font-medium tabular-nums shrink-0">{formatCurrency(fareBreakdown.distanceFare)}</span>
                </div>
               
                {fareBreakdown.driverAllowance > 0 && (
                  <div className="flex justify-between gap-3 py-1.5 border-b-2 border-white/30">
                    <span className="text-gray-300">
                      Driver bata
                      <span className="block text-[11px] text-gray-500 font-normal">driver food & stay{fareBreakdown.bataPerDay ? ` · ₹${fareBreakdown.bataPerDay}/day${fareBreakdown.billableDays > 1 ? ` × ${fareBreakdown.billableDays} days` : ""}` : ""}</span>
                    </span>
                    <span className="text-gray-200 font-medium tabular-nums shrink-0">{formatCurrency(fareBreakdown.driverAllowance)}</span>
                  </div>
                )}
                {fareBreakdown.waitingCharge > 0 && (
                  <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                    <span className="text-gray-300">
                      Waiting fee
                      <span className="block text-[11px] text-gray-500 font-normal">first 30 min free</span>
                    </span>
                    <span className="text-gray-200 font-medium tabular-nums shrink-0">{formatCurrency(fareBreakdown.waitingCharge)}</span>
                  </div>
                )}
                {fareBreakdown.nightCharge > 0 && (
                  <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                    <span className="text-gray-300">Night charge</span>
                    <span className="text-gray-200 font-medium tabular-nums shrink-0">{formatCurrency(fareBreakdown.nightCharge)}</span>
                  </div>
                )}
                {fareBreakdown.airportCharge > 0 && (
                  <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                    <span className="text-gray-300">
                      Airport charge
                      <span className="block text-[11px] text-gray-500 font-normal">airport pickup / drop fee</span>
                    </span>
                    <span className="text-gray-200 font-medium tabular-nums shrink-0">{formatCurrency(fareBreakdown.airportCharge)}</span>
                  </div>
                )}
                {fareBreakdown.tollCharges > 0 && (
                  <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                    <span className="text-gray-300">
                      Toll charges
                      <span className="block text-[11px] text-gray-500 font-normal">toll plazas on your route</span>
                    </span>
                    <span className="text-gray-200 font-medium tabular-nums shrink-0">{formatCurrency(fareBreakdown.tollCharges)}</span>
                  </div>
                )}
                {fareBreakdown.permitCharges > 0 && (
                  <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                    <span className="text-gray-300">
                      Permit charges
                      <span className="block text-[11px] text-gray-500 font-normal">interstate permit, if applicable</span>
                    </span>
                    <span className="text-gray-200 font-medium tabular-nums shrink-0">{formatCurrency(fareBreakdown.permitCharges)}</span>
                  </div>
                )}
                
              </div>
              <div className="flex justify-between items-center gap-3 pt-2.5">
                <span className="font-semibold text-white">
                  Amount payable
                  <span className="block text-[11px] text-gray-500 font-normal">pay cash to the driver for toll and permit charges</span>
                </span>
                <span className="font-display text-lg font-bold text-green-400 tabular-nums">{formatCurrency(fareBreakdown.total)}</span>
              </div>
            </Motion.div>
          )}
        </Motion.div>
      )}

      {estimating && (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" />
          Calculating fare...
        </div>
      )}
    </div>
  );
};

export default VehicleSelector;
