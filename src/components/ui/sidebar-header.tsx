import { Brain, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarHeader = ({ isCollapsed, toggleCollapsed }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-sortmy-blue" />
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg font-bold"
          >
            <span className="text-white">SortMy</span>
            <span className="text-sortmy-blue">AI</span>
          </motion.span>
        )}
      </div>

      <Collapsible open={true}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex hover:bg-gray-800/50"
            onClick={toggleCollapsed}
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform", !isCollapsed && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {/* This is empty on purpose but needed to satisfy Radix UI component hierarchy */}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SidebarHeader;
