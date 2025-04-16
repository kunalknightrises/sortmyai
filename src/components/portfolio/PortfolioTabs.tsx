import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PortfolioItem } from "@/types";
import { PortfolioItemCard } from "./PortfolioItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";
import { Video } from "lucide-react";

interface PortfolioTabsProps {
  loading: boolean;
  filteredItems: PortfolioItem[];
  onTabChange: (value: string) => void;
  onEdit?: (item: PortfolioItem) => void;
  onDelete?: (item: PortfolioItem) => void;
  onArchive?: (item: PortfolioItem) => void;
  onRestore?: (item: PortfolioItem) => void;
  isOwner?: boolean;
}

export const PortfolioTabs = ({ loading, filteredItems, onTabChange }: PortfolioTabsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[300px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="posts" className="w-full mt-6" onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="reels">Reels</TabsTrigger>
        <TabsTrigger value="tagged">Tagged</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <PortfolioItemCard key={item.id} item={item} />
        ))}
      </TabsContent>

      <TabsContent value="reels">
        <div className="text-center py-8 text-gray-500">
          Reels coming soon...
        </div>
      </TabsContent>

      <TabsContent value="tagged">
        <div className="text-center py-8 text-gray-500">
          Tagged content coming soon...
        </div>
      </TabsContent>
    </Tabs>
  );
};

export const PortfolioTabsWithLightbox = ({
  loading,
  filteredItems,
  onTabChange,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  isOwner = false
}: PortfolioTabsProps) => {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleItemClick = (item: PortfolioItem) => {
    openLightbox(item);
  };

  // Handle lightbox open/close
  const openLightbox = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsLightboxOpen(true);
    // Add a class to the body to prevent scrolling
    document.body.classList.add('overflow-hidden');
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    // Remove the class from the body to allow scrolling again
    document.body.classList.remove('overflow-hidden');
  };

  return (
    <>
      <Tabs defaultValue="posts" className="w-full mt-6" onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reels">Reels</TabsTrigger>
          <TabsTrigger value="tagged">Tagged</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[300px] w-full" />
            ))
          ) : (
            filteredItems
              .filter(item => item.content_type === 'post' || item.content_type === 'both')
              .map((item) => (
                <div key={item.id} onClick={() => handleItemClick(item)} className="cursor-pointer">
                  <PortfolioItemCard
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onArchive={onArchive}
                    onRestore={onRestore}
                    isOwner={isOwner}
                  />
                </div>
              ))
          )}
        </TabsContent>

        <TabsContent value="reels">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px] w-full" />
              ))}
            </div>
          ) : (
            <>
              {filteredItems.filter(item => item.content_type === 'reel' || item.content_type === 'both').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems
                    .filter(item => item.content_type === 'reel' || item.content_type === 'both')
                    .map((item) => (
                      <div key={item.id} onClick={() => handleItemClick(item)} className="cursor-pointer">
                        <PortfolioItemCard
                          item={item}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onArchive={onArchive}
                          onRestore={onRestore}
                          isOwner={isOwner}
                          isReel={true}
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-sortmy-gray/10 rounded-lg border border-sortmy-gray/20">
                  <div className="mx-auto w-16 h-16 rounded-full bg-sortmy-gray/20 flex items-center justify-center mb-4">
                    <Video className="w-8 h-8 text-sortmy-blue/70" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Reels Found</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">
                    Create your first reel by selecting "Reel Only" or "Both Post and Reel" when adding content.
                  </p>
                  {isOwner && (
                    <Button
                      onClick={() => window.location.href = '/dashboard/portfolio/add'}
                      variant="outline"
                      className="bg-sortmy-gray/20 border-sortmy-gray/30"
                    >
                      Create Your First Reel
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="tagged">
          <div className="text-center py-8 text-gray-500">
            Tagged content coming soon...
          </div>
        </TabsContent>
      </Tabs>

      {/* Lightbox for portfolio item details */}
      <Lightbox
        item={selectedItem}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
      />
    </>
  );
};

export default PortfolioTabsWithLightbox;