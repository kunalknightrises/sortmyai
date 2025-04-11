
import { Tool } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

const ToolCard = ({ tool }: ToolCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {tool.logo_url ? (
            <img 
              src={tool.logo_url} 
              alt={tool.name} 
              className="w-12 h-12 rounded object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center text-gray-500">
              {tool.name.charAt(0)}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium truncate">{tool.name}</h3>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm">{tool.rating}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
              {tool.description}
            </p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {tool.category}
              </Badge>
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400">
                {tool.price_tier}
              </Badge>
            </div>
          </div>
        </div>
        
        {tool.website && (
          <a 
            href={tool.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-blue-600 mt-2 flex items-center"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Visit Website
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default ToolCard;
