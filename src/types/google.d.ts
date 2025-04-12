declare namespace google.accounts.oauth2 {
  interface TokenClient {
    callback: (response: {
      access_token: string;
      error?: string;
      expires_in?: number;
    }) => void;
    requestAccessToken(overrideConfig?: {
      prompt?: string;
      scope?: string;
      client_id?: string;
    }): void;
  }

  interface TokenResponse {
    access_token: string;
    error?: string;
    expires_in?: number;
  }

  function initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: string | ((response: TokenResponse) => void);
    error_callback?: (error: Error) => void;
  }): TokenClient;
}

declare namespace gapi {
  function load(api: string, callback: () => void): void;
  
  namespace client {
    function init(args: {
      apiKey: string;
      discoveryDocs: string[];
    }): Promise<void>;
  }
}
