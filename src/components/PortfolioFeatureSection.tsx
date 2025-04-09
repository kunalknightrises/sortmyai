import { ArrowRight, Palette, User, VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router-dom";

const PortfolioFeatureSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-sortmy-darker">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Turn Your AI Work Into a Powerful Digital Portfolio</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
          Get discovered. Get hired. Get paid.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <CreatorProfileCard 
            username="aivisioneer"
            fullName="Emma Chen"
            tags={["AI Art", "Voice Clone", "Brand Reels"]}
            imageUrl="https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=500&auto=format&fit=crop"
          />
          
          <CreatorProfileCard 
            username="futurecoder"
            fullName="James Wilson"
            tags={["ChatGPT Pro", "Code Generation", "Automation"]}
            imageUrl="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=500&auto=format&fit=crop"
          />
          
          <CreatorProfileCard 
            username="designfuturist"
            fullName="Alex Rivera"
            tags={["Midjourney", "3D Models", "UX Prototypes"]}
            imageUrl="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=500&auto=format&fit=crop"
          />
        </div>
        
        <div className="text-center mt-12">
          <Link to="/explore">
            <Button className="bg-sortmy-blue hover:bg-sortmy-blue/90 text-white">
            Create Your AI Profile
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

interface CreatorProfileCardProps {
  username: string;
  fullName: string;
  tags: string[];
  imageUrl: string;
}

const CreatorProfileCard = ({ username, fullName, tags, imageUrl }: CreatorProfileCardProps) => {
  return (
    <Card className="overflow-hidden border-sortmy-gray/30 bg-sortmy-gray/10 hover:bg-sortmy-gray/20 transition-colors card-glow">
      <div className="relative">
        <AspectRatio ratio={1/1}>
          <img
            src={imageUrl}
            alt={fullName}
            className="w-full h-full object-cover"
          />
        </AspectRatio>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
          <VideoIcon className="w-4 h-4 text-sortmy-blue" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-sortmy-blue/20 flex items-center justify-center mr-2">
            <User className="w-4 h-4 text-sortmy-blue" />
          </div>
          <div>
            <h3 className="font-medium">{fullName}</h3>
            <p className="text-sm text-gray-400">@{username}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3 mb-4">
          {tags.map((tag, index) => (
            <div key={index} className="text-xs px-2 py-1 rounded-full bg-sortmy-gray/30 text-gray-300 flex items-center">
              <Palette className="w-3 h-3 mr-1 text-sortmy-blue" />
              {tag}
            </div>
          ))}
        </div>
        
        <Link to={`/creator/${username}`}>
          <Button variant="outline" size="sm" className="w-full mt-2 border-sortmy-gray/50">
            View Portfolio
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default PortfolioFeatureSection;
