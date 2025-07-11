import { Button } from "./ui/button";
import { useUser } from "@/context/use-user";
import { useState } from "react";

export function UserProfile() {
  const { currentUser, setCurrentUser } = useUser();
  const [isHovered, setIsHovered] = useState(false);

  if (!currentUser) {
    return null;
  }

  // Get the color based on the user initial
  const getUserColor = (initial: string): string => {
    const colorMap: Record<string, string> = {
      'A': 'bg-[var(--user-a)]',
      'L': 'bg-[var(--user-l)]',
      'I': 'bg-[var(--user-i)]',
      'J': 'bg-[var(--user-j)]',
      'F': 'bg-[var(--user-f)]',
    };
    
    return colorMap[initial] || 'bg-[var(--user-fallback)]';
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div 
      className="flex items-center gap-2 relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleLogout}
    >
      <div 
        className={`${getUserColor(currentUser)} w-10 h-10 rounded-md flex items-center justify-center text-white font-bold transition-transform duration-200 ${isHovered ? 'scale-110' : ''}`}
      >
        {currentUser}
      </div>
      
      {isHovered && (
        <div className="absolute top-full right-0 mt-2 bg-overlay text-overlay-fg border border-border rounded-md shadow-lg p-3 z-10 min-w-40">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
            <div className={`${getUserColor(currentUser)} w-8 h-8 rounded-md flex items-center justify-center text-white font-bold`}>
              {currentUser}
            </div>
            <span className="text-overlay-fg">{currentUser}</span>
          </div>
          <Button 
            variant="ghost" 
            size="small"
            className="text-overlay-fg hover:bg-muted w-full justify-start"
            onClick={handleLogout}
          >
            Switch Profiles
          </Button>
        </div>
      )}
    </div>
  );
}