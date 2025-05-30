import { Button } from "./ui/button";
import { useUser } from "@/context/user-context";
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
      'A': 'bg-red-600',
      'L': 'bg-blue-600',
      'I': 'bg-green-600',
      'J': 'bg-purple-600',
      'F': 'bg-yellow-600',
    };
    
    return colorMap[initial] || 'bg-gray-600';
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
        <div className="absolute top-full right-0 mt-2 bg-black bg-opacity-90 border border-gray-700 rounded-md shadow-lg p-3 z-10 min-w-40">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
            <div className={`${getUserColor(currentUser)} w-8 h-8 rounded-md flex items-center justify-center text-white font-bold`}>
              {currentUser}
            </div>
            <span className="text-white">{currentUser}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-gray-800 w-full justify-start"
            onClick={handleLogout}
          >
            Switch Profiles
          </Button>
        </div>
      )}
    </div>
  );
}