import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoogleDriveStorage } from '@/components/storage/GoogleDriveStorage';

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
  const [storageType, setStorageType] = useState<'firebase' | 'gdrive'>('firebase');
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

  const handleSubmitForm = async (data: PortfolioFormData) => {
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

  const handleGoogleDriveUpload = async (fileUrl: string) => {
    if (fileUrl) {
      setPreviewUrl(fileUrl);
      const formData = watch();
      await onSubmit({
        ...formData,
        media_url: fileUrl
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
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

      <div className="space-y-4">
        <label className="block text-sm font-medium text-white mb-2">
          Storage Option
        </label>
        <Tabs value={storageType} onValueChange={(val: string) => setStorageType(val as 'firebase' | 'gdrive')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="firebase">Firebase Storage</TabsTrigger>
            <TabsTrigger value="gdrive">Google Drive</TabsTrigger>
          </TabsList>

          <TabsContent value="firebase">
            <div className="mt-4">
              <div className="border-2 border-dashed border-sortmy-gray/30 rounded-lg p-8 text-center cursor-pointer hover:border-sortmy-blue/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto" />
                ) : (
                  <div>
                    <input
                      type="file"
                      {...register('media_file')}
                      className="hidden"
                      ref={fileInputRef}
                      accept="image/*,video/*"
                    />
                    <p className="text-slate-400">Click to upload media</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gdrive">
            <GoogleDriveStorage 
              userId={user.uid} 
              onFileUpload={handleGoogleDriveUpload}
            />
          </TabsContent>
        </Tabs>
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