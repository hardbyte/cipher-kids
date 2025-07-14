/**
 * Animation configuration utility for controlling animation speeds in different environments
 * Particularly useful for test environments where we want faster animations
 */

// Check if we're in test mode and get animation speed multiplier
const getAnimationConfig = (() => {
  let isTestMode = false;
  let speedMultiplier = 1;
  
  // Check URL parameters first (highest priority)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const animSpeedParam = urlParams.get('animSpeed');
    if (animSpeedParam) {
      speedMultiplier = parseFloat(animSpeedParam);
      isTestMode = speedMultiplier < 1;
      return { isTestMode, speedMultiplier };
    }
    
    // Check for test parameter
    if (urlParams.get('test') === 'true') {
      isTestMode = true;
      speedMultiplier = 0.1;
      return { isTestMode, speedMultiplier };
    }
  }
  
  // Check if we're running in browser on test port (Playwright uses 5174)
  if (typeof window !== 'undefined' && 
      window.location.hostname === 'localhost' && 
      window.location.port === '5174') {
    isTestMode = true;
    speedMultiplier = 0.1;
    return { isTestMode, speedMultiplier };
  }
  
  // Check for Vite test environment variable
  try {
    if (import.meta.env?.VITE_TEST_MODE === 'true') {
      isTestMode = true;
      speedMultiplier = 0.1;
      return { isTestMode, speedMultiplier };
    }
  } catch {
    // import.meta might not be available in all contexts
  }
  
  // Check for Playwright global
  if (typeof global !== 'undefined' && (global as any).__PLAYWRIGHT__) {
    isTestMode = true;
    speedMultiplier = 0.1;
    return { isTestMode, speedMultiplier };
  }
  
  return { isTestMode, speedMultiplier };
})();

const { isTestMode, speedMultiplier: ANIMATION_SPEED_MULTIPLIER } = getAnimationConfig;

/**
 * Get animation delay with test mode optimization
 * @param baseDelay - Base delay in milliseconds
 * @returns Adjusted delay for current environment
 */
export function getAnimationDelay(baseDelay: number): number {
  return Math.max(1, baseDelay * ANIMATION_SPEED_MULTIPLIER);
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
 */
export const ANIMATION_TIMINGS = {
  // Character processing delay for cipher animations
  CHARACTER_PROCESS: getAnimationDelay(350),
  
  // Non-alphabetic character delay
  NON_ALPHA_CHARACTER: getAnimationDelay(50),
  
  // Step-by-step animation delays
  STEP_REVEAL: getAnimationDelay(200),
  STEP_HIGHLIGHT: getAnimationDelay(800),
  
  // Visualization building delays
  ZIGZAG_CHARACTER: getAnimationDelay(200),
  RAIL_READING: getAnimationDelay(800),
  
  // Morse code delays
  MORSE_CHARACTER: getAnimationDelay(300),
  MORSE_WORD_SEPARATOR: getAnimationDelay(600),
  
  // General animation delays
  SHORT_DELAY: getAnimationDelay(100),
  MEDIUM_DELAY: getAnimationDelay(500),
  LONG_DELAY: getAnimationDelay(1000),
} as const;

/**
 * Check if we're currently in test mode
 */
export function isInTestMode(): boolean {
  return isTestMode;
}