import React from 'react';
import { ArrowRight, Upload, Brain, Check } from "lucide-react";

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 px-4 bg-sortmy-darker">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A simple, powerful process that transforms chaos into clarity
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Step 
              icon={<Upload className="w-8 h-8" />}
              title="Drag & Drop"
              description="Upload files, folders, or connect to your cloud storage"
              number={1}
            />
            
            <ArrowConnector />
            
            <Step 
              icon={<Brain className="w-8 h-8" />}
              title="AI Analysis"
              description="SortMyAI helps you categorize, tag, and structure your content"
              number={2}
            />
            
            <ArrowConnector />
            
            <Step 
              icon={<Check className="w-8 h-8" />}
              title="Organized Output"
              description="Access your intelligent, structured digital library"
              number={3}
            />
          </div>
          
          
        </div>
      </div>
    </section>
  );
};

const Step = ({ icon, title, description, number }: { icon: React.ReactNode, title: string, description: string, number: number }) => {
  return (
    <div className="text-center mb-8 md:mb-0">
      <div className="w-16 h-16 bg-sortmy-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
        <div className="text-sortmy-blue">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-sortmy-blue flex items-center justify-center text-xs font-bold">
          {number}
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-gray-400 text-sm max-w-[200px] mx-auto">{description}</p>
    </div>
  );
};

const ArrowConnector = () => {
  return (
    <div className="hidden md:block text-sortmy-blue/60">
      <ArrowRight className="w-8 h-8" />
    </div>
  );
};

export default HowItWorksSection;
