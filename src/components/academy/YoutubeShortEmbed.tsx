
import { useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Play } from 'lucide-react';

interface YoutubeShortEmbedProps {
  videoId: string;
  title?: string;
}

const YoutubeShortEmbed = ({ videoId, title }: YoutubeShortEmbedProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&autoplay=0&rel=0`;
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const directUrl = `https://youtube.com/shorts/${videoId}`;

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setIsError(true);
  };

  // Fallback to thumbnail with link when iframe fails or during loading
  if (isError) {
    return (
      <a 
        href={directUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block relative rounded-lg overflow-hidden group transition-all"
        aria-label={title ? `Watch YouTube Short: ${title}` : 'Watch YouTube Short'}
      >
        <img 
          src={thumbnailUrl} 
          alt={title || 'YouTube Short thumbnail'} 
          className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
          <Play size={48} className="text-white opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>
      </a>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden shadow-md">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-sortmy-darker z-10">
          <div className="w-full">
            <img 
              src={thumbnailUrl} 
              alt={title || 'Loading YouTube Short'} 
              className="w-full h-auto opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="animate-pulse flex items-center gap-2">
                <Play size={24} className="text-white" />
                <span className="text-white text-sm font-medium">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <AspectRatio ratio={9/16} className="bg-sortmy-darker rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          title={title || "YouTube Short"}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={`w-full h-full ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      </AspectRatio>
    </div>
  );
};

export default YoutubeShortEmbed;
