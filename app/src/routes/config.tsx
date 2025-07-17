import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useUser } from "@/context/use-user";
import { UserInitial, UserConfig } from "@/context/user-context-types";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserSettings } from "@/components/user-settings";

export const Route = createFileRoute("/config")({
  component: ConfigPage,
});

// Define the default users with semantic color tokens
const DEFAULT_USERS: { initial: UserInitial; color: string }[] = [
  { initial: "A", color: "bg-[var(--user-a)]" },
  { initial: "L", color: "bg-[var(--user-l)]" },
  { initial: "I", color: "bg-[var(--user-i)]" },
  { initial: "J", color: "bg-[var(--user-j)]" },
  { initial: "F", color: "bg-[var(--user-f)]" },
];

// Define available ciphers
const AVAILABLE_CIPHERS = [
  { id: "atbash", name: "Atbash Cipher", description: "Ancient mirror alphabet cipher where A becomes Z, B becomes Y, etc. No key needed!" },
  { id: "caesar", name: "Caesar Cipher", description: "A simple substitution cipher that shifts letters by a fixed number of positions." },
  { id: "keyword", name: "Keyword Cipher", description: "Uses a keyword to create a mixed alphabet for substitution." },
  { id: "morse", name: "Morse Code", description: "Encode messages using dots and dashes for telegraph-style communication." },
  { id: "pigpen", name: "Pigpen Cipher", description: "A geometric substitution cipher using symbols from a grid." },
  { id: "railfence", name: "Rail Fence Cipher", description: "Write message in zigzag pattern, then read off row by row." },
  { id: "vigenere", name: "Vigenère Cipher", description: "A polyalphabetic substitution cipher using a keyword to determine shifts." },
];

function ConfigPage() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  
  // Agent management state
  const [availableUsers, setAvailableUsers] = useState<{ initial: UserInitial; color: string }[]>(() => {
    const saved = localStorage.getItem('cipher-app-agents');
    if (saved) {
      try {
        const parsed: UserInitial[] = JSON.parse(saved);
        return [
          ...DEFAULT_USERS,
          ...parsed
            .filter(initial => !DEFAULT_USERS.some(u => u.initial === initial))
            .map(initial => ({ initial, color: DEFAULT_USERS.find(u => u.initial === initial)?.color || 'bg-[var(--user-color-gray)]' })),
        ];
      } catch {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  });
  
  const [newAgent, setNewAgent] = useState('');
  const [agentError, setAgentError] = useState<string | null>(null);
  
  // Cipher configuration state
  const [enabledCiphers, setEnabledCiphers] = useState<string[]>(() => {
    const saved = localStorage.getItem('cipher-app-enabled-ciphers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return AVAILABLE_CIPHERS.map(c => c.id);
      }
    }
    return AVAILABLE_CIPHERS.map(c => c.id);
  });

  // Save enabled ciphers to localStorage when they change
  useEffect(() => {
    localStorage.setItem('cipher-app-enabled-ciphers', JSON.stringify(enabledCiphers));
  }, [enabledCiphers]);

  const handleAddAgent = () => {
    const initial = newAgent.trim().toUpperCase() as UserInitial;
    if (!/^[A-Z]$/.test(initial)) {
      setAgentError('Please enter a single letter A-Z');
      return;
    }
    if (availableUsers.find(u => u.initial === initial)) {
      setAgentError('Agent already exists');
      return;
    }
    const updated = [...availableUsers, { initial, color: 'bg-secondary' }];
    setAvailableUsers(updated);
    localStorage.setItem('cipher-app-agents', JSON.stringify(updated.map(u => u.initial)));
    setNewAgent('');
    setAgentError(null);
  };

  const handleRemoveAgent = (initial: UserInitial) => {
    if (DEFAULT_USERS.some(u => u.initial === initial)) {
      return; // Can't remove default users
    }
    const updated = availableUsers.filter(u => u.initial !== initial);
    setAvailableUsers(updated);
    const customAgents = updated.filter(u => !DEFAULT_USERS.some(defaultUser => defaultUser.initial === u.initial));
    localStorage.setItem('cipher-app-agents', JSON.stringify(customAgents.map(u => u.initial)));
  };

  const handleClearCustomAgents = () => {
    setAvailableUsers(DEFAULT_USERS);
    localStorage.removeItem('cipher-app-agents');
    setNewAgent('');
    setAgentError(null);
  };

  const handleCipherToggle = (cipherId: string) => {
    setEnabledCiphers(prev => 
      prev.includes(cipherId) 
        ? prev.filter(id => id !== cipherId)
        : [...prev, cipherId]
    );
  };

  const getUserColor = (initial: string): string => {
    const colorMap: Record<string, string> = {
      'A': 'bg-[var(--user-a)]',
      'L': 'bg-[var(--user-l)]',
      'I': 'bg-[var(--user-i)]',
      'J': 'bg-[var(--user-j)]',
      'F': 'bg-[var(--user-f)]',
    };
    
    return colorMap[initial || ''] || 'bg-[var(--user-color-gray)]';
  };

  const userColor = getUserColor(currentUser || '');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${userColor} w-10 h-10 rounded-md flex items-center justify-center text-secondary-fg font-bold`}>
              {currentUser}
            </div>
            <h1 className="text-4xl font-bold text-fg">Configuration</h1>
          </div>
          <button
            onClick={() => navigate({ to: "/" })}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-fg rounded-md transition-colors"
          >
            ← Back to Home
          </button>
        </div>
        <p className="text-muted-fg text-lg">
          Manage agents and configure available ciphers
        </p>
      </header>

      {/* Agent Management Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-fg">Agent Management</h2>
        
        <div className="bg-secondary rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-secondary-fg">Current Agents</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {availableUsers.map((user) => (
              <div key={user.initial} className="flex flex-col items-center space-y-2">
                <div className={`${user.color} w-16 h-16 rounded-md flex items-center justify-center text-2xl font-bold text-secondary-fg`}>
                  {user.initial}
                </div>
                <span className="text-secondary-fg text-sm">{user.initial}</span>
                {!DEFAULT_USERS.some(u => u.initial === user.initial) && (
                  <button
                    onClick={() => handleRemoveAgent(user.initial)}
                    className="text-xs text-danger hover:text-danger/80 underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-secondary-fg">Add New Agent</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              maxLength={1}
              value={newAgent}
              onChange={(e) => setNewAgent(e.target.value)}
              className="w-16 p-3 rounded-md bg-muted/50 text-secondary-fg text-center text-lg font-bold"
              placeholder="A-Z"
            />
            <button
              onClick={handleAddAgent}
              className="px-4 py-3 bg-primary hover:bg-primary/80 rounded-md text-secondary-fg transition-colors"
            >
              Add Agent
            </button>
            <button
              onClick={handleClearCustomAgents}
              className="px-4 py-3 bg-danger hover:bg-danger/80 rounded-md text-secondary-fg transition-colors"
            >
              Clear Custom Agents
            </button>
          </div>
          {agentError && <p className="text-danger text-sm">{agentError}</p>}
        </div>
      </section>

      {/* Theme Configuration Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-secondary-fg">Theme & Appearance</h2>
        
        <div className="bg-secondary rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-secondary-fg">Theme Preference</h3>
          <p className="text-muted-fg text-sm">Choose your preferred theme for the application</p>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-md">
            <div>
              <h4 className="text-secondary-fg font-medium">Application Theme</h4>
              <p className="text-muted-fg text-sm">Select light, dark, or system theme</p>
            </div>
            <ThemeSwitcher appearance="outline" showDropdown={true} />
          </div>
        </div>
      </section>

      {/* User Settings Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-secondary-fg">User Settings</h2>
        
        <div className="bg-secondary rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-secondary-fg">Individual User Configuration</h3>
          <p className="text-muted-fg text-sm">Manage settings and achievements for each user</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {availableUsers.map((user) => {
              const userConfig = JSON.parse(localStorage.getItem(`user-config-${user.initial}`) || '{}') as UserConfig;
              const achievementCount = userConfig.achievements?.length || 0;
              const messagesCount = (userConfig.progress?.messagesEncoded || 0) + (userConfig.progress?.messagesDecoded || 0);
              
              return (
                <div key={user.initial} className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`${user.color} w-12 h-12 rounded-md flex items-center justify-center text-lg font-bold ${
                      userConfig.avatar ? 'text-fg' : 'text-secondary-fg'
                    }`}>
                      {userConfig.avatar || user.initial}
                    </div>
                    <div className="text-center">
                      <div className="text-secondary-fg font-medium text-sm">
                        {userConfig.displayName || `User ${user.initial}`}
                      </div>
                      <div className="text-muted-fg text-xs">
                        {userConfig.theme || 'system'} theme
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-muted-fg">
                      <span>Achievements:</span>
                      <span className="text-yellow-400">{achievementCount}</span>
                    </div>
                    <div className="flex justify-between text-muted-fg">
                      <span>Messages:</span>
                      <span className="text-green-400">{messagesCount}</span>
                    </div>
                    <div className="flex justify-between text-muted-fg">
                      <span>Ciphers Used:</span>
                      <span className="text-blue-400">{userConfig.progress?.ciphersUsed?.length || 0}</span>
                    </div>
                  </div>
                  
                  <UserSettings>
                    <button className="w-full px-3 py-2 bg-primary hover:bg-primary/80 text-secondary-fg text-sm rounded-md transition-colors">
                      Edit Settings
                    </button>
                  </UserSettings>
                </div>
              );
            })}
          </div>
          
          <div className="pt-4 border-t border-muted">
            <p className="text-sm text-muted-fg">
              Click "Edit Settings" to configure individual user preferences, avatars, and view their achievements.
            </p>
          </div>
        </div>
      </section>

      {/* Cipher Configuration Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-secondary-fg">Cipher Configuration</h2>
        
        <div className="bg-secondary rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-secondary-fg">Available Ciphers</h3>
          <p className="text-muted-fg text-sm">Choose which ciphers appear on the home page</p>
          
          <div className="space-y-3">
            {AVAILABLE_CIPHERS.map((cipher) => (
              <label key={cipher.id} className="flex items-start gap-3 p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledCiphers.includes(cipher.id)}
                  onChange={() => handleCipherToggle(cipher.id)}
                  className="mt-1 w-4 h-4 text-primary bg-muted/80 border-muted rounded focus:ring-primary"
                />
                <div>
                  <h4 className="text-secondary-fg font-medium">{cipher.name}</h4>
                  <p className="text-muted-fg text-sm">{cipher.description}</p>
                </div>
              </label>
            ))}
          </div>
          
          <div className="pt-4 border-t border-muted">
            <p className="text-sm text-muted-fg">
              {enabledCiphers.length} of {AVAILABLE_CIPHERS.length} ciphers enabled
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}