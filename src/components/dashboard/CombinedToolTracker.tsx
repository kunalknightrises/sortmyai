import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ExternalLink, Edit, Trash2, Tag, Briefcase, Filter, ChevronDown, ChevronUp, Plus, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import HoverEffect from '@/components/ui/HoverEffect';
import ClickEffect from '@/components/ui/ClickEffect';
import AnimatedTooltip from '@/components/ui/AnimatedTooltip';
import { Separator } from '@/components/ui/separator';
import { Tool, AITool } from '@/types';

// Helper function to format website URLs
const formatWebsiteUrl = (url: string) => {
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

const CombinedToolTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Common state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // User tools state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Library tools state
  const [savingToolIds, setSavingToolIds] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Fetch user's tools
  const { data: userTools, isLoading: isLoadingUserTools, error: userToolsError } = useQuery({
    queryKey: ['userTools', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];

      // Fetch from tools collection
      const toolsRef = collection(db, 'tools');
      const q = query(toolsRef, where('user_id', '==', user?.uid));
      const snapshot = await getDocs(q);
      const toolsFromCollection = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        source: 'tools_collection'
      }));

      // Fetch from user's toolTracker array
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return toolsFromCollection;

      const userData = userDoc.data();
      const toolTracker = userData.toolTracker || [];

      // Convert toolTracker items to Tool format
      const toolsFromTracker = toolTracker.map((tool: any) => {
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
      });

      return [...toolsFromCollection, ...toolsFromTracker] as (Tool & { source: string })[];
    },
    enabled: !!user?.uid
  });

  // Fetch AI tools library
  const { data: libraryTools, isLoading: isLoadingLibrary } = useQuery({
    queryKey: ['aiTools'],
    queryFn: async () => {
      const toolsCollection = collection(db, 'aiTools');
      const toolsSnapshot = await getDocs(toolsCollection);

      const toolsList: AITool[] = [];
      toolsSnapshot.forEach((doc) => {
        const toolData = doc.data() as AITool;
        const tool = {
          ...toolData,
          id: doc.id
        };

        // Convert tags to array if it's a string
        if (tool.tags) {
          if (typeof tool.tags === 'string') {
            tool.tags = tool.tags.split(',').map(tag => tag.trim());
          }
        }

        toolsList.push(tool);
      });

      return toolsList;
    }
  });

  // Loading and error states
  const isLoading = isLoadingUserTools || isLoadingLibrary;
  const error = userToolsError;

  // Extract all unique tags from both user tools and library tools
  useEffect(() => {
    const tagsSet = new Set<string>();

    // Add tags from user tools
    if (userTools && userTools.length > 0) {
      userTools.forEach(tool => {
        if (tool.tags && Array.isArray(tool.tags)) {
          tool.tags.forEach(tag => tagsSet.add(tag));
        }
      });
    }

    // Add tags from library tools
    if (libraryTools && libraryTools.length > 0) {
      libraryTools.forEach(tool => {
        if (tool.tags && Array.isArray(tool.tags)) {
          tool.tags.forEach(tag => tagsSet.add(tag));
        }
      });
    }

    setAllTags(Array.from(tagsSet));
  }, [userTools, libraryTools]);

  // Filter user tools
  const filteredUserTools = userTools?.filter(tool => {
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

  // Filter library tools
  const filteredLibraryTools = libraryTools?.filter(tool => {
    // Filter by search query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      tool.name.toLowerCase().includes(searchLower) ||
      (tool.description && tool.description.toLowerCase().includes(searchLower)) ||
      (tool.useCase && tool.useCase.toLowerCase().includes(searchLower)) ||
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

  // Check if a library tool is already in user's tools
  const isToolInUserTools = (libraryTool: AITool) => {
    return userTools?.some(userTool =>
      userTool.id === libraryTool.id ||
      userTool.name.toLowerCase() === libraryTool.name.toLowerCase()
    );
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Handle deleting a user tool
  const handleDeleteClick = (tool: Tool) => {
    setToolToDelete(tool);
    setShowDeleteDialog(true);
  };

  // Confirm deletion of a user tool
  const confirmDelete = async () => {
    if (!toolToDelete) return;

    setIsDeleting(true);
    try {
      // Check the source of the tool to determine how to delete it
      if (toolToDelete.source === 'tools_collection') {
        // Delete from tools collection
        await deleteDoc(doc(db, 'tools', toolToDelete.id));
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
      }

      // Invalidate and refetch the userTools query
      await queryClient.invalidateQueries({ queryKey: ['userTools', user?.uid] });

      toast({
        title: "Tool deleted",
        description: "Your tool has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast({
        title: "Error",
        description: "Failed to delete the tool. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setToolToDelete(null);
    }
  };

  // Add a library tool to user's tools
  const addToolToTracker = async (tool: AITool) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to add tools to your tracker.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSavingToolIds(prev => [...prev, tool.id]);

      // Process tags if they exist
      let tags: string[] = [];
      if (tool.tags) {
        tags = Array.isArray(tool.tags) ? tool.tags :
              typeof tool.tags === 'string' ? tool.tags.split(',').map(tag => tag.trim()) : [];
      }

      // Add tool to user's tool tracker in Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        toolTracker: arrayUnion({
          id: tool.id,
          name: tool.name,
          useCase: tool.useCase,
          description: tool.description,
          logoUrl: tool.logoUrl || tool.logoLink,
          website: formatWebsiteUrl(tool.website || tool.websiteLink || ''),
          tags: tags,
          pricing: tool.pricing,
          excelsAt: tool.excelsAt,
          addedAt: new Date().toISOString(),
        })
      });

      // Invalidate and refetch the userTools query
      await queryClient.invalidateQueries({ queryKey: ['userTools', user?.uid] });

      toast({
        title: 'Success',
        description: `${tool.name} has been added to your tool tracker.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error adding tool to tracker:', error);
      toast({
        title: 'Error',
        description: 'Failed to add tool to your tracker. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingToolIds(prev => prev.filter(id => id !== tool.id));
    }
  };

  // Handle image load errors
  const handleImageError = (toolId: string) => {
    setFailedImages(prev => new Set(prev).add(toolId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-gray-400">Track and organize your AI tools</p>
        </div>

        <div className="flex gap-3">
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

      {/* Search and Filters */}
      <GlassCard variant="bordered" className="border-sortmy-blue/20">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tools by name, description, or tag..."
                className="pl-10 bg-sortmy-darker/50 border-sortmy-blue/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters Toggle */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-400 hover:text-white"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
              >
                <Filter className="h-4 w-4" />
                Filters
                {filtersExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Tags Filter */}
            {filtersExpanded && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-sortmy-blue" />
                  <span className="text-sm font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedTags.includes(tag)
                          ? "bg-sortmy-blue/20 text-sortmy-blue hover:bg-sortmy-blue/30"
                          : "hover:bg-sortmy-gray/20"
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {allTags.length === 0 && (
                    <span className="text-sm text-gray-400">No tags available</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>

      {/* User's Tools Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Your Tools</h3>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <GlassCard key={i} variant="bordered" className="border-sortmy-blue/20">
                <CardHeader className="pb-2 animate-pulse">
                  <div className="h-6 bg-sortmy-blue/20 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-sortmy-blue/10 rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="animate-pulse">
                  <div className="h-4 bg-sortmy-blue/10 rounded w-full mb-2"></div>
                  <div className="h-4 bg-sortmy-blue/10 rounded w-3/4"></div>
                </CardContent>
              </GlassCard>
            ))}
          </div>
        ) : error ? (
          <GlassCard variant="bordered" className="border-sortmy-blue/20">
            <CardContent className="p-6 text-center">
              <p className="text-red-400">Error loading your tools. Please try again later.</p>
            </CardContent>
          </GlassCard>
        ) : filteredUserTools && filteredUserTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUserTools.map(tool => (
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
                            onError={() => handleImageError(tool.id)}
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Tags */}
                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tool.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-sortmy-blue/10 border-sortmy-blue/20 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex gap-2">
                        <AnimatedTooltip content="Edit Tool">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-sortmy-blue/10"
                            onClick={() => navigate(`/dashboard/tools/edit/${tool.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </AnimatedTooltip>
                        <AnimatedTooltip content="Delete Tool">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDeleteClick(tool)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AnimatedTooltip>
                      </div>
                      {tool.website && (
                        <AnimatedTooltip content="Visit Website">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-sortmy-blue hover:bg-sortmy-blue/10"
                            onClick={() => window.open(formatWebsiteUrl(tool.website), '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Visit
                          </Button>
                        </AnimatedTooltip>
                      )}
                    </div>
                  </CardContent>
                </GlassCard>
              </HoverEffect>
            ))}
          </div>
        ) : (
          <GlassCard variant="bordered" className="border-sortmy-blue/20">
            <CardContent className="p-6 text-center">
              <Briefcase className="mx-auto w-12 h-12 mb-3 opacity-30" />
              <p className="text-gray-400">You haven't added any tools yet</p>
              <ClickEffect effect="bounce" color="blue">
                <Link to="/dashboard/tools/add">
                  <NeonButton variant="magenta" size="sm" className="mt-4">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Your First Tool
                  </NeonButton>
                </Link>
              </ClickEffect>
            </CardContent>
          </GlassCard>
        )}
      </div>

      {/* Separator */}
      <Separator className="bg-sortmy-blue/20 my-8" />

      {/* AI Tools Library Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">AI Tools Library</h3>
        <p className="text-gray-400">Discover and add new AI tools to your collection</p>

        {isLoadingLibrary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <GlassCard key={i} variant="bordered" className="border-sortmy-blue/20">
                <CardHeader className="pb-2 animate-pulse">
                  <div className="h-6 bg-sortmy-blue/20 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-sortmy-blue/10 rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="animate-pulse">
                  <div className="h-4 bg-sortmy-blue/10 rounded w-full mb-2"></div>
                  <div className="h-4 bg-sortmy-blue/10 rounded w-3/4"></div>
                </CardContent>
              </GlassCard>
            ))}
          </div>
        ) : filteredLibraryTools && filteredLibraryTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLibraryTools.map(tool => (
              <HoverEffect effect="lift" key={tool.id} className="h-full">
                <GlassCard variant="bordered" className="border-sortmy-blue/20 h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text">{tool.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {tool.useCase || tool.description}
                        </CardDescription>
                      </div>
                      {(tool.logoUrl || tool.logoLink) && !failedImages.has(tool.id) && (
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-white p-1">
                          <img
                            src={tool.logoUrl || tool.logoLink}
                            alt={`${tool.name} logo`}
                            className="w-full h-full object-contain"
                            onError={() => handleImageError(tool.id)}
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Tags */}
                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tool.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-sortmy-blue/10 border-sortmy-blue/20 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Pricing */}
                    {tool.pricing && (
                      <div className="mb-3">
                        <Badge
                          variant="outline"
                          className={`
                            ${tool.pricing === 'Free' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              tool.pricing === 'Freemium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              'bg-purple-500/10 text-purple-400 border-purple-500/20'}
                          `}
                        >
                          {tool.pricing}
                        </Badge>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-sortmy-blue border-sortmy-blue/20 hover:bg-sortmy-blue/10"
                        onClick={() => addToolToTracker(tool)}
                        disabled={isToolInUserTools(tool) || savingToolIds.includes(tool.id)}
                      >
                        {savingToolIds.includes(tool.id) ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-1" />
                        )}
                        {isToolInUserTools(tool) ? 'Added' : 'Add to My Tools'}
                      </Button>

                      {(tool.website || tool.websiteLink) && (
                        <AnimatedTooltip content="Visit Website">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-sortmy-blue hover:bg-sortmy-blue/10"
                            onClick={() => window.open(formatWebsiteUrl(tool.website || tool.websiteLink || ''), '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Visit
                          </Button>
                        </AnimatedTooltip>
                      )}
                    </div>
                  </CardContent>
                </GlassCard>
              </HoverEffect>
            ))}
          </div>
        ) : (
          <GlassCard variant="bordered" className="border-sortmy-blue/20">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">No AI tools found matching your search criteria.</p>
            </CardContent>
          </GlassCard>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-sortmy-darker border-sortmy-blue/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tool? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CombinedToolTracker;
