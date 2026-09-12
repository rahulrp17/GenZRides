import React from "react";
import { motion as Motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, y = 32, className = "" }) => (
  <Motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </Motion.div>
);

export const SectionHeading = ({ eyebrow, title, sub, align = "center" }) => {
  const alignCls =
    align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <Reveal className={`max-w-2xl ${alignCls} mb-12 md:mb-16`}>
      {eyebrow && (
        <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-gray-400 text-base sm:text-lg leading-relaxed">
          {sub}
        </p>
      )}
    </Reveal>
  );
};

export const GlowBlobs = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="landing-drift absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-green-500/15 blur-[130px] rounded-full" />
    <div className="landing-drift-slow absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-blue-500/15 blur-[130px] rounded-full" />
    <div className="landing-drift absolute -bottom-32 left-1/3 w-[26rem] h-[26rem] bg-emerald-500/10 blur-[130px] rounded-full" />
  </div>
);
