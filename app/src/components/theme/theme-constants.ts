import type { Theme } from './theme-context';

// Shared theme definitions to ensure consistency across the app
export const THEME_OPTIONS: Array<{ theme: Theme; name: string; icon: string }> = [
  { theme: 'light', name: 'Light', icon: '☀️' },
  { theme: 'dark', name: 'Dark', icon: '🌙' },
  { theme: 'system', name: 'System', icon: '⚙️' },
  { theme: 'matrix', name: 'Matrix', icon: '{ }' },
  { theme: 'emoji', name: 'Emoji', icon: '😊' },
];

export const ALL_THEMES: Theme[] = THEME_OPTIONS.map(option => option.theme);

// CSS classes that need to be removed when switching themes
export const THEME_CSS_CLASSES = ['light', 'dark', 'matrix', 'emoji'] as const;