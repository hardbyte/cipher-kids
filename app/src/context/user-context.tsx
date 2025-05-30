import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the available users
export type UserInitial = 'A' | 'L' | 'I' | 'J' | 'F';

interface UserContextType {
  currentUser: UserInitial | null;
  setCurrentUser: (user: UserInitial | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

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

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};