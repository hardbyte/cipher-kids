# Matrix Theme Implementation Documentation

## Overview

The Matrix theme is a robotic/cyberpunk-themed background for the Cipher Kids web application that features an animated "digital rain" effect reminiscent of The Matrix movie. It provides an engaging futuristic aesthetic for young users learning about cryptography.

## How It Should Work

### Visual Design
- **Dark background** with green text styling
- **Falling character animation** covering the entire screen background
- **Multiple vertical columns** of characters falling from top to bottom
- **Smooth CSS animations** with varying fall speeds and delays
- **Green glow effect** on all characters using text-shadow

### Animation Content
- **Japanese katakana characters**: アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン
- **Numbers**: 0123456789
- **Kid-friendly secret messages**: SECRET, CIPHER, DECODE, PUZZLE, HIDDEN, CRYPTO, SPY, HERO
- **Mixed content**: 90% individual characters, 10% full words

### Technical Specifications
- **Desktop only**: Animation only runs on screens ≥768px width
- **Accessibility**: Respects `prefers-reduced-motion` setting
- **Performance**: CSS-based animations, not JavaScript
- **Z-index**: Background layer (z-index: -1) behind main content
- **Non-interactive**: pointer-events: none

### Animation Behavior
- **Continuous falling**: Characters fall from top (-100vh) to bottom (100vh)
- **Variable timing**: Fall duration 2-6 seconds per character
- **Staggered start**: Random delays 0-3 seconds
- **Opacity transitions**: Fade in at 10%, fade out at 90%
- **Column layout**: ~20px wide columns across screen width
- **Character density**: 8-12 characters per column

## Implementation Files

### Core Component
- **File**: `/src/components/matrix-background.tsx`
- **Purpose**: Main React component that creates and manages the matrix animation
- **Integration**: Imported and used in `__root.tsx`

### Theme Integration
- **Theme Type**: Added "matrix" to Theme union in `/src/components/theme/theme-context.ts`
- **Theme Switcher**: Updated `/src/components/theme-switcher.tsx` with "01" binary icon
- **CSS Variables**: Matrix color scheme in `/src/index.css`

### Component Architecture
```tsx
export function MatrixBackground() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Only run on matrix theme, desktop screens, with motion enabled
    if (theme !== 'matrix' || window.innerWidth < 768 || prefersReducedMotion) {
      return;
    }
    
    // Inject CSS styles for animations
    // Create columns with falling characters
    // Clean up on theme change
  }, [theme]);
  
  if (theme !== 'matrix') return null;
  
  return <div ref={containerRef} className="matrix-rain" />;
}
```

## Expected User Experience

### Theme Activation
1. User clicks theme switcher showing current theme icon
2. Dropdown appears with Light, Dark, System, Matrix options
3. User selects "01 Matrix" option
4. Theme immediately switches to dark green color scheme
5. **Falling character animation starts within 1-2 seconds**
6. Animation continues smoothly in background

### Animation Visibility
- **Immediate startup**: Animation should be visible within seconds of theme switch
- **Full screen coverage**: Characters falling across entire viewport width
- **Behind content**: Main UI remains fully readable and functional
- **Continuous motion**: Characters constantly falling at different speeds
- **No interference**: Animation doesn't block clicks or interactions

### Performance Characteristics
- **Smooth 60fps**: CSS animations should be hardware accelerated
- **Low CPU usage**: No JavaScript animation loops
- **Memory efficient**: Proper cleanup when switching themes
- **No layout shift**: Animation doesn't affect main content positioning

## Current Issue

**Problem**: User reports "no animated background" - no falling characters visible despite theme being applied correctly.

**Symptoms**:
- Matrix theme colors are applied (green text, dark background)
- Theme switcher shows "01" icon correctly
- No visible falling character animation
- Issue occurs in both Firefox and Chrome on desktop
- HMR is working, so not a stale code issue

**Debug Information**:
- Console shows: `shouldRun: true` (all conditions met)
- Window width: >768px (desktop)
- Motion preferences: not reduced
- Theme: correctly set to "matrix"
- Container exists in DOM

**Potential Causes to Investigate**:
1. CSS animation not triggering
2. Characters created but not visible (opacity/color issues)
3. Z-index conflicts hiding animation
4. CSS injection failing
5. Container positioning issues
6. Animation duration/timing problems

## Files to Review

Please analyze these files against this specification:

1. `/src/components/matrix-background.tsx` - Main implementation
2. `/src/components/theme-switcher.tsx` - Theme integration  
3. `/src/components/theme/theme-context.ts` - Theme type definition
4. `/src/routes/__root.tsx` - Component integration
5. `/src/index.css` - CSS variables and any conflicting styles

## Questions for Review

1. Is the CSS being properly injected into the document head?
2. Are the matrix characters being created and positioned correctly?
3. Could there be CSS specificity issues hiding the animation?
4. Are the CSS animations actually running (check computed styles)?
5. Is the container properly positioned and sized?
6. Are there any conflicting styles in index.css?
7. Could the z-index be causing the animation to be invisible?