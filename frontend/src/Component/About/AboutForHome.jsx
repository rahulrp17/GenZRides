import React, { useRef } from "react";
import { motion as Motion, useInView } from "framer-motion";
import about from "../../assets/images/about.jpg";
import about2 from "../../assets/images/about2.webp";
import { FaCarSide } from "react-icons/fa";


const AnimatedOnScroll = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef();
  const inView = useInView(ref, { once: false, margin: "-100px" });

  const getDirectionVariants = (dir) => {
    switch (dir) {
      case "left":
        return { hidden: { x: -60, opacity: 0 }, visible: { x: 0, opacity: 1 } };
      case "right":
        return { hidden: { x: 60, opacity: 0 }, visible: { x: 0, opacity: 1 } };
      case "down":
        return { hidden: { y: -60, opacity: 0 }, visible: { y: 0, opacity: 1 } };
      case "left2":
        return { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } };
      default:
        return { hidden: { x: 50, opacity: 0 }, visible: { x: 0, opacity: 1 } };
    }
  };

  return (
    <Motion.div
      ref={ref}
      variants={getDirectionVariants(direction)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.7, delay }}
    >
      {children}
    </Motion.div>
  );
};

const About = () => {
  return (
    <section className="relative bg-white py-20 px-6 md:px-20 overflow-hidden" id="about">
      <div className="flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
        

        <div className="md:w-1/2 relative z-20">
          <AnimatedOnScroll delay={0.1} direction="left">
            <h2 className="text-4xl font-bold text-indigo-700">WELCOME TO</h2>
          </AnimatedOnScroll>
          <AnimatedOnScroll delay={0.2} direction="right">
            <h1 className="text-3xl font-extrabold text-gray-800 mt-2">GenZRides</h1>
          </AnimatedOnScroll>
          
          <div className="mt-6">
            <AnimatedOnScroll delay={0.3} direction="left">
              <div className="relative pr-10">
                <AnimatedOnScroll delay={0.5} direction="left2">
                  <FaCarSide size={48} className="text-indigo-600 absolute -top-12 right-10 z-30" />
                </AnimatedOnScroll>

                <hr className="border-t-2 border-gray-300 mb-4" />
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  GenZRides offers a seamless cab booking experience across cities and towns.
                  With our reliable drivers, real-time tracking, and comfortable rides,
                  we’re redefining local and long-distance travel.
                </p>

                <AnimatedOnScroll delay={0.3} direction="right">
                  <p className="text-indigo-700 italic font-semibold text-md mb-4 ml-4">
                    "Your journey, our priority — Let’s Go Anywhere with GenZRides."
                  </p>
                </AnimatedOnScroll>

                <AnimatedOnScroll delay={0.4} direction="up">
                  <a
                    href="/about"
                    className="inline-block mt-2 px-6 py-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition"
                  >
                    View More
                  </a>
                </AnimatedOnScroll>
              </div>
            </AnimatedOnScroll>
          </div>
        </div>

        <div className="md:w-1/2 relative z-10">
          <AnimatedOnScroll delay={0.2} direction="right">
            <div className="relative w-full  ">
              <img
                src={about}
                alt="Cab Services"
                className="rounded-xl shadow-xl shadow-gray-800 w-full max-w-sm mx-auto -mt-10 z-10 relative"
              />
              <img
                src={about2}
                alt="Driver"
                className="rounded-xl shadow-xl shadow-gray-600 w-2/3 max-w-sm absolute -top-20 -right-18 z-0 opacity-90 hidden md:block"
              />
            </div>
          </AnimatedOnScroll>
        </div>
      </div>
      <div className="absolute -top-32 -right-32 w-[300px] h-[300px] bg-indigo-100 rounded-full z-0 blur-3xl opacity-60"></div>
    </section>
  );
};

export default About;
