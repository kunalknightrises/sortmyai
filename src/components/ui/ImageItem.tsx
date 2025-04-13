import React, { useState, useEffect, useCallback } from 'react';
import { Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

interface ImageItemProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageItem: React.FC<ImageItemProps> = ({ src, alt, className }) => {
  const [imgError, setImgError] = useState(false);
  const [errorAttempts, setErrorAttempts] = useState(0);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
    setImgError(false);
    setErrorAttempts(0);
  }, [src]);

  const handleImageError = useCallback(() => {
    // Track error attempts and set error state
    setErrorAttempts(prev => prev + 1);
    setImgError(true);

    // We'll skip trying different approaches since they're likely to fail due to COEP restrictions
    // Instead, we'll just let the fallback UI show up after a single error

    // Only try Firebase Storage URLs
    if (src.includes('firebasestorage.googleapis.com')) {
      // For Firebase Storage URLs, try adding a token
      try {
        const storageRef = ref(getStorage(), src);
        getDownloadURL(storageRef)
          .then(url => setImgSrc(url))
          .catch(console.error);
      } catch (error) {
        console.error('Error getting download URL:', error);
      }
    }
  }, [src, imgError, errorAttempts]);

  // Show fallback UI after a single error for Google Drive images
  if (imgError && (errorAttempts > 0 && src.includes('drive.google.com'))) {
    // For Google Drive images, we can show a direct link as a last resort
    if (src.includes('drive.google.com')) {
      const fileId =
        src.match(/id=([^&]+)/)?.[1] ||
        src.match(/\/d\/([^\/]+)/)?.[1];

      if (fileId) {
        return (
          <div className={cn("h-full flex flex-col items-center justify-center bg-gray-800/50 p-4 text-center", className)}>
            <Image className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-300 mb-3">Image preview unavailable. This may be due to permission settings.</p>
            <p className="text-xs text-gray-400 mb-3">Please ensure the file is set to "Anyone with the link can view" in Google Drive.</p>
            <a
              href={`https://drive.google.com/file/d/${fileId}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Open in Google Drive to view & adjust permissions
            </a>
          </div>
        );
      }
    }
    return (
      <div className={cn("h-full flex items-center justify-center bg-gray-800", className)}>
        <Image className="w-16 h-16 text-gray-500" />
      </div>
    );
  }

  // For Google Drive images, try multiple URL formats
  if (src.includes('drive.google.com')) {
    const fileId =
      src.match(/id=([^&]+)/)?.[1] ||
      src.match(/\/d\/([^\/]+)/)?.[1];

    if (fileId) {
      // Try a different approach with direct image loading
      return (
        <div className={cn("h-full overflow-hidden", className)}>
          <img
            src={`https://lh3.googleusercontent.com/d/${fileId}`}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If this fails, try a different URL format
              const target = e.target as HTMLImageElement;
              target.onerror = (e2: any) => {
                // If this also fails, show a fallback
                if (e2.target) {
                  const target2 = e2.target as HTMLImageElement;
                  target2.onerror = null;
                  target2.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMSAxNWgtMnYtMmgydjJ6bTAtNGgtMlY3aDJ2NnoiIGZpbGw9IiM5OTkiLz48L3N2Zz4=`;
                }
              };
              target.src = `https://drive.usercontent.google.com/download?id=${fileId}&export=view`;
            }}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }
  }

  // For all other images, use the standard img tag
  return (
    <div
      className={cn("h-full overflow-hidden", className)}
      style={{ contain: 'paint' }}
    >
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        onError={handleImageError}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default ImageItem;
