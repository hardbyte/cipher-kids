import { useState, useEffect } from "react";
import { MORSE_CODE_MAPPING } from "@/utils/ciphers";

interface MorseCodeAnimatorProps {
  text: string;
  isPlaying: boolean;
  onComplete?: () => void;
  speed?: number; // milliseconds per dot/dash
}

export function MorseCodeAnimator({ 
  text, 
  isPlaying, 
  onComplete, 
  speed = 300 
}: MorseCodeAnimatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMorseIndex, setCurrentMorseIndex] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [currentChar, setCurrentChar] = useState<string>("");
  const [currentMorsePattern, setCurrentMorsePattern] = useState<string>("");

  useEffect(() => {
    if (!isPlaying || !text) {
      setCurrentIndex(0);
      setCurrentMorseIndex(0);
      setIsFlashing(false);
      setCurrentChar("");
      setCurrentMorsePattern("");
      return;
    }

    const animate = async () => {
      const cleanText = text.toUpperCase();
      
      for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];
        const morsePattern = MORSE_CODE_MAPPING[char];
        
        setCurrentChar(char);
        setCurrentIndex(i);
        
        if (morsePattern && char !== ' ') {
          setCurrentMorsePattern(morsePattern);
          
          // Animate each dot/dash in the pattern
          for (let j = 0; j < morsePattern.length; j++) {
            setCurrentMorseIndex(j);
            setIsFlashing(true);
            
            // Flash duration depends on dot or dash
            const flashDuration = morsePattern[j] === '.' ? speed : speed * 3;
            await new Promise(resolve => setTimeout(resolve, flashDuration));
            
            setIsFlashing(false);
            
            // Pause between dots/dashes
            await new Promise(resolve => setTimeout(resolve, speed / 2));
          }
          
          // Pause between letters
          await new Promise(resolve => setTimeout(resolve, speed * 2));
        } else if (char === ' ') {
          // Longer pause for spaces
          setCurrentMorsePattern("/");
          await new Promise(resolve => setTimeout(resolve, speed * 4));
        } else {
          // For non-mappable characters, just show briefly
          setCurrentMorsePattern("?");
          await new Promise(resolve => setTimeout(resolve, speed));
        }
      }
      
      // Animation complete
      setCurrentChar("");
      setCurrentMorsePattern("");
      setIsFlashing(false);
      onComplete?.();
    };

    animate();
  }, [isPlaying, text, speed, onComplete]);

  if (!text) {
    return (
      <div className="bg-muted/20 p-6 rounded-lg">
        <div className="text-center text-muted-fg">
          Enter a message to see the Morse code animation!
        </div>
      </div>
    );
  }

  const renderMorsePattern = (pattern: string, highlightIndex: number) => {
    return pattern.split('').map((symbol, index) => {
      const isHighlighted = index === highlightIndex && isFlashing;
      const isDot = symbol === '.';
      const isDash = symbol === '-';
      
      if (symbol === '/') {
        return (
          <span key={index} className="text-accent mx-2">
            (space)
          </span>
        );
      }
      
      if (symbol === '?') {
        return (
          <span key={index} className="text-muted-fg">
            ?
          </span>
        );
      }
      
      return (
        <span 
          key={index}
          className={`
            inline-block mx-1 transition-all duration-150
            ${isDot ? 'text-warning' : isDash ? 'text-danger' : 'text-muted-fg'}
            ${isHighlighted ? 'scale-150 brightness-150' : 'scale-100'}
          `}
        >
          {isDot ? '●' : isDash ? '▬' : symbol}
        </span>
      );
    });
  };

  const renderTextWithHighlight = () => {
    return text.toUpperCase().split('').map((char, index) => (
      <span 
        key={index}
        className={`
          inline-block mx-1 transition-all duration-300
          ${index === currentIndex ? 'bg-accent text-accent-fg scale-110 px-2 py-1 rounded' : 'text-fg'}
        `}
      >
        {char === ' ' ? '␣' : char}
      </span>
    ));
  };

  return (
    <div className="bg-accent/10 p-6 rounded-lg border-2 border-accent/30">
      <div className="space-y-6">
        {/* Text being encoded */}
        <div className="text-center">
          <div className="text-sm text-muted-fg mb-2">Message:</div>
          <div className="text-xl font-mono tracking-wider">
            {renderTextWithHighlight()}
          </div>
        </div>

        {/* Current character and its morse pattern */}
        {currentChar && (
          <div className="text-center border-t border-accent/20 pt-4">
            <div className="text-sm text-muted-fg mb-2">Current Letter:</div>
            <div className="text-3xl font-bold text-accent mb-3">
              {currentChar === ' ' ? '(space)' : currentChar}
            </div>
            
            {currentMorsePattern && (
              <>
                <div className="text-sm text-muted-fg mb-2">Morse Pattern:</div>
                <div className="text-4xl font-mono tracking-widest mb-4">
                  {renderMorsePattern(currentMorsePattern, currentMorseIndex)}
                </div>
                
                <div className="text-sm text-primary font-mono">
                  {currentMorsePattern === '/' ? '/ (word separator)' : 
                   currentMorsePattern === '?' ? '(unknown character)' : 
                   currentMorsePattern}
                </div>
              </>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm border-t border-accent/20 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-warning text-xl">●</span>
            <span className="text-muted-fg">Dot (short)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-danger text-xl">▬</span>
            <span className="text-muted-fg">Dash (long)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent">␣</span>
            <span className="text-muted-fg">Space</span>
          </div>
        </div>

        {/* Sound indicators */}
        {isFlashing && currentMorsePattern && currentMorsePattern[currentMorseIndex] && (
          <div className="text-center">
            <div className={`
              inline-block px-4 py-2 rounded-full text-white font-semibold
              ${currentMorsePattern[currentMorseIndex] === '.' ? 'bg-warning animate-pulse' : 'bg-danger animate-pulse'}
            `}>
              {currentMorsePattern[currentMorseIndex] === '.' ? 'BEEP' : 'BEEEEP'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}