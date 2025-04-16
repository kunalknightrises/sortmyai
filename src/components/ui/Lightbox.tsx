import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Heart, Eye, Play, Pause, Volume2, VolumeX, Video } from 'lucide-react';
import { PortfolioItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ImageItem } from './ImageItem';
import { Badge } from './badge';

interface LightboxProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ item, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset image index when item changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsPlaying(false);
  }, [item]);

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
        videoRef.current.play();
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

  if (!isOpen || !item) return null;

  // Handle multiple images if available
  const images = item.media_urls ? item.media_urls : item.media_url ? [item.media_url] : [];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-10 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media section */}
        <div className="relative w-full md:w-3/5 h-[40vh] md:h-[90vh] bg-black/30">
          {images.length > 0 ? (
            <>
              <div className="w-full h-full">
                {item.media_type === 'video' ? (
                  <div className="relative w-full h-full">
                    {/* Google Drive Video */}
                    {images[currentImageIndex].includes('drive.google.com') ? (
                      <div className="w-full h-full">
                        {(() => {
                          const fileId = getGoogleDriveFileId(images[currentImageIndex]);
                          if (fileId) {
                            // Check if this is a reel
                            const isReel = item.content_type === 'reel' || item.content_type === 'both';

                            return (
                              <div className="relative w-full h-full">
                                <iframe
                                  src={`https://drive.google.com/file/d/${fileId}/preview`}
                                  allow="autoplay; fullscreen"
                                  className="w-full h-full border-0"
                                />

                                {/* Reel indicator if applicable */}
                                {isReel && (
                                  <div className="absolute top-4 left-4 z-10 bg-blue-500/80 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1">
                                    <Video className="w-4 h-4" />
                                    Reel
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return (
                            <div className="w-full h-full flex items-center justify-center bg-sortmy-gray/20">
                              <p className="text-sm text-gray-400">Video preview not available</p>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      /* Direct Video */
                      <>
                        <div className="relative w-full h-full">
                          <video
                            ref={videoRef}
                            src={images[currentImageIndex]}
                            className="w-full h-full object-contain"
                            controls
                            muted={isMuted}
                            playsInline
                            autoPlay
                            poster={item.thumbnail_url}
                            onClick={(e) => e.stopPropagation()}
                            loop={item.content_type === 'reel' || item.content_type === 'both'}
                          />

                          {/* Video controls overlay */}
                          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 rounded-md px-2 py-1 z-10">
                            <button
                              onClick={togglePlay}
                              className="p-1 hover:bg-sortmy-gray/20 rounded-full transition-colors"
                            >
                              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={toggleMute}
                              className="p-1 hover:bg-sortmy-gray/20 rounded-full transition-colors"
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                          </div>

                          {/* Reel indicator if applicable */}
                          {(item.content_type === 'reel' || item.content_type === 'both') && (
                            <div className="absolute top-4 left-4 z-10 bg-blue-500/80 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              Reel
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <ImageItem
                    src={images[currentImageIndex]}
                    alt={item.title}
                    className="w-full h-full"
                  />
                )}
              </div>

              {/* Image navigation */}
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/50 text-xs">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">No image available</p>
            </div>
          )}
        </div>

        {/* Details section */}
        <div className="w-full md:w-2/5 p-6 overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
          <h2 className="text-2xl font-bold mb-2">{item.title}</h2>

          <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{item.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className={`w-4 h-4 ${item.likes > 0 ? 'text-red-500 fill-red-500' : ''}`} />
              <span>{item.likes}</span>
            </div>
          </div>

          {item.project_url && (
            <a
              href={item.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 mb-4"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Visit Project</span>
            </a>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
            <p className="text-gray-300 whitespace-pre-line">{item.description}</p>
          </div>

          {item.tools_used && item.tools_used.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Tools Used</h3>
              <div className="flex flex-wrap gap-2">
                {item.tools_used.map((tool, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-800/50">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
