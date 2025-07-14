/**
 * Animation configuration utility for controlling animation speeds in different environments.
 * 
 * Speed Control via URL Parameter:
 * - ?animSpeed=1    = Normal speed (default)
 * - ?animSpeed=0.1  = 10x faster (for quick tests)
 * - ?animSpeed=0.01 = 100x faster (for ultra-fast tests)
 * - ?animSpeed=10   = 10x slower (for demonstrations)
 * 
 * Auto-detection:
 * - Test ports (5174) automatically get 10x faster animations
 * - Production uses normal speed
 */

function getAnimationConfig() {
  let isTestMode = false;
  let speedFactor = 1; // Default: normal speed
  
  // Check URL parameters first (highest priority)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const animSpeedParam = urlParams.get('animSpeed');
    if (animSpeedParam) {
      speedFactor = parseFloat(animSpeedParam);
      isTestMode = speedFactor !== 1;
      return { isTestMode, speedFactor };
    }
    
    // Check for test parameter
    if (urlParams.get('test') === 'true') {
      isTestMode = true;
      speedFactor = 0.1; // 10x faster
      return { isTestMode, speedFactor };
    }
  }
  
  // Auto-detect test environment by port (Playwright typically uses 5174)
  if (typeof window !== 'undefined' && 
      window.location.hostname === 'localhost' && 
      window.location.port === '5174') {
    isTestMode = true;
    speedFactor = 0.1; // 10x faster
    return { isTestMode, speedFactor };
  }
  
  // Check for Vite test environment variable
  try {
    if (import.meta.env?.VITE_TEST_MODE === 'true') {
      isTestMode = true;
      speedFactor = 0.1; // 10x faster
      return { isTestMode, speedFactor };
    }
  } catch {
    // import.meta might not be available in all contexts
  }
  
  // Check for Playwright global
  if (typeof global !== 'undefined' && (global as any).__PLAYWRIGHT__) {
    isTestMode = true;
    speedFactor = 0.1; // 10x faster
    return { isTestMode, speedFactor };
  }
  
  return { isTestMode, speedFactor };
}

/**
 * Get animation delay adjusted for current environment
 * @param baseDelay - Base delay in milliseconds
 * @returns Adjusted delay (smaller = faster animations)
 */
export function getAnimationDelay(baseDelay: number): number {
  const { speedFactor } = getAnimationConfig();
  // speedFactor directly multiplies the delay:
  // speedFactor=1   -> normal speed (350ms stays 350ms)  
  // speedFactor=0.1 -> 10x faster (350ms becomes 35ms)
  // speedFactor=0.01 -> 100x faster (350ms becomes 3.5ms)
  return Math.max(0.1, baseDelay * speedFactor);
}

/**
 * Create a delay promise with environment-aware timing
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the adjusted delay
 */
export function createDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, getAnimationDelay(ms)));
}

/**
 * Animation timing constants with test mode awareness
 * These are functions that dynamically check the current environment
 */
export const ANIMATION_TIMINGS = {
  // Character processing delay for cipher animations
  get CHARACTER_PROCESS() { return getAnimationDelay(350); },
  
  // Non-alphabetic character delay
  get NON_ALPHA_CHARACTER() { return getAnimationDelay(50); },
  
  // Step-by-step animation delays
  get STEP_REVEAL() { return getAnimationDelay(200); },
  get STEP_HIGHLIGHT() { return getAnimationDelay(800); },
  
  // Visualization building delays
  get ZIGZAG_CHARACTER() { return getAnimationDelay(200); },
  get RAIL_READING() { return getAnimationDelay(800); },
  
  // Morse code delays
  get MORSE_CHARACTER() { return getAnimationDelay(300); },
  get MORSE_WORD_SEPARATOR() { return getAnimationDelay(600); },
  
  // General animation delays
  get SHORT_DELAY() { return getAnimationDelay(100); },
  get MEDIUM_DELAY() { return getAnimationDelay(500); },
  get LONG_DELAY() { return getAnimationDelay(1000); },
} as const;

/**
 * Check if we're currently in test mode (animations are faster than normal)
 */
export function isInTestMode(): boolean {
  const { isTestMode } = getAnimationConfig();
  return isTestMode;
}