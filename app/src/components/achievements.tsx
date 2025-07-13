import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useUser } from '@/context/use-user';
import { ACHIEVEMENTS, getEarnedAchievements, getAlmostEarnedAchievements, Achievement } from '@/utils/achievements';

interface AchievementsProps {
  children: React.ReactNode;
}

const DIFFICULTY_COLORS = {
  bronze: 'bg-orange-100 text-orange-800 border-orange-200',
  silver: 'bg-gray-100 text-gray-800 border-gray-200',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  platinum: 'bg-purple-100 text-purple-800 border-purple-200'
};

const CATEGORY_ICONS = {
  cipher: '🔐',
  social: '👥',
  milestone: '🎯',
  explorer: '🧭'
};

export function Achievements({ children }: AchievementsProps) {
  const { currentUser, getUserConfig } = useUser();
  const [activeTab, setActiveTab] = useState<'earned' | 'progress' | 'all'>('earned');
  
  if (!currentUser) return null;
  
  const userConfig = getUserConfig();
  const earnedAchievements = getEarnedAchievements(userConfig);
  const almostEarnedAchievements = getAlmostEarnedAchievements(userConfig);

  const renderAchievement = (achievement: Achievement, isEarned: boolean = false, progress?: number) => (
    <div
      key={achievement.id}
      className={`p-4 rounded-lg border transition-all ${
        isEarned 
          ? 'bg-success/10 border-success/30 shadow-sm' 
          : 'bg-muted/10 border-muted/30 opacity-70'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`text-3xl ${isEarned ? '' : 'grayscale'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold ${isEarned ? 'text-fg' : 'text-muted-fg'}`}>
              {achievement.name}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full border ${DIFFICULTY_COLORS[achievement.difficulty]}`}>
              {achievement.difficulty}
            </span>
            <span className="text-xs">
              {CATEGORY_ICONS[achievement.category]}
            </span>
          </div>
          <p className={`text-sm ${isEarned ? 'text-muted-fg' : 'text-muted-fg/70'}`}>
            {achievement.description}
          </p>
          
          {/* Progress bar for almost earned achievements */}
          {progress !== undefined && progress > 0 && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-fg">Progress</span>
                <span className="text-xs text-muted-fg">{Math.round(progress * 100)}%</span>
              </div>
              <div className="w-full bg-muted/20 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
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
              <div className="grid gap-3">
                {earnedAchievements.map(achievement => renderAchievement(achievement, true))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold mb-2">No achievements yet!</h3>
                <p className="text-muted-fg">Start encoding messages to earn your first achievement.</p>
              </div>
            )}
          </div>
        );
      
      case 'progress':
        return (
          <div className="space-y-4">
            {almostEarnedAchievements.length > 0 ? (
              <div className="grid gap-3">
                {almostEarnedAchievements.map(item => 
                  renderAchievement(item, false, item.progress)
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Keep coding!</h3>
                <p className="text-muted-fg">Use the ciphers more to make progress on achievements.</p>
              </div>
            )}
          </div>
        );
      
      case 'all':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
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
    <Modal>
      <Modal.Trigger>
        {children}
      </Modal.Trigger>
      <Modal.Content size="lg">
        <Modal.Header>
          <Modal.Title className="flex items-center gap-2">
            🏆 Your Achievements
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
              {earnedAchievements.length}/{ACHIEVEMENTS.length}
            </span>
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-muted/10 p-1 rounded-lg">
            {[
              { key: 'earned', label: 'Earned', count: earnedAchievements.length },
              { key: 'progress', label: 'In Progress', count: almostEarnedAchievements.length },
              { key: 'all', label: 'All', count: ACHIEVEMENTS.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary text-primary-fg shadow-sm'
                    : 'text-muted-fg hover:text-fg hover:bg-muted/20'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 text-xs bg-fg/10 text-fg px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-h-96 overflow-y-auto">
            {getTabContent()}
          </div>

          {/* Statistics */}
          <div className="mt-6 pt-4 border-t border-muted/30">
            <h4 className="font-semibold mb-3 text-center">Your Stats</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-primary/5 p-3 rounded-lg">
                <div className="text-2xl font-bold text-primary">{userConfig.progress?.messagesEncoded || 0}</div>
                <div className="text-xs text-muted-fg">Messages Encoded</div>
              </div>
              <div className="bg-success/5 p-3 rounded-lg">
                <div className="text-2xl font-bold text-success">{userConfig.progress?.messagesDecoded || 0}</div>
                <div className="text-xs text-muted-fg">Messages Decoded</div>
              </div>
              <div className="bg-warning/5 p-3 rounded-lg">
                <div className="text-2xl font-bold text-warning">{userConfig.progress?.codesCracked || 0}</div>
                <div className="text-xs text-muted-fg">Codes Cracked</div>
              </div>
              <div className="bg-accent/5 p-3 rounded-lg">
                <div className="text-2xl font-bold text-accent">
                  {new Set(userConfig.progress?.ciphersUsed || []).size}
                </div>
                <div className="text-xs text-muted-fg">Ciphers Used</div>
              </div>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Modal.Close>Close</Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}