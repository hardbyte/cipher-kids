import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useUser } from "@/context/use-user";
import { UserInitial } from "@/context/user-context-types";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const Route = createFileRoute("/config")({
  component: ConfigPage,
});

// Define the default users
const DEFAULT_USERS: { initial: UserInitial; color: string }[] = [
  { initial: "A", color: "bg-red-600" },
  { initial: "L", color: "bg-blue-600" },
  { initial: "I", color: "bg-green-600" },
  { initial: "J", color: "bg-purple-600" },
  { initial: "F", color: "bg-yellow-600" },
];

// Define available ciphers
const AVAILABLE_CIPHERS = [
  { id: "atbash", name: "Atbash Cipher", description: "Ancient mirror alphabet cipher where A becomes Z, B becomes Y, etc. No key needed!" },
  { id: "caesar", name: "Caesar Cipher", description: "A simple substitution cipher that shifts letters by a fixed number of positions." },
  { id: "keyword", name: "Keyword Cipher", description: "Uses a keyword to create a mixed alphabet for substitution." },
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
            .map(initial => ({ initial, color: DEFAULT_USERS.find(u => u.initial === initial)?.color || 'bg-gray-700' })),
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
    const updated = [...availableUsers, { initial, color: 'bg-gray-700' }];
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
      'A': 'bg-red-600',
      'L': 'bg-blue-600',
      'I': 'bg-green-600',
      'J': 'bg-purple-600',
      'F': 'bg-yellow-600',
    };
    
    return colorMap[initial || ''] || 'bg-gray-700';
  };

  const userColor = getUserColor(currentUser || '');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${userColor} w-10 h-10 rounded-md flex items-center justify-center text-white font-bold`}>
              {currentUser}
            </div>
            <h1 className="text-4xl font-bold text-white">Configuration</h1>
          </div>
          <button
            onClick={() => navigate({ to: "/" })}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            ← Back to Home
          </button>
        </div>
        <p className="text-gray-400 text-lg">
          Manage agents and configure available ciphers
        </p>
      </header>

      {/* Agent Management Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Agent Management</h2>
        
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Current Agents</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {availableUsers.map((user) => (
              <div key={user.initial} className="flex flex-col items-center space-y-2">
                <div className={`${user.color} w-16 h-16 rounded-md flex items-center justify-center text-2xl font-bold text-white`}>
                  {user.initial}
                </div>
                <span className="text-white text-sm">{user.initial}</span>
                {!DEFAULT_USERS.some(u => u.initial === user.initial) && (
                  <button
                    onClick={() => handleRemoveAgent(user.initial)}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Add New Agent</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              maxLength={1}
              value={newAgent}
              onChange={(e) => setNewAgent(e.target.value)}
              className="w-16 p-3 rounded-md bg-gray-900 text-white text-center text-lg font-bold"
              placeholder="A-Z"
            />
            <button
              onClick={handleAddAgent}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-md text-white transition-colors"
            >
              Add Agent
            </button>
            <button
              onClick={handleClearCustomAgents}
              className="px-4 py-3 bg-red-600 hover:bg-red-500 rounded-md text-white transition-colors"
            >
              Clear Custom Agents
            </button>
          </div>
          {agentError && <p className="text-red-400 text-sm">{agentError}</p>}
        </div>
      </section>

      {/* Theme Configuration Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Theme & Appearance</h2>
        
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Theme Preference</h3>
          <p className="text-gray-400 text-sm">Choose your preferred theme for the application</p>
          
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-md">
            <div>
              <h4 className="text-white font-medium">Application Theme</h4>
              <p className="text-gray-400 text-sm">Select light, dark, or system theme</p>
            </div>
            <ThemeSwitcher appearance="outline" showDropdown={true} />
          </div>
        </div>
      </section>

      {/* Cipher Configuration Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Cipher Configuration</h2>
        
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Available Ciphers</h3>
          <p className="text-gray-400 text-sm">Choose which ciphers appear on the home page</p>
          
          <div className="space-y-3">
            {AVAILABLE_CIPHERS.map((cipher) => (
              <label key={cipher.id} className="flex items-start gap-3 p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledCiphers.includes(cipher.id)}
                  onChange={() => handleCipherToggle(cipher.id)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                />
                <div>
                  <h4 className="text-white font-medium">{cipher.name}</h4>
                  <p className="text-gray-400 text-sm">{cipher.description}</p>
                </div>
              </label>
            ))}
          </div>
          
          <div className="pt-4 border-t border-gray-600">
            <p className="text-sm text-gray-400">
              {enabledCiphers.length} of {AVAILABLE_CIPHERS.length} ciphers enabled
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}