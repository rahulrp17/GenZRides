import React from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Quote, ArrowRight, CarFront, Phone } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { hero8 } from "../../assets/images";
import { Reveal, SectionHeading, GlowBlobs } from "./Reveal";
import { cardHover } from "./motion";

const TESTIMONIALS = [
  {
    quote:
      "The 4 AM airport pickup was flawless — the driver arrived early, the car was spotless, and the fare was exactly as shown. My default cab service now.",
    name: "Priya Sharma",
    meta: "Frequent flyer · Chennai",
  },
  {
    quote:
      "Booked an Innova for a Madurai–Rameshwaram family trip. Courteous driver, knew every temple stop, and the kids still talk about the ride.",
    name: "Karthik Raja",
    meta: "Family traveller · Trichy",
  },
  {
    quote:
      "Transparent pricing is real here. No surge games at midnight, live tracking for my team, and invoices that make expense reports painless.",
    name: "Ananya Iyer",
    meta: "Business traveller · Bangalore",
  },
];

const Stars = () => (
  <div className="flex gap-1 mb-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={16} className="text-green-400" fill="currentColor" />
    ))}
  </div>
);

export const Testimonials = () => (
  <section className="relative bg-black py-20 md:py-28 overflow-hidden">
    <GlowBlobs />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
      <SectionHeading
        eyebrow="Rider Stories"
        title="Loved on every route"
        sub="4.9 stars across thousands of trips — here's why riders stay."
      />
      {/* Premium Swiper carousel: exactly 1 card on mobile, up to 3 on lg */}
      <Reveal>
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          loop
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="testimonials-swiper !pb-10"
        >
          {TESTIMONIALS.map((t) => (
            <SwiperSlide key={t.name} className="h-auto">
              <Motion.figure
                {...cardHover}
                className="h-full bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-7 hover:border-green-500/40 hover:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition-colors flex flex-col"
              >
                <Quote size={28} className="text-green-500/50 mb-4" fill="currentColor" />
                <Stars />
                <blockquote className="text-gray-300 text-[15px] leading-relaxed flex-1">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 pt-5 border-t border-white/10">
                  <p className="font-display font-bold text-white">{t.name}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{t.meta}</p>
                </figcaption>
              </Motion.figure>
            </SwiperSlide>
          ))}
        </Swiper>
      </Reveal>
    </div>
  </section>
);

export const DriverCTA = () => (
  <section className="relative py-20 md:py-28 overflow-hidden">
    <img
      src={hero8}
      alt="Open highway at dusk"
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-black/75" />
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/60" />
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="landing-drift absolute top-10 left-1/4 w-96 h-96 bg-green-500/20 blur-[130px] rounded-full" />
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-10 items-center">
      <Reveal>
        <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-lg border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">
          Drive with us
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
          Turn your car into a paycheck
        </h2>
        <p className="mt-4 text-gray-300 text-base sm:text-lg leading-relaxed max-w-lg">
          Join hundreds of verified chauffeurs earning more with fair commissions,
          weekly payouts and trips that respect your time.
        </p>
        <div className="flex flex-wrap gap-4 mt-8">
          <Link to="/driver/continue">
            <Motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold inline-flex items-center gap-2 hover:shadow-[0_0_35px_rgba(34,197,94,0.55)] transition-all"
            >
              <CarFront size={20} /> Become a Driver
            </Motion.button>
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { v: "Zero joining fee", s: "Start earning today" },
            { v: "Weekly payouts", s: "Direct to your bank" },
            { v: "Fair commission", s: "You keep more per trip" },
            { v: "24/7 support", s: "Humans, not bots" },
          ].map((f) => (
            <div
              key={f.v}
              className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
            >
              <p className="font-display text-lg font-bold text-white leading-snug">{f.v}</p>
              <p className="text-gray-400 text-sm mt-1">{f.s}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

export const FinalCTA = () => (
  <section className="relative bg-black py-20 md:py-28 overflow-hidden">
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[30px] border border-green-500/30 bg-gradient-to-br from-green-500/15 via-white/5 to-blue-500/10 backdrop-blur-lg p-10 sm:p-14 text-center shadow-[0_0_60px_rgba(34,197,94,0.2)]">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="landing-drift absolute -top-20 left-1/4 w-80 h-80 bg-green-500/20 blur-[110px] rounded-full" />
            <div className="landing-drift-slow absolute -bottom-20 right-1/4 w-80 h-80 bg-blue-500/20 blur-[110px] rounded-full" />
          </div>
          <h2 className="relative font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Ready to Ride?
          </h2>
          <p className="relative mt-4 text-gray-300 text-base sm:text-lg max-w-xl mx-auto">
            Your chauffeur is minutes away. Book in under a minute — pay online
            or in cash, your call.
          </p>
          <div className="relative flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/booking">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-9 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold inline-flex items-center gap-2 hover:shadow-[0_0_35px_rgba(34,197,94,0.55)] transition-all"
              >
                Book Your Ride <ArrowRight size={19} />
              </Motion.button>
            </Link>
            <a href="tel:+91934830199">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-9 py-4 rounded-full bg-white/5 backdrop-blur-lg border border-white/15 text-white font-semibold inline-flex items-center gap-2 hover:border-green-500/50 hover:text-green-300 transition-all"
              >
                <Phone size={18} /> +91 93483 0199
              </Motion.button>
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);
