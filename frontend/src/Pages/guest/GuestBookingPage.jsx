import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "../../Component/Navbar/Navbar";
import Footer from "../../Component/Footer/Footer";
import PageHero from "../../Component/Landing/PageHero";
import GuestBookingForm from "./GuestBookingForm";
import { hero10 } from "../../assets/images";
import { Reveal } from "../../Component/Landing/Reveal";
import SEO from "../../components/SEO";
import { serviceJsonLd, breadcrumbJsonLd } from "../../utils/StructuredData";

/**
 * Public /booking route: full guest booking flow entry (no login required).
 * Step 1 collects the trip; submit continues to /booking/vehicles.
 */
const GuestBookingPage = () => (
  <main className="bg-black text-white overflow-x-clip">
    <SEO
      title="Book a Cab Online — No Login Needed"
      description="Book your cab in 3 quick steps without signing up: enter trip, choose Sedan/SUV with live fares, confirm. Tamil Nadu-wide service."
      keywords="book cab without login, guest cab booking, one way drop booking, round trip cab booking, one way cab Tamil Nadu, online taxi booking Tamil Nadu"
      path="/booking"
      jsonLd={serviceJsonLd("Guest Cab Booking", "Book your cab in 3 quick steps without signing up: enter trip, choose Sedan/SUV with live fares, confirm.", "TaxiService", "Tamil Nadu", "booking")}
      breadcrumbs={breadcrumbJsonLd([{name:"Home",path:"/"},{name:"Book a Cab",path:"/booking"}])}
    />
    <Navbar />
    <PageHero
      eyebrow="Step 1 of 3 — Your Trip"
      title="Book your ride"
      sub="No login needed. Tell us where you're going — pick your car next."
      img={hero10}
    />

    <section className="relative py-14 md:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="landing-drift absolute top-10 -left-24 w-96 h-96 bg-green-500/10 blur-[130px] rounded-full" />
        <div className="landing-drift-slow absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 blur-[130px] rounded-full" />
      </div>
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <Reveal className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-5 sm:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          <div aria-hidden className="absolute -inset-3 bg-gradient-to-br from-green-500/15 via-transparent to-blue-500/10 blur-2xl rounded-[36px] -z-10" />
          <GuestBookingForm />
        </Reveal>
      </div>
    </section>
    <Footer />
  </main>
);

export default GuestBookingPage;
