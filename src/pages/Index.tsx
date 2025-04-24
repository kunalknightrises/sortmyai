import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AudienceSection from '@/components/AudienceSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import PortfolioFeatureSection from '@/components/PortfolioFeatureSection';
import ToolTrackerPreview from '@/components/ToolTrackerPreview';
import PricingComparison from '@/components/PricingComparision';

const Index = () => {
  return (
    <div className="min-h-screen bg-sortmy-dark relative">
      <Navbar />
      <main>
        <HeroSection />
        <ToolTrackerPreview />
        <PortfolioFeatureSection />
        
        <AudienceSection />
        <HowItWorksSection />
        <PricingComparison />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
