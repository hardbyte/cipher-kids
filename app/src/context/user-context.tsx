import { useState, useEffect, ReactNode } from 'react';
import { UserInitial, UserConfig, UserContext } from './user-context-types';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserInitial | null>(() => {
    // Check if user is stored in localStorage
    const savedUser = localStorage.getItem('cipher-app-user');
    return (savedUser as UserInitial) || null;
  });

  const isAuthenticated = currentUser !== null;

  // Save user to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cipher-app-user', currentUser);
    } else {
      localStorage.removeItem('cipher-app-user');
    }
  }, [currentUser]);

  const getEnabledCiphers = (): string[] => {
    const saved = localStorage.getItem('cipher-app-enabled-ciphers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['caesar', 'keyword', 'vigenere'];
      }
    }
    return ['caesar', 'keyword', 'vigenere'];
  };

  const hasAgents = (): boolean => {
    const saved = localStorage.getItem('cipher-app-agents');
    const defaultUsers = ['A', 'L', 'I', 'J', 'F'];
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0;
      } catch {
        return false;
      }
    }
    return defaultUsers.length > 0;
  };

  const getUserConfig = (): UserConfig => {
    if (!currentUser) {
      return { theme: 'dark' };
    }
    
    const saved = localStorage.getItem(`cipher-app-user-config-${currentUser}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { theme: 'dark' };
      }
    }
    return { theme: 'dark' };
  };

  const updateUserConfig = (config: Partial<UserConfig>) => {
    if (!currentUser) return;
    
    const currentConfig = getUserConfig();
    const newConfig = { ...currentConfig, ...config };
    localStorage.setItem(`cipher-app-user-config-${currentUser}`, JSON.stringify(newConfig));
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isAuthenticated, getEnabledCiphers, hasAgents, getUserConfig, updateUserConfig }}>
      {children}
    </UserContext.Provider>
  );
};

