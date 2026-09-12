import React, { useRef } from "react";
import { motion as Motion, useInView } from "framer-motion";
import {
  ShieldCheck,
  Wallet,
  Clock,
  Headphones,
  CarFront,
  Sparkles,
} from "lucide-react";

const AnimatedCard = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef();
  const isInView = useInView(ref, { once: false,amount: 0, margin: "-100px" });

  const variants = {
    left: { hidden: { x: -60, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    right: { hidden: { x: 60, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    up: { hidden: { y: 60, opacity: 0 }, visible: { y: 0, opacity: 1 } },
  };

  return (
    < Motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[direction]}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </Motion.div>
  );
};

const WhyChooseUs = () => {
  const reasons = [
    {
      title: "Safe & Secure Rides",
      desc: "Every driver is background-checked and every ride is GPS-tracked.",
      icon: <ShieldCheck className="w-10 h-10 text-indigo-600 mx-auto mb-3" />,
      direction: "left",
    },
    {
      title: "Transparent Pricing",
      desc: "Upfront fares, no hidden charges or surge surprises.",
      icon: <Wallet className="w-10 h-10 text-indigo-600 mx-auto mb-3" />,
      direction: "right",
    },
    {
      title: "Instant Booking",
      desc: "Book your cab in seconds with real-time availability.",
      icon: <Clock className="w-10 h-10 text-indigo-600 mx-auto mb-3" />,
      direction: "left",
    },
    {
      title: "24/7 Support",
      desc: "Our team is available around the clock to help you.",
      icon: <Headphones className="w-10 h-10 text-indigo-600 mx-auto mb-3" />,
      direction: "right",
    },
    {
      title: "Multiple Ride Options",
      desc: "Choose from economy, premium, or outstation rides.",
      icon: <CarFront className="w-10 h-10 text-indigo-600 mx-auto mb-3" />,
      direction: "left",
    },
    {
      title: "Clean & Comfortable",
      desc: "All cabs are sanitized and maintained for your comfort.",
      icon: <Sparkles className="w-10 h-10 text-indigo-600 mx-auto mb-3" />,
      direction: "right",
    },
  ];

  return (
    <section className="bg-gray-50 py-20 px-6 md:px-20 overflow-hidden" id="why-us">
      <AnimatedCard direction="up">
        <h2 className="text-4xl font-bold text-center text-indigo-700 mb-10">
          Why Choose <span className="text-black">GenZRides</span>
        </h2>
      </AnimatedCard>

      <div className="grid md:grid-cols-3 gap-8">
        {reasons.map((item, index) => (
          <AnimatedCard
            key={index}
            delay={0.2 * index}
            direction={item.direction}
          >
            <div className="bg-white shadow-md max-w-100 rounded-xl p-6 text-center hover:shadow-xl transition">
              {item.icon}
              <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
