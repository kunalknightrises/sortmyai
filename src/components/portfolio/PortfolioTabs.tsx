import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PortfolioItem } from "@/types";
import { PortfolioItemCard } from "./PortfolioItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Lightbox } from "@/components/ui/Lightbox";
import { Video, AlertTriangle, Image, Link2 } from "lucide-react";

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
    <Tabs defaultValue="images" className="w-full mt-6" onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="images" className="flex items-center justify-center">
          <Image className="w-4 h-4 mr-2" />
          Images
        </TabsTrigger>
        <TabsTrigger value="reels" className="flex items-center justify-center">
          <Video className="w-4 h-4 mr-2" />
          Reels
        </TabsTrigger>
        <TabsTrigger value="links" className="flex items-center justify-center">
          <Link2 className="w-4 h-4 mr-2" />
          Links
        </TabsTrigger>
      </TabsList>

      <TabsContent value="images" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems
          .filter(item => (!item.content_type || item.content_type === 'post' || item.content_type === 'both') && !item.project_url)
          .map((item) => (
            <PortfolioItemCard key={item.id} item={item} />
          ))}
      </TabsContent>

      <TabsContent value="reels" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems
          .filter(item => item.content_type === 'reel' || item.content_type === 'both')
          .map((item) => (
            <PortfolioItemCard key={item.id} item={item} isReel={true} />
          ))}
      </TabsContent>

      <TabsContent value="links" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems
          .filter(item => item.project_url)
          .map((item) => (
            <PortfolioItemCard key={item.id} item={item} />
          ))}
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
  // const { toast } = useToast(); // Uncomment if needed for future use

  const handleItemClick = (item: PortfolioItem) => {
    openLightbox(item);
  };

  // Make sure to close the lightbox when a delete action is triggered
  useEffect(() => {
    const handleDeleteAction = () => {
      if (isLightboxOpen) {
        closeLightbox();
      }
    };

    // Listen for custom event that will be dispatched when delete is clicked
    window.addEventListener('portfolio:delete-action', handleDeleteAction);

    return () => {
      window.removeEventListener('portfolio:delete-action', handleDeleteAction);
    };
  }, [isLightboxOpen]);

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
      <Tabs defaultValue="images" className="w-full mt-6" onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="images" className="flex items-center justify-center">
            <Image className="w-4 h-4 mr-2" />
            Images
          </TabsTrigger>
          <TabsTrigger value="reels" className="flex items-center justify-center">
            <Video className="w-4 h-4 mr-2" />
            Reels
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center justify-center">
            <Link2 className="w-4 h-4 mr-2" />
            Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[300px] w-full" />
            ))
          ) : (
            filteredItems
              .filter(item => (!item.content_type || item.content_type === 'post' || item.content_type === 'both') && !item.project_url)
              .map((item) => {
                // Debug item status
                console.log('Rendering item:', item.id, 'Status:', item.status, 'Content type:', item.content_type);
                return (
                <div key={item.id} onClick={() => handleItemClick(item)} className="cursor-pointer relative">
                  {/* Error indicator for items with missing or invalid media */}
                  {((!item.media_url && (!item.media_urls || item.media_urls.length === 0)) ||
                    (item.media_url && item.media_url.includes('drive.google.com') &&
                     !item.media_url.includes('/d/') && !item.media_url.includes('id='))) && (
                    <div className="absolute top-2 right-2 z-20 bg-red-500/80 text-white px-2 py-1 rounded-md flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-xs">Media Error</span>
                    </div>
                  )}
                  <PortfolioItemCard
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onArchive={onArchive}
                    onRestore={onRestore}
                    isOwner={isOwner}
                  />
                </div>
              );
              })
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
                      <div key={item.id} onClick={() => handleItemClick(item)} className="cursor-pointer relative">
                        {/* Error indicator for items with missing or invalid media */}
                        {((!item.media_url && (!item.media_urls || item.media_urls.length === 0)) ||
                          (item.media_url && item.media_url.includes('drive.google.com') &&
                           !item.media_url.includes('/d/') && !item.media_url.includes('id='))) && (
                          <div className="absolute top-2 right-2 z-20 bg-red-500/80 text-white px-2 py-1 rounded-md flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-xs">Media Error</span>
                          </div>
                        )}
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

        <TabsContent value="links">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px] w-full" />
              ))}
            </div>
          ) : (
            <>
              {filteredItems.filter(item => item.project_url).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems
                    .filter(item => item.project_url)
                    .map((item) => (
                      <div key={item.id} onClick={() => handleItemClick(item)} className="cursor-pointer relative">
                        <PortfolioItemCard
                          item={item}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onArchive={onArchive}
                          onRestore={onRestore}
                          isOwner={isOwner}
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-sortmy-gray/10 rounded-lg border border-sortmy-gray/20">
                  <h3 className="text-lg font-medium mb-2">No Linked Projects Found</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">
                    Add a project URL when creating a post to have it appear in this section.
                  </p>
                </div>
              )}
            </>
          )}
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