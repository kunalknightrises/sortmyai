import React, { useState, useRef, useEffect } from 'react';
import { PortfolioItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Lock, ChevronLeft, ChevronRight, Edit, Archive, Trash2, AlertCircle, Play, Pause, Volume2, VolumeX, AlertTriangle, MessageSquare } from 'lucide-react';
import { ImageItem } from '../ui/ImageItem';
import { useToast } from '@/hooks/use-toast';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedTooltip from '@/components/ui/AnimatedTooltip';
import LikeButton from '@/components/interactions/LikeButton';
import { trackView } from '@/services/analyticsService';
import { useAuth } from '@/contexts/AuthContext';
import { collection, doc, getDocs, addDoc, deleteDoc, query, where, limit, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PortfolioItemCardProps {
  item: PortfolioItem;
  onEdit?: (item: PortfolioItem) => void;
  onDelete?: (item: PortfolioItem) => void;
  onArchive?: (item: PortfolioItem) => void;
  onRestore?: (item: PortfolioItem) => void;
  isOwner?: boolean;
  isReel?: boolean;
  showUsername?: boolean;
  username?: string;
}

export function PortfolioItemCard({ item, onEdit, onDelete, onArchive, onRestore, isOwner = false, isReel = false, showUsername = false, username }: PortfolioItemCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0); // Always start at 0, real-time listener will update
  const [commentCount, setCommentCount] = useState(item.comments || 0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Defensive: Don't render LikeButton if item.id is missing
  const canLike = !!item.id;

  // Real-time listener for likes
  useEffect(() => {
    if (!item.id) return;
    const likesRef = collection(db, 'likes');
    const q = query(likesRef, where('postId', '==', item.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLikeCount(snapshot.size);
      if (user) {
        const userId = user.uid || user.id;
        setUserHasLiked(snapshot.docs.some(doc => doc.data().userId === userId));
      } else {
        setUserHasLiked(false);
      }
    });
    return () => unsubscribe();
  }, [item.id, user]);

  // Like/unlike handler for LikeButton
  const handleLikePost = async (postId: string, userId: string, liked: boolean) => {
    const likesRef = collection(db, 'likes');
    const q = query(likesRef,
      where('userId', '==', userId),
      where('postId', '==', postId)
    );
    const snapshot = await getDocs(q);

    if (liked) {
      if (snapshot.empty) {
        await addDoc(likesRef, {
          userId,
          postId,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      if (!snapshot.empty) {
        await deleteDoc(doc(db, 'likes', snapshot.docs[0].id));
      }
    }
  };

  // Helper to get like/comment stats for a post and user
  async function getPostInteractionStats(postId: string, userId?: string) {
    try {
      // First get the portfolio item to get the cached counts
      const portfolioDoc = await getDoc(doc(db, 'portfolio', postId));
      let likes = 0;
      let comments = 0;

      if (portfolioDoc.exists()) {
        const data = portfolioDoc.data();
        likes = data.likes || 0;
        comments = data.comments || 0;
      }

      // Check if user has liked
      let userHasLiked = false;
      if (userId) {
        const likesRef = collection(db, 'likes');
        userHasLiked = !(
          await getDocs(query(likesRef, where('postId', '==', postId), where('userId', '==', userId), limit(1)))
        ).empty;
      }

      return { likes, comments, userHasLiked };
    } catch (error) {
      console.error('Error getting interaction stats:', error);
      return { likes: 0, comments: 0, userHasLiked: false };
    }
  }

  // Reset view tracking when item changes
  useEffect(() => {
    setHasTrackedView(false);
  }, [item.id]);

  // Fetch interaction stats and track view when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Use default values if item.id is not defined
        if (!item.id) {
          console.warn('Portfolio item has no ID, using default interaction values');
          return;
        }

        // Use the correct user id for check
        const stats = await getPostInteractionStats(item.id, user?.id || user?.uid);
        setCommentCount(stats.comments);

        // Track view for analytics but don't track views from the owner
        if (!isOwner && user && item.id && !hasTrackedView) {
          try {
            const cleanUser = {
              id: user.id || user.uid || '',
              uid: user.uid || user.id || '',
              email: user.email || '',
              username: user.username || '',
              xp: user.xp || 0,
              level: user.level || 1,
              streak_days: user.streak_days || 0,
              last_login: new Date().toISOString(),
              badges: user.badges || [],
              following: user.following || [],
              followers_count: user.followers_count || 0,
              following_count: user.following_count || 0,
              avatar_url: undefined // Explicitly set to undefined since we don't track it
            };
            await trackView(item.id, 'portfolio', cleanUser);
            setHasTrackedView(true);
          } catch (viewError) {
            console.error('Error tracking view:', viewError);
          }
        }
      } catch (error) {
        console.error('Error fetching interaction stats:', error);
        setCommentCount(0);
      }
    };

    fetchStats();
  }, [item.id, user, isOwner, hasTrackedView]);

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
      // Add a small delay to make the hover effect more intentional
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(err => {
            console.error('Error auto-playing video:', err);
          });
          setIsPlaying(true);
        }
      }, 300);
    }
  };

  const handleCardMouseLeave = () => {
    if (isReel && videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
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

  // Check if the item has media errors
  const hasMediaError = (!item.media_url && (!item.media_urls || item.media_urls.length === 0)) ||
    (item.media_url && item.media_url.includes('drive.google.com') &&
      !item.media_url.includes('/d/') && !item.media_url.includes('id='));

  // Handle status-specific actions
  const handleEdit = (e: React.MouseEvent) => {
    // Stop event propagation to prevent lightbox from opening
    e.stopPropagation();

    if (onEdit) {
      onEdit(item);
    }
    setShowActions(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    // Stop event propagation to prevent lightbox from opening
    e.stopPropagation();

    // Dispatch a custom event to notify that delete was clicked
    // This will be used to close the lightbox if it's open
    window.dispatchEvent(new CustomEvent('portfolio:delete-action'));

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

  const handleArchive = (e: React.MouseEvent) => {
    // Stop event propagation to prevent lightbox from opening
    e.stopPropagation();

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

  const handleRestore = (e: React.MouseEvent) => {
    // Stop event propagation to prevent lightbox from opening
    e.stopPropagation();

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
    <div className="h-full">
      <GlassCard
        variant="bordered"
        className={`border-sortmy-blue/20 overflow-hidden transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg
          ${isArchived ? 'opacity-70' : ''}
          ${isDraft ? 'border-yellow-500/30' : ''}
          ${isDeleted ? 'opacity-50 grayscale' : ''}
          ${isReel ? 'border-l-4 border-l-[#0E96D5] aspect-[9/16]' : ''}`}
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
          {/* Show media error placeholder if there's an issue with the media */}
          {hasMediaError && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-sortmy-gray/20 p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-sm text-gray-400 mb-1">Media Error</p>
              <p className="text-xs text-gray-500">This item has invalid or missing media</p>
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete(item);
                  }}
                  className="mt-3 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Item
                </button>
              )}
            </div>
          )}
          {item.media_type === 'image' && images.length > 0 && !hasMediaError && (
            <>
              {/* Image navigation controls if multiple images */}
              {images.length > 1 && (
                <>
                  <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-md px-2 py-1 text-xs text-white">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                  <AnimatedTooltip content="Previous image" position="left">
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/50 hover:bg-sortmy-blue/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </AnimatedTooltip>
                  <AnimatedTooltip content="Next image" position="right">
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/50 hover:bg-sortmy-blue/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </AnimatedTooltip>
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
          {item.media_type === 'video' && !hasMediaError && (
            <div className="relative w-full h-full">
              {/* Option A: Google Drive Embed */}
              {item.media_url && item.media_url.includes('drive.google.com') && (
                <div className="w-full h-full">
                  {(() => {
                    const fileId = getGoogleDriveFileId(item.media_url);
                    if (fileId) {
                      // For reels, use a thumbnail with play button instead of iframe
                      if (isReel) {
                        return (
                          <div className="relative w-full h-full bg-sortmy-gray/10">
                            <img
                              src={`https://lh3.googleusercontent.com/d/${fileId}`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="bg-blue-500/80 rounded-full p-3">
                                <Play className="w-8 h-8 text-white" fill="white" />
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // For regular videos, use iframe
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
                    <AnimatedTooltip content={isPlaying ? "Pause" : "Play"} position="top">
                      <button
                        onClick={togglePlay}
                        className="p-1 hover:bg-sortmy-blue/20 rounded-full transition-colors"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </AnimatedTooltip>
                    <AnimatedTooltip content={isMuted ? "Unmute" : "Mute"} position="top">
                      <button
                        onClick={toggleMute}
                        className="p-1 hover:bg-sortmy-blue/20 rounded-full transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </AnimatedTooltip>
                  </div>

                  {/* Play button overlay for better UX when paused */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/30 rounded-full p-3 backdrop-blur-sm">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
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
          {showUsername && username && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-sortmy-blue/20 flex items-center justify-center text-xs text-white">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-300 hover:text-sortmy-blue transition-colors">
                {username}
              </span>
            </div>
          )}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{item.title}</h3>
            {isOwner && (
              <div className="relative">
                <AnimatedTooltip content="Actions" position="left">
                  <button
                    onClick={toggleActions}
                    className="p-1 hover:bg-sortmy-blue/20 rounded-full transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>
                </AnimatedTooltip>
                {showActions && (
                  <div className="absolute right-0 mt-1 w-48 bg-sortmy-darker border border-sortmy-blue/20 rounded-lg shadow-lg overflow-hidden z-10 backdrop-blur-sm">
                    {!isDeleted && (
                      <button
                        onClick={(e) => handleEdit(e)}
                        className="w-full px-4 py-2 text-left hover:bg-sortmy-blue/10 transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Project
                      </button>
                    )}

                    {!isArchived && !isDeleted && (
                      <button
                        onClick={(e) => handleArchive(e)}
                        className="w-full px-4 py-2 text-left hover:bg-sortmy-blue/10 transition-colors flex items-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        Archive Project
                      </button>
                    )}

                    {(isArchived || isDraft) && !isDeleted && (
                      <button
                        onClick={(e) => handleRestore(e)}
                        className="w-full px-4 py-2 text-left hover:bg-sortmy-blue/10 transition-colors flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        Restore Project
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDelete(e)}
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
                className="px-2 py-1 text-xs bg-sortmy-blue/10 text-slate-300 rounded-full hover:bg-sortmy-blue/20 transition-colors cursor-pointer"
              >
                {tool}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm text-slate-400">
            <div className="flex items-center gap-4">
              {canLike && (
                <LikeButton
                  postId={item.id}
                  initialLikeCount={likeCount}
                  initialLiked={userHasLiked}
                  user={user ? { id: user.uid } : null} // Always use user.uid for Firestore rules
                  likePost={handleLikePost}
                  onLikeChange={async (liked: boolean, newCount: number) => {
                    setUserHasLiked(liked);
                    setLikeCount(newCount);
                  }}
                  size="sm"
                />
              )}
              {!canLike && (
                <span className="text-xs text-red-400">Like unavailable</span>
              )}
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{commentCount}</span>
              </div>
            </div>
            <span title={new Date(item.created_at).toLocaleString()}>
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
