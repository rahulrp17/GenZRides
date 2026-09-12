import React, { useEffect, useState } from "react";
import SEO from "../../components/SEO";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Phone,
} from "lucide-react";
import PageHero from "../../Component/Landing/PageHero";
import { Reveal, GlowBlobs } from "../../Component/Landing/Reveal";
import { hero8 } from "../../assets/images";

const SECTIONS = [
  {
    id: "terms",
    icon: FileText,
    title: "Terms of Use",
    body: [
      "By booking with GenZRides you agree to provide accurate pickup, drop and contact details for every trip.",
      "Fares are confirmed upfront at booking time. Tolls, interstate permits and waiting charges beyond the free limits apply at actuals.",
      "Passengers are expected to wear seatbelts and follow the chauffeur's safety instructions at all times.",
      "We reserve the right to refuse or cancel trips involving unsafe, unlawful or abusive conduct, with a full fare review.",
    ],
  },
  {
    id: "privacy",
    icon: ShieldCheck,
    title: "Privacy Policy",
    body: [
      "We collect only what a ride needs: name, phone, email, trip locations and payment status.",
      "Live location is used solely for tracking, ETA and safety during an active trip — never sold or shared for marketing.",
      "Booking invoices and trip history stay visible only to you, your assigned driver and authorised admins.",
      "Write to support@genzrides.com anytime to access, correct or delete your personal data.",
    ],
  },
  {
    id: "cancellation",
    icon: XCircle,
    title: "Cancellation Policy",
    body: [
      "Cancel free of charge any time before the ride starts, from your bookings page — a reason helps us improve.",
      "Once the trip has started, the fare for distance covered applies; the balance is waived.",
      "If a driver cancels, you are reassigned on priority and notified instantly with the reason.",
      "Refunds for online payments are processed to the source within 5–7 working days.",
    ],
  },
  {
    id: "disclaimer",
    icon: AlertTriangle,
    title: "Disclaimer",
    body: [
      "Estimated arrival times depend on live traffic, weather and road conditions and are indicative, not guaranteed.",
      "Flight delays are tracked on a best-effort basis; please share updated PNR details for red-eye arrivals.",
      "We are not liable for loss of personal belongings left in vehicles, though our team will always help trace them.",
    ],
  },
];

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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const Info = () => {
  const location = useLocation();
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 150);
    }
  }, [location.hash]);

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO
        title="Information — Terms, Privacy, Cancellation & FAQs"
        description="GenZRides policies: terms of use, privacy, cancellation and disclaimers, plus answers to frequently asked cab booking questions."
        keywords="cab booking terms, taxi cancellation policy, cab service FAQs"
        path="/info"
        jsonLd={faqJsonLd}
      />
      <PageHero
        eyebrow="Information"
        title="The fine print, made clear"
        sub="Terms, privacy, cancellations and answers — everything about riding with GenZRides in one place."
        img={hero8}
      />

      {/* Policy sections */}
      <section className="relative py-14 sm:py-20">
        <GlowBlobs />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 space-y-5 md:space-y-6">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.05}>
              <div
                id={s.id}
                className="scroll-mt-28 bg-white/5 backdrop-blur-lg rounded-[24px] sm:rounded-[30px] border border-white/10 p-6 sm:p-8 hover:border-green-500/30 transition-colors"
              >
                <div className="flex items-center gap-3.5 mb-4">
                  <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500/25 to-emerald-600/25 border border-green-500/30 flex items-center justify-center shrink-0">
                    <s.icon size={21} className="text-green-400" />
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {s.title}
                  </h2>
                </div>
                <ul className="space-y-2.5">
                  {s.body.map((line, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm sm:text-[15px] text-gray-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/info/${s.id}`}
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-green-400 hover:text-green-300 transition-colors"
                >
                  Read full policy
                  <ArrowRight size={15} />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faqs" className="relative py-14 sm:py-20 bg-gradient-to-b from-black via-slate-950 to-black scroll-mt-20">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-8 sm:mb-10">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              <HelpCircle size={13} /> FAQs
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Questions, answered
            </h2>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={f.q} delay={i * 0.04}>
                  <div
                    className={`bg-white/5 backdrop-blur-lg border rounded-2xl overflow-hidden transition-colors ${
                      open ? "border-green-500/40" : "border-white/10"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center justify-between gap-3 px-5 sm:px-6 py-4 text-left"
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
                          <p className="px-5 sm:px-6 pb-5 text-sm text-gray-400 leading-relaxed">{f.a}</p>
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
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

export default Info;
