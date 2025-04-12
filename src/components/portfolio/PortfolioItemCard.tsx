
import React from 'react';
import { PortfolioItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Heart, Lock } from 'lucide-react';

interface PortfolioItemCardProps {
  item: PortfolioItem;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export function PortfolioItemCard({ item, onEdit, onDelete, isOwner = false }: PortfolioItemCardProps) {
  const [showActions, setShowActions] = React.useState(false);

  const toggleActions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActions(!showActions);
  };

  return (
    <div className="group bg-sortmy-darker rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-sortmy-blue/20">
      <div className="relative aspect-square">
        {item.media_type === 'image' && (
          <img
            src={item.media_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {item.media_type === 'video' && (
          <video
            src={item.media_url}
            className="w-full h-full object-cover"
            controls={false}
            muted
            loop
            playsInline
          />
        )}
        {!item.is_public && (
          <div className="absolute top-2 right-2 bg-sortmy-darker/80 backdrop-blur-sm p-1 rounded-full">
            <Lock className="w-4 h-4 text-sortmy-blue" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white truncate">{item.title}</h3>
          {isOwner && (
            <div className="relative">
              <button
                onClick={toggleActions}
                className="p-1 hover:bg-sortmy-gray/20 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>
              {showActions && (
                <div className="absolute right-0 mt-1 w-48 bg-sortmy-darker border border-sortmy-gray rounded-lg shadow-lg overflow-hidden z-10">
                  <button
                    onClick={onEdit}
                    className="w-full px-4 py-2 text-left hover:bg-sortmy-gray/20 transition-colors"
                  >
                    Edit Project
                  </button>
                  <button
                    onClick={onDelete}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Delete Project
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-slate-400 text-sm line-clamp-2 mb-4">
          {item.description}
        </p>        <div className="flex flex-wrap gap-2 mb-4">
          {item.tools_used?.map((tool: string, index: number) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-sortmy-gray/30 text-slate-300 rounded-full"
            >
              {tool}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>{item.likes}</span>
          </div>
          <span title={new Date(item.created_at).toLocaleString()}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
