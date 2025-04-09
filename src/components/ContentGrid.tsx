import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioItem } from '@/types';
import { 
  Image, 
  Video, 
  Heart, 
  Play,
  Eye
} from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';

interface ContentGridProps {
  items: PortfolioItem[];
}

const ContentGrid = ({ items }: ContentGridProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-20 h-20 rounded-full bg-sortmy-gray/10 flex items-center justify-center mb-4">
          <Image className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">No posts yet</h3>
        <p className="text-gray-400">This creator hasn't posted any content</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
      {items.map((item) => (
        <Link 
          key={item.id} 
          to={`/dashboard/portfolio/${item.id}`}
          className="group relative block overflow-hidden"
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <AspectRatio ratio={1/1} className="bg-sortmy-gray/20">
            {item.media_type === 'image' ? (
              <div className="h-full overflow-hidden">
                <img
                  src={item.media_url || `https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=500&auto=format&fit=crop`}
                  alt={item.title}
                  className={cn(
                    "w-full h-full object-cover",
                    hoveredItem === item.id ? "scale-110" : "scale-100",
                    "transition-transform duration-500"
                  )}
                />
              </div>
            ) : (
              <div className="relative w-full h-full bg-black">
                <img
                  src={item.media_url || `https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=500&auto=format&fit=crop`}
                  alt={item.title}
                  className={cn(
                    "w-full h-full object-cover opacity-90",
                    hoveredItem === item.id ? "scale-110" : "scale-100",
                    "transition-transform duration-500"
                  )}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
              </div>
            )}
            
          {/* Media type indicator */}
          <div className="absolute top-2 right-2">
            {item.media_type === 'image' && <Image className="w-5 h-5 text-white" />}
            {item.media_type === 'video' && <Video className="w-5 h-5 text-white" />}
          </div>
          </AspectRatio>
          
          {/* Hover overlay */}
          <div className={cn(
            "absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity duration-200",
            hoveredItem === item.id ? "opacity-100" : "md:group-hover:opacity-100"
          )}>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <Heart className="w-6 h-6 text-white fill-white" />
                <span className="text-white font-medium">{item.likes}</span>
              </div>
              <div className="flex flex-col items-center">
                <Eye className="w-6 h-6 text-white" />
                <span className="text-white font-medium">{Math.floor(Math.random() * 1000)}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ContentGrid;