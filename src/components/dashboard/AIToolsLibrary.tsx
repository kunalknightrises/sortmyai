import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Filter, Tag, Zap, ExternalLink, Sparkles } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import ClickEffect from '@/components/ui/ClickEffect';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import NeonSkeleton from '@/components/ui/NeonSkeleton';
import { AITool } from '@/types';

const AIToolsLibrary = () => {
  const [tools, setTools] = useState<AITool[]>([]);
  const [filteredTools, setFilteredTools] = useState<AITool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingToolIds, setSavingToolIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch AI tools from Firebase
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const toolsCollection = collection(db, 'ai-tools');
        const toolsSnapshot = await getDocs(toolsCollection);

        const toolsList: AITool[] = [];
        const tagsSet = new Set<string>();

        toolsSnapshot.forEach((doc) => {
          const toolData = doc.data() as AITool;
          const tool = {
            ...toolData,
            id: doc.id
          };

          // Extract all tags for filtering
          if (tool.tags && Array.isArray(tool.tags)) {
            tool.tags.forEach(tag => tagsSet.add(tag));
          }

          toolsList.push(tool);
        });

        setTools(toolsList);
        setFilteredTools(toolsList);
        setAllTags(Array.from(tagsSet));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching AI tools:', error);
        toast({
          title: 'Error',
          description: 'Failed to load AI tools. Please try again later.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchTools();
  }, [toast]);

  // Filter tools based on search query and selected tags
  useEffect(() => {
    let filtered = tools;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool =>
        tool.name?.toLowerCase().includes(query) ||
        tool.description?.toLowerCase().includes(query) ||
        tool.useCase?.toLowerCase().includes(query)
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(tool =>
        tool.tags && selectedTags.every(tag => tool.tags.includes(tag))
      );
    }

    // Filter by tab
    if (activeTab === 'free') {
      filtered = filtered.filter(tool =>
        tool.pricing === 'Free' || tool.pricing === 'Freemium'
      );
    } else if (activeTab === 'paid') {
      filtered = filtered.filter(tool =>
        tool.pricing === 'Paid' || tool.pricing === 'Subscription'
      );
    }

    setFilteredTools(filtered);
  }, [searchQuery, selectedTags, tools, activeTab]);

  // Add tool to user's tool tracker
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

      // Add tool to user's tool tracker in Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        toolTracker: arrayUnion({
          id: tool.id,
          name: tool.name,
          useCase: tool.useCase,
          logoUrl: tool.logoUrl,
          website: tool.website,
          addedAt: new Date().toISOString(),
        })
      });

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
    setActiveTab('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-sortmy-blue" />
          AI Tools Library
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Search and filters */}
        <div className="w-full md:w-1/4 space-y-4">
          <GlassCard variant="bordered" className="border-sortmy-blue/20 p-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-sortmy-blue" />
              <Input
                placeholder="Search tools..."
                className="pl-8 bg-sortmy-darker/50 border-sortmy-blue/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center mb-2">
                <Filter className="w-4 h-4 mr-2 text-sortmy-blue" />
                <h3 className="font-medium">Filters</h3>
              </div>

              <div className="mt-2">
                <div className="flex items-center mb-2">
                  <Tag className="w-4 h-4 mr-2 text-sortmy-blue" />
                  <h4 className="text-sm font-medium">Tags</h4>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedTags.includes(tag)
                          ? 'bg-sortmy-blue hover:bg-sortmy-blue/80'
                          : 'hover:bg-sortmy-blue/10 border-sortmy-blue/20'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {(searchQuery || selectedTags.length > 0 || activeTab !== 'all') && (
                <ClickEffect effect="ripple" color="blue">
                  <NeonButton
                    variant="cyan"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </NeonButton>
                </ClickEffect>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Tools grid */}
        <div className="w-full md:w-3/4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-sortmy-darker border border-sortmy-blue/20 mb-4">
              <TabsTrigger value="all">All Tools</TabsTrigger>
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 6 }).map((_, index) => (
                    <GlassCard key={index} variant="bordered" className="border-sortmy-blue/20 p-4 h-64">
                      <div className="flex items-center mb-4">
                        <NeonSkeleton className="h-10 w-10 rounded-md" />
                        <div className="ml-3 space-y-2 flex-1">
                          <NeonSkeleton className="h-4 w-3/4" />
                          <NeonSkeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <NeonSkeleton className="h-20 w-full mb-4" />
                      <div className="flex justify-between items-center">
                        <NeonSkeleton className="h-8 w-24" />
                        <NeonSkeleton className="h-8 w-24" />
                      </div>
                    </GlassCard>
                  ))
                ) : filteredTools.length > 0 ? (
                  filteredTools.map(tool => (
                    <GlassCard
                      key={tool.id}
                      variant="bordered"
                      className="border-sortmy-blue/20 p-4 hover:shadow-[0_0_15px_rgba(0,102,255,0.15)] transition-all duration-300 hover:translate-y-[-5px]"
                    >
                      <div className="flex items-center mb-3">
                        {tool.logoUrl ? (
                          <img
                            src={tool.logoUrl}
                            alt={`${tool.name} logo`}
                            className="w-10 h-10 rounded-md object-cover border border-sortmy-blue/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-sortmy-blue/20 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-sortmy-blue" />
                          </div>
                        )}
                        <div className="ml-3">
                          <h3 className="font-medium bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text">
                            {tool.name}
                          </h3>
                          <p className="text-xs text-gray-400">{tool.useCase}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                        {tool.description}
                      </p>

                      {tool.tags && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tool.tags.slice(0, 3).map(tag => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs border-sortmy-blue/20 bg-sortmy-blue/5"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {tool.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-sortmy-blue/20 bg-sortmy-blue/5"
                            >
                              +{tool.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-auto">
                        <Badge
                          variant={
                            tool.pricing === 'Free' ? 'default' :
                            tool.pricing === 'Freemium' ? 'secondary' :
                            'outline'
                          }
                          className={
                            tool.pricing === 'Free' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            tool.pricing === 'Freemium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          }
                        >
                          {tool.pricing || 'Unknown'}
                        </Badge>

                        <div className="flex gap-2">
                          {tool.website && (
                            <a
                              href={tool.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md bg-sortmy-blue/10 hover:bg-sortmy-blue/20 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-sortmy-blue" />
                            </a>
                          )}

                          <ClickEffect effect="ripple" color="blue">
                            <NeonButton
                              variant="cyan"
                              size="sm"
                              className="px-3"
                              onClick={() => addToolToTracker(tool)}
                              disabled={savingToolIds.includes(tool.id)}
                            >
                              {savingToolIds.includes(tool.id) ? (
                                <span className="flex items-center">
                                  <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                                  Saving
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add
                                </span>
                              )}
                            </NeonButton>
                          </ClickEffect>
                        </div>
                      </div>
                    </GlassCard>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <Search className="w-12 h-12 text-sortmy-gray mb-4" />
                    <h3 className="text-xl font-medium mb-2">No tools found</h3>
                    <p className="text-gray-400 text-center max-w-md">
                      We couldn't find any tools matching your search criteria. Try adjusting your filters or search query.
                    </p>
                    <ClickEffect effect="ripple" color="blue">
                      <NeonButton
                        variant="cyan"
                        className="mt-4"
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </NeonButton>
                    </ClickEffect>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="free" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Content is filtered by the useEffect */}
                {/* This is the same grid as "all" but filtered by the activeTab state */}
                {/* The actual rendering is handled by the shared code above */}
              </div>
            </TabsContent>

            <TabsContent value="paid" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Content is filtered by the useEffect */}
                {/* This is the same grid as "all" but filtered by the activeTab state */}
                {/* The actual rendering is handled by the shared code above */}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AIToolsLibrary;
