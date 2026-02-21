export interface Requirement {
  id: string;
  description?: string;
  text?: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Section {
  id: string;
  title: string;
  content: string;
  requirements?: Requirement[];
}

export interface BRD {
  projectName: string;
  sections: Section[];
  createdAt: string | number | Date;
  conflicts: number;
}

export interface IndexedFile {
  name: string;
  size: number;
  indexed?: boolean;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            itp_support?: boolean;
          }) => void;
          renderButton: (parent: HTMLElement, config: {
            theme?: string;
            size?: string;
            text?: string;
            shape?: string;
            width?: number;
          }) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (tokenResponse: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export interface GmailMessage {
  id: string;
  subject: string;
  snippet?: string;
}

export interface GeneratorFormData {
  projectName: string;
  projectDesc: string;
  rawReqs: string;
  sources: string[];
  sections: string[];
}
