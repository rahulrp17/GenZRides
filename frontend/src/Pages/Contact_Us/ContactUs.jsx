import React, { useRef, useState } from "react";
import { motion as Motion, useInView, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock3,
  Send,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { FaFacebookF as FaFb, FaInstagram as FaIg, FaLinkedinIn as FaLi, FaTwitter as FaTw } from "react-icons/fa";
import PageHero from "../../Component/Landing/PageHero";
import SEO from "../../components/SEO"
import { localBusinessJsonLd, breadcrumbJsonLd } from "../../utils/StructuredData";
import { Reveal, GlowBlobs } from "../../Component/Landing/Reveal";
import { hero10 } from "../../assets/images";

const FAQS = [
  {
    q: "How do I book a cab?",
    a: "Enter your pickup and drop locations on the booking page, pick a date and vehicle, and confirm. Your chauffeur details arrive instantly.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Cancel free of charge from your bookings any time before the ride starts. A reason helps us serve you better.",
  },
  {
    q: "Are tolls and permits included?",
    a: "Toll fees and interstate permits are extra at actuals. Waiting beyond 30 minutes is billed at ₹2/min.",
  },
  {
    q: "Do you operate at night?",
    a: "Yes — our dispatch and support run 24×7, including airport pickups and outstation departures.",
  },
  {
    q: "How can drivers join?",
    a: "Head to Drive With Us, register with your documents, and start earning after quick verification.",
  },
];

const ContactUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO
        title="Contact Us — 24/7 Cab Support"
        description="Contact GenZRides support anytime: +91 934830199, support@genzrides.com. Coimbatore, Tamil Nadu. Bookings, pricing and trip help."
        keywords="cab booking support, taxi helpline Tamil Nadu, contact cab service"
        path="/contact"
        jsonLd={localBusinessJsonLd}
        breadcrumbs={breadcrumbJsonLd([{name:"Home",path:"/"},{name:"Contact",path:"/contact"}])}
      />
      <PageHero
        eyebrow="Contact GenZRides"
        title="Get In Touch"
        sub="Need a cab instantly or planning your next trip? Reach out to our support team anytime — we're available 24/7."
        img={hero10}
      />

      <section
        ref={ref}
        className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6"
      >
        <GlowBlobs />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
            {/* LEFT SIDE */}
            <Motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Contact Cards */}
              {[
                {
                  icon: <Phone size={26} />,
                  title: "Call Us",
                  value: "+91 99436 91718",
                  color: "from-green-500 to-emerald-600",
                },
                {
                  icon: <Mail size={26} />,
                  title: "Email Address",
                  value: "support@genzrides.com",
                  color: "from-blue-500 to-indigo-600",
                },
                {
                  icon: <MapPin size={26} />,
                  title: "Office Location",
                  value: "1/86 Ambalakara Street, Nehru Play Ground, Vengaimandalam, Trichy 621005, Tamil Nadu",
                  color: "from-orange-500 to-red-500",
                },
                {
                  icon: <Clock3 size={26} />,
                  title: "Working Hours",
                  value: "24/7 Available",
                  color: "from-purple-500 to-pink-600",
                },
              ].map((item, index) => (
                <Motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ y: -6, scale: 1.01, borderColor: "#22c55e" }}
                  className="group flex items-center gap-5 bg-white/5 border border-white/10 rounded-[30px] p-5 sm:p-6 backdrop-blur-xl transition-all duration-300"
                >
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center text-white shadow-lg shrink-0`}
                  >
                    {item.icon}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                      {item.title}
                    </h3>

                    <p className="text-gray-400 break-words">{item.value}</p>
                  </div>
                </Motion.div>
              ))}

              {/* Floating Info */}
              <Motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-white/10 rounded-[30px] p-6 sm:p-8 backdrop-blur-xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="text-green-400" />
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Quick Response
                    </h3>

                    <p className="text-gray-400">
                      Usually replies within minutes
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  Our support team is always ready to help you with bookings,
                  pricing, trip planning, and travel assistance.
                </p>

                <div className="flex gap-3 mt-5">
                  {[
                    { icon: FaFb, label: "Facebook" },
                    { icon: FaTw, label: "Twitter" },
                    { icon: FaLi, label: "LinkedIn" },
                    { icon: FaIg, label: "Instagram" },
                  ].map((s) => (
                    <span
                      key={s.label}
                      title={s.label}
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:border-green-500/50 hover:text-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] cursor-pointer transition-all"
                    >
                      <s.icon size={16} />
                    </span>
                  ))}
                </div>
              </Motion.div>
            </Motion.div>

            {/* RIGHT SIDE FORM */}
            <Motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="relative lg:sticky lg:top-28"
            >
              <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[30px] p-6 sm:p-8 md:p-10 shadow-2xl">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                  Send Message
                </h2>

                <p className="text-gray-400 mb-8">
                  Fill out the form below and our team will contact you shortly.
                </p>

                <form className="space-y-5 sm:space-y-6">
                  {/* Name */}
                  <Motion.div whileFocus={{ scale: 1.01 }}>
                    <label className="text-sm text-gray-300 mb-2 block">
                      Full Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-green-500 transition placeholder:text-gray-500"
                    />
                  </Motion.div>

                  {/* Email */}
                  <Motion.div whileFocus={{ scale: 1.01 }}>
                    <label className="text-sm text-gray-300 mb-2 block">
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-green-500 transition placeholder:text-gray-500"
                    />
                  </Motion.div>

                  {/* Phone */}
                  <Motion.div whileFocus={{ scale: 1.01 }}>
                    <label className="text-sm text-gray-300 mb-2 block">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      placeholder="Enter your mobile number"
                      className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-green-500 transition placeholder:text-gray-500"
                    />
                  </Motion.div>

                  {/* Message */}
                  <Motion.div whileFocus={{ scale: 1.01 }}>
                    <label className="text-sm text-gray-300 mb-2 block">
                      Message
                    </label>

                    <textarea
                      rows="5"
                      placeholder="Write your message..."
                      className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-green-500 transition resize-none placeholder:text-gray-500"
                    />
                  </Motion.div>

                  {/* Button */}
                  <Motion.button
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0px 0px 25px rgba(34,197,94,0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Send Message
                  </Motion.button>
                </form>
              </div>

              {/* Floating Circle */}
              <Motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="absolute -top-10 -right-6 sm:-right-10 w-24 h-24 sm:w-32 sm:h-32 border-[10px] border-green-500/20 rounded-full pointer-events-none"
              />
            </Motion.div>
          </div>

          {/* FAQ */}
          <div className="mt-16 md:mt-24 max-w-3xl mx-auto">
            <Reveal className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                FAQ
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Questions, answered
              </h2>
            </Reveal>
            <div className="space-y-3">
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <Reveal key={f.q} delay={i * 0.05}>
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
                            <p className="px-5 sm:px-6 pb-5 text-sm text-gray-400 leading-relaxed">
                              {f.a}
                            </p>
                          </Motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactUs;
