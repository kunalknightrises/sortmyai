/**
 * Fallback implementation for Google Drive integration
 * This file provides a direct approach to Google Drive authentication
 * that works better in production environments
 */

// Hardcoded credentials as fallback
const CLIENT_ID = '220186510992-5oa2tojm2o51qh4324ao7fe0mmfkh021.apps.googleusercontent.com';
const API_KEY = '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';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Define authorized redirect URIs
const AUTHORIZED_URIS = [
  'https://www.sortmyai.com',
  'https://sortmyai.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost'
];

// Get the appropriate redirect URI based on the current origin
const getRedirectUri = (): string => {
  const origin = window.location.origin;
  if (AUTHORIZED_URIS.includes(origin)) {
    return origin;
  }
  // Default to the first authorized URI if the current origin is not in the list
  return AUTHORIZED_URIS[0];
};

let accessToken: string | null = null;

// Define gapi with proper types
declare global {
  interface Window {
    gapi: any;
  }
}

/**
 * Load the Google API client library
 */
export const loadGoogleApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
          apiKey: API_KEY,
          // @ts-ignore - clientId is valid but not in the type definition
          clientId: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          // @ts-ignore - redirect_uri is valid but not in the type definition
          redirect_uri: getRedirectUri()
        }).then(() => {
          console.log('Google API initialized successfully');
          resolve();
        }).catch((error: any) => {
          console.error('Error initializing Google API:', error);
          reject(error);
        });
      });
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google API script'));
    };
    document.head.appendChild(script);
  });
};

/**
 * Authenticate with Google Drive
 */
export const authenticate = async (): Promise<string> => {
  try {
    // If we already have a token, return it
    if (accessToken) {
      return accessToken;
    }

    // Make sure the API is loaded
    if (!window.gapi.auth2) {
      await loadGoogleApi();
    }

    // Sign in the user
    const authInstance = window.gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn();
    }

    // Get the access token
    const currentUser = authInstance.currentUser.get();
    const authResponse = currentUser.getAuthResponse();
    accessToken = authResponse.access_token;

    // Return the token, ensuring it's not null
    return accessToken || '';
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

/**
 * Upload a file to Google Drive
 */
export const uploadFile = async (file: File, folderName?: string): Promise<string> => {
  try {
    // Authenticate first
    await authenticate();

    // Find or create folder if needed
    let folderId = 'root';
    if (folderName) {
      try {
        folderId = await findOrCreateFolder(folderName);
      } catch (error) {
        console.warn('Error with folder operations:', error);
        // Continue without folder if there's an error
        folderId = 'root';
      }
    }

    // Create a file metadata
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [folderId]
    };

    // Create a media object
    const content = await readFileAsArrayBuffer(file);

    // Upload the file
    const response = await window.gapi.client.request({
      path: 'https://www.googleapis.com/upload/drive/v3/files',
      method: 'POST',
      params: {
        uploadType: 'multipart'
      },
      headers: {
        'Content-Type': 'multipart/related; boundary=boundary'
      },
      body: createMultipartBody(metadata, content, file.type)
    });

    const fileId = JSON.parse(response.body).id;

    // Make the file public
    await makeFilePublic(fileId);

    return fileId;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Find or create a folder in Google Drive
 */
const findOrCreateFolder = async (folderName: string): Promise<string> => {
  try {
    // Search for the folder first
    const response = await window.gapi.client.drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)'
    });

    const files = response.result.files;
    if (files && files.length > 0) {
      return files[0].id;
    }

    // Create the folder if it doesn't exist
    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const folderResponse = await window.gapi.client.drive.files.create({
      resource: metadata,
      fields: 'id'
    });

    return folderResponse.result.id;
  } catch (error) {
    console.error('Error finding or creating folder:', error);
    throw error;
  }
};

/**
 * Make a file public
 */
const makeFilePublic = async (fileId: string): Promise<void> => {
  try {
    await window.gapi.client.drive.permissions.create({
      fileId: fileId,
      resource: {
        role: 'reader',
        type: 'anyone'
      }
    });
  } catch (error) {
    console.warn('Error making file public:', error);
    // Don't throw the error - just log it
  }
};

/**
 * Read a file as ArrayBuffer
 */
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Create a multipart request body
 */
const createMultipartBody = (metadata: any, content: ArrayBuffer, contentType: string): string => {
  const boundary = 'boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart =
    `Content-Type: application/json\r\n\r\n${JSON.stringify(metadata)}`;

  const contentPart =
    `Content-Type: ${contentType}\r\n\r\n${arrayBufferToString(content)}`;

  return delimiter + metadataPart + delimiter + contentPart + closeDelimiter;
};

/**
 * Convert ArrayBuffer to string
 */
const arrayBufferToString = (buffer: ArrayBuffer): string => {
  return String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
};

/**
 * Disconnect from Google Drive
 */
export const disconnect = async (): Promise<void> => {
  try {
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
    }
    accessToken = null;
  } catch (error) {
    console.error('Error disconnecting from Google Drive:', error);
    throw error;
  }
};
