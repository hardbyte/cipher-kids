import { useState, useEffect, ReactNode } from 'react';
import { UserInitial, UserConfig, UserContext } from './user-context-types';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserInitial | null>(() => {
    // Check if user is stored in localStorage
    const savedUser = localStorage.getItem('cipher-app-user');
    return (savedUser as UserInitial) || null;
  });

  // State to trigger re-renders when user config changes
  const [configVersion, setConfigVersion] = useState(0);

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
        return ['atbash', 'caesar', 'keyword', 'railfence', 'vigenere', 'pigpen', 'morse'];
      }
    }
    return ['atbash', 'caesar', 'keyword', 'railfence', 'vigenere', 'pigpen', 'morse'];
  };

  const hasAgents = (): boolean => {
    const saved = localStorage.getItem('cipher-app-agents');
    const defaultUsers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    
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
    return getUserConfigFor(currentUser);
  };

  const getUserConfigFor = (user: UserInitial): UserConfig => {
    const saved = localStorage.getItem(`cipher-app-user-config-${user}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure config has default values
        return {
          theme: parsed.theme || 'dark',
          iconColor: parsed.iconColor || undefined,
          displayName: parsed.displayName || undefined,
          avatar: parsed.avatar || undefined,
          achievements: parsed.achievements || [],
          progress: parsed.progress || {
            ciphersUsed: [],
            messagesEncoded: 0,
            messagesDecoded: 0,
            codesCracked: 0,
          },
          ...parsed
        };
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
    
    // Trigger re-render by updating configVersion
    setConfigVersion(prev => prev + 1);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isAuthenticated, getEnabledCiphers, hasAgents, getUserConfig, getUserConfigFor, updateUserConfig, configVersion }}>
      {children}
    </UserContext.Provider>
  );
};

