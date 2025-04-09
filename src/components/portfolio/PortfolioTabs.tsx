import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PortfolioItem } from "@/types";
import { PortfolioItemCard } from "./PortfolioItemCard";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioTabsProps {
  loading: boolean;
  filteredItems: PortfolioItem[];
  onTabChange: (value: string) => void;
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

export default PortfolioTabs;