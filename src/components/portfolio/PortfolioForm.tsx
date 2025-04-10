import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';

const portfolioSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tools_used: z.array(z.string()).min(1, 'Select at least one tool'),
  is_public: z.boolean().default(true),
  media_file: z.instanceof(File).optional(),
});

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: initialData,
  });

  const watchFile = watch('media_file');

  useEffect(() => {
    if (watchFile && Array.isArray(watchFile) && watchFile.length > 0) {
      const file = watchFile[0]
      if (file) {
        const URLobj = URL.createObjectURL(file);
        setPreviewUrl(URLobj);
      }
      if(previewUrl){
        return () => URL.revokeObjectURL(previewUrl);
      }
    }
  }, [watchFile]);

  const handleFormSubmit = async (data: PortfolioFormData) => {
    try {
      let mediaUrl = initialData?.media_url || undefined;

       if (data.media_file) {
        const file = data.media_file;
        const fileRef = ref(getStorage(app), `portfolio/${user.id}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        mediaUrl = await getDownloadURL(fileRef);
      }

      await onSubmit({ ...data, media_url: mediaUrl });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Project Title
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
          Media
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          {...register('media_file')}
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              register('media_file').onChange(e);
            }
          }}
        />
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative aspect-video w-full border-2 border-dashed border-sortmy-gray rounded-lg overflow-hidden cursor-pointer hover:border-sortmy-blue transition-colors"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-slate-400">Click to upload media</p>
            </div>
          )}
        </div>
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Project'}
        </Button>
      </div>
    </form>
  );
}