
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
import { Tool } from '@/types';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, ExternalLink, Edit, Trash2, Tag, Briefcase, Library } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
// import NeuCard from '@/components/ui/NeuCard';
import NeonButton from '@/components/ui/NeonButton';
import HoverEffect from '@/components/ui/HoverEffect';
import ClickEffect from '@/components/ui/ClickEffect';
import AnimatedTooltip from '@/components/ui/AnimatedTooltip';
import AISuggestion from '@/components/ui/AISuggestion';

const ToolTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['tools', user?.uid],
    queryFn: async () => {
      const toolsRef = collection(db, 'tools');
      const q = query(toolsRef, where('user_id', '==', user?.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tool[];
    },
    enabled: !!user?.uid
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;

    try {
      await deleteDoc(doc(db, 'tools', id));
      toast({
        title: "Tool deleted",
        description: "Your tool has been removed successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting tool:', error);
      toast({
        title: "Error",
        description: "Failed to delete the tool. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredTools = tools?.filter(tool => {
    const searchLower = searchQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(searchLower) ||
      tool.description.toLowerCase().includes(searchLower) ||
      (tool.tags && Array.isArray(tool.tags) && tool.tags.some(tag =>
        typeof tag === 'string' && tag.toLowerCase().includes(searchLower)
      ))
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text flex items-center">
            <Briefcase className="w-8 h-8 mr-2 text-sortmy-blue" />
            Tool Tracker
          </h1>
          <p className="text-gray-400 mt-1">
            Manage and organize your AI tools in one place
          </p>
        </div>

        <div className="flex gap-3">
          <ClickEffect effect="ripple" color="blue">
            <Link to="/dashboard/tools/library">
              <NeonButton variant="cyan">
                <Library className="w-4 h-4 mr-2" />
                AI Tools Library
              </NeonButton>
            </Link>
          </ClickEffect>

          <ClickEffect effect="ripple" color="blue">
            <Link to="/dashboard/tools/add">
              <NeonButton variant="gradient">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add a Tool
              </NeonButton>
            </Link>
          </ClickEffect>
        </div>
      </div>

      <AISuggestion
        suggestion="Explore our AI Tools Library to discover new tools for your workflow."
        actionText="Explore Library"
        onAction={() => navigate('/dashboard/tools/library')}
        autoHide={true}
      />

      <GlassCard variant="bordered" className="border-sortmy-blue/20">
        <div className="p-4">
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sortmy-blue" size={18} />
            <Input
              placeholder="Search tools by name, description or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-sortmy-gray/10 border-sortmy-blue/20 focus:border-sortmy-blue/50 transition-colors"
            />
          </div>
        </div>
      </GlassCard>

      {isLoading ? (
        <div className="text-center py-12">Loading your tools...</div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-lg mb-2">Failed to load your tools</p>
          <p className="text-gray-400">Please try again later</p>
        </div>
      ) : filteredTools?.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <div>
              <p className="text-lg mb-2">No tools match your search</p>
              <p className="text-gray-400">Try a different search term</p>
            </div>
          ) : (
            <div>
              <p className="text-lg mb-2">You haven't added any tools yet</p>
              <ClickEffect effect="bounce" color="blue">
                <Link to="/dashboard/tools/add">
                  <NeonButton variant="gradient" className="mt-4">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Your First Tool
                  </NeonButton>
                </Link>
              </ClickEffect>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools?.map(tool => (
            <HoverEffect effect="lift" key={tool.id} className="h-full">
              <GlassCard variant="bordered" className="border-sortmy-blue/20 h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text">{tool.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {tool.description}
                    </CardDescription>
                  </div>
                  {tool.logo_url && (
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-white p-1">
                      <img
                        src={tool.logo_url}
                        alt={`${tool.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mt-3 mb-4">
                  {tool.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sortmy-blue/20 text-sortmy-blue hover:bg-sortmy-blue/30 transition-colors cursor-pointer"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-2">
                    <AnimatedTooltip content="Visit website" position="top">
                      <a href={tool.website || tool.website_url} target="_blank" rel="noopener noreferrer">
                        <NeonButton variant="cyan" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Visit
                        </NeonButton>
                      </a>
                    </AnimatedTooltip>
                    <AnimatedTooltip content="Edit tool" position="top">
                      <NeonButton variant="magenta" size="sm" onClick={() => navigate(`/dashboard/tools/edit/${tool.id}`)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </NeonButton>
                    </AnimatedTooltip>
                  </div>
                  <AnimatedTooltip content="Delete tool" position="top">
                    <NeonButton variant="magenta" size="sm" onClick={() => handleDelete(tool.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </NeonButton>
                  </AnimatedTooltip>
                </div>
              </CardContent>
              </GlassCard>
            </HoverEffect>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolTracker;
