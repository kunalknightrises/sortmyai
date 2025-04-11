declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenResponse {
        access_token: string;
        error?: string;
      }      interface TokenClientConfig {
        client_id: string;
        scope: string;
        callback: string;
        error_callback?: (error: any) => void;
        prompt?: string;
        include_granted_scopes?: boolean;
        enable_serial_consent?: boolean;
      }

      interface TokenRequestOptions {
        prompt?: string;
        hint?: string;
        hosted_domain?: string;
      }

      interface TokenClient {
        callback: (response: TokenResponse) => void;
        requestAccessToken: (config?: TokenRequestOptions) => void;
      }

      function initTokenClient(config: TokenClientConfig): TokenClient;

      function revoke(token: string, callback: () => void): void;
    }
  }
}

declare namespace gapi {
  interface ClientConfig {
    apiKey: string;
    discoveryDocs: string[];
  }

  namespace client {
    function init(config: ClientConfig): Promise<void>;
    namespace drive {
      namespace files {
        function list(params: {
          q: string;
          fields: string;
        }): Promise<{
          result: {
            files?: Array<{
              id: string;
              name: string;
            }>;
          };
        }>;

        function create(params: {
          resource: {
            name: string;
            mimeType: string;
          };
          fields: string;
        }): Promise<{
          result: {
            id: string;
          };
        }>;
      }
    }
  }

  function load(api: string, options: {
    callback: () => void;
    onerror: (error: Error) => void;
  }): void;
}
