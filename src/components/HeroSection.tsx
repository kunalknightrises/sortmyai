import { Brain, MousePointerClick, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardPreview from './DashboardPreview';
import NeonButton from "@/components/ui/NeonButton";
import ClickEffect from "@/components/ui/ClickEffect";
// Background components

const HeroSection = () => {
  return (
    <section className="pt-28 pb-8 md:pt-40 md:pb-16 px-4 relative overflow-hidden">
      {/* Basic blue theme background */}
      <div className="absolute inset-0 z-[-1]">
        <div className="absolute inset-0 bg-sortmy-dark">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1121] to-[#0a0a2e] opacity-90"></div>
          <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
        </div>
      </div>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Turn <span className="bg-gradient-to-r from-[#ff00cc] to-[#00ffff] text-transparent bg-clip-text">chaos</span> into <span className="bg-gradient-to-r from-[#00ffff] to-[#0066ff] text-transparent bg-clip-text">control</span>.<br />
              Build your own <span className="relative">
                <span className="bg-gradient-to-r from-[#0066ff] to-[#ff00cc] text-transparent bg-clip-text">AI brain</span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ffff] to-[#0066ff] opacity-70"></span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-md backdrop-blur-sm bg-sortmy-darker/10 p-4 rounded-lg border border-sortmy-blue/10 shadow-[0_0_15px_rgba(0,102,255,0.1)]">
              This isn't a dashboard. It's your future's home screen. Track your tools. Build your AI brain. Showcase your genius.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signup">
                <ClickEffect effect="ripple" color="blue">
                  <NeonButton variant="gradient" className="px-8 py-6 rounded-md shadow-[0_0_15px_rgba(0,102,255,0.2)] hover:shadow-[0_0_20px_rgba(0,102,255,0.4)] transition-all duration-300">
                    Sign In to Access Your AI Control Panel
                    <MousePointerClick className="ml-2 h-5 w-5" />
                  </NeonButton>
                </ClickEffect>
              </Link>
            </div>
          </div>

          <div className="md:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-[#ff00cc]/20 to-[#00ffff]/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#00ffff]/20 to-[#0066ff]/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="w-64 h-64 md:w-80 md:h-80 bg-sortmy-darker/50 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse-glow absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 border border-sortmy-blue/20 shadow-[0_0_30px_rgba(0,102,255,0.2)]">
              <div className="relative">
                <Brain className="w-28 h-28 md:w-36 md:h-36 text-sortmy-blue animate-float" />
                <Sparkles className="w-8 h-8 absolute -top-4 -right-4 text-[#00ffff] animate-pulse" />
              </div>
            </div>
            <div className="relative z-10 w-full max-w-md mx-auto">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
