import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, Upload, FolderOpen, Check, AlertCircle, LogOut, Video, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import {
  initializeGoogleDrive,
  uploadToGoogleDrive,
  createFolder,
  disconnectGoogleDrive,
  getAccessToken
} from '@/lib/googleDrive';

// Import fallback implementation
import * as fallback from '@/lib/googleDriveFallback';

interface GoogleDriveStorageProps {
  userId?: string;
  onFileUpload?: (fileUrl: string, fileType: 'image' | 'video') => void;
  buttonText?: string;
  acceptedFileTypes?: string;
}

export const GoogleDriveStorage: React.FC<GoogleDriveStorageProps> = ({
  userId,
  onFileUpload,
  buttonText = "Upload File",
  acceptedFileTypes = "image/*,video/*"
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const { toast } = useToast();
  const auth = getAuth();

  useEffect(() => {
    if (!auth.currentUser) return;

    // Subscribe to user document to watch for Google Drive connection changes
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      const userData = doc.data();
      const hasGDriveAccess = !!userData?.googleDriveAuth?.accessToken;
      setIsConnected(hasGDriveAccess);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const initializeGDrive = async () => {
    if (isInitialized) return;
    try {
      console.log('Initializing Google Drive integration...');

      // Try the primary implementation first
      if (!useFallback) {
        try {
          await initializeGoogleDrive();
          console.log('Google Drive initialization successful');
          setIsInitialized(true);
          return;
        } catch (primaryError) {
          console.error('Primary Google Drive initialization failed, trying fallback:', primaryError);
          setUseFallback(true);
        }
      }

      // If primary fails or we're already using fallback, try the fallback
      if (useFallback) {
        try {
          await fallback.loadGoogleApi();
          console.log('Fallback Google Drive initialization successful');
          setIsInitialized(true);
          return;
        } catch (fallbackError) {
          console.error('Fallback Google Drive initialization also failed:', fallbackError);
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
      toast({
        title: "Google Drive Error",
        description: "Failed to initialize Google Drive. Please try again or contact support.",
        variant: "destructive",
      });
      throw error;
    }
  };



  const connectToGoogleDrive = async () => {
    setIsConnecting(true);
    setIsAuthenticating(true);
    try {
      console.log('Connecting to Google Drive...');
      // First make sure Google Drive API is initialized
      if (!isInitialized) {
        console.log('Google Drive not initialized, initializing now...');
        await initializeGDrive();
      }

      // Get access token - this will trigger the OAuth popup
      console.log('Requesting access token...');
      let token;

      if (useFallback) {
        // Use fallback authentication
        try {
          token = await fallback.authenticate();
          console.log('Fallback authentication successful');
        } catch (fallbackError) {
          console.error('Fallback authentication failed:', fallbackError);
          throw fallbackError;
        }
      } else {
        // Use primary authentication
        try {
          token = await getAccessToken();
          console.log('Access token received:', token ? 'Yes' : 'No');
        } catch (primaryError) {
          console.error('Primary authentication failed, trying fallback:', primaryError);
          setUseFallback(true);
          token = await fallback.authenticate();
          console.log('Fallback authentication successful after primary failed');
        }
      }

      if (!token) {
        throw new Error('Failed to authenticate with Google Drive');
      }

      // Update user document with Google Drive auth status
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          'googleDriveAuth.accessToken': true,
          'googleDriveAuth.connectedAt': new Date().toISOString()
        });
      }

      // Create user folder after successful authentication
      try {
        const folderName = `sortmyai_${userId}`;
        await createFolder(folderName);
      } catch (folderError) {
        console.error('Error creating folder:', folderError);
        // Don't fail the connection if folder creation fails
      }

      toast({
        title: "Connected to Google Drive",
        description: "You can now use Google Drive for storage",
      });
      setIsConnected(true);
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
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (useFallback) {
        await fallback.disconnect();
      } else {
        await disconnectGoogleDrive();
      }

      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          'googleDriveAuth.accessToken': false,
          'googleDriveAuth.connectedAt': null
        });
      }
      setIsInitialized(false);
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Google Drive",
      });
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting from Google Drive:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect from Google Drive",
        variant: "destructive",
      });
    }
  };

  // Helper function to determine if a file is a video
  const isVideoFile = (file: File): boolean => {
    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    return videoTypes.includes(file.type);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a video file
    const isVideo = isVideoFile(file);

    // Show a toast for video uploads with additional information
    if (isVideo) {
      toast({
        title: "Uploading Video",
        description: "Videos will be embedded using Google Drive player. Make sure to make the file public after upload.",
      });
    }

    try {
      // First initialize Google Drive if not already done
      if (!isInitialized) {
        await initializeGDrive();
      }

      // Check if we're connected before attempting upload
      if (!isConnected) {
        // Try to connect first
        await connectToGoogleDrive();

        // If still not connected after attempt, show error and return
        if (!isConnected) {
          toast({
            title: "Authentication Required",
            description: "Please connect to Google Drive before uploading files.",
            variant: "destructive",
          });
          return;
        }
      }

      // Now we should be authenticated, proceed with upload
      setUploadProgress(0);
      const folderName = `sortmyai_${userId}`;
      let fileId;

      if (useFallback) {
        // Use fallback upload
        fileId = await fallback.uploadFile(file, folderName);
      } else {
        // Use primary upload
        try {
          fileId = await uploadToGoogleDrive(file, folderName);
        } catch (primaryError) {
          console.error('Primary upload failed, trying fallback:', primaryError);
          setUseFallback(true);
          fileId = await fallback.uploadFile(file, folderName);
        }
      }

      setUploadProgress(100);

      // We'll show more detailed instructions after upload completes

      if (onFileUpload) {
        // Use a direct file URL format that works better for display
        const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
        onFileUpload(fileUrl, isVideo ? 'video' : 'image');
      }

      toast({
        title: "File Uploaded Successfully",
        description: "Your file has been uploaded to Google Drive.",
      });

      // Show instructions for making the file public immediately
      toast({
        title: "Important: Make Your File Public",
        description: "For best results, please make your file public in Google Drive: Right-click the file → Share → General access → Anyone with the link → Done",
        variant: "default",
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
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Cloud className="w-6 h-6 text-blue-400" />
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
          disabled={isConnecting || isAuthenticating}
        >
          {isConnecting ? 'Connecting...' : isAuthenticating ? 'Authenticating...' : 'Connect to Google Drive'}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="flex-1"
              disabled={isAuthenticating}
            >
              <Upload className="w-4 h-4 mr-2" />
              {buttonText}
            </Button>
            <Button
              variant="outline"
              disabled={isAuthenticating}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept={acceptedFileTypes}
          />
          <div className="flex justify-center gap-4 mt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>Images</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              <span>Videos</span>
            </Badge>
          </div>
          {uploadProgress !== null && (
            <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
