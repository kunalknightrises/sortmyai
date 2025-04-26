import React from 'react';
import { Cpu, Briefcase, FileText, PenTool } from "lucide-react";

const AudienceSection = () => {
  return (
    <section id="audience" className="py-16 md:py-24 px-4 bg-sortmy-dark">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Who It's For</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Designed for those who create, manage, and organize digital content at scale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AudienceCard
            icon={<Cpu />}
            title="AI Creators"
            description="For those building with and generating massive amounts of AI content"
          />

          <AudienceCard
            icon={<Briefcase />}
            title="Founders"
            description="Entrepreneurs managing complex information ecosystems"
          />

          <AudienceCard
            icon={<FileText />}
            title="Content Marketers"
            description="Teams producing and organizing multi-channel content"
          />

          <AudienceCard
            icon={<PenTool />}
            title="Knowledge Workers"
            description="Professionals who live in documents, research, and digital assets"
          />
        </div>
      </div>
    </section>
  );
};

const AudienceCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="bg-sortmy-gray/5 hover:bg-sortmy-gray/10 border border-sortmy-gray/20 rounded-xl p-6 transition-all duration-300">
      <div className="text-sortmy-blue mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

export default AudienceSection;
