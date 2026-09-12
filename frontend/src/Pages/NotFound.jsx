import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Home } from "lucide-react";
import SEO from "../components/SEO";

const NotFound = () => (
  <main className="min-h-[70vh] bg-black text-white flex flex-col items-center justify-center px-4 sm:px-6 text-center">
    <SEO noindex title="Page Not Found — 404" description="The page you are looking for does not exist. Explore popular cab routes or book a ride with GenZRides." path="/404" />
    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
      <MapPin size={28} className="text-green-400" />
    </div>
    <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">404 — Page not found</h1>
    <p className="text-gray-400 mt-3 max-w-md">We couldn&apos;t find that page. It may have moved or the link is incorrect. Try a popular route or go home.</p>
    <div className="flex flex-col sm:flex-row gap-3 mt-8">
      <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold">
        <Home size={16} /> Go Home
      </Link>
      <Link to="/popular-routes" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/15 text-white text-sm font-semibold hover:border-green-500/50">
        Popular Routes <ArrowRight size={16} />
      </Link>
    </div>
  </main>
);
export default NotFound;
