import React from "react";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { motion as Motion } from "framer-motion";

const FloatingIcons = () => {
  return (
    <>
      <Motion.a
        href="https://wa.me/919943691718"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="fixed bottom-3 left-2 z-50 bg-green-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform "
      >
        <FaWhatsapp size={22} />
      </Motion.a>

      <Motion.a
        href="tel:+919943691718"
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="fixed bottom-3 right-2 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <FaPhoneAlt size={22} />
      </Motion.a>
    </>
  );
};

export default FloatingIcons;
