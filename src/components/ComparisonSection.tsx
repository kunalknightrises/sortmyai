import React from 'react';
import { CheckCircle, XCircle } from "lucide-react";

const ComparisonSection = () => {
  return (
    <section id="comparison" className="py-16 md:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why It's Different</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Not just another folder system — a revolutionary way to think about digital organization
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <ComparisonCard 
            title="Traditional Folders"
            isPrimary={false}
            features={[
              { text: "Manual organization", available: false },
              { text: "Static folder structures", available: false },
              { text: "Limited search capabilities", available: false },
              { text: "No content analysis", available: false },
              { text: "Isolated from other tools", available: false }
            ]}
          />
          
          <ComparisonCard 
            title="SortMyAI Interface"
            isPrimary={true}
            features={[
              { text: "AI-powered auto-organization", available: true },
              { text: "Dynamic, adaptive structures", available: true },
              { text: "Deep content understanding", available: true },
              { text: "Contextual connections", available: true },
              { text: "Seamless integrations", available: true }
            ]}
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureItem {
  text: string;
  available: boolean;
}

const ComparisonCard = ({ 
  title, 
  isPrimary, 
  features 
}: { 
  title: string; 
  isPrimary: boolean; 
  features: FeatureItem[];
}) => {
  return (
    <div className={`rounded-xl p-6 border ${
      isPrimary 
        ? 'bg-sortmy-blue/10 border-sortmy-blue/30' 
        : 'bg-sortmy-gray/10 border-sortmy-gray/30'
    }`}>
      <h3 className={`text-xl font-bold mb-6 ${isPrimary ? 'text-sortmy-blue' : 'text-gray-400'}`}>
        {title}
      </h3>
      
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            {feature.available ? (
              <CheckCircle className="w-5 h-5 text-sortmy-blue shrink-0 mr-3" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-500 shrink-0 mr-3" />
            )}
            <span className={feature.available ? 'text-white' : 'text-gray-400'}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ComparisonSection;
