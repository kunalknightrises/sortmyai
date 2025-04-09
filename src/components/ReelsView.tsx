import { PortfolioItem } from '@/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card } from '@/components/ui/card';
import { 
  Play,
  Heart, 
  MessageSquare,
  Video
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReelsViewProps {
  items: PortfolioItem[];
}

const ReelsView = ({ items }: ReelsViewProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-20 h-20 rounded-full bg-sortmy-gray/10 flex items-center justify-center mb-4">
          <Video className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">No reels yet</h3>
        <p className="text-gray-400">This creator hasn't posted any video content</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <Link key={item.id} to={`/dashboard/portfolio/${item.id}`} className="group">
          <Card className="overflow-hidden border-sortmy-gray/30 bg-sortmy-gray/10 hover:bg-sortmy-gray/20 transition-colors">
            <div className="relative">
              <AspectRatio ratio={9/16} className="bg-black">
                <img
                  src={item.media_url || `https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=500&auto=format&fit=crop`}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-70 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center group-hover:bg-sortmy-blue/80 transition-colors">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
              </AspectRatio>
              
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white text-sm font-medium line-clamp-1">{item.title}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-white" />
                    <span className="text-xs text-white">{item.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-white" />
                    <span className="text-xs text-white">{Math.floor(Math.random() * 50)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default ReelsView;
