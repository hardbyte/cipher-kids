# Matrix Theme Implementation Documentation

## Overview

The Matrix theme is a robotic/cyberpunk-themed background for the Cipher Kids web application that features an animated "digital rain" effect reminiscent of The Matrix movie. It provides an engaging futuristic aesthetic for young users learning about cryptography.

## How It Works

### Visual Design
- **Dark background** with green text styling. A subtle static matrix grid background is also applied via `index.css` even when the animation is not active.
- **Falling character animation** covering the entire screen background.
- **Multiple vertical columns** of characters falling from top to bottom.
- **Smooth CSS animations** with varying fall speeds and delays.
- **Green glow effect** on all characters using `text-shadow`.
- **Enhanced Card Visibility**: Main content blocks on cipher pages now use a shared `CipherPageContentWrapper` component. This component applies a semi-transparent background (`bg-[var(--content-block-bg)]`) when the Matrix theme is active, to provide better visual separation from the background. For more details on the theming system, refer to [Theme System Documentation](./theme-system.md).

### Animation Content
- **Japanese katakana characters**: アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン
- **Numbers**: 0123456789
- **Kid-friendly secret messages**: SECRET, CIPHER, DECODE, PUZZLE, HIDDEN, CRYPTO, SPY, HERO
- **Mixed content**: 75% individual characters, 25% full words.

### Technical Specifications
- **Mobile Enabled**: The animation now runs on all screen sizes, with optimizations for smaller screens.
- **Accessibility**: Respects `prefers-reduced-motion` setting.
- **Performance**: CSS-based animations, not JavaScript for the animation loop itself.
- **Z-index**: Background layer (`z-index: -1`) behind main content.
- **Non-interactive**: `pointer-events: none`.

### Animation Behavior
- **Continuous falling**: Characters fall from top (`-100vh`) to bottom (`100vh`).
- **Variable timing**: Fall duration 2-6 seconds per character.
- **Staggered start**: Random delays 0-3 seconds.
- **Opacity transitions**: Fade in at 10%, fade out at 90% of the animation duration, with a peak opacity of 0.3.
- **Column layout**: Columns are ~20px wide on desktop and ~40px wide on mobile.
- **Character density**: 8-12 characters per column on desktop, and 4-6 characters per column on mobile.

## Implementation Files

### Core Component
- **File**: `/src/components/matrix-background.tsx`
- **Purpose**: Main React component that creates and manages the matrix animation.
- **Integration**: Imported and used in `__root.tsx`.
- **Dynamic CSS Injection**: This component dynamically creates a `<style>` element and injects the necessary CSS for the matrix animation (including `@keyframes matrix-drop`) directly into the document's `<head>`. This ensures the styles are applied only when the component is active and are properly cleaned up on unmount or theme change.

### Theme Integration
- **Theme Type**: Added "matrix" to Theme union in `/src/components/theme/theme-context.ts`.
- **Theme Switcher**: Updated `/src/components/theme-switcher.tsx` with "01" binary icon for the matrix theme option.
- **CSS Variables**: Matrix color scheme defined in `/src/index.css` under the `.matrix` class, which applies the base colors and a subtle static background grid.

### Component Architecture (`/src/components/matrix-background.tsx`)
```tsx
export function MatrixBackground() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const styleSheetRef = useRef<HTMLStyleElement | null>(null); // Ref for dynamic stylesheet
  const animationFrameRef = useRef<number | null>(null); // Ref for animation frame cleanup

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Only run on matrix theme, with motion enabled
    if (theme !== 'matrix' || !containerRef.current || prefersReducedMotion) {
      // Clean up dynamically injected styles and animation frames
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
    
    // ... (CSS styles and character creation logic)
    
    // Inject styles into document head using ref for safe cleanup
    styleSheetRef.current = document.createElement('style');
    styleSheetRef.current.type = 'text/css';
    styleSheetRef.current.textContent = styles; // `styles` variable contains the CSS
    document.head.appendChild(styleSheetRef.current);
    
    // ... (Column and character generation logic)

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
      if (containerRef.current && containerRef.current.isConnected) {
        try {
          containerRef.current.textContent = '';
        } catch {
          console.debug('Container already cleared');
        }
      }
    };
  }, [theme]); // Dependency array ensures effect re-runs when theme changes
  
  if (theme !== 'matrix') return null;
  
  return <div ref={containerRef} className="matrix-rain" />;
}
```

## Expected User Experience

### Theme Activation
1. User clicks theme switcher showing current theme icon.
2. Dropdown appears with Light, Dark, System, Matrix options.
3. User selects "01 Matrix" option.
4. Theme immediately switches to dark green color scheme.
5. **Falling character animation starts within 1-2 seconds**.
6. Animation continues smoothly in background.

### Animation Visibility
- **Immediate startup**: Animation should be visible within seconds of theme switch.
- **Full screen coverage**: Characters falling across entire viewport width.
- **Behind content**: Main UI remains fully readable and functional.
- **Continuous motion**: Characters constantly falling at different speeds.
- **No interference**: Animation doesn't block clicks or interactions.

### Performance Characteristics
- **Smooth 60fps**: CSS animations should be hardware accelerated.
- **Low CPU usage**: No JavaScript animation loops for the animation itself.
- **Memory efficient**: Proper cleanup when switching themes.
- **No layout shift**: Animation doesn't affect main content positioning.

## Possible Enhancements

Here are some ideas for further enhancements to the Matrix theme:


2.  **Inject Secret Messages**: Integrate kid-friendly secret messages more prominently into the falling characters.
3.  **Dynamic Character Set**: Allow the character set to change based on the user's current page or input, making it more interactive and relevant.
4.  **Optimize for Mobile**: Implement a reduced character density or simplified animation for mobile devices to ensure performance and a good user experience.
5.  **Customizable Characters**: Allow users to select different character sets (e.g., binary, hexadecimal, custom symbols) for the digital rain.
6.  **Interactive Rain**: Implement a subtle interactive effect where characters react to mouse movement or clicks (e.g., change color, speed up/slow down).
7.  **Dynamic Density**: Adjust the density of falling characters based on CPU usage or user preference to optimize performance.
8.  **Sound Effects**: Add subtle, ambient "digital" sound effects that play when the Matrix theme is active.
9.  **Theme Transitions**: Implement smoother transitions when switching to and from the Matrix theme.
10. **Performance Optimization**: Investigate further CSS optimizations or WebGL for more complex effects if performance becomes an issue on lower-end devices.