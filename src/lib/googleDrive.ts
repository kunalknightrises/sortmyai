/// <reference path="../types/google.d.ts" />

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_SCOPE = 'https://www.googleapis.com/auth/drive.file';

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

let tokenClient: google.accounts.oauth2.TokenClient;

export const initializeGoogleDrive = async (): Promise<boolean> => {
  try {
    await loadScript('https://accounts.google.com/gsi/client');
    
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: API_SCOPE,
      callback: '', // Will be set dynamically
      error_callback: function(error: Error) {
        console.error('Google OAuth Error:', error);
        throw error;
      },
      prompt: 'consent'
    });

    await loadGapiClient();
    return true;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('Failed to initialize Google Drive:', err);
    throw err;
  }
};

const loadGapiClient = async (): Promise<void> => {
  if (!window.gapi) {
    await loadScript('https://apis.google.com/js/api.js');
  }

  return new Promise<void>((resolve, reject) => {
    gapi.load('client', {
      callback: async () => {
        try {
          await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          resolve();
        } catch (err: unknown) {
          reject(err instanceof Error ? err : new Error('GAPI client init failed'));
        }
      },
      onerror: (error: Error) => reject(error)
    });
  });
};

export const getAccessToken = (): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    try {
      const isPopupBlocked = window.screenY === 0 && !window.opener;
      if (isPopupBlocked) {
        reject(new Error('Popup blocked by browser. Please allow popups for this site.'));
        return;
      }

      tokenClient.callback = (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error !== undefined) {
          reject(new Error(response.error));
          return;
        }
        resolve(response.access_token);
      };

      tokenClient.requestAccessToken({
        prompt: '',
        hint: '',
        hosted_domain: window.location.hostname,
      });
    } catch (error: unknown) {
      reject(error instanceof Error ? error : new Error('Failed to get access token'));
    }
  });
};

interface UploadResponse {
  id: string;
  webContentLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  error?: {
    message: string;
  };
}

export const uploadToGoogleDrive = async (file: File, folderName: string): Promise<string> => {
  try {
    const folderId = await findOrCreateFolder(folderName);
    const metadata = {
      name: file.name,
      parents: [folderId],
      description: 'Uploaded via SortMind Zenith'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const accessToken = await getAccessToken();
    
    const upload = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webContentLink,thumbnailLink,webViewLink', 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!upload.ok) {
      const errorData = await upload.json() as UploadResponse;
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await upload.json() as UploadResponse;
    
    // Set file to be publicly accessible
    await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shared: true,
        copyRequiresWriterPermission: false
      })
    });
    
    await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
        allowFileDiscovery: false
      })
    });

    if (file.type.startsWith('image/')) {
      const thumbnailUrl = result.thumbnailLink?.replace(/=s\d+$/, '=s1024') || 
        `https://drive.google.com/thumbnail?id=${result.id}&sz=w1024`;
      return thumbnailUrl;
    }
    
    return result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Upload failed');
    console.error('Upload error:', err);
    throw err;
  }
};

interface FolderSearchResponse {
  files?: Array<{
    id: string;
    name: string;
  }>;

  error?: {
    message: string;
  };
}

interface FolderResponse {
  id: string;
  name: string;
}

const findOrCreateFolder = async (folderName: string): Promise<string> => {
  const accessToken = await getAccessToken();
  
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and name='${folderName}'&spaces=drive&fields=files(id,name)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!searchResponse.ok) {
    const errorData = await searchResponse.json() as FolderSearchResponse;
    throw new Error(`Failed to search for folder: ${errorData.error?.message || 'Unknown error'}`);
  }

  const searchResult = await searchResponse.json() as FolderSearchResponse;
  
  if (searchResult.files && searchResult.files.length > 0) {
    return searchResult.files[0].id;
  }

  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.json() as FolderSearchResponse;
    throw new Error(`Failed to create folder: ${errorData.error?.message || 'Unknown error'}`);
  }

  const folder = await createResponse.json() as FolderResponse;
  return folder.id;
};

export const createFolder = async (folderName: string): Promise<string> => {
  return findOrCreateFolder(folderName);
};

export const disconnectGoogleDrive = async (): Promise<void> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      google.accounts.oauth2.revoke(accessToken, () => {});
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Disconnect failed');
    console.error('Error disconnecting from Google Drive:', err);
    throw err;
  }
};
