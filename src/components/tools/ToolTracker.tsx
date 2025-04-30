import { useState, useEffect, useRef } from 'react';
import { Tool } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import ToolCard from './ToolCard';
import NeonButton from '@/components/ui/NeonButton';
import { fetchUserTools, deleteUserTool } from '@/services/toolService';
import { useToast } from '@/hooks/use-toast';

const ToolTracker = () => {
  const [userTools, setUserTools] = useState<Tool[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const libraryRef = useRef<HTMLDivElement>(null);

  // Scroll to library section
  const handleEmptyStateClick = () => {
    libraryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load tools on mount
  useEffect(() => {
    const loadTools = async () => {
      if (!user) return;
      try {
        const tools = await fetchUserTools(user.id);
        setUserTools(tools);
      } catch (error) {
        console.error('Error loading tools:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tools',
          variant: 'destructive'
        });
      }
    };
    
    loadTools();
  }, [user, toast]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Tool Tracker</h1>

      {userTools.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Add Your First Tool</h2>
          <p className="text-sm text-gray-400 mb-6">Browse our tool library to get started</p>
          <NeonButton variant="gradient" onClick={handleEmptyStateClick}>
            Browse Tools
          </NeonButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isUserTool={true}
              onDelete={async (tool: Tool) => {
                try {
                  await deleteUserTool(tool.id);
                  setUserTools(prev => prev.filter(t => t.id !== tool.id));
                  toast({
                    title: 'Tool removed',
                    description: 'Tool has been removed from your collection'
                  });
                } catch (error) {
                  toast({
                    title: 'Error',
                    description: 'Failed to remove tool',
                    variant: 'destructive'
                  });
                }
              }}
            />
          ))}
        </div>
      )}

      <div ref={libraryRef} className="pt-8">
        {/* Tool library content */}
      </div>
    </div>
  );
};

export default ToolTracker;