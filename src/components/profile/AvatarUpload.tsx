import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
}

export const AvatarUpload = ({ currentUrl, onUpload }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // For now, just return a placeholder URL
      // TODO: Implement actual file upload
      const url = URL.createObjectURL(file);
      onUpload(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <Avatar className="h-24 w-24">
        <AvatarImage src={currentUrl} />
        <AvatarFallback>Profile</AvatarFallback>
      </Avatar>
      <Button
        size="icon"
        variant="outline"
        className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-sortmy-darker/70"
        disabled={uploading}
      >
        <Camera className="h-4 w-4" />
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
        />
      </Button>
    </div>
  );
};
