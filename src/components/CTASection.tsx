import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-sortmy-darker">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Organize Your <span className="gradient-text">AI Brain</span>?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join the exclusive waitlist today and be among the first to experience
            the future of AI content organization.
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup">
              <Button className="bg-sortmy-blue hover:bg-sortmy-blue/90 text-white px-8 py-6 rounded-md">
                Sign Up
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" className="bg-transparent border-sortmy-gray text-white hover:bg-sortmy-gray/30 px-8 py-6 rounded-md">
              Try the Demo
            </Button>
          </div>

          <p className="text-gray-500 mt-6 text-sm">
            Limited spots available for early access
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
