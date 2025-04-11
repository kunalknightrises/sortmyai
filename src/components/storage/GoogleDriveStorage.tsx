import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, Upload, FolderOpen, Check, AlertCircle, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { 
  initializeGoogleDrive, 
  uploadToGoogleDrive, 
  createFolder, 
  disconnectGoogleDrive 
} from '@/lib/googleDrive';

interface GoogleDriveStorageProps {
  userId: string;
  onFileUpload?: (fileUrl: string) => void;
}

export const GoogleDriveStorage: React.FC<GoogleDriveStorageProps> = ({ userId, onFileUpload }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const { toast } = useToast();
  const auth = getAuth();

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      const userData = doc.data();
      setIsConnected(!!userData?.googleDriveAuth?.accessToken);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const connectToGoogleDrive = async () => {
    setIsConnecting(true);
    try {
      await initializeGoogleDrive();
      
      // Create user folder after successful authentication
      const folderName = `sortmyai_${userId}`;
      await createFolder(folderName);

      // Update user document with Google Drive connection status
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          googleDriveAuth: {
            accessToken: true,
            connectedAt: new Date().toISOString()
          }
        }, { merge: true });
      }

      setIsConnected(true);
      toast({
        title: "Connected to Google Drive",
        description: "You can now use Google Drive for storage",
      });
    } catch (error: any) {
      console.error('Error connecting to Google Drive:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to Google Drive. Please try again.",
        variant: "destructive",
      });
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectGoogleDrive();
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          googleDriveAuth: null
        }, { merge: true });
      }
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Google Drive",
      });
    } catch (error) {
      console.error('Error disconnecting from Google Drive:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect from Google Drive",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(0);
      const folderName = `sortmyai_${userId}`;
      const fileUrl = await uploadToGoogleDrive(file, folderName);
      setUploadProgress(100);
      
      if (onFileUpload) {
        onFileUpload(fileUrl);
      }

      toast({
        title: "File Uploaded",
        description: "Your file has been uploaded to Google Drive successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Could not upload file to Google Drive. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadProgress(null);
    }
  };

  return (
    <Card className="p-6 bg-sortmy-gray/10 border-sortmy-gray/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Cloud className="w-6 h-6 text-sortmy-blue" />
          <div>
            <h3 className="text-lg font-semibold">Google Drive Storage</h3>
            <p className="text-sm text-gray-400">Store your files securely in the cloud</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={isConnected ? "default" : "outline"}
            className={isConnected ? "bg-green-500/20 text-green-400" : ""}
          >
            {isConnected ? (
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Not Connected
              </span>
            )}
          </Badge>
          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              className="text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {!isConnected ? (
        <Button 
          onClick={connectToGoogleDrive} 
          className="w-full"
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect to Google Drive'}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            <Button variant="outline">
              <FolderOpen className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
          {uploadProgress !== null && (
            <div className="w-full bg-sortmy-gray/20 rounded-full h-2 mt-4">
              <div
                className="bg-sortmy-blue h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
