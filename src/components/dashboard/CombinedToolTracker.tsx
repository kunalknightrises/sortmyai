import { useState, useEffect, useRef } from 'react';
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
import { PlusCircle, Search, ExternalLink, Edit, Trash2, Tag, Briefcase, Plus, Loader2, X, Hash, FileText, Info, Bookmark } from 'lucide-react';
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
  const libraryRef = useRef<HTMLDivElement>(null);

  // Common state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Search suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Define types for search suggestions
  type SuggestionType = 'name' | 'description' | 'category' | 'tag';

  interface SearchSuggestion {
    text: string;
    type: SuggestionType;
    source: 'user' | 'library' | 'both';
    toolId?: string;
  }

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
        if ((tool as any).tags && Array.isArray((tool as any).tags)) {
          (tool as any).tags.forEach((tag: string) => tagsSet.add(tag));
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

  // Generate search suggestions based on the search query
  const generateSuggestions = (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const queryLower = query.toLowerCase();
    const newSuggestions: SearchSuggestion[] = [];
    const addedSuggestions = new Set<string>(); // To avoid duplicates

    // Helper function to add a suggestion if it's not already added
    const addSuggestion = (text: string, type: SuggestionType, source: 'user' | 'library' | 'both', toolId?: string) => {
      const key = `${text}-${type}`;
      if (!addedSuggestions.has(key) && text.toLowerCase().includes(queryLower)) {
        newSuggestions.push({ text, type, source, toolId });
        addedSuggestions.add(key);
      }
    };

    // Add suggestions from user tools
    if (userTools && userTools.length > 0) {
      userTools.forEach(tool => {
        // Add name suggestions
        if ((tool as any).name) {
          addSuggestion((tool as any).name, 'name', 'user', tool.id);
        }

        // Add description suggestions
        if ((tool as any).description) {
          const desc = (tool as any).description;
          // Only add if the description is not too long and contains the query
          if (desc.length < 50) {
            addSuggestion(desc, 'description', 'user', tool.id);
          }
        }

        // Add category suggestions
        if ((tool as any).category) {
          addSuggestion((tool as any).category, 'category', 'user', tool.id);
        }

        // Add tag suggestions
        if ((tool as any).tags && Array.isArray((tool as any).tags)) {
          (tool as any).tags.forEach((tag: string) => {
            addSuggestion(tag, 'tag', 'user', tool.id);
          });
        }
      });
    }

    // Add suggestions from library tools
    if (libraryTools && libraryTools.length > 0) {
      libraryTools.forEach(tool => {
        // Add name suggestions
        addSuggestion(tool.name, 'name', 'library', tool.id);

        // Add description/useCase suggestions
        if (tool.description && tool.description.length < 50) {
          addSuggestion(tool.description, 'description', 'library', tool.id);
        }
        if (tool.useCase && tool.useCase.length < 50) {
          addSuggestion(tool.useCase, 'description', 'library', tool.id);
        }

        // Add tag suggestions
        if (tool.tags) {
          const tags = Array.isArray(tool.tags)
            ? tool.tags
            : typeof tool.tags === 'string'
              ? tool.tags.split(',').map(t => t.trim())
              : [];

          tags.forEach(tag => {
            // Check if this tag also exists in user tools
            const existsInUserTools = userTools?.some(userTool =>
              (userTool as any).tags &&
              Array.isArray((userTool as any).tags) &&
              (userTool as any).tags.includes(tag)
            );

            addSuggestion(tag, 'tag', existsInUserTools ? 'both' : 'library', tool.id);
          });
        }
      });
    }

    // Limit the number of suggestions to avoid overwhelming the UI
    setSuggestions(newSuggestions.slice(0, 10));
  };

  // Update suggestions when search query changes
  useEffect(() => {
    generateSuggestions(searchQuery);
  }, [searchQuery, userTools, libraryTools]);

  // Handle clicks outside the suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSuggestions &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  // Filter user tools
  const filteredUserTools = userTools?.filter(tool => {
    // Filter by search query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      (tool as any).name?.toLowerCase().includes(searchLower) ||
      (tool as any).description?.toLowerCase().includes(searchLower) ||
      ((tool as any).tags && Array.isArray((tool as any).tags) && (tool as any).tags.some((tag: string) =>
        typeof tag === 'string' && tag.toLowerCase().includes(searchLower)
      ))
    );

    // Filter by selected tags
    const matchesTags = selectedTags.length === 0 || (
      (tool as any).tags &&
      Array.isArray((tool as any).tags) &&
      selectedTags.every(tag => (tool as any).tags.includes(tag))
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
      ((userTool as any).name?.toLowerCase() === libraryTool.name.toLowerCase())
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

  // Handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    // If it's a tag, add it to selected tags
    if (suggestion.type === 'tag') {
      if (!selectedTags.includes(suggestion.text)) {
        toggleTag(suggestion.text);
      }
      // Clear the search query if it was used to find this tag
      if (searchQuery.toLowerCase().includes(suggestion.text.toLowerCase())) {
        setSearchQuery('');
      }
    } else {
      // For other types, set the search query to the suggestion text
      setSearchQuery(suggestion.text);
    }

    // Hide suggestions after selection
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    // Focus back on the input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle deleting a user tool
  const handleDeleteClick = (tool: any) => {
    setToolToDelete(tool as Tool);
    setShowDeleteDialog(true);
  };

  // Confirm deletion of a user tool
  const confirmDelete = async () => {
    if (!toolToDelete) return;

    setIsDeleting(true);
    try {
      // Check the source of the tool to determine how to delete it
      if ((toolToDelete as any).source === 'tools_collection') {
        // Delete from tools collection
        await deleteDoc(doc(db, 'tools', toolToDelete.id));
      } else if ((toolToDelete as any).source === 'user_tooltracker') {
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

  const scrollToLibrary = () => {
    libraryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Tool Tracker</h2>
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

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
        <Input
          ref={searchInputRef}
          placeholder="Search tools by name, description, or tag..."
          className="pl-10 bg-sortmy-darker/50 border-[#01AAE9]/20 focus:border-[#01AAE9]/40 focus:ring-[#01AAE9]/10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && searchQuery.length >= 2 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-sortmy-darker border border-[#01AAE9]/20 rounded-md shadow-lg max-h-60 overflow-auto"
            style={{ boxShadow: '0 4px 20px rgba(1, 170, 233, 0.2)' }}
          >
            <div className="p-2">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.text}-${suggestion.type}-${index}`}
                    className={`
                      flex items-center p-2 rounded-md cursor-pointer
                      ${selectedSuggestionIndex === index ? 'bg-[#01AAE9]/20' : 'hover:bg-[#01AAE9]/10'}
                    `}
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    {/* Icon based on suggestion type */}
                    {suggestion.type === 'name' && <Search className="h-4 w-4 mr-2 text-[#01AAE9]" />}
                    {suggestion.type === 'description' && <FileText className="h-4 w-4 mr-2 text-[#01AAE9]" />}
                    {suggestion.type === 'category' && <Bookmark className="h-4 w-4 mr-2 text-[#01AAE9]" />}
                    {suggestion.type === 'tag' && <Hash className="h-4 w-4 mr-2 text-[#01AAE9]" />}

                    <div className="flex-1">
                      <span className="text-sm text-white">{suggestion.text}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {suggestion.type === 'name' ? 'Tool' :
                         suggestion.type === 'description' ? 'Description' :
                         suggestion.type === 'category' ? 'Category' : 'Tag'}
                      </span>
                    </div>

                    {/* Source indicator */}
                    <Badge
                      variant="outline"
                      className={`
                        text-xs
                        ${suggestion.source === 'user' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          suggestion.source === 'library' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-purple-500/10 text-purple-400 border-purple-500/20'}
                      `}
                    >
                      {suggestion.source === 'user' ? 'Your Tool' :
                       suggestion.source === 'library' ? 'Library' : 'Both'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-400">
                  <Info className="h-4 w-4 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No suggestions found for "{searchQuery}"</p>
                  <p className="text-xs mt-1">Try a different search term or browse by tags</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tags Filter - Limit to 8 tags */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center mr-2">
          <Tag className="h-4 w-4 text-[#01AAE9] mr-1" />
          <span className="text-sm font-medium text-white">Tags:</span>
        </div>
        {allTags.slice(0, 8).map(tag => (
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
            onClick={() => setSelectedTags([])}
          >
            Clear Filters
            <X className="ml-1 h-3 w-3" />
          </Badge>
        )}
      </div>

      {/* User's Tools Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Your Tools</h3>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-sortmy-darker border border-[#01AAE9]/20 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3 animate-pulse">
                    <div className="h-6 bg-[#01AAE9]/20 rounded w-3/4 mb-2"></div>
                    <div className="h-10 w-10 bg-[#01AAE9]/10 rounded"></div>
                  </div>
                  <div className="h-4 bg-[#01AAE9]/10 rounded w-full mb-4 animate-pulse"></div>
                  <div className="flex flex-wrap gap-2 mb-4 animate-pulse">
                    <div className="h-6 bg-[#01AAE9]/10 rounded w-16"></div>
                    <div className="h-6 bg-[#01AAE9]/10 rounded w-20"></div>
                  </div>
                  <div className="flex justify-between items-center animate-pulse">
                    <div className="h-4 bg-[#01AAE9]/10 rounded w-24"></div>
                    <div className="h-4 bg-[#01AAE9]/10 rounded w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-sortmy-darker border border-red-500/20 rounded-lg p-6 text-center">
            <p className="text-red-400">Error loading your tools. Please try again later.</p>
          </div>
        ) : filteredUserTools && filteredUserTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredUserTools.map(tool => (
              <div key={tool.id} className="bg-sortmy-darker border border-[#01AAE9]/20 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <a 
                      href={(tool as any).website || (tool as any).website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-[#01AAE9] hover:underline"
                    >
                      {(tool as any).name}
                    </a>
                    {(tool as any).logo_url && (
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-white p-1">
                        <img
                          src={(tool as any).logo_url}
                          alt={`${(tool as any).name} logo`}
                          className="w-full h-full object-contain"
                          onError={() => handleImageError(tool.id)}
                        />
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{(tool as any).description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(tool as any).tags && Array.isArray((tool as any).tags) && (tool as any).tags.length > 0 ? (
                      (tool as any).tags.map((tag: string, index: number) => (
                        <Badge
                          key={index}
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

                  {/* Switch Visit and Delete button positions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleDeleteClick(tool)}
                        className="text-red-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/tools/edit/${tool.id}`)}
                        className="text-[#01AAE9] hover:underline flex items-center text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    </div>
                    <a
                      href={(tool as any).website || (tool as any).website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#01AAE9] hover:underline flex items-center text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Visit
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-sortmy-darker border border-[#01AAE9]/20 rounded-lg p-6 text-center">
            <Briefcase className="mx-auto w-12 h-12 mb-3 opacity-30" />
            <p className="text-gray-400">You haven't added any tools yet</p>
            <div className="flex justify-center mt-4">
              <button
                onClick={scrollToLibrary}
                className="px-4 py-2 bg-[#01AAE9] text-white rounded-md flex items-center hover:bg-[#01AAE9]/90 transition-colors"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Browse Library
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Separator */}
      <Separator className="bg-sortmy-blue/20 my-8" />

      {/* AI Tools Library Section - Add ref here */}
      <div ref={libraryRef} className="space-y-4">
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
                        <CardTitle 
                          className="text-xl bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text cursor-pointer hover:opacity-80"
                          onClick={() => window.open(formatWebsiteUrl(tool.website || tool.websiteLink || ''), '_blank')}
                        >
                          <a 
                            href={formatWebsiteUrl(tool.website || tool.websiteLink || '')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {tool.name}
                          </a>
                        </CardTitle>
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
                    {tool.tags && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {Array.isArray(tool.tags) ?
                          tool.tags.map((tag: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-sortmy-blue/10 border-sortmy-blue/20 text-xs"
                            >
                              {tag}
                            </Badge>
                          )) :
                          typeof tool.tags === 'string' && tool.tags.split(',').map((tag: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-sortmy-blue/10 border-sortmy-blue/20 text-xs"
                            >
                              {tag.trim()}
                            </Badge>
                          ))
                        }
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
        <AlertDialogContent className="bg-sortmy-dark border-[#01AAE9]/20 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{(toolToDelete as any)?.name}"? This action cannot be undone.
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
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 inline animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CombinedToolTracker;
