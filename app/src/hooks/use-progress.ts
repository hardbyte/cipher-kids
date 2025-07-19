import { useUser } from '@/context/use-user';
import { updateUserProgress } from '@/utils/achievements';

/**
 * Hook for tracking user progress and updating achievements
 */
export function useProgress() {
  const { currentUser, getUserConfig, updateUserConfig } = useUser();

  const trackAction = (cipherId: string, action: 'encode' | 'decode' | 'crack') => {
    if (!currentUser) return [];

    const currentConfig = getUserConfig();
    const updatedConfig = updateUserProgress(currentConfig, action, cipherId);
    
    // Update the user config with new progress and achievements
    updateUserConfig(updatedConfig);

    // Check if any new achievements were earned
    const oldAchievements = currentConfig.achievements || [];
    const newAchievements = updatedConfig.achievements || [];
    const newlyEarned = newAchievements.filter((id: string) => !oldAchievements.includes(id));

    return newlyEarned;
  };

  const getStats = () => {
    if (!currentUser) return null;
    
    const config = getUserConfig();
    return {
      achievements: config.achievements?.length || 0,
      messagesEncoded: config.progress?.messagesEncoded || 0,
      messagesDecoded: config.progress?.messagesDecoded || 0,
      codesCracked: config.progress?.codesCracked || 0,
      ciphersUsed: new Set(config.progress?.ciphersUsed || []).size
    };
  };

  return {
    trackAction,
    getStats
  };
}