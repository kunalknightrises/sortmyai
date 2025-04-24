
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
import { Tool as BaseTool } from '@/types';

// Extended Tool type with source information
interface Tool extends BaseTool {
  source?: string;
}
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ExternalLink, Edit, Trash2, Tag, Library } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
// import NeuCard from '@/components/ui/NeuCard';
import NeonButton from '@/components/ui/NeonButton';
import HoverEffect from '@/components/ui/HoverEffect';
import ClickEffect from '@/components/ui/ClickEffect';
import AnimatedTooltip from '@/components/ui/AnimatedTooltip';
import AISuggestion from '@/components/ui/AISuggestion';
import SearchableDropdown from './SearchableDropdown';

const ToolTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: tools, isLoading: isLoadingTools, error: toolsError } = useQuery({
    queryKey: ['tools', user?.uid],
    queryFn: async () => {
      const toolsRef = collection(db, 'tools');
      const q = query(toolsRef, where('user_id', '==', user?.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        source: 'tools_collection'
      })) as (Tool & { source: string })[];
    },
    enabled: !!user?.uid
  });

  // Fetch tools from user's toolTracker array
  const { data: userTools, isLoading: isLoadingUserTools, error: userToolsError } = useQuery({
    queryKey: ['userTools', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return [];

      const userData = userDoc.data();
      const toolTracker = userData.toolTracker || [];

      // Convert toolTracker items to Tool format
      return toolTracker.map((tool: any) => {
        // Extract tags from the tool if available
        let tags: string[] = [];
        if (tool.tags) {
          tags = Array.isArray(tool.tags) ? tool.tags :
                typeof tool.tags === 'string' ? tool.tags.split(',').map((t: string) => t.trim()) : [];
        }

        return {
          id: tool.id,
          name: tool.name,
          description: tool.useCase || tool.description || '',
          logo_url: tool.logoUrl || tool.logoLink,
          website_url: tool.website || tool.websiteLink,
          website: tool.website || tool.websiteLink,
          tags: tags,
          created_at: tool.addedAt || new Date().toISOString(),
          user_id: user.uid,
          category: tool.category || '',
          price_tier: tool.pricing || 'free',
          notes: tool.excelsAt || '',
          source: 'user_tooltracker'
        };
      }) as (Tool & { source: string })[];
    },
    enabled: !!user?.uid
  });

  // Combine tools from both sources
  const allTools = [...(tools || []), ...(userTools || [])];
  const isLoading = isLoadingTools || isLoadingUserTools;
  const error = toolsError || userToolsError;

  // Extract all unique tags from tools
  useEffect(() => {
    if (allTools.length > 0) {
      const tagsSet = new Set<string>();

      allTools.forEach(tool => {
        if (tool.tags && Array.isArray(tool.tags)) {
          tool.tags.forEach(tag => tagsSet.add(tag));
        }
      });

      setAllTags(Array.from(tagsSet));
    }
  }, [allTools]);

  const handleDeleteClick = (tool: Tool) => {
    setToolToDelete(tool);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!toolToDelete) return;

    setIsDeleting(true);
    try {
      // Check the source of the tool to determine how to delete it
      if (toolToDelete.source === 'tools_collection') {
        // Delete from tools collection
        await deleteDoc(doc(db, 'tools', toolToDelete.id));
        // Invalidate and refetch the tools query
        await queryClient.invalidateQueries({ queryKey: ['tools', user?.uid] });
      } else if (toolToDelete.source === 'user_tooltracker') {
        // Delete from user's toolTracker array
        const userRef = doc(db, 'users', user!.uid);

        // Get the current toolTracker array
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const toolTracker = userData.toolTracker || [];

          // Find the tool to remove
          const toolToRemove = toolTracker.find((tool: any) => tool.id === toolToDelete.id);

          if (toolToRemove) {
            // Remove the tool from the array
            await updateDoc(userRef, {
              toolTracker: arrayRemove(toolToRemove)
            });
          }
        }

        // Invalidate and refetch the userTools query
        await queryClient.invalidateQueries({ queryKey: ['userTools', user?.uid] });
      }

      toast({
        title: "Tool deleted",
        description: "Your tool has been removed successfully.",
      });
      setShowDeleteDialog(false);
      setToolToDelete(null);
    } catch (error: any) {
      console.error('Error deleting tool:', error);
      toast({
        title: "Error",
        description: "Failed to delete the tool. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTools = allTools?.filter(tool => {
    // Filter by search query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      tool.name.toLowerCase().includes(searchLower) ||
      tool.description.toLowerCase().includes(searchLower) ||
      (tool.tags && Array.isArray(tool.tags) && tool.tags.some(tag =>
        typeof tag === 'string' && tag.toLowerCase().includes(searchLower)
      ))
    );

    // Filter by selected tags
    const matchesTags = selectedTags.length === 0 || (
      tool.tags &&
      Array.isArray(tool.tags) &&
      selectedTags.every(tag => tool.tags.includes(tag))
    );

    return matchesSearch && matchesTags;
  });

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-gray-400">
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

        <GlassCard variant="bordered" className="border-sortmy-blue/20 p-4 mb-6">
          <div className="w-full">
            <SearchableDropdown
              placeholder="Search tools or select categories..."
              options={allTags}
              value={searchQuery}
              onValueChange={setSearchQuery}
              onOptionSelect={toggleTag}
              selectedOptions={selectedTags}
            />
          </div>

          {/* Clear filters button - only shown when filters are applied */}
          {(searchQuery || selectedTags.length > 0) && (
            <div className="mt-4 flex justify-end">
              <ClickEffect effect="ripple" color="blue">
                <NeonButton
                  variant="cyan"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear Filters
                </NeonButton>
              </ClickEffect>
            </div>
          )}
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
                    {tool.tags && Array.isArray(tool.tags) && tool.tags.length > 0 ? (
                      tool.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sortmy-blue/20 text-sortmy-blue hover:bg-sortmy-blue/30 transition-colors cursor-pointer"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No tags</span>
                    )}
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
                      <NeonButton variant="magenta" size="sm" onClick={() => handleDeleteClick(tool)}>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-sortmy-dark border-sortmy-blue/20 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{toolToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <ClickEffect effect="ripple" color="blue">
              <NeonButton variant="cyan" disabled={isDeleting} onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </NeonButton>
            </ClickEffect>
            <ClickEffect effect="ripple" color="blue">
              <NeonButton
                variant="magenta"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 border-red-500/50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </NeonButton>
            </ClickEffect>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ToolTracker;
