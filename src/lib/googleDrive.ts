/// <reference path="../types/google.d.ts" />

// Get API key and client ID from environment variables or use hardcoded values as fallback
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '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';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '220186510992-5oa2tojm2o51qh4324ao7fe0mmfkh021.apps.googleusercontent.com';
// Use a limited scope to avoid verification requirements
const API_SCOPE = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let gapiInited = false;

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
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

  // Load the client library
  await new Promise<void>((resolve) => {
    gapi.load('client', resolve);
  });

  // Initialize the client
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
    });

    // Initialize token client if not already initialized
    if (!tokenClient) {
      console.log('Initializing token client with client ID:', GOOGLE_CLIENT_ID);

      // Make sure we have a valid client ID
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID is missing. Please check your environment variables.');
      }

      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: API_SCOPE,
        callback: () => {},
        error_callback: (err) => {
          console.error('Google OAuth Error:', err);
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error);
    throw error;
  }
};

// Keep track of the current token
let currentAccessToken: string | null = null;

export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // If we already have a token, return it
      if (currentAccessToken) {
        resolve(currentAccessToken);
        return;
      }

      if (!tokenClient) {
        reject(new Error('Token client not initialized'));
        return;
      }

      // Set the callback right before requesting the token
      tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
          reject(new Error(resp.error));
          return;
        }
        // Store the token for future use
        currentAccessToken = resp.access_token;
        resolve(resp.access_token);
      };

      // Request access token with specific settings to help with COOP issues
      console.log('Requesting access token with client ID:', GOOGLE_CLIENT_ID);
      tokenClient.requestAccessToken({
        prompt: 'consent',
        client_id: GOOGLE_CLIENT_ID, // Explicitly provide client_id again
      });
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
    const fileId = data.id;

    // Automatically make the file public
    try {
      await makeFilePublic(fileId);
    } catch (shareError) {
      console.warn('Failed to make file public automatically:', shareError);
      // Continue even if sharing fails - the file was uploaded successfully
    }

    return fileId;
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

/**
 * Attempt to make a file publicly accessible to anyone with the link
 * Note: This may not work with the limited scope, but we'll try anyway
 */
export async function makeFilePublic(fileId: string): Promise<void> {
  try {
    const token = await getAccessToken();

    // Try to update the file to be publicly accessible
    // This might work with drive.file scope for files the app created
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });

    if (!response.ok) {
      // This might fail with the limited scope, but that's expected
      console.warn('Could not automatically set file permissions. User may need to do this manually.');
      return;
    }

    console.log('Successfully set file permissions to public');
  } catch (error) {
    console.warn('Error making file public (expected with limited scope):', error);
    // Don't throw the error - just log it and continue
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
    if (tokenClient && currentAccessToken) {
      // Revoke the token
      await fetch(`https://oauth2.googleapis.com/revoke?token=${currentAccessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Clear the cached token
      currentAccessToken = null;

      // Clear the token client
      tokenClient = null;
    }

    // Reset initialization state
    gapiInited = false;

    return true;
  } catch (error) {
    console.error('Error disconnecting from Google Drive:', error);
    // Clear token even if revocation fails
    currentAccessToken = null;
    tokenClient = null;
    gapiInited = false;
    throw error;
  }
};
