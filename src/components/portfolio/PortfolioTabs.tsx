import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PortfolioItem } from "@/types";
import { PortfolioItemCard } from "./PortfolioItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";

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
    setSelectedItem(item);
    setIsLightboxOpen(true);
  };

  // Debug: Log items and their content types
  console.log('All filtered items:', filteredItems);
  console.log('Reel items:', filteredItems.filter(item => item.content_type === 'reel' || item.content_type === 'both'));
  console.log('Post items:', filteredItems.filter(item => item.content_type === 'post' || item.content_type === 'both'));

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

        <TabsContent value="reels" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[300px] w-full" />
            ))
          ) : (
            filteredItems
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
              ))
          )}
          {!loading && filteredItems.filter(item => item.content_type === 'reel' || item.content_type === 'both').length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No reels found. Create your first reel by selecting "Reel Only" or "Both Post and Reel" when adding content.
            </div>
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
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
};

export default PortfolioTabsWithLightbox;