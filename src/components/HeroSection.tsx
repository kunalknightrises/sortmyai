import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="pt-28 pb-16 md:pt-40 md:pb-24 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Your <span className="gradient-text">AI Brain</span>,<br /> 
              Finally <span className="relative">
                Organized
                <span className="absolute bottom-0 left-0 w-full h-1 bg-sortmy-blue opacity-70"></span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-md">
              Automatically sort, manage, and understand all your AI outputs in one sleek, intelligent interface.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-sortmy-blue hover:bg-sortmy-blue/90 text-white px-8 py-6 rounded-md">
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="bg-transparent border-sortmy-gray text-white hover:bg-sortmy-gray/30 px-8 py-6 rounded-md">
                Try the Demo
              </Button>
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-sortmy-gray/20 rounded-full flex items-center justify-center animate-pulse-glow">
                <Brain className="w-28 h-28 md:w-36 md:h-36 text-sortmy-blue animate-float" />
              </div>
              <div className="absolute top-0 left-0 w-full h-full neural-bg rounded-full opacity-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
