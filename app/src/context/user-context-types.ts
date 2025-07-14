import { createContext } from 'react';

// Define the available users
export type UserInitial = string;
// Re-export Theme from shared theme context to ensure consistency
export type { Theme } from '@/components/theme/theme-context';

export type UserIconColor = 
  | "red" 
  | "blue" 
  | "green" 
  | "purple" 
  | "yellow" 
  | "orange" 
  | "pink" 
  | "cyan" 
  | "lime" 
  | "indigo";

export interface UserConfig {
  theme: Theme;
  iconColor?: UserIconColor;
  displayName?: string;
  avatar?: string; // Emoji avatar
  achievements?: string[]; // List of earned achievement IDs
  progress?: {
    ciphersUsed: string[];
    messagesEncoded: number;
    messagesDecoded: number;
    codesCracked: number;
  };
}

export interface UserContextType {
  currentUser: UserInitial | null;
  setCurrentUser: (user: UserInitial | null) => void;
  isAuthenticated: boolean;
  getEnabledCiphers: () => string[];
  hasAgents: () => boolean;
  getUserConfig: () => UserConfig;
  getUserConfigFor: (user: UserInitial) => UserConfig;
  updateUserConfig: (config: Partial<UserConfig>) => void;
  configVersion: number; // For triggering re-renders when config changes
}

export const UserContext = createContext<UserContextType | undefined>(undefined);