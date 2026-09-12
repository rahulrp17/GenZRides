import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { ArrowLeft, MapPin, Navigation, CalendarDays, CarFront, Loader2, User, Mail, Phone, Home, StickyNote, Info } from "lucide-react";
import SEO from "../../components/SEO";
import Navbar from "../../Component/Navbar/Navbar";
import Footer from "../../Component/Footer/Footer";
import Modal from "../../components/shared/Modal";
import FareNotes from "../../components/shared/FareNotes";
import PageHero from "../../Component/Landing/PageHero";
import { bookingAPI, guestAPI, vehicleAPI } from "../../services/endpoints";
import { hero8 } from "../../assets/images";
import { loadDraft, clearDraft } from "./guestDraft";
import { Reveal } from "../../Component/Landing/Reveal";

const formatCurrency = (n) => `₹${Number(n ?? 0).toFixed(2)}`;

const fmtWhen = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

const ConfirmPage = () => {
  const navigate = useNavigate();
  const draft = useMemo(() => loadDraft(), []);
  const [vehicle, setVehicle] = useState(null);
  const [name, setName] = useState(draft?.guest?.name || "");
  const [email, setEmail] = useState(draft?.guest?.email || "");
  const [phone, setPhone] = useState(draft?.guest?.phone || "");
  const [pickupAddress, setPickupAddress] = useState(draft?.guest?.address || draft?.pickup?.address || "");
  const [note, setNote] = useState("");
  const [booking, setBooking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!draft?.pickup?.lat || !draft?.drop?.lat || !draft?.vehicleType || !draft?.fareEstimate) {
      navigate("/booking", { replace: true });
      return;
    }
    (async () => {
      try {
        const { data } = await vehicleAPI.getAll();
        setVehicle((data?.vehicles || []).find((v) => v._id === draft.vehicleType) || null);
      } catch {
        // vehicle name falls back below; fare already in draft
      }
    })();
  }, [draft, navigate]);

  if (!draft?.fareEstimate) return null;

  const fare = draft.fareEstimate;
  const days = draft.tripType === "Round Trip" ? (draft.days || 1) : 1;

  const validateDetails = () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    if (cleanName.length < 2 || cleanName.length > 50) {
      toast.error("Please enter your full name.");
      return null;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return null;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number.");
      return null;
    }
    if (!pickupAddress.trim()) {
      toast.error("Please confirm your pickup address.");
      return null;
    }
    return { cleanName, cleanEmail, cleanPhone };
  };

  const openConfirm = (e) => {
    e.preventDefault();
    if (booking) return;
    if (validateDetails()) setConfirmOpen(true);
  };

  const handleBook = async () => {
    const validated = validateDetails();
    if (!validated) {
      setConfirmOpen(false);
      return;
    }
    const { cleanName, cleanEmail, cleanPhone } = validated;

    setBooking(true);
    try {
      const payload = {
        pickup: { address: pickupAddress.trim(), latitude: draft.pickup.lat, longitude: draft.pickup.lng },
        drop: { address: draft.drop.address, latitude: draft.drop.lat, longitude: draft.drop.lng },
        pickupDateTime: new Date(draft.pickupDateTime).toISOString(),
        tripType: draft.tripType,
        days,
        vehicleType: draft.vehicleType,
        paymentMethod: "Cash",
        customerNotes: note.trim(),
      };

      let bookingRef;
      let duplicate = false;
      const token = localStorage.getItem("accessToken");
      if (token) {
        // Logged-in guest-flow users keep the booking on their account
        const { data } = await bookingAPI.create(payload);
        if (!data.success) throw new Error(data.message || "Booking failed.");
        bookingRef = data.booking?._id || data.data?._id;
      } else {
        const { data } = await guestAPI.create({
          ...payload,
          guestName: cleanName,
          guestEmail: cleanEmail,
          guestPhone: cleanPhone,
        });
        if (!data.success) throw new Error(data.message || "Booking failed.");
        bookingRef = data.booking?._id;
        duplicate = !!data.duplicate;
      }

      if (duplicate) toast.success("Booking already received — showing its status.");
      else toast.success("Booking confirmed! Waiting for approval.");
      clearDraft();
      navigate("/booking/waiting", { state: { ref: bookingRef, name: cleanName, note: note.trim() } });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO noindex title="Confirm Your Booking" />
      <Navbar />
      <PageHero
        eyebrow="Step 3 of 3 — Confirmation"
        title="Confirm your ride"
        sub="Review the trip, share your contact details, and book."
        img={hero8}
      />

      <section className="relative py-14 md:py-20">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <Link to="/booking/vehicles" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to car types
          </Link>

          <div className="grid lg:grid-cols-2 gap-5 md:gap-6 items-start">
            {/* LEFT — trip summary */}
            <Reveal className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-white mb-5">Trip Summary</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-emerald-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Pickup</p>
                    <p className="text-sm font-medium text-white break-words">{draft.pickup.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                    <Navigation size={16} className="text-red-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Drop</p>
                    <p className="text-sm font-medium text-white break-words">{draft.drop.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <CalendarDays size={16} className="text-blue-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Date &amp; Time</p>
                    <p className="text-sm font-medium text-white">{fmtWhen(draft.pickupDateTime)} · {draft.tripType}{draft.tripType === "Round Trip" ? ` · ${days} day${days > 1 ? "s" : ""}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                    <CarFront size={16} className="text-green-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Vehicle</p>
                    <p className="text-sm font-medium text-white">{vehicle?.name || "Selected car"}</p>
                  </div>
                </div>
                {note.trim() && (
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <StickyNote size={16} className="text-amber-400" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-widest">Booking Note</p>
                      <p className="text-sm font-medium text-white break-words">{note.trim()}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 mt-6 pt-5 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Distance</span>
                  <span className="text-white">{fare.distance?.toFixed(1)} km · {Math.ceil(fare.duration)} min</span>
                </div>
                {draft.tripType === "Round Trip" && days > 1 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Total distance ({days} days)</span>
                    <span className="text-white">{(fare.distance * days).toFixed(1)} km</span>
                  </div>
                )}
                {fare.fareBreakdown && (
                  <>
                    <div className="flex justify-between text-gray-400"><span>Base fare</span><span className="text-white">{formatCurrency(fare.fareBreakdown.baseFare)}</span></div>
                    <div className="flex justify-between text-gray-400">
                      <span>{fare.fareBreakdown.baseKm > 0 && fare.fareBreakdown.chargeableDistance < fare.fareBreakdown.billedDistanceKm
                        ? `Distance fare (${fare.fareBreakdown.chargeableDistance} km billed · ${fare.fareBreakdown.baseKm} km included in base fare)`
                        : "Distance fare"}</span>
                      <span className="text-white">{formatCurrency(fare.fareBreakdown.distanceFare)}</span>
                    </div>
                    {fare.fareBreakdown.billedDistanceKm != null &&
                      fare.distance != null &&
                      Number(fare.fareBreakdown.billedDistanceKm) > Number(fare.distance) && (
                        <div className="flex justify-between text-gray-400">
                          <span>Billed distance</span>
                          <span className="text-white">{Number(fare.fareBreakdown.billedDistanceKm).toFixed(1)} km (minimum applied)</span>
                        </div>
                      )}
                    {fare.fareBreakdown.driverAllowance > 0 && (
                      <div className="flex justify-between text-gray-400">
                        <span>Driver bata{fare.fareBreakdown.bataPerDay ? ` (₹${fare.fareBreakdown.bataPerDay}/day${fare.fareBreakdown.billableDays > 1 ? ` × ${fare.fareBreakdown.billableDays} days` : ""})` : ""}</span>
                        <span className="text-white">{formatCurrency(fare.fareBreakdown.driverAllowance)}</span>
                      </div>
                    )}
                    {fare.fareBreakdown.waitingCharge > 0 && (
                      <div className="flex justify-between text-gray-400"><span>Waiting charge (first 30 min free)</span><span className="text-white">{formatCurrency(fare.fareBreakdown.waitingCharge)}</span></div>
                    )}
                    {/* {fare.fareBreakdown.nightCharge > 0 && (
                      <div className="flex justify-between text-gray-400"><span>Night charge</span><span className="text-white">{formatCurrency(fare.fareBreakdown.nightCharge)}</span></div>
                    )} */}
                    {fare.fareBreakdown.airportCharge > 0 && (
                      <div className="flex justify-between text-gray-400"><span>Airport charge</span><span className="text-white">{formatCurrency(fare.fareBreakdown.airportCharge)}</span></div>
                    )}
                    {fare.fareBreakdown.tollCharges > 0 && (
                      <div className="flex justify-between text-gray-400"><span>Toll charges</span><span className="text-white">{formatCurrency(fare.fareBreakdown.tollCharges)}</span></div>
                    )}
                    {fare.fareBreakdown.permitCharges > 0 && (
                      <div className="flex justify-between text-gray-400"><span>Permit charges</span><span className="text-white">{formatCurrency(fare.fareBreakdown.permitCharges)}</span></div>
                    )}
                  </>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-display text-2xl font-bold text-green-400">{formatCurrency(fare.estimatedFare)}</span>
                </div>
                <p className="text-xs text-gray-500">Pay cash to the driver. Tolls &amp; permits extra at actuals.</p>
              </div>
            </Reveal>

            {/* RIGHT — guest details */}
            <Reveal delay={0.1} className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-white mb-1">Your Details</h2>
              <p className="text-gray-400 text-sm mb-6">The driver will contact you on these details.</p>
              <form onSubmit={openConfirm} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><User size={14} className="text-green-400" /> Full Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required minLength={2} maxLength={50}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Mail size={14} className="text-green-400" /> Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Phone size={14} className="text-green-400" /> Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" required pattern="[6-9]\d{9}" title="Enter a valid 10-digit Indian mobile number"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Home size={14} className="text-green-400" /> Pickup Address</label>
                  <textarea value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} rows={2} required
                    placeholder="Flat, street, landmark for the driver"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition resize-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><StickyNote size={14} className="text-green-400" /> Booking Note <span className="text-gray-500 font-normal">(optional)</span></label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} rows={2}
                    placeholder="Flight number, luggage, pet, extra stop…"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition resize-none" />
                </div>
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={booking}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(34,197,94,0.55)] transition-all disabled:opacity-50"
                >
                  Book Now
                </Motion.button>
              </form>
            </Reveal>
          </div>

          {/* Premium informational note — good to know before you ride */}
          <Reveal className="mt-5 md:mt-6 bg-gradient-to-br from-emerald-500/10 via-white/5 to-transparent backdrop-blur-lg rounded-[30px] border border-emerald-500/20 p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Info size={16} className="text-emerald-400" />
              </span>
              <h2 className="font-display text-lg font-bold text-white">Good to know</h2>
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-300">
              <li className="flex gap-2.5"><span className="text-emerald-400 shrink-0">✓</span> Free cancellation any time before the ride starts, right from your bookings.</li>
              <li className="flex gap-2.5"><span className="text-emerald-400 shrink-0">✓</span> Pay cash to the driver. Tolls, permits and waiting beyond free limits apply at actuals.</li>
              <li className="flex gap-2.5"><span className="text-emerald-400 shrink-0">✓</span> Your driver calls you on confirmation — keep your phone reachable.</li>
              <li className="flex gap-2.5"><span className="text-emerald-400 shrink-0">✓</span> Be ready 10 minutes early. Night allowance may apply 11 PM – 5 AM, shown upfront.</li>
            </ul>
          </Reveal>

          {/* Fare & cancellation notes near the price */}
          <div className="mt-5 md:mt-6">
            <FareNotes />
          </div>
        </div>
      </section>

      {/* Premium glass confirm popup — Confirm uses the existing booking
          API; Cancel just closes. Submit is disabled while booking so no
          duplicate booking can be created. */}
      <Modal isOpen={confirmOpen} onClose={() => !booking && setConfirmOpen(false)} title="Confirm your booking" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5 text-sm">
            {/* Fare breakdown */}
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Base fare</span>
              <span className="text-white font-medium">{formatCurrency(fare.fareBreakdown?.baseFare)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Distance fare</span>
              <span className="text-white font-medium">{formatCurrency(fare.fareBreakdown?.distanceFare)}</span>
            </div>
            {fare.fareBreakdown?.driverAllowance > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Driver bata</span>
                <span className="text-white font-medium">{formatCurrency(fare.fareBreakdown?.driverAllowance)}</span>
              </div>
            )}
            {fare.fareBreakdown?.tollCharges > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Toll fee</span>
                <span className="text-white font-medium">{formatCurrency(fare.fareBreakdown?.tollCharges)}</span>
              </div>
            )}
            {fare.fareBreakdown?.permitCharges > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Permit fee</span>
                <span className="text-white font-medium">{formatCurrency(fare.fareBreakdown?.permitCharges)}</span>
              </div>
            )}
            {draft.tripType === "One Way" && (
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Waiting charge</span>
                <span className="text-white font-medium">₹2.5/min after 30 min</span>
              </div>
            )}
            {fare.fareBreakdown?.waitingCharge > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Waiting fee</span>
                <span className="text-white font-medium">{formatCurrency(fare.fareBreakdown?.waitingCharge)}</span>
              </div>
            )}
            {/* {fare.fareBreakdown?.nightCharge > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Night charge</span>
                <span className="text-white font-medium">{formatCurrency(fare.fareBreakdown?.nightCharge)}</span>
              </div>
            )} */}
            <div className="flex justify-between items-center gap-3 pt-2 border-t border-white/10">
              <span className="text-gray-300 font-semibold">Total fare</span>
              <span className="font-display text-2xl font-bold text-green-400">₹{fare.estimatedFare}</span>
            </div>
          </div>
          {/* Notes */}
          <div className="bg-red-800 border border-white/10 rounded-2xl p-4 text-xs text-white space-y-1.5">
            <p> <strong>Note:</strong> Pay cash to the driver. Tolls &amp; permits extra at actuals.</p>
            {draft.tripType === "One Way" && <p>Waiting charge ₹2.5/min applies after 30 min free waiting.</p>}
            {note.trim() && <p className="text-gray-300">Note: {note.trim()}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={booking}
              className="py-3 min-h-[48px border bg-red-400/60 border-white/10 text-gray-200 rounded-2xl text-sm font-semibold hover:bg-white/10 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBook}
              disabled={booking}
              className="py-3 min-h-[48px] bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {booking ? (<><Loader2 size={16} className="animate-spin" /> Booking…</>) : "Confirm Booking"}
            </button>
          </div>
        </div>
      </Modal>
      <Footer />
    </main>
  );
};

export default ConfirmPage;
