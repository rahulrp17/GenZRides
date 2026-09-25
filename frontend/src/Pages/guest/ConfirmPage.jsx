import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { ArrowLeft, MapPin, Navigation, CalendarDays, CarFront, Loader2, Repeat, ArrowRight, User, Mail, Phone, Home, StickyNote, Info, Receipt } from "lucide-react";
import SEO from "../../components/SEO";
import { formatTripDuration } from "../../utils/formatDuration";
import Navbar from "../../Component/Navbar/Navbar";
import Footer from "../../Component/Footer/Footer";
import Modal from "../../components/shared/Modal";
import FareNotes from "../../components/shared/FareNotes";
import PageHero from "../../Component/Landing/PageHero";
import { bookingAPI, guestAPI, vehicleAPI } from "../../services/endpoints";
import { hero8 } from "../../assets/images";
import { loadDraft, saveDraft, clearDraft } from "./guestDraft";
import { toBookingRef } from "../../utils/bookingText";
import { Reveal } from "../../Component/Landing/Reveal";

const formatCurrency = (n) =>
  `₹${Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const perKmLabel = (n) =>
  n == null
    ? "—"
    : `₹${Number(n) % 1 === 0 ? Number(n).toFixed(0) : Number(n).toFixed(2)}/km`;

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
  const [note, setNote] = useState(draft?.guest?.note || "");
  const [booking, setBooking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Temporary visitor hold created by "Book Now" (guests only). "Confirm
  // Booking" converts this hold into the real instant booking.
  const [visitor, setVisitor] = useState(null);
  const [reserving, setReserving] = useState(false);
  const [nowTs, setNowTs] = useState(0);

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

  // Keep the customer's inputs across a page refresh — every keystroke is
  // written back into the draft so a refresh never empties the fields.
  useEffect(() => {
    if (!draft) return;
    saveDraft({
      ...draft,
      guest: {
        ...(draft.guest || {}),
        name,
        email,
        phone,
        note,
        address: pickupAddress,
      },
    });
  }, [draft, name, email, phone, note, pickupAddress]);

  // Ticking clock for the 10-minute trip hold shown in the modal.
  // (Above the early return — hooks must run on every render.)
  useEffect(() => {
    if (!confirmOpen || !visitor?.expiresAt) return;
    setNowTs(Date.now());
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [confirmOpen, visitor?.expiresAt]);

  if (!draft?.fareEstimate) return null;

  const fare = draft.fareEstimate;
  const days = draft.tripType === "Round Trip" ? (draft.days || 1) : 1;

  // Per-km tariff straight from the estimate (oneWayPerKm / roundTripPerKm).
  // Fallback derives it from the breakdown for drafts made before the API
  // started returning perKm, so old in-memory drafts never show a dash.
  const perKm =
    fare?.perKm ||
    (fare?.fareBreakdown?.chargeableDistance > 0
      ? fare.fareBreakdown.distanceFare / fare.fareBreakdown.chargeableDistance
      : null);

  // Billed figure shown on the invoice comes straight from the backend
  // (billedDistanceKm already nets the daily-minimum block on round
  // trips). totalRunningKm is only used for the "Total distance" row and
  // for detecting whether the per-day floor lifted the total.
  const rtLegs = draft.tripType === "Round Trip" ? 2 : 1;
  const billedTotalKm =
    fare.fareBreakdown?.billedDistanceKm ??
    fare.fareBreakdown?.totalRunningKm ??
    fare.distance;
  const totalKm =
    fare.fareBreakdown?.totalRunningKm ??
    fare.fareBreakdown?.billedDistanceKm ??
    fare.distance;
  const minimumApplied =
    (fare.distance ?? 0) > 0 && (totalKm ?? 0) > rtLegs * fare.distance;

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

  const holdLeftMs = visitor?.expiresAt
    ? new Date(visitor.expiresAt).getTime() - nowTs
    : null;
  const holdCountdown =
    holdLeftMs == null || nowTs === 0
      ? ""
      : holdLeftMs <= 0
        ? "expired"
        : `${Math.floor(holdLeftMs / 60000)}:${String(
            Math.floor((holdLeftMs % 60000) / 1000),
          ).padStart(2, "0")}`;

  const buildVisitPayload = (validated) => ({
    pickup: {
      address: pickupAddress.trim(),
      latitude: draft.pickup.lat,
      longitude: draft.pickup.lng,
    },
    drop: {
      address: draft.drop.address,
      latitude: draft.drop.lat,
      longitude: draft.drop.lng,
    },
    pickupDateTime: new Date(draft.pickupDateTime).toISOString(),
    tripType: draft.tripType,
    days,
    vehicleType: draft.vehicleType,
    customerNotes: note.trim(),
    guestName: validated.cleanName,
    guestEmail: validated.cleanEmail,
    guestPhone: validated.cleanPhone,
  });

  // Did the guest edit anything after the hold was created?
  const holdIsStale = (validated) =>
    !visitor ||
    visitor.guestName !== validated.cleanName ||
    visitor.guestEmail !== validated.cleanEmail ||
    visitor.guestPhone !== validated.cleanPhone ||
    visitor.pickup?.address !== pickupAddress.trim() ||
    (visitor.customerNotes || "") !== note.trim();

  const openConfirm = async (e) => {
    e.preventDefault();
    if (booking || reserving) return;
    const validated = validateDetails();
    if (!validated) return;
    // Logged-in users book directly on their account (unchanged flow).
    if (localStorage.getItem("accessToken")) {
      setConfirmOpen(true);
      return;
    }
    // Guests: "Book Now" only reserves a temporary 10-minute hold.
    setReserving(true);
    try {
      const { data } = await guestAPI.visit(buildVisitPayload(validated));
      if (!data.success) throw new Error(data.message || "Could not hold your trip.");
      setVisitor(data.visitor);
      setConfirmOpen(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Could not hold your trip. Please try again.",
      );
    } finally {
      setReserving(false);
    }
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
      let createdResponse = null;
      const token = localStorage.getItem("accessToken");
      if (token) {
        // Logged-in guest-flow users keep the booking on their account
        const { data } = await bookingAPI.create(payload);
        if (!data.success) throw new Error(data.message || "Booking failed.");
        bookingRef = data.booking?._id || data.data?._id;
        createdResponse = data;
      } else {
        // Guests: "Confirm Booking" converts the temporary hold into the
        // real instant booking (Pending Approval until admin verifies).
        // Details edited after the hold refresh it first so the booking
        // carries exactly what the guest confirmed.
        let visitorId = visitor?._id;
        if (holdIsStale(validated)) {
          const { data: hold } = await guestAPI.visit(
            buildVisitPayload(validated),
          );
          if (!hold.success) throw new Error(hold.message || "Booking failed.");
          visitorId = hold.visitor._id;
          setVisitor(hold.visitor);
        }
        const { data } = await guestAPI.confirm({ visitorId });
        if (!data.success) throw new Error(data.message || "Booking failed.");
        bookingRef = data.booking?._id;
        duplicate = !!data.duplicate;
        createdResponse = data;
      }

      if (duplicate) toast.success("Booking already received — showing its status.");
      else toast.success("Booking confirmed! Waiting for approval.");

      // Snapshot the confirmed trip so the Waiting page can show full booking
      // details — and survives a refresh (the guest has no account to fetch
      // the booking from).
      const bookingInfo = createdResponse?.booking || createdResponse?.data || null;
      // Canonical tracking ref (last 8 of the _id, uppercase) — this is what
      // the track-ride form, Waiting page and backend lookup all key on.
      const shortRef = toBookingRef(bookingRef);
      const summary = {
        ref: shortRef,
        pickupAddress: pickupAddress.trim(),
        dropAddress: draft.drop.address,
        pickupDateTime: new Date(draft.pickupDateTime).toISOString(),
        tripType: draft.tripType,
        days,
        vehicleName: bookingInfo?.vehicleType?.name || vehicle?.name || "Selected car",
        distance: bookingInfo?.distance ?? fare?.distance ?? null,
        duration: bookingInfo?.duration ?? fare?.duration ?? null,
        estimatedFare: bookingInfo?.estimatedFare ?? fare?.estimatedFare ?? null,
        guestName: cleanName,
        guestEmail: cleanEmail,
        guestPhone: cleanPhone,
        note: note.trim(),
      };
      try {
        sessionStorage.setItem("guestBookingSummary", JSON.stringify(summary));
      } catch {
        // ignore — details just won't survive a refresh
      }

      // Backend is the source of truth: the booking (with guestName/guestPhone)
      // is stored server-side and fetched live by the My Booking page. These
      // keys are just the reference handle that lets the page auto-fill the
      // lookup form on this device.
      if (!token) {
        try {
          localStorage.setItem("guestBookingRef", shortRef);
          localStorage.setItem("guestBookingPhone", cleanPhone);
          localStorage.setItem("guestBookingName", cleanName);
        } catch {
          // ignore — the guest can type ref + phone manually on My Booking
        }
      }

      clearDraft();
      navigate("/booking/waiting", { state: { ref: shortRef, name: cleanName, note: note.trim(), booking: summary } });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Booking failed. Please try again.");
      // Expired hold — drop it so "Book Now" reserves a fresh one.
      if (err.response?.status === 410) {
        setConfirmOpen(false);
        setVisitor(null);
      }
    } finally {
      setBooking(false);
    }
  };

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO noindex title="Confirm Your Booking" description="Review your trip details and confirm your cab booking with GenZRides." path="/booking/confirm" />
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

              <div className="border-t border-white/10 mt-6 pt-5 text-sm">
                <div className="flex items-center justify-between gap-3 pb-2 border-b border-dashed border-white/15">
                  <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
                    <Receipt size={13} className="text-emerald-400" /> PAYMENT SUMMARY
                  </span>
                  <span className="text-[11px] text-gray-500 tabular-nums">
                    {fare.distance?.toFixed(1)} km · {formatTripDuration(fare.duration)}
                  </span>
                </div>
                {draft.tripType === "Round Trip" && days > 1 && (
                  <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5 text-gray-400">
                    <span>Total distance ({days} days)</span>
                    <span className="text-white tabular-nums shrink-0">{(totalKm ?? 0).toFixed(1)} km{minimumApplied ? " (minimum applied)" : ""}</span>
                  </div>
                )}
                 {(draft.tripType === "Round Trip" || minimumApplied) && billedTotalKm != null && (
                      <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5 text-gray-400">
                        <span>
                          Billed distance
                          
                            <span className="block text-[11px] text-gray-500 font-normal">{totalKm } km - {fare.fareBreakdown.baseKm} km</span>
                          
                        </span>
                        <span className="text-white tabular-nums shrink-0">{Number(billedTotalKm).toFixed(1)} km</span>
                      </div>
                    )}
                {fare.fareBreakdown && (
                  <>
                    <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5 text-gray-400">
                      <span>
                        Base fare
                        {fare.fareBreakdown.baseKm > 0 && (
                          <span className="block text-[11px] text-gray-500 font-normal">first {fare.fareBreakdown.baseKm} km included</span>
                        )}
                      </span>
                      <span className="text-white tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown.baseFare)}</span>
                    </div>
                    <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5 text-gray-400">
                      <span>
                        Distance fare
                        {fare.fareBreakdown.chargeableDistance > 0 && perKm != null && (
                          <span className="block text-[11px] text-gray-500 font-normal">({(totalKm ?? 0).toFixed(1)} km - {fare.fareBreakdown.baseKm} km) x ₹{perKm}/perKm </span>
                        )}
                      </span>
                      <span className="text-white tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown.distanceFare)}</span>
                    </div>
                   
                    {fare.fareBreakdown.driverAllowance > 0 && (
                      <div className="flex justify-between gap-3 py-1.5 border-b-2  border-white/30 text-gray-400">
                        <span>
                          Driver bata
                          <span className="block text-[11px] text-gray-500 font-normal">driver food & stay{fare.fareBreakdown.bataPerDay ? ` · ₹${fare.fareBreakdown.bataPerDay}/day${fare.fareBreakdown.billableDays > 1 ? ` × ${fare.fareBreakdown.billableDays} days` : ""}` : ""}</span>
                        </span>
                        <span className="text-white tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown.driverAllowance)}</span>
                      </div>
                    )}
                    {fare.fareBreakdown.waitingCharge > 0 && (
                      <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5 text-gray-400">
                        <span>
                          Waiting fee
                          <span className="block text-[11px] text-gray-500 font-normal">first 30 min free</span>
                        </span>
                        <span className="text-white tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown.waitingCharge)}</span>
                      </div>
                    )}
                    {fare.fareBreakdown.airportCharge > 0 && (
                      <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5 text-gray-400">
                        <span>
                          Airport charge
                          <span className="block text-[11px] text-gray-500 font-normal">airport pickup / drop fee</span>
                        </span>
                        <span className="text-white tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown.airportCharge)}</span>
                      </div>
                    )}
                    {fare.fareBreakdown.tollCharges > 0 && (
                      <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5 text-gray-400">
                        <span>
                          Toll charges
                          <span className="block text-[11px] text-gray-500 font-normal">toll plazas on your route</span>
                        </span>
                        <span className="text-white tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown.tollCharges)}</span>
                      </div>
                    )}
                    {fare.fareBreakdown.permitCharges > 0 && (
                      <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5 text-gray-400">
                        <span>
                          Permit charges
                          <span className="block text-[11px] text-gray-500 font-normal">interstate permit, if applicable</span>
                        </span>
                        <span className="text-white tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown.permitCharges)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between items-center gap-3 pt-2.5">
                  <span className="font-semibold text-white">
                    Amount payable
                    <span className="block text-[11px] text-gray-500 font-normal">pay cash to the driver for</span>
                  </span>
                  <span className="font-display text-2xl font-bold text-green-400 tabular-nums">{formatCurrency(fare.estimatedFare)}</span>
                </div>
                <p className="text-xs text-gray-500">Tolls &amp; permits extra at actuals.</p>
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
                  <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><StickyNote size={14} className="text-green-400" /> Booking Note <span className="text-gray-500 font-normal"></span></label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} rows={2} required
                    placeholder="Exact Picup Address,Flight number, luggage, pet, extra stop…"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition resize-none" />
                </div>
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={booking || reserving}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(34,197,94,0.55)] transition-all disabled:opacity-50"
                >
                  {reserving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Holding your trip…
                    </>
                  ) : (
                    "Book Now"
                  )}
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

      {/* Premium glass confirm popup — Confirm converts the temporary
          visitor hold into the real instant booking (guests) or books
          directly (logged-in); Cancel just closes. Submit is disabled
          while booking so no duplicate booking can be created. */}
      <Modal isOpen={confirmOpen} onClose={() => !booking && setConfirmOpen(false)} title="Confirm your booking" maxWidth="max-w-md">
        <div className="space-y-3">
          {/* Trip hold — guests only: reference + live 10-minute countdown */}
          {visitor && !localStorage.getItem("accessToken") && (
            <div className="flex items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3.5 py-2.5 text-[13px]">
              <span className="text-gray-400 min-w-0">
                Trip hold{" "}
                <span className="font-mono font-semibold text-emerald-300">
                  {visitor.reference}
                </span>
              </span>
              {holdCountdown && (
                <span
                  className={`font-semibold tabular-nums shrink-0 ${
                    holdCountdown === "expired" ? "text-red-300" : "text-emerald-300"
                  }`}
                >
                  {holdCountdown === "expired" ? "expired" : `reserved ${holdCountdown}`}
                </span>
              )}
            </div>
          )}
          {/* Guest details — compact contact strip */}
          <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/10">
            {[
              ["Customer", name.trim() || "—"],
              ["Email", email.trim() || "—"],
              ["Phone", phone.trim() || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 px-3.5 py-2 text-[13px] min-w-0">
                <span className="shrink-0 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">{label}</span>
                <span className="text-white font-medium truncate">{value}</span>
              </div>
            ))}
          </div>

          {/* Trip card — route, schedule, vehicle */}
          <div className="bg-gradient-to-br from-emerald-500/15 via-white/5 to-transparent border border-emerald-500/20 rounded-xl p-3.5">
            <div className="relative pl-4 space-y-2 text-[13px]">
              <span aria-hidden className="absolute left-[4px] top-1 bottom-1 w-px bg-gradient-to-b from-green-400/70 via-white/15 to-red-400/70" />
              <div className="relative min-w-0">
                <span aria-hidden className="absolute  left-[-15px] top-1 w-[9px] h-[9px] rounded-full bg-green-400 ring-4 ring-green-400/20" />
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Pickup</p>
                <p className="text-white font-medium break-words">{draft.pickup.address}</p>
              </div>
              <div className="relative min-w-0">
                <span aria-hidden className="absolute  left-[-15px] top-3 w-[9px] h-[9px] rounded-full bg-red-400 ring-4 ring-red-400/20" />
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Drop</p>
                <p className="text-white font-medium break-words">{draft.drop.address}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[12px]">
              <div className="flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 min-w-0">
                <CalendarDays size={12} className="text-blue-400 shrink-0" />
                <span className="truncate">{fmtWhen(draft.pickupDateTime)}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 min-w-0">
                <CarFront size={12} className="text-green-400 shrink-0" />
                <span className="truncate">{vehicle?.name || "Selected car"}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 min-w-0">
                <Navigation size={12} className="text-sky-400 shrink-0" />
                <span className="truncate">{fare.distance?.toFixed(1)} km · {formatTripDuration(fare.duration)}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 min-w-0">
                {draft.tripType === "Round Trip"
                  ? <Repeat size={12} className="text-emerald-400 shrink-0" />
                  : <ArrowRight size={12} className="text-emerald-400 shrink-0" />}
                <span className="truncate">{draft.tripType}{draft.tripType === "Round Trip" ? ` · ${days} day${days > 1 ? "s" : ""}` : ""}</span>
              </div>
            </div>
          </div>

          {/* Trip invoice — plain-language fare receipt */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-[13px]">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-dashed border-white/15">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
                <Receipt size={13} className="text-emerald-400" /> PAYMENT SUMMARY
              </span>
              <span className="text-[11px] text-gray-500 tabular-nums">
                {fare.distance?.toFixed(1)} km · {formatTripDuration(fare.duration)}
              </span>
            </div>
            <div className="py-1">
              <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                <span className="text-gray-300">
                  Base fare
                  {fare.fareBreakdown?.baseKm > 0 && (
                    <span className="block text-[11px] text-gray-500 font-normal">first {fare.fareBreakdown.baseKm} km included</span>
                  )}
                </span>
                <span className="text-white font-medium tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown?.baseFare)}</span>
              </div>
              <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                <span className="text-gray-300">
                  Distance fare
                  {fare.fareBreakdown?.chargeableDistance > 0 && perKm != null && (
                    <span className="block text-[11px] text-gray-500 font-normal">({(totalKm ?? 0).toFixed(1)} km - {fare.fareBreakdown.baseKm} km) x ₹{perKmLabel}{perKm}/perKm </span>
                  )}
                </span>
                <span className="text-white font-medium tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown?.distanceFare)}</span>
              </div>
              {fare.fareBreakdown?.driverAllowance > 0 && (
                <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                  <span className="text-gray-300">
                    Driver bata
                    <span className="block text-[11px] text-gray-500 font-normal">driver food & stay{draft.tripType === "Round Trip" ? ` × ${fare.fareBreakdown.billableDays || days} day(s)` : ""}</span>
                  </span>
                  <span className="text-white font-medium tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown?.driverAllowance)}</span>
                </div>
              )}
              {fare.fareBreakdown?.tollCharges > 0 && (
                <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                  <span className="text-gray-300">
                    Toll fee
                    <span className="block text-[11px] text-gray-500 font-normal">toll plazas on your route</span>
                  </span>
                  <span className="text-white font-medium tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown?.tollCharges)}</span>
                </div>
              )}
              {fare.fareBreakdown?.permitCharges > 0 && (
                <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                  <span className="text-gray-300">
                    Permit fee
                    <span className="block text-[11px] text-gray-500 font-normal">interstate permit, if applicable</span>
                  </span>
                  <span className="text-white font-medium tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown?.permitCharges)}</span>
                </div>
              )}
              {fare.fareBreakdown?.waitingCharge > 0 && (
                <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                  <span className="text-gray-300">
                    Waiting fee
                    <span className="block text-[11px] text-gray-500 font-normal">first 30 min free</span>
                  </span>
                  <span className="text-white font-medium tabular-nums shrink-0">{formatCurrency(fare.fareBreakdown?.waitingCharge)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center gap-3 pt-2.5">
              <span className="text-gray-200 font-semibold">
                Amount payable
                <span className="block text-[11px] text-gray-500 font-normal">pay cash to the driver</span>
              </span>
              <span className="font-display text-xl font-bold text-green-400 tabular-nums">₹{Number(fare.estimatedFare ?? 0).toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Notes — single line */}
          <p className="text-[11px] leading-5 bg-red-700 border border-white/10 text-200 rounded-md px-2.5 py-1.5 text-gray-400">
            <span className="text-black font-bold">Note:</span> <span className="text-white">Pay cash to the driver for Tolls &amp; permits at actuals.{""} {draft.tripType === "One Way" && " Waiting charge ₹2.5/min  will apply when driver waiting at pick up point after 30 min ."}</span> 
            
            <br />
            {note.trim() && <span className="text-black font-bold">Customer note:</span>}{note.trim() && <span className="text-white"> {note.trim()}</span>}
          </p>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={booking}
              className="py-2.5 min-h-[44px] border bg-red-400/60 border-white/10 text-gray-200 rounded-xl text-sm font-semibold hover:bg-white/10 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBook}
              disabled={booking}
              className="py-2.5 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {booking ? (<><Loader2 size={15} className="animate-spin" /> Booking…</>) : "Confirm Booking"}
            </button>
          </div>
        </div>
      </Modal>
      <Footer />
    </main>
  );
};

export default ConfirmPage;
