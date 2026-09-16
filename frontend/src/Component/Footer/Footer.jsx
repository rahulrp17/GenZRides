import React from "react";
import { Link } from "react-router-dom";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter
} from "react-icons/fa";

import { PiMapPinFill } from "react-icons/pi";
import GenZRides from "../../assets/images/GenZRides.png"; // update path as needed
 // replace with your logo path

const Footer = () => {
  return (
    <footer className="relative bg-black border-t border-white/10 text-white py-14 px-6 md:px-16 overflow-hidden">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-10 mb-8 max-w-7xl mx-auto">

        {/* Logo & Contact */}
        <div>
          <img src={GenZRides} alt="GenZRides cab service logo" className="w-30 h-10 mb-4  rounded-[10px] object-fill ring-1 ring-green-500/40" />
          {/* <p className="font-display text-lg font-bold text-white tracking-tight mb-3">
            GenZRides
          </p> */}
          <div className="text-sm leading-relaxed text-gray-400">
            <p className="flex items-start gap-2">
              <PiMapPinFill className="mt-1 text-green-400 shrink-0" />
              1/86 AMBALAKARA STREET, NEHRU PLAY GROUND,<br />
              VENGAIMANDALAM, TRICHY, Tamil Nadu - 621005
            </p>
            <p className="flex items-center gap-2 mt-3 text-green-400"><FaPhoneAlt /> +91 934830199</p>
            <p className="flex items-center gap-2 mt-1 text-green-400"><FaEnvelope /> support@genzrides.com</p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-green-400 uppercase tracking-[0.2em]">Popular Routes</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/routes/chennai-to-bangalore" className="hover:text-white transition-colors">Chennai to Bangalore</Link></li>
            <li><Link to="/routes/chennai-to-madurai" className="hover:text-white transition-colors">Chennai to Madurai</Link></li>
            <li><Link to="/routes/madurai-to-rameshwaram" className="hover:text-white transition-colors">Madurai to Rameshwaram</Link></li>
            <li><Link to="/routes/coimbatore-to-salem" className="hover:text-white transition-colors">Coimbatore to Salem</Link></li>
            <li><Link to="/routes/trichy-to-chennai" className="hover:text-white transition-colors">Trichy to Chennai</Link></li>
          </ul>
        </div>

        {/* Airport Services */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-green-400 uppercase tracking-[0.2em]">Airport Transfers</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/airport/chennai" className="hover:text-white transition-colors">Chennai Airport Taxi</Link></li>
            <li><Link to="/airport/bangalore" className="hover:text-white transition-colors">Bangalore Airport Taxi</Link></li>
            <li><Link to="/airport/coimbatore" className="hover:text-white transition-colors">Coimbatore Airport Taxi</Link></li>
            <li><Link to="/airport/trichy" className="hover:text-white transition-colors">Trichy Airport Taxi</Link></li>
            <li><Link to="/airport/madurai" className="hover:text-white transition-colors">Madurai Airport Taxi</Link></li>
          </ul>
        </div>

        {/* Policies and Social */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-green-400 uppercase tracking-[0.2em]">Information</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/info/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
            <li><Link to="/info/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/info/cancellation" className="hover:text-white transition-colors">Cancellation Policy</Link></li>
            <li><Link to="/info/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
            <li><Link to="/info/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
          </ul>
          <div className="flex gap-3 mt-5 text-gray-300 text-lg">
            <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-green-500/50 hover:text-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] cursor-pointer transition-all"><FaFacebookF size={15} /></span>
            <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-green-500/50 hover:text-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] cursor-pointer transition-all"><FaTwitter size={15} /></span>
            <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-green-500/50 hover:text-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] cursor-pointer transition-all"><FaLinkedinIn size={15} /></span>
            <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-green-500/50 hover:text-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] cursor-pointer transition-all"><FaInstagram size={15} /></span>
          </div>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="relative border-t border-white/10 pt-5 text-sm text-center font-semibold text-gray-500 max-w-7xl mx-auto">
        &copy; 2025 <span className="text-green-400 font-medium">GENZRIDES INDIA PVT LTD</span>. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
