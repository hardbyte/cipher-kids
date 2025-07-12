import { useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme/use-theme';

export function MatrixBackground() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const styleSheetRef = useRef<HTMLStyleElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Only run on desktop screens (768px and above) and respect motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    
    if (theme !== 'matrix' || !containerRef.current || window.innerWidth < 768 || prefersReducedMotion) {
      // Clean up if switching away from matrix theme
      if (styleSheetRef.current && styleSheetRef.current.parentNode) {
        styleSheetRef.current.parentNode.removeChild(styleSheetRef.current);
        styleSheetRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const container = containerRef.current;
    
    // Clean up any existing styles from previous instances
    if (styleSheetRef.current && styleSheetRef.current.parentNode) {
      styleSheetRef.current.parentNode.removeChild(styleSheetRef.current);
    }
    
    // Clear container content using React-safe method
    container.textContent = '';
    
    // Inject CSS styles for matrix animation
    const styles = `
      .matrix-rain {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: -1;
        display: flex;
        justify-content: space-around;
        pointer-events: none;
      }

      .matrix-column {
        position: relative;
        width: 20px;
        height: 100vh;
        overflow: hidden;
      }

      .matrix-char {
        position: absolute;
        font-family: 'Courier New', Courier, monospace;
        font-size: 16px;
        font-weight: bold;
        color: #00ff00;
        text-shadow: 0 0 8px #00ff00;
        animation: matrix-drop var(--fall-duration, 3s) linear var(--fall-delay, 0s) infinite;
        user-select: none;
        left: 0;
        width: 100%;
        text-align: center;
      }

      @keyframes matrix-drop {
        0% {
          transform: translateY(-100vh);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateY(100vh);
          opacity: 0;
        }
      }
    `;

    // Inject styles into document head using ref for safe cleanup
    styleSheetRef.current = document.createElement('style');
    styleSheetRef.current.type = 'text/css';
    styleSheetRef.current.textContent = styles;
    document.head.appendChild(styleSheetRef.current);
    
    // Matrix characters including katakana, numbers, and symbols
    const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
    
    // Kid-friendly secret messages
    const secretMessages = ['SECRET', 'CIPHER', 'DECODE', 'PUZZLE', 'HIDDEN', 'CRYPTO', 'SPY', 'HERO'];
    
    // Create columns based on screen width
    const columnWidth = 20;
    const numColumns = Math.floor(window.innerWidth / columnWidth);
    
    for (let col = 0; col < numColumns; col++) {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      
      // Add 8-12 characters per column with random positions
      const charsPerColumn = 8 + Math.floor(Math.random() * 5);
      
      for (let i = 0; i < charsPerColumn; i++) {
        const char = document.createElement('div');
        char.className = 'matrix-char';
        
        // Randomly choose regular character or secret message word
        const useSecret = Math.random() < 0.1; // 10% chance
        char.textContent = useSecret 
          ? secretMessages[Math.floor(Math.random() * secretMessages.length)]
          : matrixChars[Math.floor(Math.random() * matrixChars.length)];
        
        // Set CSS custom properties for animation timing
        const fallDuration = 2 + Math.random() * 4; // 2-6 seconds
        const fallDelay = Math.random() * 3; // 0-3 second delay
        
        char.style.setProperty('--fall-duration', `${fallDuration}s`);
        char.style.setProperty('--fall-delay', `${fallDelay}s`);
        char.style.top = `${Math.random() * -200}px`; // Start above screen
        
        column.appendChild(char);
      }
      
      container.appendChild(column);
    }

    return () => {
      // Clean up styles using ref - much safer than querying DOM
      if (styleSheetRef.current && styleSheetRef.current.parentNode) {
        try {
          styleSheetRef.current.parentNode.removeChild(styleSheetRef.current);
        } catch {
          console.debug('Style sheet already removed');
        }
        styleSheetRef.current = null;
      }
      
      // Cancel any pending animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Clear container content - let React handle the DOM cleanup
      if (container && container.isConnected) {
        try {
          container.textContent = '';
        } catch {
          console.debug('Container already cleared');
        }
      }
    };
  }, [theme]);

  if (theme !== 'matrix') return null;

  return (
    <div 
      ref={containerRef}
      className="matrix-rain"
    />
  );
}