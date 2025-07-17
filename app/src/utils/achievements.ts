/**
 * Achievement system for tracking user progress and milestones
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'cipher' | 'social' | 'milestone' | 'explorer';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirements: {
    type: 'cipher_use' | 'messages_encoded' | 'messages_decoded' | 'codes_cracked' | 'specific_cipher' | 'all_ciphers' | 'custom';
    value?: number;
    cipherId?: string;
    customCheck?: (progress: UserProgress) => boolean;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // Beginner achievements
  {
    id: 'first_encode',
    name: 'First Steps',
    description: 'Encode your first message with any cipher',
    icon: '🌟',
    category: 'milestone',
    difficulty: 'bronze',
    requirements: {
      type: 'messages_encoded',
      value: 1
    }
  },
  {
    id: 'first_decode',
    name: 'Code Breaker',
    description: 'Decode your first message',
    icon: '🔓',
    category: 'milestone',
    difficulty: 'bronze',
    requirements: {
      type: 'messages_decoded',
      value: 1
    }
  },
  {
    id: 'first_crack',
    name: 'Detective',
    description: 'Crack your first code without knowing the key',
    icon: '🕵️',
    category: 'milestone',
    difficulty: 'silver',
    requirements: {
      type: 'codes_cracked',
      value: 1
    }
  },

  // Cipher-specific achievements
  {
    id: 'caesar_master',
    name: 'Caesar\'s Champion',
    description: 'Master the Caesar cipher by using it 10 times',
    icon: '🏛️',
    category: 'cipher',
    difficulty: 'bronze',
    requirements: {
      type: 'specific_cipher',
      cipherId: 'caesar',
      value: 10
    }
  },
  {
    id: 'vigenere_expert',
    name: 'Vigenère Virtuoso',
    description: 'Become an expert with the Vigenère cipher',
    icon: '🎯',
    category: 'cipher',
    difficulty: 'gold',
    requirements: {
      type: 'specific_cipher',
      cipherId: 'vigenere',
      value: 20
    }
  },
  {
    id: 'morse_operator',
    name: 'Telegraph Operator',
    description: 'Send 15 messages using Morse code',
    icon: '📡',
    category: 'cipher',
    difficulty: 'silver',
    requirements: {
      type: 'specific_cipher',
      cipherId: 'morse',
      value: 15
    }
  },
  {
    id: 'pigpen_artist',
    name: 'Symbol Artist',
    description: 'Create 10 messages with the Pigpen cipher',
    icon: '🎨',
    category: 'cipher',
    difficulty: 'silver',
    requirements: {
      type: 'specific_cipher',
      cipherId: 'pigpen',
      value: 10
    }
  },
  {
    id: 'atbash_mirror',
    name: 'Mirror Master',
    description: 'Use the Atbash cipher 8 times',
    icon: '🪞',
    category: 'cipher',
    difficulty: 'bronze',
    requirements: {
      type: 'specific_cipher',
      cipherId: 'atbash',
      value: 8
    }
  },
  {
    id: 'keyword_creator',
    name: 'Keyword Creator',
    description: 'Encode 12 messages with keyword ciphers',
    icon: '🔑',
    category: 'cipher',
    difficulty: 'silver',
    requirements: {
      type: 'specific_cipher',
      cipherId: 'keyword',
      value: 12
    }
  },
  {
    id: 'railfence_engineer',
    name: 'Railway Engineer',
    description: 'Master the Rail Fence cipher',
    icon: '🚂',
    category: 'cipher',
    difficulty: 'silver',
    requirements: {
      type: 'specific_cipher',
      cipherId: 'railfence',
      value: 10
    }
  },

  // Explorer achievements
  {
    id: 'cipher_explorer',
    name: 'Cipher Explorer',
    description: 'Try all available ciphers at least once',
    icon: '🗺️',
    category: 'explorer',
    difficulty: 'gold',
    requirements: {
      type: 'all_ciphers'
    }
  },
  {
    id: 'persistent_coder',
    name: 'Persistent Coder',
    description: 'Encode 50 messages total',
    icon: '💪',
    category: 'milestone',
    difficulty: 'silver',
    requirements: {
      type: 'messages_encoded',
      value: 50
    }
  },
  {
    id: 'master_decoder',
    name: 'Master Decoder',
    description: 'Decode 50 messages total',
    icon: '🧠',
    category: 'milestone',
    difficulty: 'silver',
    requirements: {
      type: 'messages_decoded',
      value: 50
    }
  },
  {
    id: 'code_cracker_supreme',
    name: 'Supreme Code Cracker',
    description: 'Crack 25 codes without knowing the key',
    icon: '👑',
    category: 'milestone',
    difficulty: 'platinum',
    requirements: {
      type: 'codes_cracked',
      value: 25
    }
  },

  // Social achievements
  {
    id: 'customization_king',
    name: 'Customization King',
    description: 'Personalize your profile with an avatar and theme',
    icon: '🎭',
    category: 'social',
    difficulty: 'bronze',
    requirements: {
      type: 'custom',
      customCheck: (progress: UserProgress) => {
        // Check if user has both avatar and custom theme
        return !!(progress.avatar && progress.iconColor);
      }
    }
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Encode and decode 100 messages combined',
    icon: '💯',
    category: 'milestone',
    difficulty: 'gold',
    requirements: {
      type: 'custom',
      customCheck: (progress: UserProgress) => {
        return (progress.messagesEncoded + progress.messagesDecoded) >= 100;
      }
    }
  }
];

/**
 * Check if a user has earned a specific achievement
 */
export function hasEarnedAchievement(achievement: Achievement, userConfig: UserConfig): boolean {
  const { requirements } = achievement;
  const progress = userConfig.progress || {
    ciphersUsed: [],
    messagesEncoded: 0,
    messagesDecoded: 0,
    codesCracked: 0
  };

  switch (requirements.type) {
    case 'messages_encoded':
      return progress.messagesEncoded >= (requirements.value || 0);
    
    case 'messages_decoded':
      return progress.messagesDecoded >= (requirements.value || 0);
    
    case 'codes_cracked':
      return progress.codesCracked >= (requirements.value || 0);
    
    case 'specific_cipher': {
      if (!requirements.cipherId) return false;
      const cipherCount = progress.ciphersUsed.filter((id: string) => id === requirements.cipherId).length;
      return cipherCount >= (requirements.value || 0);
    }
    
    case 'all_ciphers': {
      const availableCiphers = ['atbash', 'caesar', 'keyword', 'morse', 'pigpen', 'railfence', 'vigenere'];
      return availableCiphers.every(cipher => progress.ciphersUsed.includes(cipher));
    }
    
    case 'custom':
      if (requirements.customCheck) {
        return requirements.customCheck({ ...progress, ...userConfig });
      }
      return false;
    
    default:
      return false;
  }
}

/**
 * Get all achievements earned by a user
 */
export function getEarnedAchievements(userConfig: UserConfig): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => 
    hasEarnedAchievement(achievement, userConfig)
  );
}

/**
 * Get achievements that are close to being earned (within 80% of completion)
 */
export function getAlmostEarnedAchievements(userConfig: UserConfig): Array<Achievement & { progress: number }> {
  const progress = userConfig.progress || {
    ciphersUsed: [],
    messagesEncoded: 0,
    messagesDecoded: 0,
    codesCracked: 0
  };

  return ACHIEVEMENTS
    .filter(achievement => !hasEarnedAchievement(achievement, userConfig))
    .map(achievement => {
      let currentProgress = 0;
      const target = achievement.requirements.value || 1;

      switch (achievement.requirements.type) {
        case 'messages_encoded':
          currentProgress = progress.messagesEncoded / target;
          break;
        case 'messages_decoded':
          currentProgress = progress.messagesDecoded / target;
          break;
        case 'codes_cracked':
          currentProgress = progress.codesCracked / target;
          break;
        case 'specific_cipher':
          if (achievement.requirements.cipherId) {
            const count = progress.ciphersUsed.filter((id: string) => id === achievement.requirements.cipherId).length;
            currentProgress = count / target;
          }
          break;
        case 'all_ciphers': {
          const availableCiphers = ['atbash', 'caesar', 'keyword', 'morse', 'pigpen', 'railfence', 'vigenere'];
          const usedCiphers = availableCiphers.filter(cipher => progress.ciphersUsed.includes(cipher)).length;
          currentProgress = usedCiphers / availableCiphers.length;
          break;
        }
        default:
          currentProgress = 0;
      }

      return {
        ...achievement,
        progress: Math.min(currentProgress, 1)
      };
    })
    .filter(item => item.progress >= 0.6) // Show achievements that are 60% complete
    .sort((a, b) => b.progress - a.progress);
}

/**
 * Update user progress after an action
 */
export function updateUserProgress(
  currentConfig: UserConfig,
  action: 'encode' | 'decode' | 'crack',
  cipherId: string
): UserConfig {
  const progress = currentConfig.progress || {
    ciphersUsed: [],
    messagesEncoded: 0,
    messagesDecoded: 0,
    codesCracked: 0
  };

  const newProgress = { ...progress };
  
  // Add cipher to used list
  newProgress.ciphersUsed = [...progress.ciphersUsed, cipherId];
  
  // Update counters
  switch (action) {
    case 'encode':
      newProgress.messagesEncoded++;
      break;
    case 'decode':
      newProgress.messagesDecoded++;
      break;
    case 'crack':
      newProgress.codesCracked++;
      break;
  }

  // Check for newly earned achievements
  const oldAchievements = currentConfig.achievements || [];
  const newAchievements = getEarnedAchievements({ ...currentConfig, progress: newProgress })
    .map(a => a.id)
    .filter(id => !oldAchievements.includes(id));

  return {
    ...currentConfig,
    progress: newProgress,
    achievements: [...oldAchievements, ...newAchievements]
  };
}