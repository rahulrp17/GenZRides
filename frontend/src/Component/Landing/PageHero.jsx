import React from "react";
import { motion as Motion } from "framer-motion";

/**
 * Shared cinematic page hero for public pages.
 * Pure presentation — no logic.
 */
const PageHero = ({ eyebrow, title, sub, img }) => (
  <section className="relative overflow-hidden bg-black pt-32 pb-16 md:pt-40 md:pb-24">
    {img && (
      <>
        <img
          src={img}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
      </>
    )}
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="landing-drift absolute -top-20 left-1/4 w-96 h-96 bg-green-500/15 blur-[130px] rounded-full" />
      <div className="landing-drift-slow absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/15 blur-[130px] rounded-full" />
    </div>

    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {eyebrow && (
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-lg border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
          {title}
        </h1>
        {sub && (
          <p className="mt-5 text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {sub}
          </p>
        )}
      </Motion.div>
    </div>
  </section>
);

export default PageHero;
