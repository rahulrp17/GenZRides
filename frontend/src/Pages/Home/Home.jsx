import React, { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import { makeHomeJsonLd, breadcrumbJsonLd } from '../../utils/StructuredData'
import { vehicleAPI } from '../../services/endpoints'

const Home = () => {
  const queryClient = useQueryClient();
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
  ])
  // Warm the fleet cache on mount. Same queryKey as VehicleShowcase, so when
  // the section scrolls into view the data is already there — no skeleton gap.
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["vehicles"],
      queryFn: async () => {
        const { data } = await vehicleAPI.getAll();
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
  return (
    <main className="bg-black text-white overflow-x-clip">
      <SEO
        title="Book Cabs Online in Tamil Nadu"
        description="Book airport taxis, city rides and outstation cabs across Tamil Nadu, Puducherry & Bangalore with verified drivers, transparent fares and 24/7 support."
        keywords="cab booking Tamil Nadu, airport taxi Chennai, outstation cabs, online taxi booking, Trichy cab service, Bangalore airport taxi, local taxi Madurai, Coimbatore cab"
        path="/"
        jsonLd={makeHomeJsonLd()}
        breadcrumbs={breadcrumbs}
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
