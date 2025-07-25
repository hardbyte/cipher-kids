import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from 'react';
import { useUser } from '@/context/use-user';
import { useTheme } from '@/components/theme/use-theme';
import { ACHIEVEMENTS, getEarnedAchievements, getAlmostEarnedAchievements, Achievement } from '@/utils/achievements';

export const Route = createFileRoute("/achievements")({
  component: AchievementsPage,
});

const DIFFICULTY_COLORS = {
  bronze: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  silver: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/20 dark:text-gray-300 dark:border-gray-700',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  platinum: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
};

const CATEGORY_ICONS = {
  cipher: '🔐',
  social: '👥',
  milestone: '🎯',
  explorer: '🧭'
};

function AchievementsPage() {
  const { currentUser, getUserConfig } = useUser();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'earned' | 'progress' | 'all'>('earned');
  
  if (!currentUser) {
    navigate({ to: "/" });
    return null;
  }
  
  const userConfig = getUserConfig();
  const earnedAchievements = getEarnedAchievements(userConfig);
  const almostEarnedAchievements = getAlmostEarnedAchievements(userConfig);

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

  const renderAchievement = (achievement: Achievement, isEarned: boolean = false, progress?: number) => (
    <div
      key={achievement.id}
      className={`p-6 rounded-lg border transition-all ${ 
        isEarned 
          ? 'bg-success/10 border-success/30 shadow-sm' 
          : 'bg-muted/10 border-muted/30 opacity-70'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`text-4xl ${isEarned ? '' : 'grayscale'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className={`font-semibold text-lg ${isEarned ? 'text-fg' : 'text-muted-fg'}`}>
              {achievement.name}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full border ${DIFFICULTY_COLORS[achievement.difficulty]}`}>
              {achievement.difficulty}
            </span>
            <span className="text-lg">
              {CATEGORY_ICONS[achievement.category]}
            </span>
          </div>
          <p className={`text-sm mb-3 ${isEarned ? 'text-muted-fg' : 'text-muted-fg/70'}`}>
            {achievement.description}
          </p>
          
          {/* Progress bar for almost earned achievements */}
          {progress !== undefined && progress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-fg font-medium">Progress</span>
                <span className="text-sm text-muted-fg">{Math.round(progress * 100)}%</span>
              </div>
              <div className="w-full bg-muted/20 rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'earned':
        return (
          <div className="space-y-4">
            {earnedAchievements.length > 0 ? (
              <div className="grid gap-4">
                {earnedAchievements.map(achievement => renderAchievement(achievement, true))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🏆</div>
                <h3 className="text-xl font-semibold mb-3">No achievements yet!</h3>
                <p className="text-muted-fg text-lg">Start encoding messages to earn your first achievement.</p>
              </div>
            )}
          </div>
        );
      
      case 'progress':
        return (
          <div className="space-y-4">
            {almostEarnedAchievements.length > 0 ? (
              <div className="grid gap-4">
                {almostEarnedAchievements.map(item => 
                  renderAchievement(item, false, item.progress)
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🎯</div>
                <h3 className="text-xl font-semibold mb-3">Keep coding!</h3>
                <p className="text-muted-fg text-lg">Use the ciphers more to make progress on achievements.</p>
              </div>
            )}
          </div>
        );
      
      case 'all':
        return (
          <div className="space-y-4">
            <div className="grid gap-4">
              {ACHIEVEMENTS.map(achievement => {
                const isEarned = earnedAchievements.some(earned => earned.id === achievement.id);
                return renderAchievement(achievement, isEarned);
              })}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className={`rounded-lg border p-6 space-y-8 ${
        theme === 'matrix' || theme === 'emoji' ? 'bg-[var(--content-block-bg)]' : 'bg-bg'
      }`}>
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`${getUserColor(currentUser)} w-12 h-12 rounded-md flex items-center justify-center font-bold text-2xl ${
              userConfig.avatar ? 'text-black' : 'text-white'
            }`}>
              {userConfig.avatar || currentUser}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-fg flex items-center gap-3">
                🏆 Your Achievements
                <span className="text-lg bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {earnedAchievements.length}/{ACHIEVEMENTS.length}
                </span>
              </h1>
              <p className="text-muted-fg text-lg mt-2">
                Track your progress and celebrate your cipher mastery!
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate({ to: "/" })}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-fg rounded-md transition-colors"
          >
            ← Home
          </button>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <div className="text-3xl font-bold text-primary">{userConfig.progress?.messagesEncoded || 0}</div>
          <div className="text-sm text-muted-fg font-medium">Messages Encoded</div>
        </div>
        <div className="bg-success/5 p-4 rounded-lg border border-success/20">
          <div className="text-3xl font-bold text-success">{userConfig.progress?.messagesDecoded || 0}</div>
          <div className="text-sm text-muted-fg font-medium">Messages Decoded</div>
        </div>
        <div className="bg-warning/5 p-4 rounded-lg border border-warning/20">
          <div className="text-3xl font-bold text-warning">{userConfig.progress?.codesCracked || 0}</div>
          <div className="text-sm text-muted-fg font-medium">Codes Cracked</div>
        </div>
        <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
          <div className="text-3xl font-bold text-accent">
            {new Set(userConfig.progress?.ciphersUsed || []).size}
          </div>
          <div className="text-sm text-muted-fg font-medium">Ciphers Used</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-muted/10 p-2 rounded-lg">
        {[
          { key: 'earned', label: 'Earned', count: earnedAchievements.length },
          { key: 'progress', label: 'In Progress', count: almostEarnedAchievements.length },
          { key: 'all', label: 'All', count: ACHIEVEMENTS.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'earned' | 'progress' | 'all')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-primary-fg shadow-sm'
                : 'text-muted-fg hover:text-fg hover:bg-muted/20'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 text-xs bg-fg/10 text-fg px-2 py-1 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {getTabContent()}
      </div>
      </div>
    </div>
  );
}