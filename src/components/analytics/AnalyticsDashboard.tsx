import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserPortfolioAnalytics, getProfileAnalytics, getAnalyticsForDateRange } from '@/services/analyticsService';
import { AnalyticsSummary, ProfileAnalytics } from '@/types/analytics';
import { Loader2, TrendingUp, Eye, ThumbsUp, MessageSquare, Users, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import GlassCard from '@/components/ui/GlassCard';
import AnalyticsChart from './AnalyticsChart';
import InteractionsTable from './InteractionsTable';
import TopPortfolioItems from './TopPortfolioItems';
import { useNavigate } from 'react-router-dom';

type DateRange = '7d' | '30d' | '90d' | 'all';

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<AnalyticsSummary | null>(null);
  const [profileAnalytics, setProfileAnalytics] = useState<ProfileAnalytics | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [filteredData, setFilteredData] = useState<{
    views: number;
    likes: number;
    comments: number;
    viewsOverTime: {date: string, count: number}[];
    likesOverTime: {date: string, count: number}[];
    commentsOverTime: {date: string, count: number}[];
  }>({
    views: 0,
    likes: 0,
    comments: 0,
    viewsOverTime: [],
    likesOverTime: [],
    commentsOverTime: []
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Load portfolio analytics
        const portfolioData = await getUserPortfolioAnalytics(user.uid);
        setPortfolioAnalytics(portfolioData);

        // Load profile analytics
        const profileData = await getProfileAnalytics(user.uid);
        setProfileAnalytics(profileData);

        // Apply initial date filter
        applyDateFilter('30d', portfolioData);
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load analytics data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user, toast]);

  const applyDateFilter = async (range: DateRange, data: AnalyticsSummary | null) => {
    if (!user || !data) return;

    setDateRange(range);

    let startDate: Date;
    const endDate = new Date();

    switch (range) {
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '90d':
        startDate = subDays(endDate, 90);
        break;
      case 'all':
      default:
        // Use all data
        setFilteredData({
          views: data.totalViews,
          likes: data.totalLikes,
          comments: data.totalComments,
          viewsOverTime: data.viewsOverTime,
          likesOverTime: data.likesOverTime,
          commentsOverTime: data.commentsOverTime
        });
        return;
    }

    // For specific date ranges, fetch filtered data
    try {
      const rangeData = await getAnalyticsForDateRange(user.uid, startDate, endDate);
      setFilteredData(rangeData);
    } catch (error) {
      console.error('Error filtering analytics:', error);

      // Fallback to filtering the existing data
      const startDateStr = format(startDate, 'yyyy-MM-dd');

      const filteredViews = data.viewsOverTime.filter(
        item => item.date >= startDateStr
      );

      const filteredLikes = data.likesOverTime.filter(
        item => item.date >= startDateStr
      );

      const filteredComments = data.commentsOverTime.filter(
        item => item.date >= startDateStr
      );

      setFilteredData({
        views: filteredViews.reduce((sum, item) => sum + item.count, 0),
        likes: filteredLikes.reduce((sum, item) => sum + item.count, 0),
        comments: filteredComments.reduce((sum, item) => sum + item.count, 0),
        viewsOverTime: filteredViews,
        likesOverTime: filteredLikes,
        commentsOverTime: filteredComments
      });
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sortmy-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text">
          Analytics Dashboard
        </h1>

        <Select value={dateRange} onValueChange={(value) => applyDateFilter(value as DateRange, portfolioAnalytics)}>
          <SelectTrigger className="w-[180px] bg-sortmy-dark/50 border-sortmy-blue/20">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent className="bg-sortmy-darker border-sortmy-blue/20">
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard variant="bordered" className="border-sortmy-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Eye className="h-5 w-5 mr-2 text-sortmy-blue" />
              Views
            </CardTitle>
            <CardDescription>Total portfolio views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredData.views}</div>
            <p className="text-sm text-gray-400 mt-1">
              {dateRange === 'all'
                ? 'All time'
                : `Last ${dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : '90 days'}`}
            </p>
          </CardContent>
        </GlassCard>

        <GlassCard variant="bordered" className="border-sortmy-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ThumbsUp className="h-5 w-5 mr-2 text-sortmy-blue" />
              Likes
            </CardTitle>
            <CardDescription>Total portfolio likes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredData.likes}</div>
            <p className="text-sm text-gray-400 mt-1">
              {dateRange === 'all'
                ? 'All time'
                : `Last ${dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : '90 days'}`}
            </p>
          </CardContent>
        </GlassCard>

        <GlassCard variant="bordered" className="border-sortmy-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-sortmy-blue" />
              Comments
            </CardTitle>
            <CardDescription>Total portfolio comments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredData.comments}</div>
            <p className="text-sm text-gray-400 mt-1">
              {dateRange === 'all'
                ? 'All time'
                : `Last ${dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : '90 days'}`}
            </p>
          </CardContent>
        </GlassCard>
      </div>

      <GlassCard variant="bordered" className="border-sortmy-blue/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-sortmy-blue" />
            Engagement Over Time
          </CardTitle>
          <CardDescription>
            View how your portfolio engagement has changed over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsChart
            viewsData={filteredData.viewsOverTime}
            likesData={filteredData.likesOverTime}
            commentsData={filteredData.commentsOverTime}
          />
        </CardContent>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard variant="bordered" className="border-sortmy-blue/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-sortmy-blue" />
              Profile Stats
            </CardTitle>
            <CardDescription>
              Your profile performance and followers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profileAnalytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-sortmy-dark/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Profile Views</p>
                    <p className="text-2xl font-bold">{profileAnalytics.profileViews}</p>
                  </div>
                  <div className="bg-sortmy-dark/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Unique Viewers</p>
                    <p className="text-2xl font-bold">{profileAnalytics.uniqueViewers}</p>
                  </div>
                  <div className="bg-sortmy-dark/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Followers</p>
                    <p className="text-2xl font-bold">{profileAnalytics.followers}</p>
                  </div>
                  <div className="bg-sortmy-dark/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Following</p>
                    <p className="text-2xl font-bold">{profileAnalytics.following}</p>
                  </div>
                </div>

                <Separator className="my-4 bg-sortmy-blue/20" />

                <div>
                  <h3 className="text-sm font-medium mb-2">Recent Profile Viewers</h3>
                  <div className="space-y-2">
                    {profileAnalytics.recentViewers.length > 0 ? (
                      profileAnalytics.recentViewers.slice(0, 5).map((viewer) => (
                        <div
                          key={viewer.userId}
                          className="flex items-center justify-between p-2 bg-sortmy-dark/20 rounded-lg hover:bg-sortmy-blue/10 transition-colors cursor-pointer"
                          onClick={() => handleViewProfile(viewer.userId)}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-sortmy-blue/20 overflow-hidden mr-2">
                              {viewer.avatar_url ? (
                                <img
                                  src={viewer.avatar_url}
                                  alt={viewer.username || 'User'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-medium text-sortmy-blue">
                                  {(viewer.username || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{viewer.username || 'Unknown User'}</p>
                              <p className="text-xs text-gray-400">
                                {viewer.interactionCount} view{viewer.interactionCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProfile(viewer.userId);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-2">No profile viewers yet</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">No profile analytics available</p>
            )}
          </CardContent>
        </GlassCard>

        <GlassCard variant="bordered" className="border-sortmy-blue/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-sortmy-blue" />
              Top Performing Content
            </CardTitle>
            <CardDescription>
              Your most popular portfolio items
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profileAnalytics?.topPortfolioItems && profileAnalytics.topPortfolioItems.length > 0 ? (
              <TopPortfolioItems items={profileAnalytics.topPortfolioItems} />
            ) : (
              <p className="text-center text-gray-400 py-4">No portfolio items available</p>
            )}
          </CardContent>
        </GlassCard>
      </div>

      <Tabs defaultValue="viewers" className="w-full">
        <TabsList className="bg-sortmy-dark/50 border border-sortmy-blue/20 mb-4">
          <TabsTrigger value="viewers" className="data-[state=active]:bg-sortmy-blue/20">
            <Eye className="h-4 w-4 mr-2" />
            Viewers
          </TabsTrigger>
          <TabsTrigger value="likers" className="data-[state=active]:bg-sortmy-blue/20">
            <ThumbsUp className="h-4 w-4 mr-2" />
            Likers
          </TabsTrigger>
          <TabsTrigger value="commenters" className="data-[state=active]:bg-sortmy-blue/20">
            <MessageSquare className="h-4 w-4 mr-2" />
            Commenters
          </TabsTrigger>
        </TabsList>

        <GlassCard variant="bordered" className="border-sortmy-blue/20">
          <TabsContent value="viewers" className="mt-0">
            <CardHeader>
              <CardTitle>Top Viewers</CardTitle>
              <CardDescription>
                People who view your portfolio items the most
              </CardDescription>
            </CardHeader>
            <CardContent>
              {portfolioAnalytics?.topViewers && portfolioAnalytics.topViewers.length > 0 ? (
                <InteractionsTable
                  users={portfolioAnalytics.topViewers}
                  interactionType="view"
                  onViewProfile={handleViewProfile}
                />
              ) : (
                <p className="text-center text-gray-400 py-4">No viewers yet</p>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="likers" className="mt-0">
            <CardHeader>
              <CardTitle>Top Likers</CardTitle>
              <CardDescription>
                People who like your portfolio items the most
              </CardDescription>
            </CardHeader>
            <CardContent>
              {portfolioAnalytics?.topLikers && portfolioAnalytics.topLikers.length > 0 ? (
                <InteractionsTable
                  users={portfolioAnalytics.topLikers}
                  interactionType="like"
                  onViewProfile={handleViewProfile}
                />
              ) : (
                <p className="text-center text-gray-400 py-4">No likes yet</p>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="commenters" className="mt-0">
            <CardHeader>
              <CardTitle>Top Commenters</CardTitle>
              <CardDescription>
                People who comment on your portfolio items the most
              </CardDescription>
            </CardHeader>
            <CardContent>
              {portfolioAnalytics?.topCommenters && portfolioAnalytics.topCommenters.length > 0 ? (
                <InteractionsTable
                  users={portfolioAnalytics.topCommenters}
                  interactionType="comment"
                  onViewProfile={handleViewProfile}
                />
              ) : (
                <p className="text-center text-gray-400 py-4">No comments yet</p>
              )}
            </CardContent>
          </TabsContent>
        </GlassCard>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
