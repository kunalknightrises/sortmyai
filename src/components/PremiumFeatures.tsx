import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Crown, Brain, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const PremiumFeatures = () => {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Crown className="w-4 h-4 mr-2 text-yellow-400" />
            Premium Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Unlock the Power of <span className="gradient-text">Claude 3.5 Sonnet</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience state-of-the-art AI assistance with our premium integration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-purple-400" />}
            title="Advanced AI Processing"
            description="Leverage Claude's powerful understanding for better content organization"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8 text-yellow-400" />}
            title="Smart Suggestions"
            description="Get intelligent recommendations for content categorization"
          />
          <FeatureCard
            icon={<LineChart className="w-8 h-8 text-blue-400" />}
            title="Enhanced Analytics"
            description="Deep insights into your content organization patterns"
          />
        </div>

        <div className="mt-12 text-center">
          <Button asChild className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
            <Link to="/signup">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
      <CardHeader>
        <div className="mb-4 bg-sortmy-gray/20 w-14 h-14 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default PremiumFeatures;