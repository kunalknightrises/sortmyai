
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';
import { PlusCircle, ExternalLink, Edit, Trash2, Tag, Search, X } from 'lucide-react';
import NeonButton from '@/components/ui/NeonButton';
import ClickEffect from '@/components/ui/ClickEffect';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tool } from "@/types";

// Define an extended Tool type that includes source
interface ExtendedTool extends Tool {
  source: 'tools_collection' | 'user_tooltracker';
}

const ToolTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<ExtendedTool | null>(null);
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
      })) as ExtendedTool[];
    },
    enabled: !!user?.uid
  });

  const { data: userTools, isLoading: isLoadingUserTools, error: userToolsError } = useQuery({
    queryKey: ['userTools', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return [];

      const userData = userDoc.data();
      const toolTracker = userData.toolTracker || [];

      return toolTracker.map((tool: any) => {
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
      }) as ExtendedTool[];
    },
    enabled: !!user?.uid
  });

  const allTools = [...(tools || []), ...(userTools || [])];
  const isLoading = isLoadingTools || isLoadingUserTools;
  const error = toolsError || userToolsError;

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

  const handleDeleteClick = (tool: ExtendedTool) => {
    setToolToDelete(tool);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!toolToDelete) return;

    setIsDeleting(true);
    try {
      if (toolToDelete.source === 'tools_collection') {
        await deleteDoc(doc(db, 'tools', toolToDelete.id));
        await queryClient.invalidateQueries({ queryKey: ['tools', user?.uid] });
      } else if (toolToDelete.source === 'user_tooltracker') {
        const userRef = doc(db, 'users', user!.uid);

        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const toolTracker = userData.toolTracker || [];

          const toolToRemove = toolTracker.find((tool: any) => tool.id === toolToDelete.id);

          if (toolToRemove) {
            await updateDoc(userRef, {
              toolTracker: arrayRemove(toolToRemove)
            });
          }
        }

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
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      tool.name.toLowerCase().includes(searchLower) ||
      tool.description.toLowerCase().includes(searchLower) ||
      (tool.tags && Array.isArray(tool.tags) && tool.tags.some(tag =>
        typeof tag === 'string' && tag.toLowerCase().includes(searchLower)
      ))
    );

    const matchesTags = selectedTags.length === 0 || (
      tool.tags &&
      Array.isArray(tool.tags) &&
      selectedTags.every(tag => tool.tags.includes(tag))
    );

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-gray-400">
              Track and organize your AI tools
            </p>
          </div>

          <div>
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

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
          <Input
            placeholder="Search tools by name, description, or tag..."
            className="pl-10 bg-sortmy-darker/50 border-[#01AAE9]/20 focus:border-[#01AAE9]/40 focus:ring-[#01AAE9]/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center mr-2">
            <Tag className="h-4 w-4 text-[#01AAE9] mr-1" />
            <span className="text-sm font-medium text-white">Tags:</span>
          </div>
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer ${
                selectedTags.includes(tag)
                  ? "bg-[#01AAE9] text-white hover:bg-[#01AAE9]/80"
                  : "hover:bg-[#01AAE9]/10 border-[#01AAE9]/20"
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-red-500/10 border-red-500/20 text-red-400"
              onClick={clearFilters}
            >
              Clear Filters
              <X className="ml-1 h-3 w-3" />
            </Badge>
          )}
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredTools?.map(tool => (
              <div key={tool.id} className="bg-sortmy-darker border border-[#01AAE9]/20 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-[#01AAE9]">{tool.name}</h3>
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

                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{tool.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tool.tags && Array.isArray(tool.tags) && tool.tags.length > 0 ? (
                      tool.tags.map((tag, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="bg-[#01AAE9]/10 text-[#01AAE9] border-[#01AAE9]/20 hover:bg-[#01AAE9]/20"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No tags</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <a
                        href={tool.website || tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#01AAE9] hover:underline flex items-center text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Visit
                      </a>
                      <button
                        onClick={() => navigate(`/dashboard/tools/edit/${tool.id}`)}
                        className="text-[#01AAE9] hover:underline flex items-center text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(tool)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-sortmy-dark border-[#01AAE9]/20 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{toolToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button
              className="px-4 py-2 rounded-md bg-transparent border border-[#01AAE9]/20 text-white hover:bg-[#01AAE9]/10 transition-colors"
              disabled={isDeleting}
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-red-500/80 text-white hover:bg-red-500 transition-colors"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ToolTracker;
