import { PortfolioItem } from "@/types";
import { PortfolioItemCard } from "../portfolio/PortfolioItemCard";
import { Button } from "../ui/button";
import { Undo2 } from "lucide-react";

interface TrashItemsProps {
  items: PortfolioItem[];
  onRecover: (item: PortfolioItem) => void;
  onDelete: (item: PortfolioItem) => void;
}

export const TrashItems = ({ items, onRecover, onDelete }: TrashItemsProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-4">Trash Items</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-green-600/20 hover:bg-green-600/40 border-green-600/50"
                  onClick={() => onRecover(item)}
                >
                  <Undo2 className="w-4 h-4 mr-1" />
                  Recover
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-red-600/20 hover:bg-red-600/40 border-red-600/50"
                  onClick={() => onDelete(item)}
                >
                  Delete Permanently
                </Button>
              </div>
            </div>
            <div className="opacity-60">
              <PortfolioItemCard item={item} />
            </div>
            <div className="absolute top-2 right-2 z-20 bg-red-500/80 text-white px-2 py-1 rounded-md text-xs">
              Deleted
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrashItems;
