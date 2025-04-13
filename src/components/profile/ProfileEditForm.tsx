import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { GoogleDriveStorage } from '@/components/storage/GoogleDriveStorage';
import { Loader2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

// Define the schema for profile editing
const profileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar_url: z.string().optional(),
  profession: z.string().max(100, 'Profession must be less than 100 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

// Use the schema to infer the type
type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  user: User;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ user, onSubmit, onCancel }: ProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(user.avatar_url);
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  // Initialize form with user data
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: user.bio || '',
      avatar_url: user.avatar_url || '',
      profession: user.profession || '',
      website: user.website || '',
    }
  });

  const handleGoogleDriveUpload = async (fileUrl: string) => {
    if (fileUrl) {
      // Extract the file ID from the Google Drive URL
      const fileIdMatch = fileUrl.match(/\/d\/([^\/]+)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;

      // Store both the file URL and ID
      setPreviewUrl(fileUrl);

      // Store the file ID or URL in the form
      setValue('avatar_url', fileId || fileUrl, {
        shouldValidate: false  // Don't validate immediately after upload
      });

      toast({
        title: 'Avatar Uploaded',
        description: 'Your profile picture has been uploaded successfully.',
      });
    }
  };

  const handleFormSubmit = async (formData: ProfileFormData) => {
    if (!user.id) return;

    setIsSubmitting(true);
    try {
      // Update user profile in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        profession: formData.profession,
        website: formData.website,
        updated_at: new Date().toISOString(),
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });

      // Refresh user data in the context
      await refreshUser();

      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearAvatar = () => {
    setPreviewUrl(undefined);
    setValue('avatar_url', '', { shouldValidate: false });
  };

  const getInitials = () => {
    if (!user || !user.username) return 'U';
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Edit Profile</h2>

        {/* Avatar Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-sortmy-blue/20">
              <AvatarImage src={previewUrl} />
              <AvatarFallback className="text-xl bg-sortmy-blue/20 text-sortmy-blue">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              <GoogleDriveStorage
                onFileUpload={handleGoogleDriveUpload}
                buttonText="Upload New Avatar"
                acceptedFileTypes="image/*"
              />

              {previewUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAvatar}
                  className="flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove Avatar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profession */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Profession
          </label>
          <input
            {...register('profession')}
            className="w-full px-3 py-2 bg-sortmy-darker border border-sortmy-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sortmy-blue"
            placeholder="e.g. AI Content Creator"
          />
          {errors.profession && (
            <p className="text-red-500 text-xs mt-1">{errors.profession.message}</p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Bio
          </label>
          <textarea
            {...register('bio')}
            rows={4}
            className="w-full px-3 py-2 bg-sortmy-darker border border-sortmy-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sortmy-blue"
            placeholder="Tell us about yourself..."
          />
          {errors.bio && (
            <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Website
          </label>
          <input
            {...register('website')}
            className="w-full px-3 py-2 bg-sortmy-darker border border-sortmy-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sortmy-blue"
            placeholder="https://yourwebsite.com"
          />
          {errors.website && (
            <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-sortmy-blue hover:bg-sortmy-blue/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}

export default ProfileEditForm;
