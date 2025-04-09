import React from 'react';
import { FolderCheck, Link2, FileStack, Sparkles } from "lucide-react";

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
          
          <FeatureCard 
            icon={<Sparkles className="w-10 h-10 text-yellow-400" />}
            title="Claude 3.5 Sonnet"
            description="Premium users get access to state-of-the-art AI assistance powered by Claude 3.5 Sonnet."
            isPremium
          />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  isPremium 
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  isPremium?: boolean 
}) => {
  return (
    <div className={`${
      isPremium 
        ? 'bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-purple-500/30' 
        : 'bg-sortmy-gray/10 border-sortmy-gray/30'
    } rounded-xl p-8 card-glow`}>
      <div className={`${
        isPremium ? 'bg-purple-500/10' : 'bg-sortmy-blue/10'
      } w-20 h-20 rounded-lg flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
        {title}
        {isPremium && (
          <span className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-0.5 rounded-full">
            Premium
          </span>
        )}
      </h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default FeaturesSection;
