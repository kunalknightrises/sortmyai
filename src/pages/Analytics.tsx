import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import ItemAnalytics from '@/components/analytics/ItemAnalytics';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { PortfolioItem } from '@/types';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BarChart2, Image } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

const Analytics: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { portfolioItems, loading: portfolioLoading } = usePortfolio();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-sortmy-blue" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleBackToOverview = () => {
    setSelectedItemId(null);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {selectedItemId ? (
        <ItemAnalytics itemId={selectedItemId} onBack={handleBackToOverview} />
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-sortmy-dark/50 border border-sortmy-blue/20 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-sortmy-blue/20">
              <BarChart2 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="items" className="data-[state=active]:bg-sortmy-blue/20">
              <Image className="h-4 w-4 mr-2" />
              Portfolio Items
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="items" className="mt-0">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text">
                Portfolio Item Analytics
              </h2>

              {portfolioLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-sortmy-blue" />
                </div>
              ) : portfolioItems.length === 0 ? (
                <GlassCard variant="bordered" className="border-sortmy-blue/20">
                  <CardHeader>
                    <CardTitle>No Portfolio Items</CardTitle>
                    <CardDescription>
                      You don't have any portfolio items yet. Create some to see analytics.
                    </CardDescription>
                  </CardHeader>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioItems.map((item: PortfolioItem) => (
                    <GlassCard
                      key={item.id}
                      variant="bordered"
                      className="border-sortmy-blue/20 cursor-pointer hover:border-sortmy-blue/50 transition-colors"
                      onClick={() => handleSelectItem(item.id)}
                    >
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        {item.media_url ? (
                          <img
                            src={item.media_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-sortmy-dark/50 flex items-center justify-center">
                            <Image className="h-8 w-8 text-sortmy-blue/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white font-medium truncate">{item.title}</h3>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-gray-400">Views</p>
                            <p className="text-lg font-semibold">{item.views || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Likes</p>
                            <p className="text-lg font-semibold">{item.likes || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Comments</p>
                            <p className="text-lg font-semibold">{item.comments || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Analytics;
