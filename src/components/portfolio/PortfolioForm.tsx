import { useState } from 'react';
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

// Define the schema first without type annotation
const portfolioSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tools_used: z.array(z.string()).min(1, 'Select at least one tool'),
  is_public: z.boolean().default(true),
  media_url: z.string().optional().or(z.literal('')),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
}).refine((_data) => {
  // Only validate media_url when form is being submitted
  return true;
}, {
  message: "Please upload a media file",
  path: ["media_url"]
});

// Use the schema to infer the type
type PortfolioFormData = z.infer<typeof portfolioSchema>;

interface PortfolioFormProps {
  user: User;
  initialData?: Partial<PortfolioFormData & {media_url?: string}>;
  onSubmit: (data: PortfolioFormData & { media_url?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function PortfolioForm({ user, initialData, onSubmit, isLoading }: PortfolioFormProps) {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string>();
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

      // Update user's Google Drive portfolio items
      const userRef = doc(db, 'users', user.id);
      const gdriveItem = {
        title: formData.title,
        description: formData.description,
        media_url: formData.media_url,
        created_at: new Date().toISOString()
      };

      await updateDoc(userRef, {
        gdrive_portfolio_items: arrayUnion(gdriveItem)
      });

      await onSubmit(formData);

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

  const handleGoogleDriveUpload = async (fileUrl: string) => {
    if (fileUrl) {
      setPreviewUrl(fileUrl);
      setValue('media_url', fileUrl, {
        shouldValidate: false  // Don't validate immediately after upload
      });
      toast({
        title: 'File Uploaded',
        description: 'Media file has been uploaded successfully. Please fill in the rest of the details.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-white mb-2">
          Upload Media <span className="text-red-400">*</span>
        </label>
        <GoogleDriveStorage
          userId={user.uid}
          onFileUpload={handleGoogleDriveUpload}
        />
        {previewUrl && (
          <div className="mt-4">
            <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
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