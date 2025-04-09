import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ComparePlans = () => {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare Plans</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the right plan to organize and upgrade your AI brain
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-sortmy-gray/10 border border-sortmy-gray/30 rounded-xl p-8 card-glow">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-400">Essential AI organization</p>
              <div className="mt-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-gray-400 ml-2">forever</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <FeatureItem available={true} text="Track unlimited AI tools" />
              <FeatureItem available={true} text="Document use cases" />
              <FeatureItem available={true} text="Basic portfolio" />
              <FeatureItem available={false} text="Smart suggestions" />
              <FeatureItem available={false} text="Alternative AI recommendations" />
              <FeatureItem available={false} text="Advanced analytics" />
            </ul>
            
            <Link to="/signup">
              <Button variant="outline" className="w-full border-sortmy-gray/50 hover:bg-sortmy-gray/20">
                Get Started
              </Button>
            </Link>
          </div>
          
          {/* Plus Plan */}
          <div className="bg-sortmy-blue/10 border border-sortmy-blue/30 rounded-xl p-8 relative overflow-hidden card-glow">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-sortmy-blue/20 rounded-full blur-xl"></div>
            <div className="relative">
              <div className="inline-block px-3 py-1 rounded-full bg-sortmy-blue/20 text-sortmy-blue text-xs font-medium mb-4">
                RECOMMENDED
              </div>
              <h3 className="text-2xl font-bold mb-2">SortMyAI+</h3>
              <p className="text-gray-400">Upgrade your mind</p>
              <div className="mt-4">
                <span className="text-3xl font-bold">$9</span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>
            </div>
            
            <ul className="space-y-4 my-8 relative">
              <FeatureItem available={true} text="Everything in Free" />
              <FeatureItem available={true} text="Smart suggestions based on usage" highlight={true} />
              <FeatureItem available={true} text="Better AI tool recommendations" highlight={true} />
              <FeatureItem available={true} text="Advanced portfolio customization" highlight={true} />
              <FeatureItem available={true} text="Usage analytics and insights" highlight={true} />
              <FeatureItem available={true} text="Priority updates" highlight={true} />
            </ul>
            
            <Link to="/signup">
              <Button className="w-full bg-sortmy-blue hover:bg-sortmy-blue/90">
                Upgrade Your Mind → Go Plus
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureItem = ({ 
  available, 
  text,
  highlight = false
}: { 
  available: boolean; 
  text: string;
  highlight?: boolean;
}) => {
  return (
    <li className="flex items-start">
      {available ? (
        <Check className={`w-5 h-5 shrink-0 mr-3 ${highlight ? 'text-sortmy-blue' : 'text-green-500'}`} />
      ) : (
        <X className="w-5 h-5 text-gray-500 shrink-0 mr-3" />
      )}
      <span className={available ? 'text-white' : 'text-gray-400'}>
        {text}
      </span>
    </li>
  );
};

export default ComparePlans;
