import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getPortfolioItemAnalytics } from '@/services/analyticsService';
import { PortfolioItemAnalytics } from '@/types/analytics';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Loader2, ArrowLeft, Eye, ThumbsUp, MessageSquare, Calendar } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import AnalyticsChart from './AnalyticsChart';

interface ItemAnalyticsProps {
  itemId: string;
  onBack?: () => void;
}

const ItemAnalytics: React.FC<ItemAnalyticsProps> = ({ itemId, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<PortfolioItemAnalytics | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!itemId) return;

      setLoading(true);
      try {
        const data = await getPortfolioItemAnalytics(itemId);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading item analytics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load analytics data for this item',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [itemId, toast]);

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sortmy-blue" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No analytics data available for this item</p>
        {onBack && (
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text">
            {analytics.title}
          </h2>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate(`/portfolio/${itemId}`)}
        >
          View Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard variant="bordered" className="border-sortmy-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Eye className="h-5 w-5 mr-2 text-sortmy-blue" />
              Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.views}</div>
          </CardContent>
        </GlassCard>

        <GlassCard variant="bordered" className="border-sortmy-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ThumbsUp className="h-5 w-5 mr-2 text-sortmy-blue" />
              Likes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.likes}</div>
          </CardContent>
        </GlassCard>

        <GlassCard variant="bordered" className="border-sortmy-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-sortmy-blue" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.comments}</div>
          </CardContent>
        </GlassCard>
      </div>

      <GlassCard variant="bordered" className="border-sortmy-blue/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-sortmy-blue" />
            Views Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsChart
            viewsData={analytics.viewsOverTime}
            likesData={[]}
            commentsData={[]}
          />
        </CardContent>
      </GlassCard>

      <Tabs defaultValue="viewers" className="w-full">
        <TabsList className="bg-sortmy-dark/50 border border-sortmy-blue/20 mb-4">
          <TabsTrigger value="viewers" className="data-[state=active]:bg-sortmy-blue/20">
            <Eye className="h-4 w-4 mr-2" />
            Recent Viewers
          </TabsTrigger>
          <TabsTrigger value="likers" className="data-[state=active]:bg-sortmy-blue/20">
            <ThumbsUp className="h-4 w-4 mr-2" />
            Recent Likers
          </TabsTrigger>
          <TabsTrigger value="commenters" className="data-[state=active]:bg-sortmy-blue/20">
            <MessageSquare className="h-4 w-4 mr-2" />
            Recent Commenters
          </TabsTrigger>
        </TabsList>

        <GlassCard variant="bordered" className="border-sortmy-blue/20">
          <TabsContent value="viewers" className="mt-0">
            <CardHeader>
              <CardTitle>Recent Viewers</CardTitle>
              <CardDescription>
                People who have recently viewed this item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.recentViewers.length > 0 ? (
                  analytics.recentViewers.map((viewer) => (
                    <div
                      key={viewer.userId}
                      className="flex items-center justify-between p-3 bg-sortmy-dark/20 rounded-lg hover:bg-sortmy-blue/10 transition-colors cursor-pointer"
                      onClick={() => handleViewProfile(viewer.userId)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={viewer.avatar_url} />
                          <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue">
                            {getInitials(viewer.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{viewer.username || 'Unknown User'}</p>
                          <p className="text-xs text-gray-400">
                            Viewed {viewer.interactionCount} time{viewer.interactionCount !== 1 ? 's' : ''} • Last viewed {formatDistanceToNow(parseISO(viewer.lastInteraction), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(viewer.userId);
                        }}
                      >
                        View Profile
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4">No viewers yet</p>
                )}
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="likers" className="mt-0">
            <CardHeader>
              <CardTitle>Recent Likers</CardTitle>
              <CardDescription>
                People who have recently liked this item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.recentLikers.length > 0 ? (
                  analytics.recentLikers.map((liker) => (
                    <div
                      key={liker.userId}
                      className="flex items-center justify-between p-3 bg-sortmy-dark/20 rounded-lg hover:bg-sortmy-blue/10 transition-colors cursor-pointer"
                      onClick={() => handleViewProfile(liker.userId)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={liker.avatar_url} />
                          <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue">
                            {getInitials(liker.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{liker.username || 'Unknown User'}</p>
                          <p className="text-xs text-gray-400">
                            Liked {formatDistanceToNow(parseISO(liker.lastInteraction), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(liker.userId);
                        }}
                      >
                        View Profile
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4">No likes yet</p>
                )}
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="commenters" className="mt-0">
            <CardHeader>
              <CardTitle>Recent Commenters</CardTitle>
              <CardDescription>
                People who have recently commented on this item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.recentCommenters.length > 0 ? (
                  analytics.recentCommenters.map((commenter) => (
                    <div
                      key={commenter.userId}
                      className="flex items-center justify-between p-3 bg-sortmy-dark/20 rounded-lg hover:bg-sortmy-blue/10 transition-colors cursor-pointer"
                      onClick={() => handleViewProfile(commenter.userId)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={commenter.avatar_url} />
                          <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue">
                            {getInitials(commenter.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{commenter.username || 'Unknown User'}</p>
                          <p className="text-xs text-gray-400">
                            Commented {commenter.interactionCount} time{commenter.interactionCount !== 1 ? 's' : ''} • Last comment {formatDistanceToNow(parseISO(commenter.lastInteraction), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(commenter.userId);
                        }}
                      >
                        View Profile
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4">No comments yet</p>
                )}
              </div>
            </CardContent>
          </TabsContent>
        </GlassCard>
      </Tabs>
    </div>
  );
};

export default ItemAnalytics;
