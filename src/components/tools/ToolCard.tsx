import { Card, CardContent } from '@/components/ui/card';
import NeonButton from '@/components/ui/NeonButton';
import { Tool } from '@/types';

interface ToolCardProps {
  tool: Tool;
  isUserTool?: boolean;
  onDelete?: (tool: Tool) => void;
  onAdd?: (tool: Tool) => void;
}

const ToolCard = ({ tool, isUserTool, onDelete, onAdd }: ToolCardProps) => {
  return (
    <Card>
      <CardContent className="space-y-4">
        <a 
          href={tool.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-lg font-semibold hover:text-sortmy-blue transition-colors"
        >
          {tool.name}
        </a>
        
        {/* Tool description and other content */}
        
        <div className="flex justify-end gap-2">
          {isUserTool ? (
            <>
              <NeonButton 
                variant="magenta" 
                onClick={() => onDelete?.(tool)}
              >
                Delete
              </NeonButton>
              <NeonButton
                variant="cyan"
                onClick={() => window.open(tool.website_url, '_blank', 'noopener,noreferrer')}
              >
                Visit
              </NeonButton>
            </>
          ) : (
            <NeonButton
              variant="cyan"
              onClick={() => onAdd?.(tool)}
            >
              Add Tool
            </NeonButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolCard;