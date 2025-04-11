
import { PortfolioItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PortfolioCardProps {
  item: PortfolioItem;
}

const PortfolioCard = ({ item }: PortfolioCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        {item.media_url ? (
          item.media_type === 'image' ? (
            <img
              src={item.media_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : item.media_type === 'video' ? (
            <video
              src={item.media_url}
              className="w-full h-full object-cover"
              controls
            />
          ) : (
            <audio
              src={item.media_url}
              className="absolute bottom-2 left-2 right-2"
              controls
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No media available
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium truncate">{item.title}</h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
          {item.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {item.categories.map((category, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {category}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
          <div className="flex space-x-3">
            <span className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {item.views}
            </span>
            <span className="flex items-center">
              <ThumbsUp className="w-3 h-3 mr-1" />
              {item.likes}
            </span>
          </div>
          <span>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioCard;
