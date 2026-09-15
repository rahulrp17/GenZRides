import React from 'react'
import Hero from '../../Component/Hero/Hero'
import FloatingIcons from './FloatingIcons'
import AIAssistant from '../../components/ai/AIAssistant'
import { PopularRoutes, Services } from '../../Component/Landing/RouteServices'
import VehicleShowcase from '../../Component/Landing/VehicleShowcase'
import { WhyChooseUs, AboutSection, HowItWorks } from '../../Component/Landing/StorySections'
import { Testimonials, DriverCTA, FinalCTA } from '../../Component/Landing/SocialProof'
import BookingTariff from '../../Component/Booking_Turiff/BookingTariff'
import FarePricing from '../../Component/FarePricing/FarePricing'
import SEO from '../../components/SEO'
import businessJsonLd from '../../utils/businessJsonLd'

const Home = () => {
  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO
        title="Book Cabs Online in Tamil Nadu"
        description="Book airport taxis, city rides and outstation cabs across Tamil Nadu with verified drivers, transparent fares and 24/7 support. Sedan, SUV & premium cars."
        keywords="cab booking Tamil Nadu, airport taxi Chennai, outstation cabs, online taxi booking, Trichy cab service, Bangalore airport taxi"
        path="/"
        jsonLd={{
          ...businessJsonLd,
          url: typeof window !== "undefined" ? window.location.origin : undefined,
          image: `${typeof window !== "undefined" ? window.location.origin : ""}/logo5.png`,
        }}
      />
      <FloatingIcons />
      <AIAssistant />
      <Hero />
      <PopularRoutes />
      <Services />
      <VehicleShowcase />
      <WhyChooseUs />
      <AboutSection />
      <FarePricing />
      <BookingTariff />
      <HowItWorks />
      <Testimonials />
      <DriverCTA />
      <FinalCTA />
    </main>
  )
}

export default Home
