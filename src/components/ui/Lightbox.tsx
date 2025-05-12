import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronLeft, ChevronRight, ExternalLink, Eye, Play, Pause, Volume2, VolumeX, Video, MessageSquare } from 'lucide-react';
import { PortfolioItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ImageItem } from './ImageItem';
import { Badge } from './badge';
import LikeButton from '@/components/interactions/LikeButton';
import CommentSection from '@/components/interactions/CommentSection';
import LikesModal from '@/components/interactions/LikesModal';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from './separator';
import { collection, query, where, onSnapshot, getDocs, addDoc, deleteDoc, doc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { trackView } from '@/services/analyticsService';

// Helper function to get interaction stats
async function getPostInteractionStats(postId: string, userId?: string) {
  const likesRef = collection(db, 'likes');
  const likesSnap = await getDocs(query(likesRef, where('postId', '==', postId)));
  const likes = likesSnap.size;
  let userHasLiked = false;

  if (userId) {
    userHasLiked = !(
      await getDocs(query(likesRef, where('postId', '==', postId), where('userId', '==', userId), limit(1)))
    ).empty;
  }

  return {
    likes,
    comments: 0, // Implement comment counting if needed
    userHasLiked,
  };
}

interface LightboxProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ item, isOpen, onClose }) => {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Add real-time listener for likes
  useEffect(() => {
    if (!item?.id || !isOpen) return;

    const likesRef = collection(db, 'likes');
    const q = query(likesRef, where('postId', '==', item.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLikeCount(snapshot.size);
      if (user) {
        setUserHasLiked(snapshot.docs.some(doc => doc.data().userId === (user.id || user.uid)));
      } else {
        setUserHasLiked(false);
      }
    });

    return () => unsubscribe();
  }, [item?.id, isOpen, user]);

  // Update handleLikePost to use the same logic as PortfolioItemCard
  const handleLikePost = async (postId: string, userId: string, liked: boolean) => {
    const likesRef = collection(db, 'likes');
    const q = query(likesRef, where('userId', '==', userId), where('postId', '==', postId));
    const snapshot = await getDocs(q);

    if (liked) {
      // Like: create if not exists
      if (snapshot.empty) {
        await addDoc(likesRef, {
          userId,
          postId,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // Unlike: remove if exists
      if (!snapshot.empty) {
        await deleteDoc(doc(db, 'likes', snapshot.docs[0].id));
      }
    }
  };

  // Reset image index and fetch interaction stats when item changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsPlaying(false);

    // Fetch interaction stats when item changes
    const fetchInteractionStats = async () => {
      if (item && isOpen) {
        try {
          // Use default values if item.id is not defined
          if (!item.id) {
            console.warn('Portfolio item has no ID, using default interaction values');
            setLikeCount(item.likes || 0);
            setCommentCount(item.comments || 0);
            setUserHasLiked(false);
            return;
          }

          const stats = await getPostInteractionStats(item.id, user?.uid);
          setLikeCount(stats.likes);
          setCommentCount(stats.comments);
          setUserHasLiked(stats.userHasLiked);
        } catch (error) {
          console.error('Error fetching interaction stats:', error);
          // Use default values on error
          setLikeCount(item.likes || 0);
          setCommentCount(item.comments || 0);
          setUserHasLiked(false);
        }
      }
    };

    fetchInteractionStats();
  }, [item, isOpen, user?.uid, item?.likes, item?.comments]);

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

  // Track view when lightbox opens
  useEffect(() => {
    const trackViewIfNeeded = async () => {
      if (isOpen && item && user && !hasTrackedView) {
        try {
          await trackView(item.id, 'portfolio', {
            ...user,
            uid: user.uid || user.id,
            username: user.username || '',
            xp: user.xp || 0,
            level: user.level || 1,
            streak_days: user.streak_days || 0,
            email: user.email || '',
            last_login: new Date().toISOString()
          });
          setHasTrackedView(true);
        } catch (error) {
          console.error('Error tracking lightbox view:', error);
        }
      }
    };

    trackViewIfNeeded();
  }, [isOpen, item, user]);

  // Reset view tracking when item changes
  useEffect(() => {
    setHasTrackedView(false);
  }, [item?.id]);

  // Handle multiple images if available
  const images = item?.media_urls ? item.media_urls : item?.media_url ? [item.media_url] : [];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!isOpen || !item) return null;

  // Create a portal to render the lightbox at the root level of the DOM
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="relative w-[95vw] max-w-5xl max-h-[90vh] bg-sortmy-darker border border-sortmy-blue/20 rounded-lg overflow-hidden flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-sortmy-darker/80 hover:bg-sortmy-blue/20 border border-sortmy-blue/30 transition-all duration-300 text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media section */}
        <div className="relative w-full md:w-3/5 h-[40vh] md:h-[90vh] bg-sortmy-darker/50 border-r border-sortmy-blue/10">
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-sortmy-darker/80 hover:bg-sortmy-blue/20 border border-sortmy-blue/30 transition-all duration-300"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-sortmy-darker/80 hover:bg-sortmy-blue/20 border border-sortmy-blue/30 transition-all duration-300"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-sortmy-darker/80 border border-sortmy-blue/30 text-xs font-medium">
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
        <div className="w-full md:w-2/5 p-6 overflow-y-auto max-h-[50vh] md:max-h-[90vh] bg-sortmy-darker/80 backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text">{item.title}</h2>

          <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{item.views}</span>
            </div>
            <div className="flex items-center gap-2">
              <LikeButton
                postId={item.id}
                initialLikeCount={likeCount}
                initialLiked={userHasLiked}
                user={user}
                likePost={handleLikePost}
                onLikeChange={(liked, newCount) => {
                  setUserHasLiked(liked);
                  setLikeCount(newCount);
                }}
                size="sm"
                showCount={false}
              />
              <button
                className="text-gray-400 hover:text-sortmy-blue transition-colors"
                onClick={() => setShowLikesModal(true)}
              >
                {likeCount} likes
              </button>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{commentCount}</span>
            </div>
          </div>

          {item.project_url && (
            <a
              href={item.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sortmy-blue hover:text-sortmy-blue/80 mb-4 transition-colors duration-300 border-b border-sortmy-blue/30 pb-1 px-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Visit Project</span>
            </a>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-medium text-sortmy-blue mb-2">Description</h3>
            <p className="text-gray-300 whitespace-pre-line bg-sortmy-darker/50 p-3 rounded-md border border-sortmy-blue/10">{item.description}</p>
          </div>

          {item.tools_used && item.tools_used.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-sortmy-blue mb-2">Tools Used</h3>
              <div className="flex flex-wrap gap-2">
                {item.tools_used.map((tool, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-sortmy-blue/10 border-sortmy-blue/30 hover:bg-sortmy-blue/20 transition-colors duration-300"
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-4 bg-sortmy-blue/20" />

          {/* Comments section */}
          <CommentSection
            postId={item.id}
            initialCommentCount={commentCount}
            onCommentCountChange={setCommentCount}
          />
        </div>
      </div>

      {/* Likes modal */}
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        postId={item.id}
        likeCount={likeCount}
      />
    </div>,
    document.body
  );
};

export default Lightbox;
