import React, { useState } from "react";
import SEO from "../../components/SEO";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Phone,
} from "lucide-react";
import PageHero from "../../Component/Landing/PageHero";
import { Reveal, GlowBlobs } from "../../Component/Landing/Reveal";
import { cardHover } from "../../Component/Landing/motion";
import { hero8 } from "../../assets/images";

const TOPICS = {
  terms: {
    icon: FileText,
    title: "Terms of Use",
    intro: "The ground rules that keep every GenZRides trip safe, fair and smooth.",
    body: [
      "By booking with GenZRides you agree to provide accurate pickup, drop and contact details for every trip.",
      "Fares are confirmed upfront at booking time. Tolls, interstate permits and waiting charges beyond the free limits apply at actuals.",
      "Passengers are expected to wear seatbelts and follow the chauffeur's safety instructions at all times.",
      "We reserve the right to refuse or cancel trips involving unsafe, unlawful or abusive conduct, with a full fare review.",
      "One-way trips are billed per the confirmed tariff; round trips follow calendar-day billing with the stated minimum kilometres.",
    ],
  },
  privacy: {
    icon: ShieldCheck,
    title: "Privacy Policy",
    intro: "What we collect, why we collect it, and the control you keep.",
    body: [
      "We collect only what a ride needs: name, phone, email, trip locations and payment status.",
      "Live location is used solely for tracking, ETA and safety during an active trip — never sold or shared for marketing.",
      "Booking invoices and trip history stay visible only to you, your assigned driver and authorised admins.",
      "Documents uploaded for driver verification are stored securely and reviewed only by our onboarding team.",
      "Write to support@genzrides.com anytime to access, correct or delete your personal data.",
    ],
  },
  cancellation: {
    icon: XCircle,
    title: "Cancellation Policy",
    intro: "Plans change — cancelling with us is free, fast and fair.",
    body: [
      "Cancel free of charge any time before the ride starts, from your bookings page — a reason helps us improve.",
      "Once the trip has started, the fare for distance covered applies; the balance is waived.",
      "If a driver cancels, you are reassigned on priority and notified instantly with the reason.",
      "Refunds for online payments are processed to the source within 5–7 working days.",
      "Repeated no-shows may lead to advance-payment requirements on future bookings.",
    ],
  },
  disclaimer: {
    icon: AlertTriangle,
    title: "Disclaimer",
    intro: "The honest limits of what any cab service can promise.",
    body: [
      "Estimated arrival times depend on live traffic, weather and road conditions and are indicative, not guaranteed.",
      "Flight delays are tracked on a best-effort basis; please share updated PNR details for red-eye arrivals.",
      "We are not liable for loss of personal belongings left in vehicles, though our team will always help trace them.",
      "Third-party links and app-store listings belong to their owners; our terms apply only to rides booked with us.",
    ],
  },
  faqs: {
    icon: HelpCircle,
    title: "FAQs",
    intro: "Quick answers to the questions riders ask us most.",
    body: [],
  },
};

const FAQS = [
  {
    q: "How do I book a cab?",
    a: "Enter pickup and drop on the booking page, choose your car and confirm. No login is needed for guest bookings.",
  },
  {
    q: "How do airport pickups work?",
    a: "Share your flight number while booking. We track delays, include 45 minutes of free waiting, and offer meet-and-greet on request.",
  },
  {
    q: "What are the waiting charges?",
    a: "₹2 per minute after the free limits — 30 minutes for food halts and 45 minutes on airport pickups.",
  },
  {
    q: "Is there a night driving charge?",
    a: "A small night allowance may apply for trips between 11 PM and 5 AM, shown upfront before you confirm.",
  },
  {
    q: "How do I become a driver?",
    a: "Open Drive With Us, register with your licence, Aadhaar and vehicle documents, and start earning after verification.",
  },
  {
    q: "Who do I contact for support?",
    a: "Call +91 93483 0199 any time — our support team works 24×7, including holidays.",
  },
];

const ORDER = ["terms", "privacy", "cancellation", "disclaimer", "faqs"];
const TITLES = {
  terms: "Terms of Use",
  privacy: "Privacy Policy",
  cancellation: "Cancellation Policy",
  disclaimer: "Disclaimer",
  faqs: "FAQs",
};

const InfoDetail = () => {
  const { topic } = useParams();
  const key = (topic || "").toLowerCase();
  const detail = TOPICS[key];
  const [openFaq, setOpenFaq] = useState(null);

  if (!detail) return <><SEO noindex title="Information Not Found" path={`/info/${key}`} /><div className="min-h-[60vh] bg-black flex flex-col items-center justify-center px-6 text-center"><h1 className="text-2xl font-bold text-white">Information not found</h1><p className="text-gray-400 mt-2">That topic doesn’t exist.</p><Link to="/info" className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold">All information <ArrowRight size={16} /></Link></div></>;

  const Icon = detail.icon;

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO
        title={`${detail.title} — GenZRides`}
        description={`${detail.title} for GenZRides cab bookings: clear policies on fares, privacy, cancellations and support across Tamil Nadu.`}
        keywords={`genzrides ${detail.title.toLowerCase()} Tamil Nadu, cab booking ${key}`}
        path={`/info/${key}`}
        jsonLd={key === "faqs" ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
        } : null}
      />
      <PageHero
        eyebrow="Information"
        title={detail.title}
        sub={detail.intro}
        img={hero8}
      />

      <section className="relative py-14 sm:py-20">
        <GlowBlobs />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/info" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 mb-8 transition-colors">
            <ArrowLeft size={16} /> All information
          </Link>

          <Reveal>
            <div className="bg-white/5 backdrop-blur-lg rounded-[24px] sm:rounded-[30px] border border-white/10 p-6 sm:p-10">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-green-500/25 to-emerald-600/25 border border-green-500/30 flex items-center justify-center shrink-0">
                  <Icon size={24} className="text-green-400" />
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {detail.title}
                </h3>
              </div>

              {key === "faqs" ? (
                <div className="space-y-3">
                  {FAQS.map((f, i) => {
                    const open = openFaq === i;
                    return (
                      <div
                        key={f.q}
                        className={`bg-black/30 border rounded-2xl overflow-hidden transition-colors ${
                          open ? "border-green-500/40" : "border-white/10"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(open ? null : i)}
                          className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                        >
                          <span className="font-semibold text-white text-sm sm:text-base">{f.q}</span>
                          <ChevronDown
                            size={18}
                            className={`text-green-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <Motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                            >
                              <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{f.a}</p>
                            </Motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ul className="space-y-3.5">
                  {detail.body.map((line, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm sm:text-base text-gray-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>

          {/* Sibling topics */}
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">
              Keep reading
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {ORDER.filter((k) => k !== key).map((k, i) => (
                <Reveal key={k} delay={i * 0.06}>
                  <Link to={`/info/${k}`}>
                    <Motion.div
                      {...cardHover}
                      className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-green-500/40 transition-colors h-full"
                    >
                      <p className="font-display text-base sm:text-lg font-bold text-white">{TITLES[k]}</p>
                      <p className="inline-flex items-center gap-1 text-xs text-green-400 font-semibold mt-1.5">
                        Read <ArrowRight size={13} />
                      </p>
                    </Motion.div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal className="text-center mt-10">
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/booking"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
              >
                Book Your Ride <ArrowRight size={16} />
              </Link>
              <a
                href="tel:+91934830199"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/5 border border-white/15 text-white text-sm font-semibold hover:border-green-500/50 hover:text-green-300 transition-all"
              >
                <Phone size={16} /> +91 93483 0199
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
};

export default InfoDetail;
