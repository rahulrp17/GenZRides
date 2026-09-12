import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { Car, Users, Luggage, Snowflake, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { sedan, innova } from "../../assets/images";

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

const FareBreakdownRow = ({ label, value, bold = false, large = false }) => (
  <div className={`flex justify-between items-center ${large ? "pt-2 border-t border-white/10" : ""}`}>
    <span className={`${bold ? "font-semibold text-white" : "text-gray-400"} ${large ? "text-base" : "text-sm"}`}>
      {label}
    </span>
    <span
      className={`${bold ? "font-bold text-green-400" : "font-medium text-gray-300"} ${large ? "text-lg" : "text-sm"}`}
    >
      {value}
    </span>
  </div>
);

const formatCurrency = (n) => `₹${Number(n ?? 0).toFixed(2)}`;

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

  return (
    <div>
      <Motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible"
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
                relative flex-shrink-0 w-[200px] md:w-auto bg-white/5 backdrop-blur-lg rounded-xl border-2 p-4 cursor-pointer
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
                  <Users size={12} /> {vehicle.seats}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Luggage size={12} /> {vehicle.luggage}
                </span>
              </div>

              <div className="border-t border-white/10 pt-2">
                {cardTotal != null ? (
                  <p className={`text-lg font-bold ${isSelected ? "text-green-400" : "text-white"}`}>₹{cardTotal}</p>
                ) : (
                  <p className="text-sm font-semibold text-gray-300">
                    ₹{vehicle.oneWayBaseFare} <span className="text-xs font-normal text-gray-500">base</span>
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
              <span className="text-sm font-bold text-green-400">₹{fareBreakdown.total}</span>
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
              className="px-4 pb-4 space-y-2"
            >
              <FareBreakdownRow label="Base fare" value={formatCurrency(fareBreakdown.baseFare)} />
              <FareBreakdownRow
                label={fareBreakdown.baseKm > 0 && fareBreakdown.chargeableDistance < fareBreakdown.billedDistanceKm
                  ? `Distance fare (${fareBreakdown.chargeableDistance} km billed · ${fareBreakdown.baseKm} km included in base fare)`
                  : "Distance fare"}
                value={formatCurrency(fareBreakdown.distanceFare)}
              />
              {fareBreakdown.billedDistanceKm != null &&
                fareEstimate.distance != null &&
                Number(fareBreakdown.billedDistanceKm) >
                  Number(fareEstimate.distance) && (
                  <FareBreakdownRow
                    label="Billed distance"
                    value={`${Number(fareBreakdown.billedDistanceKm).toFixed(1)} km (minimum applied)`}
                  />
                )}
              {fareBreakdown.driverAllowance > 0 && (
                <FareBreakdownRow
                  label={`Driver bata${fareBreakdown.bataPerDay ? ` (₹${fareBreakdown.bataPerDay}/day${fareBreakdown.billableDays > 1 ? ` × ${fareBreakdown.billableDays} days` : ""})` : ""}`}
                  value={formatCurrency(fareBreakdown.driverAllowance)}
                />
              )}
              {fareBreakdown.waitingCharge > 0 && (
                <FareBreakdownRow label="Waiting charge (first 30 min free)" value={formatCurrency(fareBreakdown.waitingCharge)} />
              )}
              {fareBreakdown.nightCharge > 0 && (
                <FareBreakdownRow label="Night charge" value={formatCurrency(fareBreakdown.nightCharge)} />
              )}
              {fareBreakdown.airportCharge > 0 && (
                <FareBreakdownRow label="Airport charge" value={formatCurrency(fareBreakdown.airportCharge)} />
              )}
              {fareBreakdown.tollCharges > 0 && (
                <FareBreakdownRow label="Toll charges" value={formatCurrency(fareBreakdown.tollCharges)} />
              )}
              {fareBreakdown.permitCharges > 0 && (
                <FareBreakdownRow label="Permit charges" value={formatCurrency(fareBreakdown.permitCharges)} />
              )}
              <FareBreakdownRow label="Distance" value={`${fareEstimate.distance?.toFixed(1)} km`} />
              {tripType === "Round Trip" && days > 1 && (
                <FareBreakdownRow
                  label={`Total distance (${days} days)`}
                  value={`${(fareEstimate.distance * days).toFixed(1)} km`}
                />
              )}
              <FareBreakdownRow label="Duration" value={`${Math.ceil(fareEstimate.duration)} min`} />
              <FareBreakdownRow label="Total" value={formatCurrency(fareBreakdown.total)} bold large />
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
