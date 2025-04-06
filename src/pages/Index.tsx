import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import AudienceSection from '@/components/AudienceSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import ComparisonSection from '@/components/ComparisonSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AudienceSection />
        <HowItWorksSection />
        <ComparisonSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
