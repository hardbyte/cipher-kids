import { useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme/use-theme';

export function EmojiBackground() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const styleSheetRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (theme !== 'emoji' || !containerRef.current || prefersReducedMotion) {
      if (styleSheetRef.current && styleSheetRef.current.parentNode) {
        try {
          styleSheetRef.current.parentNode.removeChild(styleSheetRef.current);
        } catch {
          // Silently ignore removal errors
        }
        styleSheetRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.textContent = '';
      }
      return;
    }

    const container = containerRef.current;
    container.textContent = '';
    
    const styles = `
      .emoji-rain {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: -1;
        pointer-events: none;
      }

      .emoji-item {
        position: absolute;
        font-size: 30px;
        opacity: 0;
        animation: emoji-float var(--float-duration) linear var(--float-delay) infinite;
      }

      @keyframes emoji-float {
        0% {
          transform: translateY(100vh) translateX(var(--start-x));
          opacity: 0;
        }
        20% {
          opacity: 0.8;
        }
        80% {
          opacity: 0.8;
        }
        100% {
          transform: translateY(-100vh) translateX(var(--end-x));
          opacity: 0;
        }
      }
    `;

    styleSheetRef.current = document.createElement('style');
    styleSheetRef.current.type = 'text/css';
    styleSheetRef.current.textContent = styles;
    document.head.appendChild(styleSheetRef.current);
    
    const emojis = [
      '😊', '😂', '😍', '🤔', '😎', '🤩', '🥳', '🤯', '🤗', '😇',
      '🥰', '😋', '😜', '🤪', '🤓', '😇', '😂', '🤣', '😉', '😊',
      '🙂', '🙃', '🫠', '😁', '😆', '😅', '🥹', '😍', '🤩', '😘',
      '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑',
      '🤗', '🤭', '🫢', '🫣', '🤫', '🤔', '🫡', '🤐', '🤨', '😐',
      '😑', '😶', '🫥', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌',
      '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
      '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸', '😎',
      '🤓', '🧐', '😕', '🫤', '😟', '🙁', '☹️', '😮', '😯', '😲',
      '😳', '🥺', '🥹', '😦', '😧', '😨', '😰', '😥', '😢', '😭',
      '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡',
      '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺',
      '👻', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼',
      '😽', '🙀', '😿', '😾', '🫶', '👋', '🤚', '🖐️', '✋', '🖖',
      '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈',
      '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛',
      '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳',
      '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🫀',
      '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '🫦', '👶', '👧',
      '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱', '👩‍🦰', '🧑‍🦰'
    ];
    const numEmojis = 150;

    for (let i = 0; i < numEmojis; i++) {
      const emoji = document.createElement('div');
      emoji.className = 'emoji-item';
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      
      const floatDuration = 8 + Math.random() * 7;
      const floatDelay = Math.random() * 5;
      const startX = Math.random() * 100;
      const endX = Math.random() * 100;
      const size = 20 + Math.random() * 20;

      emoji.style.setProperty('--float-duration', `${floatDuration}s`);
      emoji.style.setProperty('--float-delay', `${floatDelay}s`);
      emoji.style.setProperty('--start-x', `${startX}vw`);
      emoji.style.setProperty('--end-x', `${endX}vw`);
      emoji.style.fontSize = `${size}px`;
      emoji.style.left = `${startX}vw`;
      emoji.style.top = `${window.innerHeight}px`;

      container.appendChild(emoji);
    }

    return () => {
      if (styleSheetRef.current && styleSheetRef.current.parentNode) {
        try {
          styleSheetRef.current.parentNode.removeChild(styleSheetRef.current);
        } catch {
          // Silently ignore removal errors
        }
        styleSheetRef.current = null;
      }
      if (container && container.isConnected) {
        try {
          container.textContent = '';
        } catch {
          // Silently ignore content clearing errors
        }
      }
    };
  }, [theme]);

  if (theme !== 'emoji') return null;

  return (
    <div 
      ref={containerRef}
      className="emoji-rain"
    />
  );
}
