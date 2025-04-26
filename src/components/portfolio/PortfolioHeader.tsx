import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Grid, List } from 'lucide-react';

interface PortfolioHeaderProps {
  totalItems: number;
  view: 'grid' | 'list';
  filter: 'all' | 'public' | 'private';
  onViewChange: (view: 'grid' | 'list') => void;
  onFilterChange: (filter: 'all' | 'public' | 'private') => void;
}

export function PortfolioHeader({
  totalItems,
  view,
  filter,
  onViewChange,
  onFilterChange,
}: PortfolioHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 border-b border-sortmy-gray">
      <div>
        <p className="text-slate-400">
          {totalItems} {totalItems === 1 ? 'project' : 'projects'} showcasing your AI content creation
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs defaultValue={filter} onValueChange={(v) => onFilterChange(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onViewChange('grid')}
          >
            <Grid className="h-5 w-5" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onViewChange('list')}
          >
            <List className="h-5 w-5" />
          </Button>
        </div>

        <Button onClick={() => navigate('/dashboard/portfolio/add')}>
          Add New Project
        </Button>
      </div>
    </div>
  );
}
