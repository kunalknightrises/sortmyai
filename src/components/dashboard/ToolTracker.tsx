
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tool } from '@/types';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, ExternalLink, Edit, Trash2, Tag, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

  const getCategoryColor = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes('assistant') || lowerTag.includes('ai')) return 'bg-sortmy-blue text-white';
    if (lowerTag.includes('image') || lowerTag.includes('design')) return 'bg-green-500 text-white';
    if (lowerTag.includes('content') || lowerTag.includes('writing')) return 'bg-indigo-500 text-white';
    if (lowerTag.includes('productivity')) return 'bg-purple-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getPricingBadge = (tool: Tool) => {
    const priceTier = tool.price_tier || 
                     (tool.tags.some(t => t.toLowerCase().includes('free')) ? 'free' : 'paid');
    
    switch(priceTier) {
      case 'free':
        return <span className="text-sm font-medium text-gray-300">Free</span>;
      case 'freemium':
        return <span className="text-sm font-medium text-gray-300">Freemium</span>;
      case 'subscription':
      case 'paid':
      default:
        return <span className="text-sm font-medium text-gray-300">Paid</span>;
    }
  };

  const getMainCategory = (tags: string[]) => {
    const categoryMap: {[key: string]: string} = {
      'ai': 'AI Assistant',
      'assistant': 'AI Assistant',
      'image': 'Image Generation',
      'design': 'Design',
      'content': 'Content Creation',
      'writing': 'Writing',
      'productivity': 'Productivity',
      'video': 'Video',
      'audio': 'Audio',
      'research': 'Research'
    };
    
    for (const tag of tags) {
      const lowerTag = tag.toLowerCase();
      for (const [key, value] of Object.entries(categoryMap)) {
        if (lowerTag.includes(key)) return value;
      }
    }
    
    return tags[0] || 'Other';
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
          <h1 className="text-3xl font-bold">Tool Tracker</h1>
          <p className="text-gray-400 mt-1">
            Manage and organize your AI tools in one place
          </p>
        </div>

        <Button asChild>
          <Link to="/dashboard/tools/add">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add a Tool
          </Link>
        </Button>
      </div>

      <div className="w-full relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search tools by name, description or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
              <Button className="mt-4" asChild>
                <Link to="/dashboard/tools/add">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Your First Tool
                </Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools?.map((tool, index) => (
            <Card key={tool.id} className="bg-sortmy-gray/10 border-sortmy-gray/30 card-glow overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white p-1 mr-3">
                      {tool.logo_url ? (
                        <img
                          src={tool.logo_url}
                          alt={`${tool.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 text-xs">
                          No logo
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">
                        <span className="text-gray-400 mr-1">{index + 1}.</span> 
                        {tool.name}
                      </h3>
                      <div className="mt-1">
                        <Badge className={`${getCategoryColor(getMainCategory(tool.tags))} text-xs py-0.5 px-2 rounded-full`}>
                          {getMainCategory(tool.tags)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getPricingBadge(tool)}
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                  {tool.description}
                </p>
                
                <div className="mt-2 flex flex-wrap gap-2 mb-4">
                  {tool.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sortmy-blue/20 text-sortmy-blue"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {tool.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sortmy-gray/40 text-gray-300">
                      +{tool.tags.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={tool.website || tool.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Visit
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/tools/edit/${tool.id}`)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-sm text-gray-400 hover:text-gray-300 flex items-center">
                      <Link2 className="w-3 h-3 mr-1" />
                      Alternatives
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(tool.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolTracker;
