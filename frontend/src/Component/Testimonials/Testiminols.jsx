import React, { useRef } from "react";
import { motion as Motion, useInView } from "framer-motion";
import {
  UserCircleIcon,
  UserIcon,
} from "@heroicons/react/24/solid"; // Heroicons solid version

const testimonials = [
  {
    name: "Amit Sharma",
    role: "Frequent Traveler",
    quote: "GenZRides is my go-to service! Always on time and super clean rides.",
    gender: "male",
  },
  {
    name: "Sneha Reddy",
    role: "Business Professional",
    quote: "I love how easy it is to book — and the transparent pricing is a bonus!",
    gender: "female",
  },
  {
    name: "Rajeev Menon",
    role: "Student",
    quote: "Customer support helped me even at midnight. That’s real service!",
    gender: "male",
  },
];

const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.1, margin: "-100px" });

  const renderIcon = (gender) => {
    if (gender === "female") {
      return <UserCircleIcon className="w-16 h-16 text-pink-500 mx-auto mb-4" />;
    }
    return <UserIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />;
  };

  return (
    <section className="py-16 bg-gray-100 overflow-hidden" id="testimonials" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        <Motion.h2
          className="text-3xl font-bold mb-12"
          initial={{ y: 60, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          What Our Customers Say
        </Motion.h2>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {renderIcon(testimonial.gender)}

              <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
              <h4 className="text-lg font-semibold">{testimonial.name}</h4>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
              <div className="flex justify-center mt-3 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
