
import React, { useState, useRef, useEffect } from 'react';
import { PortfolioItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Heart, Lock, ChevronLeft, ChevronRight, Edit, Archive, Trash2, AlertCircle, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { ImageItem } from '../ui/ImageItem';
import { useToast } from '@/hooks/use-toast';

interface PortfolioItemCardProps {
  item: PortfolioItem;
  onEdit?: (item: PortfolioItem) => void;
  onDelete?: (item: PortfolioItem) => void;
  onArchive?: (item: PortfolioItem) => void;
  onRestore?: (item: PortfolioItem) => void;
  isOwner?: boolean;
  isReel?: boolean;
}

export function PortfolioItemCard({ item, onEdit, onDelete, onArchive, onRestore, isOwner = false, isReel = false }: PortfolioItemCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Extract Google Drive file ID if present
  const getGoogleDriveFileId = (url: string): string | null => {
    if (!url) return null;
    const fileIdMatch = url.match(/\/d\/([^\/]+)/);
    return fileIdMatch ? fileIdMatch[1] : null;
  };

  // Handle video play/pause
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          // Show play button again if autoplay fails
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video mute/unmute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Auto-play video on hover for reels
  const handleCardMouseEnter = () => {
    if (isReel && videoRef.current && !isPlaying) {
      videoRef.current.muted = true; // Always mute on auto-play
      setIsMuted(true);
      videoRef.current.play().catch(err => {
        console.error('Error auto-playing video:', err);
      });
    }
  };

  const handleCardMouseLeave = () => {
    if (isReel && videoRef.current && isPlaying) {
      videoRef.current.pause();
    }
  };

  // Update isPlaying state when video plays or pauses
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, []);

  // Get all available images
  const images = item.media_urls && item.media_urls.length > 0
    ? item.media_urls
    : item.media_url ? [item.media_url] : [];

  // Handle status-specific actions
  const handleEdit = () => {
    if (onEdit) {
      onEdit(item);
    }
    setShowActions(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item);
    } else {
      toast({
        title: "Action not available",
        description: "Delete functionality is not available.",
        variant: "destructive"
      });
    }
    setShowActions(false);
  };

  const handleArchive = () => {
    if (onArchive) {
      onArchive(item);
    } else {
      toast({
        title: "Action not available",
        description: "Archive functionality is not available.",
        variant: "destructive"
      });
    }
    setShowActions(false);
  };

  const handleRestore = () => {
    if (onRestore) {
      onRestore(item);
    } else {
      toast({
        title: "Action not available",
        description: "Restore functionality is not available.",
        variant: "destructive"
      });
    }
    setShowActions(false);
  };

  const toggleActions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActions(!showActions);
  };

  // Determine if the item has a special status
  const isArchived = item.status === 'archived';
  const isDraft = item.status === 'draft';
  const isDeleted = item.status === 'deleted';

  return (
    <div
      className={`group bg-sortmy-darker rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-sortmy-blue/20 ${isArchived ? 'opacity-70' : ''} ${isDraft ? 'border border-yellow-500/30' : ''} ${isDeleted ? 'opacity-50 grayscale' : ''} ${isReel ? 'border-l-4 border-l-blue-500' : ''}`}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
    >
      <div className="relative aspect-square">
        {/* Status indicators */}
        {isDraft && (
          <div className="absolute top-2 left-2 z-10 bg-yellow-500/80 text-black px-2 py-0.5 rounded text-xs font-medium">
            Draft
          </div>
        )}
        {isArchived && (
          <div className="absolute top-2 left-2 z-10 bg-gray-500/80 text-white px-2 py-0.5 rounded text-xs font-medium">
            Archived
          </div>
        )}
        {isDeleted && (
          <div className="absolute top-2 left-2 z-10 bg-red-500/80 text-white px-2 py-0.5 rounded text-xs font-medium">
            Deleted
          </div>
        )}
        {isReel && (
          <div className="absolute top-2 right-2 z-10 bg-blue-500/80 text-white px-2 py-0.5 rounded text-xs font-medium">
            Reel
          </div>
        )}
        {item.media_type === 'image' && images.length > 0 && (
          <>
            {/* Image navigation controls if multiple images */}
            {images.length > 1 && (
              <>
                <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-md px-2 py-1 text-xs text-white">
                  {currentImageIndex + 1} / {images.length}
                </div>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Current image display */}
            {images[currentImageIndex].includes('drive.google.com') ? (
              <div className="w-full h-full overflow-hidden bg-sortmy-gray/10">
                {(() => {
                  const fileId = images[currentImageIndex].match(/id=([^&]+)/)?.[1] ||
                                 images[currentImageIndex].match(/\/d\/([^\/]+)/)?.[1];
                  if (fileId) {
                    return (
                      <img
                        src={`https://lh3.googleusercontent.com/d/${fileId}`}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // If this fails, try a different URL format
                          const target = e.target as HTMLImageElement;
                          target.onerror = () => {
                            // If this also fails, show a fallback with a link
                            target.onerror = null;
                            target.style.display = 'none';

                            // Create a fallback element
                            const container = target.parentElement;
                            if (container) {
                              const fallback = document.createElement('div');
                              fallback.className = 'w-full h-full flex items-center justify-center';
                              fallback.innerHTML = `
                                <a href="https://drive.google.com/file/d/${fileId}/view" target="_blank" rel="noopener noreferrer"
                                   class="flex flex-col items-center justify-center p-4 text-center">
                                  <div class="w-12 h-12 mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-blue-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                  </div>
                                  <span class="text-sm text-white">View Image</span>
                                </a>
                              `;
                              container.appendChild(fallback);
                            }
                          };
                          target.src = `https://drive.usercontent.google.com/download?id=${fileId}&export=view`;
                        }}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                    );
                  }
                  return (
                    <div className="w-full h-full flex items-center justify-center bg-sortmy-gray/20">
                      <p className="text-sm text-gray-400">Preview not available</p>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <ImageItem
                src={images[currentImageIndex]}
                alt={item.title}
                className="w-full h-full"
              />
            )}
          </>
        )}
        {item.media_type === 'video' && (
          <div className="relative w-full h-full">
            {/* Option A: Google Drive Embed */}
            {item.media_url && item.media_url.includes('drive.google.com') && (
              <div className="w-full h-full">
                {(() => {
                  const fileId = getGoogleDriveFileId(item.media_url);
                  if (fileId) {
                    return (
                      <>
                        <iframe
                          src={`https://drive.google.com/file/d/${fileId}/preview`}
                          allow="autoplay"
                          className="w-full h-full border-0"
                        />
                        {/* Play button overlay for better UX */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-black/30 rounded-full p-3 backdrop-blur-sm">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </>
                    );
                  }
                  return (
                    <div className="w-full h-full flex items-center justify-center bg-sortmy-gray/20">
                      <p className="text-sm text-gray-400">Video preview not available</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Option B: Direct video for non-Google Drive videos */}
            {item.media_url && !item.media_url.includes('drive.google.com') && (
              <>
                <video
                  ref={videoRef}
                  src={item.media_url}
                  className="w-full h-full object-cover"
                  muted={isMuted}
                  loop
                  playsInline
                  onClick={(e) => e.stopPropagation()}
                  poster={item.thumbnail_url} // Use thumbnail if available
                />

                {/* Video controls overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/50 rounded-md px-2 py-1 z-10">
                  <button
                    onClick={togglePlay}
                    className="p-1 hover:bg-sortmy-gray/20 rounded-full transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-1 hover:bg-sortmy-gray/20 rounded-full transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )}

            {/* Reel indicator */}
            {isReel && (
              <div className="absolute top-2 left-2 z-10 bg-blue-500/80 text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                <Play className="w-3 h-3" />
                Reel
              </div>
            )}
          </div>
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
                  {!isDeleted && (
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-2 text-left hover:bg-sortmy-gray/20 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Project
                    </button>
                  )}

                  {!isArchived && !isDeleted && (
                    <button
                      onClick={handleArchive}
                      className="w-full px-4 py-2 text-left hover:bg-sortmy-gray/20 transition-colors flex items-center gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      Archive Project
                    </button>
                  )}

                  {(isArchived || isDraft) && !isDeleted && (
                    <button
                      onClick={handleRestore}
                      className="w-full px-4 py-2 text-left hover:bg-sortmy-gray/20 transition-colors flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Restore Project
                    </button>
                  )}

                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleted ? 'Permanently Delete' : 'Delete Project'}
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
              key={`${item.id}-tool-${index}`}
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
