import React from 'react';
import { FolderCheck, Link2, FileStack } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 px-4 bg-sortmy-darker">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What SortMyAI Does</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Powerful tools to organize your digital chaos with AI precision
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<FolderCheck className="w-10 h-10 text-sortmy-blue" />}
            title="Sorts Files"
            description="Analyze and categorize all your content automatically, creating intelligent taxonomies that adapt to your needs."
          />
          
          <FeatureCard 
            icon={<Link2 className="w-10 h-10 text-sortmy-blue" />}
            title="Connects Apps"
            description="Seamlessly integrate with your favorite tools and platforms, sharing insights and structure across your entire workflow."
          />
          
          <FeatureCard 
            icon={<FileStack className="w-10 h-10 text-sortmy-blue" />}
            title="Organizes Chaos"
            description="Transform scattered files, untagged content, and disorganized AI outputs into an elegant, searchable knowledge base."
          />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="bg-sortmy-gray/10 border border-sortmy-gray/30 rounded-xl p-8 card-glow">
      <div className="bg-sortmy-blue/10 w-20 h-20 rounded-lg flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default FeaturesSection;

  );
};

export default FeaturesSection;
