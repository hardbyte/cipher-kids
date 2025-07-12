import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useUser } from '@/context/use-user';
import { useTheme } from '@/components/theme/use-theme';
import { UserIconColor, Theme } from '@/context/user-context-types';

const ICON_COLORS: { color: UserIconColor; name: string; bgClass: string }[] = [
  { color: 'red', name: 'Red', bgClass: 'bg-[var(--user-color-red)]' },
  { color: 'blue', name: 'Blue', bgClass: 'bg-[var(--user-color-blue)]' },
  { color: 'green', name: 'Green', bgClass: 'bg-[var(--user-color-green)]' },
  { color: 'purple', name: 'Purple', bgClass: 'bg-[var(--user-color-purple)]' },
  { color: 'yellow', name: 'Yellow', bgClass: 'bg-[var(--user-color-yellow)]' },
  { color: 'orange', name: 'Orange', bgClass: 'bg-[var(--user-color-orange)]' },
  { color: 'pink', name: 'Pink', bgClass: 'bg-[var(--user-color-pink)]' },
  { color: 'cyan', name: 'Cyan', bgClass: 'bg-[var(--user-color-cyan)]' },
  { color: 'lime', name: 'Lime', bgClass: 'bg-[var(--user-color-lime)]' },
  { color: 'indigo', name: 'Indigo', bgClass: 'bg-[var(--user-color-indigo)]' },
];

const THEMES: { theme: Theme; name: string; icon: string }[] = [
  { theme: 'light', name: 'Light', icon: '☀️' },
  { theme: 'dark', name: 'Dark', icon: '🌙' },
  { theme: 'system', name: 'System', icon: '⚙️' },
  { theme: 'matrix', name: 'Matrix', icon: '{ }' },
];

interface UserSettingsProps {
  children: React.ReactNode;
}

export function UserSettings({ children }: UserSettingsProps) {
  const { currentUser, getUserConfig, updateUserConfig } = useUser();
  const { setTheme } = useTheme();
  
  if (!currentUser) return null;
  
  const userConfig = getUserConfig();
  
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    updateUserConfig({ theme: newTheme });
  };
  
  const handleIconColorChange = (newColor: UserIconColor) => {
    updateUserConfig({ iconColor: newColor });
  };
  
  const handleDisplayNameChange = (newName: string) => {
    updateUserConfig({ displayName: newName.trim() || undefined });
  };
  
  return (
    <Modal>
      <Modal.Trigger>
        {children}
      </Modal.Trigger>
      <Modal.Content size="md">
        <Modal.Header>
          <Modal.Title className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold ${
              userConfig.iconColor 
                ? `bg-[var(--user-color-${userConfig.iconColor})]` 
                : 'bg-[var(--user-fallback)]'
            }`}>
              {currentUser}
            </div>
            Settings for {userConfig.displayName || currentUser}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Display Name</label>
            <input
              type="text"
              placeholder={`User ${currentUser}`}
              defaultValue={userConfig.displayName || ''}
              onBlur={(e) => handleDisplayNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-bg text-fg placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          {/* Theme Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Theme Preference</label>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map(({ theme, name, icon }) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`p-3 rounded-md border text-left transition-colors ${
                    userConfig.theme === theme
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="font-medium">{name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Icon Color Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Icon Color</label>
            <div className="grid grid-cols-5 gap-3">
              {ICON_COLORS.map(({ color, name, bgClass }) => (
                <button
                  key={color}
                  onClick={() => handleIconColorChange(color)}
                  className={`relative group w-10 h-10 rounded-md ${bgClass} hover:scale-110 transition-transform`}
                  title={name}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    {currentUser}
                  </div>
                  {userConfig.iconColor === color && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {userConfig.iconColor && (
              <button
                onClick={() => handleIconColorChange(undefined as any)}
                className="mt-2 text-sm text-muted-fg hover:text-fg"
              >
                Reset to default
              </button>
            )}
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Modal.Close>Done</Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}