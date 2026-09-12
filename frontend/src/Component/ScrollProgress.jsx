import { motion as Motion, useScroll, useSpring } from "framer-motion";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();

  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    mass: 0.3,
    restDelta: 0.001,
  });

  return (
    <>
      {/* Main Progress Bar */}
      <Motion.div
        style={{ scaleX: progress }}
        className="
          fixed
          top-0
          left-0
          right-0
          h-[5px]
          origin-left
          z-[9999]
          rounded-r-full
          bg-gradient-to-r
          from-[#3af016]
          via-[#83fc4b]
          to-[#58e72c]
          shadow-[0_0_25px_rgba(22,163,74,0.55)]
        "
      />

      {/* Glow Layer */}
      <Motion.div
        style={{ scaleX: progress }}
        className="
          fixed
          top-0
          left-0
          right-0
          h-[10px]
          origin-left
          z-[9998]
          rounded-r-full
          bg-gradient-to-r
          from-blue-400/30
          via-indigo-400/40
          to-purple-400/30
          blur-md
        "
      />
    </>
  );
};

export default ScrollProgress;
