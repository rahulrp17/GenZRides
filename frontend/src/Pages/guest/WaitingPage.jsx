import React from "react";
import { useLocation, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Clock3, CheckCircle2, ArrowRight, Home, Phone } from "lucide-react";
import SEO from "../../components/SEO";
import Navbar from "../../Component/Navbar/Navbar";
import Footer from "../../Component/Footer/Footer";
import PageHero from "../../Component/Landing/PageHero";
import { hero2 } from "../../assets/images";
import { Reveal } from "../../Component/Landing/Reveal";

const WaitingPage = () => {
  const location = useLocation();
  let storedRef = null;
  let storedName = "";
  try {
    storedRef = JSON.parse(sessionStorage.getItem("guestBookingDone") || "null");
    storedName = sessionStorage.getItem("guestBookingName") || "";
  } catch {
    // ignore
  }
  const ref = location.state?.ref || storedRef;
  const name = location.state?.name || storedName;
  const note = location.state?.note || "";

  try {
    if (location.state?.ref) {
      sessionStorage.setItem("guestBookingDone", JSON.stringify(location.state.ref));
      sessionStorage.setItem("guestBookingName", location.state?.name || "");
    }
  } catch {
    // ignore
  }

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO noindex title="Booking Received" description="Thanks for booking with GenZRides — your ride request is with our dispatch team." path="/booking/waiting" />
      <Navbar />
      <PageHero
        eyebrow="Booking Received"
        title="Waiting for Approval"
        sub={name ? `Thanks ${name.split(" ")[0]} — your ride request is with our dispatch team.` : "Your ride request is with our dispatch team."}
        img={hero2}
      />

      <section className="relative py-14 md:py-20">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6">
          <Reveal className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-amber-500/25 p-8 sm:p-10 text-center shadow-[0_0_50px_rgba(245,158,11,0.12)]">
            <Motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mx-auto mb-5"
            >
              <Clock3 size={36} className="text-amber-400" />
            </Motion.div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Waiting for Approval
            </h2>
            <p className="text-gray-400 mt-3 leading-relaxed">
              A driver will accept your ride shortly. You will receive a call on
              your registered phone number once confirmed.
            </p>

            {ref && (
              <div className="mt-5 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-sm text-gray-300">
                  Booking Ref: <span className="font-mono font-semibold text-white">#{String(ref).slice(-8).toUpperCase()}</span>
                </span>
              </div>
            )}

            {note && (
              <div className="mt-4 mx-auto max-w-sm bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-left">
                <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 font-semibold">Your note for the driver</p>
                <p className="text-sm text-gray-200 mt-1 break-words">{note}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
              <Link to="/booking">
                <Motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(34,197,94,0.55)] transition-all"
                >
                  Book Another Ride <ArrowRight size={18} />
                </Motion.button>
              </Link>
              <Link to="/">
                <Motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/5 border border-white/15 text-white font-semibold hover:border-green-500/50 hover:text-green-300 transition-all"
                >
                  <Home size={18} /> Home
                </Motion.button>
              </Link>
            </div>

            <a href="tel:+91934830199" className="inline-flex items-center gap-1.5 mt-6 text-sm text-gray-400 hover:text-green-400 transition-colors">
              <Phone size={15} /> Need help? +91 93483 0199
            </a>
          </Reveal>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default WaitingPage;
