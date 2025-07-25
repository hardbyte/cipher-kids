import { Button } from "./ui/button";
import { useUser } from "@/context/use-user";
import { useState, useMemo, useRef, useEffect } from "react";
import { UserSettings } from "./user-settings";

export function UserProfile() {
  const { currentUser, setCurrentUser, getUserConfig } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use useMemo to re-compute userConfig when configVersion changes
  const userConfig = useMemo(() => getUserConfig(), [getUserConfig]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!currentUser) {
    return null;
  }

  // Get the color based on user config or fallback to initial-based color
  const getUserColor = (initial: string): string => {
    // If user has custom color preference, use it
    if (userConfig.iconColor) {
      return `bg-[var(--user-color-${userConfig.iconColor})]`;
    }
    
    // Fallback to legacy initial-based colors
    const colorMap: Record<string, string> = {
      'A': 'bg-[var(--user-a)]',
      'L': 'bg-[var(--user-l)]',
      'I': 'bg-[var(--user-i)]',
      'J': 'bg-[var(--user-j)]',
      'F': 'bg-[var(--user-f)]',
    };
    
    return colorMap[initial] || 'bg-[var(--user-fallback)]';
  };

  const getDisplayContent = () => userConfig.avatar || currentUser;

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div 
      ref={dropdownRef}
      className="flex items-center gap-2 relative"
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`${getUserColor(currentUser)} w-10 h-10 rounded-md flex items-center justify-center font-bold transition-transform duration-200 hover:scale-110 cursor-pointer ${userConfig.avatar ? 'text-black' : 'text-white'}`}
      >
        {getDisplayContent()}
      </div>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-overlay backdrop-blur-sm text-overlay-fg border border-border rounded-md shadow-lg p-3 z-10 min-w-48">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
            <div className={`${getUserColor(currentUser)} w-8 h-8 rounded-md flex items-center justify-center font-bold ${userConfig.avatar ? 'text-black' : 'text-white'}`}>
              {getDisplayContent()}
            </div>
            <div className="flex flex-col">
              <span className="text-overlay-fg font-medium">{userConfig.displayName || currentUser}</span>
              <span className="text-muted-fg text-xs">User {currentUser}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <UserSettings onOpenChange={() => setIsOpen(false)} />
            
            <Button 
              variant="ghost" 
              size="small"
              className="text-overlay-fg hover:bg-muted w-full justify-start"
              onClick={handleLogout}
            >
              👥 Switch Profiles
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}