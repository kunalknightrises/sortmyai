import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { GoogleDriveStorage } from '@/components/storage/GoogleDriveStorage';
import { Loader2 } from 'lucide-react';
import { ImageItem } from '../ui/ImageItem';

// Define the schema first without type annotation
const portfolioSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tools_used: z.array(z.string()).min(1, 'Select at least one tool'),
  is_public: z.boolean().default(true),
  status: z.enum(['published', 'draft', 'archived', 'deleted']).default('published'),
  content_type: z.enum(['post', 'reel', 'both']).default('post'),
  media_url: z.string().optional().or(z.literal('')),
  media_urls: z.array(z.string()).optional(),
  project_url: z.string().optional().or(z.literal('')),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional(),
  archived_at: z.string().optional()
}).refine((data) => {
  // Validate that either media_url or media_urls has content
  return !!data.media_url || (data.media_urls && data.media_urls.length > 0);
}, {
  message: "Please upload at least one media file",
  path: ["media_url"]
});

// Use the schema to infer the type
type PortfolioFormData = z.infer<typeof portfolioSchema>;

interface PortfolioFormProps {
  user: User;
  initialData?: Partial<PortfolioFormData & {media_url?: string}>;
  onSubmit: (data: PortfolioFormData & {
    media_url?: string;
    id?: string;
    media_urls?: string[];
  }) => Promise<void>;
  isLoading?: boolean;
  skipFirebaseUpdate?: boolean; // Add this flag to skip the Firebase update
}

export function PortfolioForm({ user, initialData, onSubmit, isLoading, skipFirebaseUpdate = false }: PortfolioFormProps) {
  const { toast } = useToast();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewTypes, setPreviewTypes] = useState<('image' | 'video')[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      ...initialData,
      is_public: true,
    },
    mode: 'onSubmit'
  });

  const handleFormSubmit = async (formData: PortfolioFormData) => {
    try {
      setIsUploading(true);

      // Make sure we have a media URL
      if (!formData.media_url) {
        toast({
          title: 'Error',
          description: 'Please upload a media file first',
          variant: 'destructive',
        });
        return;
      }

      // Determine media type from URL or default to image
      let mediaType = 'image';
      if (formData.media_url) {
        // Check if it's a video file by extension or URL path
        const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
        const fileExtension = formData.media_url.split('.').pop()?.toLowerCase();

        if (
          formData.media_url.includes('video') ||
          (fileExtension && videoExtensions.includes(fileExtension)) ||
          // Check if we've marked this as a video in our preview types
          (previewTypes[0] === 'video')
        ) {
          mediaType = 'video';
        } else if (formData.media_url.includes('audio')) {
          mediaType = 'audio';
        }
      }

      // If media_url is just a file ID (33 chars), convert it to a full URL for storage
      let mediaUrl = formData.media_url;
      if (mediaUrl && mediaUrl.length === 33 && !mediaUrl.includes('/')) {
        mediaUrl = `https://drive.google.com/file/d/${mediaUrl}/view`;
      }

      // Generate a unique ID for the item
      const itemId = `gdrive-${user.id}-${Date.now()}`;

      // Prepare the portfolio item data
      const portfolioItem = {
        id: itemId,
        userId: user.id,
        title: formData.title,
        description: formData.description,
        media_url: mediaUrl, // Use the processed mediaUrl
        media_urls: formData.media_urls || [mediaUrl], // Store all media URLs
        media_type: mediaType,
        content_type: formData.content_type || 'post',
        tools_used: formData.tools_used || [],
        categories: [],
        likes: 0,
        views: 0,
        project_url: formData.project_url || '',
        is_public: formData.is_public,
        status: formData.status || 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: formData.status === 'deleted' ? new Date().toISOString() : undefined,
        archived_at: formData.status === 'archived' ? new Date().toISOString() : undefined
      };

      // Only update Firebase directly if not skipped (for AddPortfolio component)
      if (!skipFirebaseUpdate) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          gdrive_portfolio_items: arrayUnion(portfolioItem)
        });
      }

      // Pass the complete portfolio item to the parent component
      await onSubmit({
        ...formData,
        id: itemId,
        media_urls: portfolioItem.media_urls
      });

      toast({
        title: 'Success',
        description: 'Portfolio item saved successfully',
      });
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to save portfolio item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGoogleDriveUpload = async (fileUrl: string, fileType: 'image' | 'video' = 'image') => {
    if (fileUrl) {
      // Extract the file ID from the Google Drive URL
      const fileIdMatch = fileUrl.match(/\/d\/([^\/]+)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;

      // Add to preview URLs array
      const newUrls = [...previewUrls, fileUrl];
      setPreviewUrls(newUrls);

      // Add to preview types array
      const newTypes = [...previewTypes, fileType];
      setPreviewTypes(newTypes);

      setCurrentPreviewIndex(newUrls.length - 1); // Show the newly added media

      // Store the URLs in the form
      if (newUrls.length === 1) {
        // For backward compatibility, still set media_url for the first image
        setValue('media_url', fileId || fileUrl, {
          shouldValidate: false
        });
      }

      // Always update the media_urls array
      setValue('media_urls', newUrls, {
        shouldValidate: false
      });

      toast({
        title: `${fileType === 'video' ? 'Video' : 'Image'} Uploaded`,
        description: `${fileType === 'video' ? 'Video' : 'Image'} file ${newUrls.length > 1 ? newUrls.length : ''} has been uploaded successfully.`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-white mb-2">
          Upload Media <span className="text-red-400">*</span>
          <span className="ml-2 text-xs text-gray-400">(Images and videos supported)</span>
        </label>
        <GoogleDriveStorage
          userId={user.uid}
          onFileUpload={handleGoogleDriveUpload}
        />
        {previewUrls.length > 0 && (
          <div className="mt-4 h-64 mx-auto rounded-lg overflow-hidden relative">
            {/* Image navigation controls */}
            {previewUrls.length > 1 && (
              <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-md px-2 py-1 text-xs text-white">
                {currentPreviewIndex + 1} / {previewUrls.length}
              </div>
            )}
            {previewUrls.length > 1 && (
              <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-2 z-10">
                <button
                  type="button"
                  onClick={() => setCurrentPreviewIndex(prev => (prev > 0 ? prev - 1 : previewUrls.length - 1))}
                  className="bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPreviewIndex(prev => (prev < previewUrls.length - 1 ? prev + 1 : 0))}
                  className="bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            )}
            {(() => {
              const fileId = previewUrls[currentPreviewIndex].match(/id=([^&]+)/)?.[1] ||
                             previewUrls[currentPreviewIndex].match(/\/d\/([^\/]+)/)?.[1];
              const isGoogleDrive = previewUrls[currentPreviewIndex].includes('drive.google.com');
              const isVideo = previewTypes[currentPreviewIndex] === 'video';

              // Video preview
              if (isVideo) {
                if (isGoogleDrive && fileId) {
                  // Google Drive video embed
                  return (
                    <div className="h-full w-full rounded-lg overflow-hidden">
                      <iframe
                        src={`https://drive.google.com/file/d/${fileId}/preview`}
                        allow="autoplay"
                        className="w-full h-full border-0"
                      />
                    </div>
                  );
                } else {
                  // Direct video
                  return (
                    <div className="h-full w-full rounded-lg overflow-hidden relative">
                      <video
                        ref={videoRef}
                        src={previewUrls[currentPreviewIndex]}
                        className="w-full h-full object-contain"
                        controls
                        playsInline
                      />
                    </div>
                  );
                }
              }

              // Image preview
              if (isGoogleDrive && fileId) {
                return (
                  <div className="h-full w-full rounded-lg overflow-hidden">
                    <img
                      src={`https://lh3.googleusercontent.com/d/${fileId}`}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-lg"
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
                            fallback.className = 'w-full h-full flex items-center justify-center bg-gray-800/30 rounded-lg';
                            fallback.innerHTML = `
                              <div class="p-4 text-center">
                                <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-blue-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                </div>
                                <p class="text-sm text-gray-300 mb-2">Google Drive Image</p>
                                <p class="text-xs text-gray-400 mb-3">File uploaded successfully</p>
                                <a href="${previewUrls[currentPreviewIndex]}" target="_blank" rel="noopener noreferrer" class="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">View Image</a>
                              </div>
                            `;
                            container.appendChild(fallback);
                          }
                        };
                        target.src = `https://drive.usercontent.google.com/download?id=${fileId}&export=view`;
                      }}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                );
              } else {
                return (
                  <ImageItem
                    src={previewUrls[currentPreviewIndex]}
                    alt="Preview"
                    className="w-full h-full rounded-lg"
                  />
                );
              }
            })()}
          </div>
        )}
        {errors.media_url && (
          <p className="mt-1 text-sm text-red-400">{errors.media_url.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Title
        </label>
        <input
          {...register('title')}
          className="w-full px-3 py-2 bg-sortmy-darker border border-sortmy-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sortmy-blue"
          placeholder="Enter project title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2 bg-sortmy-darker border border-sortmy-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sortmy-blue"
          placeholder="Describe your project"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Tools Used
        </label>
        <select
          multiple
          {...register('tools_used')}
          className="w-full px-3 py-2 bg-sortmy-darker border border-sortmy-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sortmy-blue"
        >
          <option value="Midjourney">Midjourney</option>
          <option value="DALL-E">DALL-E</option>
          <option value="Stable Diffusion">Stable Diffusion</option>
          <option value="ChatGPT">ChatGPT</option>
          <option value="Claude">Claude</option>
        </select>
        {errors.tools_used && (
          <p className="mt-1 text-sm text-red-400">{errors.tools_used.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Project URL (Optional)
        </label>
        <input
          {...register('project_url')}
          className="w-full px-3 py-2 bg-sortmy-darker border border-sortmy-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sortmy-blue"
          placeholder="https://your-project-url.com"
        />
        <p className="mt-1 text-xs text-gray-400">Add a link to your project or related content</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('is_public')}
            className="w-4 h-4 text-sortmy-blue bg-sortmy-darker border-sortmy-gray rounded focus:ring-sortmy-blue"
          />
          <label className="ml-2 text-sm text-white">
            Make this project public
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 bg-sortmy-darker border border-sortmy-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sortmy-blue"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">Set the visibility status of your project</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Content Type
            </label>
            <select
              {...register('content_type')}
              className="w-full px-3 py-2 bg-sortmy-darker border border-sortmy-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sortmy-blue"
            >
              <option value="post">Post Only</option>
              <option value="reel">Reel Only</option>
              <option value="both">Both Post and Reel</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">Choose where this content should appear</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="ghost" type="button" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isUploading}>
          {isUploading ? <Loader2 className="animate-spin" /> : 'Save Project'}
        </Button>
      </div>
    </form>
  );
}