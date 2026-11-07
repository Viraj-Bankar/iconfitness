import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Facilities } from './components/sections/Facilities';
import { WhyChooseUs } from './components/sections/WhyChooseUs';
import { Membership } from './components/sections/Membership';
import { DietPersonalTraining } from './components/sections/DietPersonalTraining';
import { Gallery } from './components/sections/Gallery';
import { Testimonials } from './components/sections/Testimonials';
import { Timings } from './components/sections/Timings';
import { Contact } from './components/sections/Contact';
import { Footer } from './components/layout/Footer';
import { FacilityModal } from './components/ui/FacilityModal';
import { EnquiryModal } from './components/ui/EnquiryModal';
import { FloatingActions } from './components/ui/FloatingWhatsApp';
import type { Facility, MembershipPlan } from './types';

export const App: React.FC = () => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryInitialInterest, setEnquiryInitialInterest] = useState<string | undefined>(undefined);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenEnquiry = (planOrTopic?: string) => {
    setSelectedPlan(null);
    setEnquiryInitialInterest(planOrTopic || 'General Gym Enquiry');
    setEnquiryModalOpen(true);
  };

  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setEnquiryInitialInterest(undefined);
    setEnquiryModalOpen(true);
  };

  return (
    <div className="bg-[#080808] text-white min-h-screen selection:bg-[#ED101B] selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar onOpenEnquiry={handleOpenEnquiry} />

      <main>
        {/* 1. Hero Section (Black) */}
        <Hero
          onExploreFacilities={() => scrollToSection('facilities')}
          onViewPlans={() => scrollToSection('membership')}
        />

        {/* 2. About Icon Fitness (Charcoal) */}
        <About onDiscoverFacilities={() => scrollToSection('facilities')} />

        {/* 3. Facilities Showcase (Black) */}
        <Facilities
          onSelectFacility={(fac) => setSelectedFacility(fac)}
          onEnquireFacility={(facTitle) => handleOpenEnquiry(facTitle)}
        />

        {/* 4. Why Choose Us (Red feature section) */}
        <WhyChooseUs />

        {/* 5. Membership & Pricing (Black) */}
        <Membership
          onSelectPlan={handleSelectPlan}
          onEnquireOffer={(offerTitle) => handleOpenEnquiry(offerTitle)}
        />

        {/* 6. Personal Training & Diet Guidance (Charcoal) */}
        <DietPersonalTraining
          onEnquireTraining={() => handleOpenEnquiry('Personal Training Guidance')}
        />

        {/* 7. Gallery — Real Gym Media (Black) */}
        <Gallery />

        {/* 8. Google Reviews (Charcoal) */}
        <Testimonials />

        {/* 9. Gym Timings (Red feature section) */}
        <Timings />

        {/* 10. Contact & Location Section (Black) */}
        <Contact preselectedOption={enquiryInitialInterest} />
      </main>

      {/* 11. Footer (Black with thin red divider) */}
      <Footer />

      {/* Facility Detail Modal */}
      <FacilityModal
        facility={selectedFacility}
        onClose={() => setSelectedFacility(null)}
        onEnquire={(title) => handleOpenEnquiry(title)}
      />

      {/* Membership & Contact Enquiry Modal */}
      <EnquiryModal
        isOpen={enquiryModalOpen}
        selectedPlan={selectedPlan}
        initialInterest={enquiryInitialInterest}
        onClose={() => {
          setEnquiryModalOpen(false);
          setSelectedPlan(null);
        }}
      />

      {/* Floating Action Buttons */}
      <FloatingActions />
    </div>
  );
};

export default App;
