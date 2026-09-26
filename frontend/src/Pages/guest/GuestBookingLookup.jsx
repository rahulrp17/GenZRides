import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Search,
  Loader2,
  MapPin,
  Navigation,
  CalendarDays,
  CarFront,
  Clock3,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  ArrowRight,
  Home,
  Wallet,
  Ban,
  ShieldCheck,
  RefreshCw,
  Receipt,
  History,
} from "lucide-react";
import SEO from "../../components/SEO";
import Navbar from "../../Component/Navbar/Navbar";
import Footer from "../../Component/Footer/Footer";
import PageHero from "../../Component/Landing/PageHero";
import Modal from "../../components/shared/Modal";
import { guestAPI } from "../../services/endpoints";
import { hero2 } from "../../assets/images";
import { Reveal } from "../../Component/Landing/Reveal";
import { formatTripDuration } from "../../utils/formatDuration";
import { BookingStatusBadge } from "../../utils/bookingStatus";
import { toBookingRef } from "../../utils/bookingText";

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

const formatCurrency = (n) =>
  n == null ? "—" : `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// Raw backend statuses that still allow a guest cancel.
const CANCELLABLE = new Set(["Pending", "Accepted", "On The Way", "Arrived", "Started", "Reached"]);

// Compact labeled section card for the detail page.
const Section = ({ icon, title, action, children }) => (
  <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4">
    <div className="flex items-center justify-between gap-2 mb-2">
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-1.5">
        {icon}
        {title}
      </p>
      {action}
    </div>
    {children}
  </div>
);


const readLs = (key) => {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
};

const GuestBookingLookup = () => {
  const location = useLocation();
  const navState = location.state || {};
  // Normalize to the canonical 8-char caps ref — heals legacy localStorage
  // values that stored the full 24-char ObjectId, and any pasted input.
  const [ref, setRef] = useState(toBookingRef(navState.ref || readLs("guestBookingRef")));
  const [phone, setPhone] = useState((navState.phone || readLs("guestBookingPhone") || "").replace(/\D/g, "").slice(0, 10));
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lookedUp, setLookedUp] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (ref && phone) handleLookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookup = async (e) => {
    e?.preventDefault();
    const cleanRef = toBookingRef(ref);
    const cleanPhone = phone.trim();
    if (cleanRef.length < 6) return toast.error("Enter the booking reference from your confirmation.");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) return toast.error("Enter the 10-digit mobile number you booked with.");

    setLoading(true);
    setNotFound(false);
    setLookedUp(true);
    try {
      const { data } = await guestAPI.lookup({ ref: cleanRef, phone: cleanPhone });
      if (!data.success) throw new Error(data.message || "Couldn't find the booking.");
      setBooking(data.booking);
      try {
        localStorage.setItem("guestBookingRef", cleanRef);
        localStorage.setItem("guestBookingPhone", cleanPhone);
      } catch {
        // ignore
      }
      toast.success("Booking found!");
    } catch (err) {
      setBooking(null);
      setNotFound(true);
      toast.error(err.response?.data?.message || err.message || "Couldn't find the booking.");
    } finally {
      setLoading(false);
    }
  };

  const openCancel = () => {
    if (!booking || !CANCELLABLE.has(booking.bookingStatus)) return;
    setReason(booking.cancelReason && booking.cancelledBy === "Customer" ? booking.cancelReason : "");
    setCancelOpen(true);
  };

  const handleCancel = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      const { data } = await guestAPI.cancel(booking._id, {
        phone: phone.trim(),
        cancelReason: reason.trim() || "No reason provided",
      });
      if (!data.success) throw new Error(data.message || "Couldn't cancel.");
      setCancelOpen(false);
      setBooking({ ...booking, bookingStatus: "Cancelled", cancelledBy: data.booking?.cancelledBy, cancelReason: data.booking?.cancelReason, cancelledAt: data.booking?.cancelledAt });
      toast.success("Booking cancelled.");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Couldn't cancel the booking.");
    } finally {
      setCancelling(false);
    }
  };

  const status = booking?.bookingStatus || "";
  const cancellable = CANCELLABLE.has(status);

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO noindex title="Track My Booking" description="Look up your GenZRides guest booking by reference and phone." path="/booking/my-booking" />
      <Navbar />
      <PageHero className="hidden" eyebrow="Guest Self-Service" title="Track my booking" sub="Enter your booking reference and phone to see live status, driver and fare — stored safely on our server." img={hero2} />

      <section className="relative py-1 md:py0">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          {/* Lookup form */}
          <Reveal className="bg-white/5 hidden backdrop-blur-lg rounded-[30px] border border-white/10 p-6 sm:p-8">
            <form onSubmit={handleLookup} className="grid sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> BookingID</label>
                <input
                  value={ref}
                  onChange={(e) => setRef(toBookingRef(e.target.value))}
                  placeholder="e.g. 0D81F495 (from #ref)"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5"><Phone size={14} className="text-green-400" /> Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit number you booked with"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition"
                />
              </div>
              <Motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="sm:col-span-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3.5 rounded-2xl hover:shadow-[0_0_30px_rgba(34,197,94,0.55)] transition-all disabled:opacity-50"
              >
                {loading ? (<><Loader2 size={18} className="animate-spin" /> Finding booking…</>) : (<><Search size={18} /> Find my booking</>)}
              </Motion.button>
            </form>
            <p className="mt-4 text-xs text-gray-500 flex items-start gap-1.5 leading-relaxed">
              <ShieldCheck size={14} className="text-green-500 shrink-0 mt-0.5" />
              Your details are fetched live from our server — the reference + phone are the only keys to open them, so no one else can view or cancel your ride.
            </p>
          </Reveal>

          {notFound && (
            <Reveal delay={0.06} className="mt-5 md:mt-6 bg-red-500/10 backdrop-blur-lg rounded-[30px] border border-red-500/30 p-6 sm:p-8 text-center">
              <XCircle size={34} className="text-red-400 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-white">Booking not found</h3>
              <p className="text-sm text-gray-400 mt-2">
                Double-check the reference and the mobile number you used. If this is a logged-in account booking, sign in and open it from My Trips instead.
              </p>
            </Reveal>
          )}

          {booking && (
            <Reveal delay={0.08} className="mt-1 md:mt-6 bg-gradient-to-br from-emerald-500/10 via-white/5 to-transparent backdrop-blur-lg rounded-[30px] border border-emerald-500/20 p-5 sm:p-7 overflow-hidden">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white">Booking #{booking.ref}</h3>
                  <p className="text-sm text-gray-400 mt-1">{booking.guestName ? `Booked by ${booking.guestName}` : "Instant booking"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <BookingStatusBadge status={status} />
                  <button
                    type="button"
                    onClick={() => handleLookup()}
                    disabled={loading}
                    title="Refresh status"
                    aria-label="Refresh status"
                    className="p-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 hover:text-white transition disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {booking.approvalStatus === "Pending Approval" && status !== "Cancelled" && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-2.5 text-[13px] text-amber-200">
                  Waiting for Booking Confirmation — this usually takes a few minutes. Your driver is assigned right after.
                </div>
              )}
              {booking.approvalStatus === "Rejected" && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2.5 text-[13px] text-red-200">
                  Sorry, this request was not approved. Call us and we&apos;ll arrange your ride right away.
                </div>
              )}

              {status === "Cancelled" && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 text-sm text-gray-200">
                  {booking.cancelledAt && <>Cancelled on {fmtWhen(booking.cancelledAt)}. </>}
                  {booking.cancelReason && booking.cancelReason !== "No reason provided" && <span className="text-red-300">Reason: {booking.cancelReason}</span>}
                </div>
              )}

              {/* Customer */}
              <Section icon={<User size={12} className="text-green-400" />} title="Customer">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{booking.guestName || "Guest"}</p>
                    {booking.guestPhone && (
                      <p className="text-xs text-gray-400 mt-0.5">{booking.guestPhone}</p>
                    )}
                  </div>
                  {booking.guestPhone && (
                    <a href={`tel:${booking.guestPhone}`} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-200 rounded-full px-4 py-2 text-[13px] font-semibold hover:border-green-500/50 hover:text-green-300 transition shrink-0">
                      <Phone size={13} className="text-green-400" /> {booking.guestPhone}
                    </a>
                  )}
                </div>
              </Section>

              {/* Route timeline */}
              <div className="relative pl-6 sm:pl-7 mt-6 space-y-5">
                <span aria-hidden className="absolute left-[10px] sm:left-[14px] top-2 bottom-8 w-px bg-gradient-to-b from-green-400/70 via-white/15 to-red-400/70" />
                <div className="relative">
                  <span aria-hidden className="absolute left-[-18px] sm:left-[-18px] top-1.5 w-[9px] h-[9px] rounded-full bg-green-400 ring-4 ring-green-400/20" />
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-1.5"><MapPin size={12} className="text-green-400" /> Pickup</p>
                  <p className="text-sm sm:text-base font-medium text-white break-words">{booking.pickup?.address}</p>
                </div>
                <div className="relative">
                  <span aria-hidden className="absolute  left-[-18px] sm:left-[-18px] top-1.5 w-[9px] h-[9px] rounded-full bg-red-400 ring-4 ring-red-400/20" />
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-1.5"><Navigation size={12} className="text-red-400" /> Drop</p>
                  <p className="text-sm sm:text-base font-medium text-white break-words">{booking.drop?.address}</p>
                </div>
              </div>

              {/* Info chips */}
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {[
                  { icon: CalendarDays, color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30", label: "Date & Time", value: fmtWhen(booking.pickupDateTime) },
                  { icon: CarFront, color: "text-green-400", bg: "bg-green-500/15 border-green-500/30", label: "Vehicle", value: booking.vehicleType || "—" },
                  { icon: ArrowRight, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", label: "Trip", value: booking.tripType ? `${booking.tripType}${booking.tripType === "Round Trip" && booking.days > 1 ? ` · ${booking.days}d` : ""}` : "—" },
                  { icon: Wallet, color: "text-sky-400", bg: "bg-sky-500/15 border-sky-500/30", label: "Payment", value: `${booking.paymentMethod || "Cash"} · ${booking.paymentStatus || "Pending"}` },
                ].map((c) => (
                  <div key={c.label} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 min-w-0 ${c.bg}`}>
                    <span className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                      <c.icon size={14} className={c.color} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">{c.label}</p>
                      <p className="text-[12px] text-white font-medium truncate">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Driver */}
              <Section icon={<CarFront size={12} className="text-green-400" />} title="Driver">
                {booking.driver ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{booking.driver.name || "Driver assigned"}</p>
                      <p className="text-xs text-gray-400">
                        {[booking.driver.vehicleBrand, booking.driver.vehicleModel, booking.driver.vehicleColor].filter(Boolean).join(" ")} · <span className="font-mono text-gray-300">{booking.driver.vehicleNumber || "—"}</span>
                        {booking.driver.vehicleType ? ` · ${booking.driver.vehicleType}` : ""}
                      </p>
                    </div>
                    {booking.driver.phone && (
                      <a href={`tel:${booking.driver.phone}`} className="inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-300 rounded-full px-4 py-2 text-sm font-semibold hover:bg-green-500/25 transition shrink-0">
                        <Phone size={14} /> Call driver
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No driver assigned yet. Our dispatch team is finding the right cab for your route.</p>
                )}
              </Section>

              {/* Timestamps */}
              <Section icon={<History size={12} className="text-green-400" />} title="Timestamps">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[13px]">
                  <div className="flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 min-w-0">
                    <Clock3 size={12} className="text-gray-500 shrink-0" />
                    <span className="truncate">Booked · {fmtWhen(booking.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 min-w-0">
                    <CalendarDays size={12} className="text-blue-400 shrink-0" />
                    <span className="truncate">Pickup · {fmtWhen(booking.pickupDateTime)}</span>
                  </div>
                  {booking.cancelledAt && (
                    <div className="flex items-center gap-1.5 bg-black/25 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-300 min-w-0">
                      <XCircle size={12} className="text-red-400 shrink-0" />
                      <span className="truncate">Cancelled · {fmtWhen(booking.cancelledAt)}</span>
                    </div>
                  )}
                </div>
              </Section>

              {/* Trip receipt — invoice-style fare summary */}
              <Section
                icon={<Receipt size={12} className="text-green-400" />}
                title="Trip Receipt"
                action={
                  <span className="text-[11px] text-gray-500 tabular-nums">{fmtWhen(booking.pickupDateTime)}</span>
                }
              >
                <div className="text-[13px]">
                  <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                    <span className="text-gray-400">Distance travelled</span>
                    <span className="text-white font-medium tabular-nums shrink-0">
                      {booking.distance != null ? `${Number(booking.distance).toFixed(1)} km` : "—"}
                      {booking.duration != null ? ` · ${formatTripDuration(booking.duration)}` : ""}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                    <span className="text-gray-400">Cab & trip</span>
                    <span className="text-white font-medium truncate">
                      {booking.vehicleType || "—"}{booking.tripType ? ` · ${booking.tripType}` : ""}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-white/5">
                    <span className="text-gray-400">Payment mode</span>
                    <span className="text-white font-medium">
                      {booking.paymentMethod || "Cash"} · {booking.paymentStatus || "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-3 pt-2">
                    <span className="text-gray-200 font-semibold">
                      Amount payable
                      <span className="block text-[11px] text-gray-500 font-normal">
                        {booking.paymentMethod === "Cash" ? "pay cash to the driver" : "online payment"}
                      </span>
                    </span>
                    <span className="font-display text-xl font-bold text-emerald-300 tabular-nums">
                      {formatCurrency(booking.finalFare || booking.estimatedFare)}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Tolls & permits (if any) are charged at actuals on the road.
                </p>
              </Section>

              {/* Cancel */}
              {cancellable && (
                <div className="mt-6 flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-sm text-gray-300">Changed your mind? You can cancel free before the ride starts.</p>
                  <button
                    type="button"
                    onClick={openCancel}
                    className="shrink-0 inline-flex items-center gap-1.5 bg-red-500/15 border border-red-500/40 text-red-300 rounded-full px-4 py-2 text-sm font-semibold hover:bg-red-500/25 transition"
                  >
                    <Ban size={14} /> Cancel booking
                  </button>
                </div>
              )}
            </Reveal>
          )}

          {/* Actions */}
          {lookedUp && booking && (
            <Reveal delay={0.12} className="mt-5 md:mt-6 bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-6 sm:p-8 text-center">
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/booking">
                  <Motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(34,197,94,0.55)] transition-all">
                    Book Another Ride <ArrowRight size={18} />
                  </Motion.button>
                </Link>
                <Link to="/">
                  <Motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/5 border border-white/15 text-white font-semibold hover:border-green-500/50 hover:text-green-300 transition-all">
                    <Home size={18} /> Home
                  </Motion.button>
                </Link>
              </div>
            </Reveal>
          )}

          <p className="text-center text-xs text-gray-500 mt-6">
            Saved this on your device? We also keep your booking on our secure server — the reference + phone are all you need, from any phone.
          </p>
        </div>
      </section>

      {/* Cancel confirmation */}
      <Modal isOpen={cancelOpen} onClose={() => !cancelling && setCancelOpen(false)} title="Cancel this booking?" maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-gray-300">Your request to cancel booking <span className="font-mono font-semibold text-white">#{booking?.ref}</span> will be sent immediately and the driver (if assigned) will be released.</p>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Reason <span className="text-gray-500 font-normal">(optional)</span></label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              rows={2}
              placeholder="Tell the driver / team why you're cancelling"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 transition resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setCancelOpen(false)} disabled={cancelling} className="py-2.5 min-h-[44px] border border-white/10 text-gray-200 rounded-xl text-sm font-semibold hover:bg-white/10 transition disabled:opacity-50">
              Keep booking
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="py-2.5 min-h-[44px] bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cancelling ? (<><Loader2 size={15} className="animate-spin" /> Cancelling…</>) : (<><Ban size={15} /> Cancel booking</>)}
            </button>
          </div>
        </div>
      </Modal>
      <Footer />
    </main>
  );
};

export default GuestBookingLookup;