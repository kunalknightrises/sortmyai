import { Button } from "@/components/ui/button";

interface PortfolioFilterToolsProps {
  uniqueTools: string[];
  filterTool: string | null;
  setFilterTool: (tool: string | null) => void;
}

export const PortfolioFilterTools = ({
  uniqueTools,
  filterTool,
  setFilterTool,
}: PortfolioFilterToolsProps) => {
  return (
    <div className="flex flex-wrap gap-2 py-4">
      <Button
        variant={filterTool === null ? "default" : "outline"}
        onClick={() => setFilterTool(null)}
      >
        All
      </Button>
      {uniqueTools.map((tool) => (
        <Button
          key={tool}
          variant={filterTool === tool ? "default" : "outline"}
          onClick={() => setFilterTool(tool)}
        >
          {tool}
        </Button>
      ))}
    </div>
  );
};

export default PortfolioFilterTools;