import { Button } from "@/components/ui/button";
import { Brain, MousePointerClick } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardPreview from './DashboardPreview';

const HeroSection = () => {
  return (
    <section className="pt-28 pb-8 md:pt-40 md:pb-16 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Turn <span className="gradient-text">chaos</span> into <span className="gradient-text">control</span>.<br /> 
              Build your own <span className="relative">
                AI brain
                <span className="absolute bottom-0 left-0 w-full h-1 bg-sortmy-blue opacity-70"></span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-md">
              This isn't a dashboard. It's your future's home screen. Track your tools. Build your AI brain. Showcase your genius.



            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signup">
                <Button className="bg-sortmy-blue hover:bg-sortmy-blue/90 text-white px-8 py-6 rounded-md">
                  Sign In to Access Your AI Control Panel
                  <MousePointerClick className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-sortmy-blue/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sortmy-blue/10 rounded-full blur-3xl"></div>
            <div className="w-64 h-64 md:w-80 md:h-80 bg-sortmy-gray/20 rounded-full flex items-center justify-center animate-pulse-glow absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
              <Brain className="w-28 h-28 md:w-36 md:h-36 text-sortmy-blue animate-float" />
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
