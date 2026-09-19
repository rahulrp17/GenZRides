import React, { useEffect, useMemo, useState } from "react";
import SEO from "../../components/SEO";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { ArrowLeft, ArrowRight, Users, Luggage, Snowflake, Loader2, CarFront } from "lucide-react";
import Navbar from "../../Component/Navbar/Navbar";
import Footer from "../../Component/Footer/Footer";
import PageHero from "../../Component/Landing/PageHero";
import { vehicleAPI, guestAPI } from "../../services/endpoints";
import { sedan, innova, hero4 } from "../../assets/images";
import { loadDraft, saveDraft } from "./guestDraft";
import { Reveal } from "../../Component/Landing/Reveal";
import { cardHover } from "../../Component/Landing/motion";
import { formatTripDuration } from "../../utils/formatDuration";

const imageFor = (v) => {
  if (v?.image) return v.image;
  const name = (v?.name || "").toLowerCase();
  if (name.includes("innova") || name.includes("suv") || name.includes("ertiga")) return innova;
  return sedan;
};

const CarTypePage = () => {
  const navigate = useNavigate();
  const draft = useMemo(() => loadDraft(), []);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fares, setFares] = useState({});
  const [estimatingId, setEstimatingId] = useState(null);
  const [selected, setSelected] = useState(draft?.vehicleType || null);

  useEffect(() => {
    if (!draft?.pickup?.lat || !draft?.drop?.lat) {
      navigate("/booking", { replace: true });
    }
  }, [draft, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await vehicleAPI.getAll();
        const list = (data?.vehicles || []).filter((v) => v.isActive !== false);
        setVehicles(list);
      } catch {
        toast.error("Could not load vehicles. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const estimateFor = async (vehicle) => {
    if (!draft) return;
    setEstimatingId(vehicle._id);
    try {
      const days = draft.tripType === "Round Trip" ? (draft.days || 1) : 1;
      const { data } = await guestAPI.estimateFare({
        pickup: { latitude: draft.pickup.lat, longitude: draft.pickup.lng },
        drop: { latitude: draft.drop.lat, longitude: draft.drop.lng },
        vehicleType: vehicle._id,
        tripType: draft.tripType,
        days,
        pickupDateTime: draft.pickupDateTime,
      });
      if (data.success) {
        setFares((prev) => ({ ...prev, [vehicle._id]: data.data }));
        return data.data;
      }
      toast.error(data.message || "Fare calculation failed for this vehicle.");
      return null;
    } catch (err) {
      toast.error(err.response?.data?.message || "Fare calculation failed for this vehicle.");
      return null;
    } finally {
      setEstimatingId(null);
    }
  };

  useEffect(() => {
    if (vehicles.length === 0 || !draft) return;
    vehicles.forEach((v) => {
      if (!fares[v._id]) estimateFor(v);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles]);

  const handleSelect = async (vehicle) => {
    let fare = fares[vehicle._id];
    if (!fare) {
      fare = await estimateFor(vehicle);
      if (!fare) return;
    }
    setSelected(vehicle._id);
    saveDraft({ ...draft, vehicleType: vehicle._id, fareEstimate: fare });
  };

  const [bookingNowId, setBookingNowId] = useState(null);

  const handleBookNow = async (vehicle) => {
    let fare = fares[vehicle._id];
    if (!fare) {
      fare = await estimateFor(vehicle);
      if (!fare) return;
    }
    setBookingNowId(vehicle._id);
    try {
      setSelected(vehicle._id);
      saveDraft({ ...draft, vehicleType: vehicle._id, fareEstimate: fare });
      navigate("/booking/confirm");
    } finally {
      setBookingNowId(null);
    }
  };

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO noindex title="Choose Your Car" description="Pick your Sedan, SUV or premium cab with live upfront fares for your exact route." path="/booking/vehicles" />
      <Navbar />
      <PageHero
        eyebrow="Step 2 of 3 — Car Type"
        title="Choose your car"
        sub="Live fares calculated on your exact route by our pricing engine."
        img={hero4}
      />

      <section className="relative py-14 md:py-20">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <Link to="/booking" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to trip details
          </Link>

          {draft && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 mb-8">
              <span className="truncate">{draft.pickup?.address}</span>
              <ArrowRight size={15} className="text-green-400 shrink-0" />
              <span className="truncate">{draft.drop?.address}</span>
              <span className="ml-auto text-xs text-gray-500 shrink-0">{draft.tripType}</span>
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white/5 rounded-[30px] border border-white/10 overflow-hidden animate-pulse">
                  <div className="h-52 bg-white/10" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-white/10 rounded w-2/3" />
                    <div className="h-6 bg-white/10 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-[30px] p-10 text-center max-w-lg mx-auto">
              <CarFront size={36} className="mx-auto mb-3 text-green-400" />
              <p className="text-white font-semibold">No vehicles available right now</p>
              <p className="text-gray-400 text-sm mt-1">Please try again in a moment.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map((v, i) => {
                const fare = fares[v._id];
                const isSelected = selected === v._id;
                return (
                  <Reveal key={v._id} delay={(i % 3) * 0.08}>
                    <Motion.div
                      {...cardHover}
                      onClick={() => handleSelect(v)}
                      className={`relative bg-white/5 backdrop-blur-lg rounded-[30px] border-2 overflow-hidden cursor-pointer transition-colors ${
                        isSelected ? "border-green-500 shadow-[0_0_35px_rgba(34,197,94,0.3)]" : "border-white/10 hover:border-white/25"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 z-10 w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="relative h-52 overflow-hidden">
                        <img src={imageFor(v)} alt={v.name} loading="lazy" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <p className="absolute bottom-4 left-5 font-display text-2xl font-bold text-white">{v.name}</p>
                        {v.isAC && (
                          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 bg-black/60 border border-blue-400/40 text-blue-300 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                            <Snowflake size={11} /> AC
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                          <span className="inline-flex items-center gap-1.5"><Users size={15} className="text-green-400" /> {v.seats}{""} Seats</span>
                          <span className="inline-flex items-center gap-1.5"><Luggage size={15} className="text-green-400" /> {v.luggage}{""} Bags</span>
                        </div>
                        <div className="border-t border-white/10 pt-3 min-h-[44px] flex items-center">
                          {estimatingId === v._id ? (
                            <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                              <Loader2 size={15} className="animate-spin text-green-400" /> Calculating fare…
                            </span>
                          ) : fare ? (
                            <p className="text-xl font-bold text-green-400">
                              ₹{fare.estimatedFare}
                              <span className="text-xs font-normal text-gray-500 ml-2">{fare.distance?.toFixed(1)} km · {formatTripDuration(fare.duration)}</span>
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">Tap to calculate fare</p>
                          )}
                        </div>
                        <Motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={(e) => { e.stopPropagation(); handleBookNow(v); }}
                          disabled={estimatingId === v._id || bookingNowId === v._id}
                          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50"
                        >
                          {bookingNowId === v._id ? (
                            <><Loader2 size={16} className="animate-spin" /> Booking…</>
                          ) : (
                            <>Book Now <ArrowRight size={16} /></>
                          )}
                        </Motion.button>
                      </div>
                    </Motion.div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default CarTypePage;
