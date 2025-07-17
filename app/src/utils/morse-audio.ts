/**
 * Audio utilities for Morse code
 * Provides functions to play dots and dashes using Web Audio API
 */

interface AudioSettings {
  frequency: number;
  dotDuration: number;
  dashDuration: number;
  pauseDuration: number;
  volume: number;
}

const DEFAULT_SETTINGS: AudioSettings = {
  frequency: 600, // Hz - Classic telegraph frequency
  dotDuration: 100, // ms
  dashDuration: 300, // ms (3x dot duration)
  pauseDuration: 100, // ms - pause between symbols
  volume: 0.1, // Gentle volume for kids
};

let audioContext: AudioContext | null = null;

/**
 * Initialize audio context (required for user interaction)
 */
export function initializeAudio(): boolean {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: AudioContext }).webkitAudioContext)();
    }
    return true;
  } catch (error) {
    console.warn('Audio not supported:', error);
    return false;
  }
}

/**
 * Play a single tone for specified duration
 */
async function playTone(duration: number, settings: AudioSettings = DEFAULT_SETTINGS): Promise<void> {
  if (!audioContext) {
    throw new Error('Audio context not initialized');
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(settings.frequency, audioContext.currentTime);
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(settings.volume, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000 - 0.01);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);

  return new Promise(resolve => {
    oscillator.onended = () => resolve();
  });
}

/**
 * Play a dot (short beep)
 */
export async function playDot(settings?: Partial<AudioSettings>): Promise<void> {
  const finalSettings = { ...DEFAULT_SETTINGS, ...settings };
  await playTone(finalSettings.dotDuration, finalSettings);
}

/**
 * Play a dash (long beep)
 */
export async function playDash(settings?: Partial<AudioSettings>): Promise<void> {
  const finalSettings = { ...DEFAULT_SETTINGS, ...settings };
  await playTone(finalSettings.dashDuration, finalSettings);
}

/**
 * Play a pause between symbols
 */
export async function playPause(settings?: Partial<AudioSettings>): Promise<void> {
  const finalSettings = { ...DEFAULT_SETTINGS, ...settings };
  return new Promise(resolve => {
    setTimeout(resolve, finalSettings.pauseDuration);
  });
}

/**
 * Play an entire Morse code string with proper timing
 */
export async function playMorseString(morseCode: string, settings?: Partial<AudioSettings>): Promise<void> {
  if (!audioContext) {
    initializeAudio();
  }

  if (!audioContext) {
    throw new Error('Audio not available');
  }

  const finalSettings = { ...DEFAULT_SETTINGS, ...settings };

  for (let i = 0; i < morseCode.length; i++) {
    const symbol = morseCode[i];
    
    if (symbol === '.') {
      await playDot(finalSettings);
    } else if (symbol === '-') {
      await playDash(finalSettings);
    } else if (symbol === ' ') {
      // Space between letters - longer pause
      await new Promise(resolve => setTimeout(resolve, finalSettings.pauseDuration * 3));
      continue;
    } else if (symbol === '/') {
      // Space between words - even longer pause
      await new Promise(resolve => setTimeout(resolve, finalSettings.pauseDuration * 7));
      continue;
    }
    
    // Pause between dots and dashes
    if (i < morseCode.length - 1 && morseCode[i + 1] !== ' ' && morseCode[i + 1] !== '/') {
      await playPause(finalSettings);
    }
  }
}

/**
 * Play a single Morse character (letter)
 */
export async function playMorseCharacter(morsePattern: string, settings?: Partial<AudioSettings>): Promise<void> {
  if (!audioContext) {
    initializeAudio();
  }

  if (!audioContext) {
    throw new Error('Audio not available');
  }

  const finalSettings = { ...DEFAULT_SETTINGS, ...settings };

  for (let i = 0; i < morsePattern.length; i++) {
    const symbol = morsePattern[i];
    
    if (symbol === '.') {
      await playDot(finalSettings);
    } else if (symbol === '-') {
      await playDash(finalSettings);
    }
    
    // Pause between symbols within the same character
    if (i < morsePattern.length - 1) {
      await playPause(finalSettings);
    }
  }
}

/**
 * Check if audio is supported in this browser
 */
export function isAudioSupported(): boolean {
  return !!(window.AudioContext || (window as Window & { webkitAudioContext?: AudioContext }).webkitAudioContext);
}