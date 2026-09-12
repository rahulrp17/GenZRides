import React from "react";
import SEO from "../../components/SEO";
import { motion as Motion } from "framer-motion";
import {
  ShieldCheck,
  PhoneCall,
  BadgeDollarSign,
  CarFront,
  ArrowRight,
  Target,
  Eye,
  HeartHandshake,
  Cpu,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "../../Component/Landing/PageHero";
import { Reveal, SectionHeading, GlowBlobs } from "../../Component/Landing/Reveal";
import { cardHover } from "../../Component/Landing/motion";
import { hero11, hero4, hero8 } from "../../assets/images";

const features = [
  {
    icon: <CarFront size={22} />,
    title: "Fast Pickup",
    desc: "Get instant cab booking with professional drivers.",
  },
  {
    icon: <BadgeDollarSign size={22} />,
    title: "Affordable Fare",
    desc: "Transparent pricing without hidden charges.",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Safe Journey",
    desc: "Verified drivers and well-maintained vehicles.",
  },
  {
    icon: <PhoneCall size={22} />,
    title: "24/7 Support",
    desc: "Customer support anytime, anywhere.",
  },
];

const pillars = [
  {
    icon: Target,
    title: "Our Mission",
    desc: "To make premium, safe and honest cab travel accessible to every town and city we serve — one ride at a time.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    desc: "To be South India's most trusted mobility brand, known for chauffeurs who care and fares that never surprise.",
  },
  {
    icon: HeartHandshake,
    title: "Customer First",
    desc: "Every policy, from cancellations to support SLAs, is written from the rider's seat — not the boardroom.",
  },
  {
    icon: Cpu,
    title: "Technology",
    desc: "Live GPS tracking, smart dispatch, digital invoices and instant notifications power every journey.",
  },
];

const values = [
  { title: "Safety", desc: "Verified drivers, GPS-tracked rides, SOS-ready support." },
  { title: "Honesty", desc: "Upfront tariffs. No surge games, no hidden extras." },
  { title: "Comfort", desc: "Sanitised AC cabins, courteous chauffeurs, quiet rides." },
  { title: "Reliability", desc: "On-time pickups backed by live dispatch, 24×7." },
];

const stats = [
  { value: "50K+", label: "Happy Riders" },
  { value: "120+", label: "Towns Served" },
  { value: "4.9", label: "Average Rating" },
  { value: "24×7", label: "Live Support" },
];

const About = () => {
  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO
        title="About Us — Our Story & Mission"
        description="About GenZRides: premium cab service born on Tamil Nadu highways. Verified chauffeurs, honest fares, 24/7 support."
        keywords="about cab company Tamil Nadu, premium taxi service, verified cab drivers"
        path="/about"
      />
      <PageHero
        eyebrow="About GenZRides"
        title="Travel Smarter with GenZRides"
        sub="Born on the highways of Tamil Nadu — premium cabs, verified chauffeurs and honest fares for every kind of journey."
        img={hero11}
      />

      {/* Story */}
      <section className="relative py-16 md:py-24">
        <GlowBlobs />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">
              Our Story
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              A better ride, built from the road up
            </h2>
            <p className="mt-5 text-gray-400 text-base sm:text-lg leading-relaxed">
              Experience reliable, affordable, and comfortable rides with
              professional drivers and modern vehicles. Whether it&apos;s airport
              transfers, city rides, or outstation trips — we make every journey
              smooth and stress-free.
            </p>
            <p className="mt-4 text-gray-400 text-base sm:text-lg leading-relaxed">
              From a single Trichy office to 120+ towns, our promise never
              changed: show up early, drive safe, charge fair.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {features.map((item) => (
                <div
                  key={item.title}
                  className="bg-white/5 border border-white/10 backdrop-blur-lg p-5 rounded-2xl hover:border-green-400/40 transition-all duration-300"
                >
                  <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 mb-3 text-white">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15} className="relative">
            <Motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="relative overflow-hidden rounded-[30px] border border-white/10 shadow-2xl"
            >
              <img
                src={hero4}
                alt="Joyful GenZRides road trip"
                loading="lazy"
                className="w-full h-[420px] md:h-[560px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <Motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute bottom-6 left-6 right-6 sm:right-auto bg-black/55 backdrop-blur-xl border border-white/10 p-5 rounded-2xl sm:max-w-xs"
              >
                <h4 className="text-2xl font-bold text-green-400 mb-1">10K+</h4>
                <p className="text-gray-300 text-sm">
                  Happy customers trust GenZRides for safe &amp; affordable rides.
                </p>
              </Motion.div>
            </Motion.div>
          </Reveal>
        </div>
      </section>

      {/* Mission / Vision / Customer-first / Technology */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeading
            eyebrow="What drives us"
            title="Mission, vision & values"
            sub="Four pillars behind every pickup, every fare, every mile."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <Motion.div
                  {...cardHover}
                  className="h-full bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-7 hover:border-green-500/40 hover:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/25 to-emerald-600/25 border border-green-500/30 flex items-center justify-center mb-5">
                    <p.icon size={26} className="text-green-400" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-2.5">{p.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                </Motion.div>
              </Reveal>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center h-full">
                  <h3 className="font-display text-lg font-bold text-green-400">{v.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1.5 leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Safety banner */}
      <section className="relative py-10 md:py-14">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <Reveal>
            <div className="relative overflow-hidden rounded-[30px] border border-white/10">
              <img
                src={hero8}
                alt="Night highway cab drive Tamil Nadu"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/70" />
              <div className="relative p-8 sm:p-12 grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                  <ShieldCheck size={30} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Safety isn&apos;t a feature. It&apos;s the foundation.
                  </h3>
                  <p className="text-gray-300 mt-2 max-w-xl">
                    Verified chauffeurs, GPS-tracked trips shared live with family,
                    and 24×7 human support on every single ride.
                  </p>
                </div>
                <Link to="/booking">
                  <Motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-[0_0_35px_rgba(34,197,94,0.55)] transition-all whitespace-nowrap"
                  >
                    Book Your Ride
                  </Motion.button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Statistics */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeading eyebrow="By the numbers" title="Trusted at scale" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-7 md:p-9 text-center hover:border-green-500/40 transition-colors">
                  <p className="font-display text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                    {s.value}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="text-center mt-12">
            <Link to="/booking">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 px-9 py-4 rounded-full font-semibold text-lg text-white hover:shadow-[0_0_35px_rgba(34,197,94,0.55)] transition-all"
              >
                Book Your Ride
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Motion.button>
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
};

export default About;
