/// <reference path="../types/google.d.ts" />

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_SCOPE = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let gapiInited = false;

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

const loadGapiClient = async () => {
  if (gapiInited) return;
  
  // Wait for gapi to be available
  if (typeof gapi === 'undefined') {
    await new Promise<void>((resolve) => {
      const checkGapi = () => {
        if (typeof gapi !== 'undefined') {
          resolve();
        } else {
          setTimeout(checkGapi, 100);
        }
      };
      checkGapi();
    });
  }

  await new Promise<void>((resolve, reject) => {
    gapi.load('client', {
      callback: resolve,
      onerror: reject
    });
  });

  await gapi.client.init({
    apiKey: GOOGLE_API_KEY,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
  });

  gapiInited = true;
};

export const initializeGoogleDrive = async () => {
  try {
    // First load the API script
    await loadScript('https://apis.google.com/js/api.js');
    
    // Wait a moment to ensure script is initialized
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Then initialize GAPI
    await loadGapiClient();
    
    // After GAPI is ready, load the Identity Services library
    await loadScript('https://accounts.google.com/gsi/client');
    
    // Wait for google.accounts to be available
    await new Promise<void>((resolve) => {
      const checkGoogle = () => {
        if (typeof google !== 'undefined' && google.accounts) {
          resolve();
        } else {
          setTimeout(checkGoogle, 100);
        }
      };
      checkGoogle();
    });    // Initialize token client with proper configuration    // Initialize token client
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: API_SCOPE,
      callback: '' // Will be set dynamically in getAccessToken
    });

    return true;
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error);
    throw error;
  }
};

export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      if (!tokenClient) {
        reject(new Error('Token client not initialized'));
        return;
      }

      // Set up the token client callback before requesting the token
      tokenClient.callback = (resp) => {
        if (resp.error !== undefined) {
          reject(new Error(resp.error));
          return;
        }
        resolve(resp.access_token);
      };

      // Set the callback dynamically right before requesting the token
      tokenClient.callback = (resp) => {
        if (resp.error !== undefined) {
          reject(new Error(resp.error));
          return;
        }
        resolve(resp.access_token);
      };      // Request token with minimal configuration to avoid popup issues
      tokenClient.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
};

export async function uploadToGoogleDrive(file: File, folderName?: string): Promise<string> {
  try {
    // First ensure we have a valid token
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Not authenticated with Google Drive');
    }

    // Find or create the folder if name is provided
    let folderId;
    if (folderName) {
      try {
        // Search for existing folder first
        const searchResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const searchData = await searchResponse.json();
        if (searchData.files && searchData.files.length > 0) {
          folderId = searchData.files[0].id;
        } else {
          // Create new folder if not found
          folderId = await createFolder(folderName);
        }
      } catch (error) {
        console.warn('Error with folder operations:', error);
        // Continue without folder if there's an error
      }
    }

    // Prepare the file metadata
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: folderId ? [folderId] : ['root']
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    // Upload the file
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: form
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to Google Drive');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error in uploadToGoogleDrive:', error);
    throw error;
  }
}

export async function shareFile(fileId: string, email: string, role: 'reader' | 'writer' | 'commenter' = 'reader'): Promise<void> {
  try {
    const token = await getAccessToken();
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        type: 'user',
        emailAddress: email,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to share file');
    }
  } catch (error) {
    console.error('Error sharing file:', error);
    throw error;
  }
}

export async function createFolder(name: string, parentFolderId?: string): Promise<string> {
  try {
    const token = await getAccessToken();
    const metadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : ['root']
    };

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error('Failed to create folder');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
}

export const disconnectGoogleDrive = async () => {
  try {
    if (tokenClient) {
      const token = await getAccessToken();
      if (token) {
        // Revoke the token
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }
      
      // Clear the token client
      tokenClient = null;
    }
    
    // Reset initialization state
    gapiInited = false;
    
    return true;
  } catch (error) {
    console.error('Error disconnecting from Google Drive:', error);
    throw error;
  }
};
