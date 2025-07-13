import { useState, useEffect } from "react";
import { useUser } from "@/context/use-user";
import { UserInitial } from "@/context/user-context-types";
import { useNavigate } from "@tanstack/react-router";

// Define the default users
const DEFAULT_USERS: { initial: UserInitial; color: string }[] = [
  { initial: "A", color: "bg-[var(--user-a)]" },
  { initial: "L", color: "bg-[var(--user-l)]" },
  { initial: "I", color: "bg-[var(--user-i)]" },
  { initial: "J", color: "bg-[var(--user-j)]" },
  { initial: "F", color: "bg-[var(--user-f)]" },
];

export function LoginScreen() {
  const { setCurrentUser, hasAgents, getUserConfigFor } = useUser();
  const navigate = useNavigate();
  const [hoveredUser, setHoveredUser] = useState<UserInitial | null>(null);

  // Get available users for display
  const availableUsers = (() => {
    const saved = localStorage.getItem('cipher-app-agents');
    if (saved) {
      try {
        const parsed: UserInitial[] = JSON.parse(saved);
        return [
          ...DEFAULT_USERS,
          ...parsed
            .filter(initial => !DEFAULT_USERS.some(u => u.initial === initial))
            .map(initial => ({ initial, color: DEFAULT_USERS.find(u => u.initial === initial)?.color || 'bg-[var(--user-fallback)]' })),
        ];
      } catch {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  })();

  // Check if there are no agents and redirect to config
  useEffect(() => {
    if (!hasAgents()) {
      navigate({ to: "/config" });
    }
  }, [hasAgents, navigate]);

  const handleUserSelect = (user: UserInitial) => {
    setCurrentUser(user);
    navigate({ to: "/" });
  };

  const getUserDisplayContent = (user: UserInitial): string => {
    const config = getUserConfigFor(user);
    return config.avatar || user;
  };

  const getUserColor = (user: UserInitial): string => {
    const config = getUserConfigFor(user);
    
    if (config.iconColor) {
      return `bg-[var(--user-color-${config.iconColor})]`;
    }
    
    const defaultColor = DEFAULT_USERS.find(u => u.initial === user)?.color;
    return defaultColor || 'bg-[var(--user-fallback)]';
  };

  const getUserDisplayName = (user: UserInitial): string => {
    const config = getUserConfigFor(user);
    return config.displayName || user;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-fg p-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Who's coding today?</h1>
          <p className="text-xl text-muted-fg">Choose your profile</p>
        </div>

        <div className="flex flex-wrap justify-center gap-10 max-w-4xl mx-auto">
          {availableUsers.map((user) => (
            <div
              key={user.initial}
              className="flex flex-col items-center group"
              onMouseEnter={() => setHoveredUser(user.initial)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              <button
                onClick={() => handleUserSelect(user.initial)}
                className={`${
                  getUserColor(user.initial)
                } w-32 h-32 rounded-md flex items-center justify-center text-5xl font-bold shadow-lg transition-all duration-300 ${
                  hoveredUser === user.initial
                    ? "ring-4 ring-ring scale-110"
                    : "opacity-90 hover:opacity-100"
                } ${getUserConfigFor(user.initial).avatar ? 'text-black' : 'text-white'}`}
                aria-label={`Select user ${getUserDisplayName(user.initial)}`}
              >
                {getUserDisplayContent(user.initial)}
              </button>
              <span className={`mt-4 text-xl font-medium transition-all duration-300 ${
                hoveredUser === user.initial ? "text-fg scale-110" : "text-muted-fg"
              }`}>{getUserDisplayName(user.initial)}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 space-y-4">
          <p className="text-sm text-muted-fg">Click on your initial to begin coding</p>
          <button
            onClick={() => navigate({ to: "/config" })}
            className="text-sm text-muted-fg hover:text-fg underline transition-colors"
          >
            Manage Agents & Configuration
          </button>
        </div>
      </div>
    </div>
  );
}