import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ThumbsUp, MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface TopPortfolioItemsProps {
  items: {
    itemId: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
  }[];
}

const TopPortfolioItems: React.FC<TopPortfolioItemsProps> = ({ items }) => {
  const navigate = useNavigate();
  
  // Find the maximum values for normalization
  const maxViews = Math.max(...items.map(item => item.views), 1);
  const maxLikes = Math.max(...items.map(item => item.likes), 1);
  const maxComments = Math.max(...items.map(item => item.comments), 1);
  
  const handleViewItem = (itemId: string) => {
    navigate(`/portfolio/${itemId}`);
  };
  
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div 
          key={item.itemId}
          className="p-3 bg-sortmy-dark/30 rounded-lg hover:bg-sortmy-blue/10 transition-colors cursor-pointer"
          onClick={() => handleViewItem(item.itemId)}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 -mt-1 -mr-1"
              onClick={(e) => {
                e.stopPropagation();
                handleViewItem(item.itemId);
              }}
            >
              <ExternalLink className="h-3 w-3" />
              <span className="sr-only">View Item</span>
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-xs">
              <Eye className="h-3 w-3 mr-1 text-[#00ffff]" />
              <span className="w-14">Views:</span>
              <div className="flex-1 flex items-center gap-2">
                <Progress 
                  value={(item.views / maxViews) * 100} 
                  className="h-2 bg-sortmy-dark/50" 
                  indicatorClassName="bg-[#00ffff]"
                />
                <span className="text-xs">{item.views}</span>
              </div>
            </div>
            
            <div className="flex items-center text-xs">
              <ThumbsUp className="h-3 w-3 mr-1 text-[#ff00cc]" />
              <span className="w-14">Likes:</span>
              <div className="flex-1 flex items-center gap-2">
                <Progress 
                  value={(item.likes / maxLikes) * 100} 
                  className="h-2 bg-sortmy-dark/50" 
                  indicatorClassName="bg-[#ff00cc]"
                />
                <span className="text-xs">{item.likes}</span>
              </div>
            </div>
            
            <div className="flex items-center text-xs">
              <MessageSquare className="h-3 w-3 mr-1 text-[#ffa500]" />
              <span className="w-14">Comments:</span>
              <div className="flex-1 flex items-center gap-2">
                <Progress 
                  value={(item.comments / maxComments) * 100} 
                  className="h-2 bg-sortmy-dark/50" 
                  indicatorClassName="bg-[#ffa500]"
                />
                <span className="text-xs">{item.comments}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopPortfolioItems;
