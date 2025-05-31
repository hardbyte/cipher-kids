import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./vigenere.css";

interface KeywordRepetitionProps {
  keyword: string;
  message: string;
  isAnimating?: boolean;
}

export const KeywordRepetition: React.FC<KeywordRepetitionProps> = ({
  keyword,
  message,
  isAnimating = false,
}) => {
  // Clean the keyword and message (keep spaces in message for alignment)
  const cleanKeyword = keyword.toUpperCase().replace(/[^A-Z]/g, "");
  const cleanMessage = message.toUpperCase();

  // Function to encrypt a single character
  const encryptChar = (char: string, keyChar: string): string => {
    if (!/[A-Z]/.test(char) || !/[A-Z]/.test(keyChar)) return char;
    const charIndex = char.charCodeAt(0) - 65;
    const keyIndex = keyChar.charCodeAt(0) - 65;
    const encryptedIndex = (charIndex + keyIndex) % 26;
    return String.fromCharCode(encryptedIndex + 65);
  };

  // Animation state
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animationInterval, setAnimationInterval] = useState<number | null>(null);

  // Generate the repeated keyword that aligns with the message
  const generateRepeatedKeyword = () => {
    if (!cleanKeyword) return Array(cleanMessage.length).fill(" ");
    
    const result: string[] = [];
    let keyIndex = 0;
    
    for (let i = 0; i < cleanMessage.length; i++) {
      // Only add a keyword character if the message character is alphabetic
      if (/[A-Z]/.test(cleanMessage[i])) {
        result.push(cleanKeyword[keyIndex % cleanKeyword.length]);
        keyIndex++;
      } else {
        // Keep spaces and non-alpha chars aligned with spaces
        result.push(" ");
      }
    }
    
    return result;
  };

  const repeatedKeyword = generateRepeatedKeyword();

  // Animation effect
  useEffect(() => {
    if (isAnimating && cleanKeyword && cleanMessage) {
      setCurrentIndex(-1);
      setIsPlaying(true);
      
      // Start animation
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < cleanMessage.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setIsPlaying(false);
            setAnimationInterval(null);
            return prev;
          }
        });
      }, 500);
      
      setAnimationInterval(interval);
      return () => {
        clearInterval(interval);
        setAnimationInterval(null);
      };
    }
  }, [isAnimating, cleanKeyword, cleanMessage]);

  const startManualAnimation = () => {
    if (animationInterval) {
      clearInterval(animationInterval);
    }
    
    setCurrentIndex(-1);
    setIsPlaying(true);
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < cleanMessage.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsPlaying(false);
          setAnimationInterval(null);
          return prev;
        }
      });
    }, 500);
    
    setAnimationInterval(interval);
  };

  const pauseAnimation = () => {
    if (animationInterval) {
      clearInterval(animationInterval);
      setAnimationInterval(null);
      setIsPlaying(false);
    }
  };

  const resumeAnimation = () => {
    if (!isPlaying && currentIndex < cleanMessage.length - 1) {
      setIsPlaying(true);
      
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < cleanMessage.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setIsPlaying(false);
            setAnimationInterval(null);
            return prev;
          }
        });
      }, 500);
      
      setAnimationInterval(interval);
    }
  };

  if (!cleanKeyword || !cleanMessage) {
    return (
      <div className="p-4 text-center text-muted-fg italic text-sm">
        Enter a keyword and message to see how the keyword repeats
      </div>
    );
  }

  const bgColors = {
    keyword: "bg-warning/20",
    message: "bg-info/10",
    combined: "bg-success/10",
    highlight: "bg-accent/20",
  };

  const textColors = {
    keyword: "text-warning-fg",
    message: "text-info-fg",
    combined: "text-success-fg",
  };

  return (
    <div className="p-3 rounded-lg border border-muted bg-muted/10">
      <div className="mb-3">
        <div className="text-sm font-medium mb-2 text-fg">Keyword Repetition</div>
        <div className="text-xs mb-4 text-muted-fg">
          The keyword "{cleanKeyword}" repeats to match the length of your message
        </div>
      </div>

      <div className="font-mono text-sm flex flex-col space-y-2">
        {/* Key row */}
        <div className="flex flex-wrap">
          <div className={`w-16 ${bgColors.keyword} ${textColors.keyword} px-2 py-1 rounded-l-md font-semibold flex items-center justify-center`}>
            KEY:
          </div>
          <div className="flex flex-1 overflow-x-auto">
            {repeatedKeyword.map((char, idx) => (
              <motion.div
                key={`key-${idx}`}
                className={`w-8 h-8 flex items-center justify-center rounded-sm ${
                  currentIndex >= idx ? bgColors.keyword : "bg-transparent"
                } ${currentIndex === idx ? bgColors.highlight : ""}`}
                animate={{
                  scale: currentIndex === idx ? 1.1 : 1,
                }}
              >
                {char}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Message row */}
        <div className="flex flex-wrap">
          <div className={`w-16 ${bgColors.message} ${textColors.message} px-2 py-1 rounded-l-md font-semibold flex items-center justify-center`}>
            MESSAGE:
          </div>
          <div className="flex flex-1 overflow-x-auto">
            {cleanMessage.split("").map((char, idx) => (
              <motion.div
                key={`msg-${idx}`}
                className={`w-8 h-8 flex items-center justify-center rounded-sm ${
                  currentIndex >= idx ? bgColors.message : "bg-transparent"
                } ${currentIndex === idx ? bgColors.highlight : ""}`}
                animate={{
                  scale: currentIndex === idx ? 1.1 : 1,
                }}
              >
                {char}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Combined result indicator */}
        <div className="flex flex-wrap mt-2">
          <div className={`w-16 ${bgColors.combined} ${textColors.combined} px-2 py-1 rounded-l-md font-semibold flex items-center justify-center`}>
            RESULT:
          </div>
          <div className="flex flex-1 overflow-x-auto">
            {cleanMessage.split("").map((char, idx) => {
              const keyChar = repeatedKeyword[idx];
              const encryptedChar = /[A-Z]/.test(char) && keyChar ? encryptChar(char, keyChar) : char;
              
              return (
                <AnimatePresence key={`combined-${idx}`}>
                  {currentIndex >= idx && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`w-8 h-8 flex items-center justify-center rounded-sm ${
                        bgColors.combined
                      } ${currentIndex === idx ? bgColors.highlight : ""}`}
                    >
                      {encryptedChar}
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          className="px-4 py-2 text-sm rounded-md bg-muted text-muted-fg hover:bg-muted/80 transition-colors"
          onClick={() => {
            if (animationInterval) {
              clearInterval(animationInterval);
              setAnimationInterval(null);
            }
            setCurrentIndex(-1);
            setIsPlaying(false);
          }}
        >
          🔄 Reset
        </button>
        
        {!isPlaying ? (
          <button
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-fg hover:bg-primary/80 transition-colors"
            onClick={currentIndex === -1 ? startManualAnimation : resumeAnimation}
          >
            ▶️ {currentIndex === -1 ? "Start" : "Resume"}
          </button>
        ) : (
          <button
            className="px-4 py-2 text-sm rounded-md bg-warning text-warning-fg hover:bg-warning/80 transition-colors"
            onClick={pauseAnimation}
          >
            ⏸️ Pause
          </button>
        )}
        
        <button
          className="px-4 py-2 text-sm rounded-md bg-accent text-accent-fg hover:bg-accent/80 transition-colors"
          onClick={() => {
            if (animationInterval) {
              clearInterval(animationInterval);
              setAnimationInterval(null);
            }
            setCurrentIndex(cleanMessage.length - 1);
            setIsPlaying(false);
          }}
        >
          ⏭️ Show All
        </button>
      </div>
    </div>
  );
};