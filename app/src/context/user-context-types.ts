import { createContext } from 'react';

// Define the available users
export type UserInitial = string;
export type Theme = "light" | "dark" | "system" | "matrix";

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
}

export interface UserContextType {
  currentUser: UserInitial | null;
  setCurrentUser: (user: UserInitial | null) => void;
  isAuthenticated: boolean;
  getEnabledCiphers: () => string[];
  hasAgents: () => boolean;
  getUserConfig: () => UserConfig;
  updateUserConfig: (config: Partial<UserConfig>) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);