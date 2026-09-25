import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion as Motion } from "framer-motion";
import { Star, User, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import Modal from "../shared/Modal";
import { reviewAPI } from "../../services/endpoints";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const StarInput = ({ value, onChange, size = 34, label, hint }) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white">{label}</p>
        <span
          className={`text-xs font-semibold tabular-nums transition-colors ${
            shown ? "text-amber-300" : "text-gray-500"
          }`}
        >
          {shown ? `${shown}/5 · ${RATING_LABELS[shown]}` : hint || "Tap to rate"}
        </span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 mt-2" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Motion.button
            key={s}
            type="button"
            role="radio"
            aria-checked={value === s}
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
            whileHover={{ scale: 1.15, rotate: s % 2 ? 6 : -6 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onFocus={() => setHover(s)}
            onBlur={() => setHover(0)}
            onClick={() => onChange(s)}
            className="min-w-[44px] min-h-[44px] -m-1 p-1 flex items-center justify-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
          >
            <Star
              style={{ width: size, height: size }}
              className={`transition-all duration-150 ${
                s <= shown
                  ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.55)]"
                  : "text-gray-600 fill-white/5"
              }`}
            />
          </Motion.button>
        ))}
      </div>
    </div>
  );
};

/**
 * Premium post-ride review dialog.
 * Collects the overall trip rating + the driver rating + an optional note,
 * then posts { rating, driverRating, review } for the booking.
 */
const ReviewModal = ({ booking, isOpen, onClose, onSubmitted }) => {
  const queryClient = useQueryClient();
  const [overall, setOverall] = useState(0);
  const [driver, setDriver] = useState(0);
  const [text, setText] = useState("");

  // Fresh state every time a (different) booking is opened.
  useEffect(() => {
    if (isOpen) {
      setOverall(0);
      setDriver(0);
      setText("");
    }
  }, [isOpen, booking?._id]);

  const mutation = useMutation({
    mutationFn: ({ bookingId, rating, driverRating, review }) =>
      reviewAPI.create(bookingId, {
        rating,
        driverRating,
        review: review || undefined,
      }),
    onSuccess: () => {
      toast.success("Thanks for your feedback!");
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["rideHistory"] });
      queryClient.invalidateQueries({ queryKey: ["currentRideCustomer"] });
      queryClient.invalidateQueries({ queryKey: ["customerReviews"] });
      onSubmitted?.();
      onClose?.();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to submit review";
      if (msg.toLowerCase().includes("already")) {
        toast.success("Review already submitted");
        onSubmitted?.();
        onClose?.();
      } else {
        toast.error(msg);
      }
    },
  });

  const handleSubmit = () => {
    if (!overall) return toast.error("Please rate your overall trip");
    if (!driver) return toast.error("Please rate your driver");
    if (!booking?._id) return toast.error("Booking not found");
    mutation.mutate({
      bookingId: booking._id,
      rating: overall,
      driverRating: driver,
      review: text.trim().slice(0, 500),
    });
  };

  const driverName = booking?.driver?.user?.name || "your driver";
  const pending = mutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !pending && onClose?.()}
      title="Rate your ride"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Trip summary */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/15 via-white/5 to-emerald-500/10 p-4">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 blur-[60px] rounded-full"
          />
          <div className="relative flex items-center gap-3 min-w-0">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(251,191,36,0.4)]">
              <CheckCircle2 size={20} className="text-black/80" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                Trip completed 🎉
              </p>
              <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                <MapPin size={11} className="shrink-0 text-emerald-400" />
                {booking?.pickup?.address || "Pickup"} → {booking?.drop?.address || "Drop"}
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-2.5 mt-3 bg-black/30 border border-white/10 rounded-xl px-3 py-2">
            <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 overflow-hidden">
              {booking?.driver?.user?.profileImage ? (
                <img
                  src={booking.driver.user.profileImage}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User size={15} className="text-indigo-300" />
              )}
            </span>
            <p className="text-[13px] text-gray-300 truncate">
              Driven by <span className="text-white font-semibold">{driverName}</span>
              {booking?.driver?.vehicleNumber && (
                <span className="text-gray-500"> · {booking.driver.vehicleNumber}</span>
              )}
            </p>
          </div>
        </div>

        {/* Overall trip rating */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <StarInput value={overall} onChange={setOverall} label="Overall trip rating" />
        </div>

        {/* Driver rating */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <StarInput
            value={driver}
            onChange={setDriver}
            label={`Driver rating — ${driverName.split(" ")[0]}`}
          />
        </div>

        {/* Written feedback */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label htmlFor="ride-review-text" className="text-sm font-semibold text-white">
              Your review <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <span className="text-[11px] text-gray-500 tabular-nums">{text.length}/500</span>
          </div>
          <textarea
            id="ride-review-text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Clean car? Polite driver? On time? Tell us…"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition resize-none min-h-[88px]"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onClose?.()}
            disabled={pending}
            className="py-3 min-h-[48px] border border-white/10 text-gray-200 rounded-2xl text-sm font-semibold hover:bg-white/10 transition disabled:opacity-50"
          >
            Later
          </button>
          <Motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={pending || !overall || !driver}
            className="py-3 min-h-[48px] bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl text-sm font-bold hover:shadow-[0_0_28px_rgba(245,158,11,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Star size={16} className="fill-white/30" /> Submit review
              </>
            )}
          </Motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewModal;
