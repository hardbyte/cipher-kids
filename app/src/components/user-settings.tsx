import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useUser } from '@/context/use-user';
import { useTheme } from '@/components/theme/use-theme';
import { UserIconColor, Theme } from '@/context/user-context-types';
import { AvatarPicker } from '@/components/avatar-picker';
import { THEME_OPTIONS } from '@/components/theme/theme-constants';
import { useNavigate } from '@tanstack/react-router';

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

// Use shared theme constants

interface UserSettingsProps {
  onOpenChange?: () => void;
}

export function UserSettings({ onOpenChange }: UserSettingsProps) {
  const { currentUser, getUserConfig, updateUserConfig } = useUser();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const themeChangeRef = useRef<number | null>(null);
  
  const handleThemeChange = useCallback((newTheme: Theme) => {
    try {
      // Cancel any pending theme change
      if (themeChangeRef.current) {
        cancelAnimationFrame(themeChangeRef.current);
      }
      
      // Update user config first (this doesn't affect DOM immediately)
      updateUserConfig({ theme: newTheme });
      
      // Then apply theme change to DOM
      // Use requestAnimationFrame to ensure DOM update happens in next frame
      themeChangeRef.current = requestAnimationFrame(() => {
        setTheme(newTheme);
        themeChangeRef.current = null;
      });
    } catch (error) {
      console.error('Error changing theme:', error);
    }
  }, [setTheme, updateUserConfig]);
  
  // Cleanup effect to cancel pending theme changes
  useEffect(() => {
    return () => {
      if (themeChangeRef.current) {
        cancelAnimationFrame(themeChangeRef.current);
      }
    };
  }, []);
  
  if (!currentUser) return null;
  
  const userConfig = getUserConfig();
  
  const handleIconColorChange = useCallback((newColor: UserIconColor | undefined) => {
    try {
      updateUserConfig({ iconColor: newColor });
    } catch (error) {
      console.error('Error changing icon color:', error);
    }
  }, [updateUserConfig]);
  
  const handleDisplayNameChange = (newName: string) => {
    updateUserConfig({ displayName: newName.trim() || undefined });
  };

  const handleAvatarChange = (avatar: string) => {
    updateUserConfig({ avatar: avatar || undefined });
  };
  
  
  return (
    <Modal onOpenChange={(isOpen) => {
      if (!isOpen && onOpenChange) {
        onOpenChange();
      }
    }}>
      <Modal.Trigger className="text-overlay-fg hover:bg-muted w-full justify-start px-3 py-2 rounded-md cursor-pointer transition-colors flex items-center gap-2 border-none bg-transparent">
        ⚙️ Settings
      </Modal.Trigger>
      <Modal.Content size="md" isBlurred={true}>
        <Modal.Header>
          <Modal.Title className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold ${
              userConfig.iconColor 
                ? `bg-[var(--user-color-${userConfig.iconColor})]` 
                : 'bg-[var(--user-fallback)]'
            }`}>
              {userConfig.avatar || currentUser}
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

          {/* Avatar Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Avatar</label>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${
                userConfig.iconColor 
                  ? `bg-[var(--user-color-${userConfig.iconColor})]` 
                  : 'bg-[var(--user-fallback)]'
              } ${userConfig.avatar ? 'text-black' : 'text-white'}`}>
                {userConfig.avatar || currentUser}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  intent="secondary"
                  size="small"
                  onPress={() => setIsAvatarPickerOpen(true)}
                >
                  {userConfig.avatar ? 'Change Avatar' : 'Choose Avatar'}
                </Button>
                {userConfig.avatar && (
                  <Button
                    intent="outline"
                    size="small"
                    onPress={() => handleAvatarChange('')}
                  >
                    Remove Avatar
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-fg mt-2">
              Choose an emoji to personalize your profile! If no avatar is selected, your initial letter will be shown.
            </p>
          </div>
          
          {/* Theme Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Theme Preference</label>
            <div className="grid grid-cols-2 gap-2">
              {THEME_OPTIONS.map(({ theme, name, icon }) => (
                <button
                  key={theme}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleThemeChange(theme);
                  }}
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
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleIconColorChange(color);
                  }}
                  className={`relative group w-10 h-10 rounded-md ${bgClass} hover:scale-110 transition-transform`}
                  title={name}
                >
                  <div className={`absolute inset-0 flex items-center justify-center font-bold text-sm ${
                    userConfig.avatar ? 'text-black' : 'text-white'
                  }`}>
                    {userConfig.avatar || currentUser}
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleIconColorChange(undefined);
                }}
                className="mt-2 text-sm text-muted-fg hover:text-fg"
              >
                Reset to default
              </button>
            )}
          </div>

          {/* Achievements Section */}
          <div>
            <label className="text-sm font-medium mb-3 block">Achievements & Progress</label>
            <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-medium">
                      {userConfig.achievements?.length || 0} achievements earned
                    </div>
                    <div className="text-xs text-muted-fg">
                      {userConfig.progress?.messagesEncoded || 0} messages encoded • {userConfig.progress?.messagesDecoded || 0} decoded
                    </div>
                  </div>
                </div>
              </div>
              <Button
                intent="secondary"
                size="small"
                onPress={() => {
                  navigate({ to: '/achievements' });
                  if (onOpenChange) onOpenChange();
                }}
              >
                View All
              </Button>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Modal.Close>Done</Modal.Close>
        </Modal.Footer>
      </Modal.Content>
      <AvatarPicker
        selectedAvatar={userConfig.avatar}
        onSelect={handleAvatarChange}
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
      />
    </Modal>
  );
}