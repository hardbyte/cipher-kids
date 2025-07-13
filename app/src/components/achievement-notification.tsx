import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACHIEVEMENTS } from '@/utils/achievements';

interface AchievementNotificationProps {
  achievementIds: string[];
  onClose: () => void;
}

export function AchievementNotification({ achievementIds, onClose }: AchievementNotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const achievements = achievementIds
    .map(id => ACHIEVEMENTS.find(a => a.id === id))
    .filter(Boolean);

  useEffect(() => {
    if (achievements.length === 0) {
      onClose();
      return;
    }

    // Auto-advance through achievements
    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Close after showing all achievements
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }, 2000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length, onClose]);

  if (!achievements.length || !isVisible) return null;

  const currentAchievement = achievements[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        className="fixed top-4 right-4 z-50"
      >
        <div className="bg-success text-success-fg p-4 rounded-lg shadow-lg border border-success/30 max-w-sm">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: 2, duration: 0.5 }}
              className="text-3xl"
            >
              {currentAchievement?.icon}
            </motion.div>
            <div className="flex-1">
              <div className="font-bold text-lg">Achievement Unlocked!</div>
              <div className="font-semibold">{currentAchievement?.name}</div>
              <div className="text-sm opacity-90">{currentAchievement?.description}</div>
              {achievements.length > 1 && (
                <div className="text-xs mt-2 opacity-75">
                  {currentIndex + 1} of {achievements.length}
                </div>
              )}
            </div>
          </div>
          
          {/* Progress indicator for multiple achievements */}
          {achievements.length > 1 && (
            <div className="flex gap-1 mt-3">
              {achievements.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full ${
                    index <= currentIndex ? 'bg-success-fg/50' : 'bg-success-fg/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}