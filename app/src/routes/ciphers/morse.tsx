import { useState, useEffect, useCallback } from "react";
import { CipherNav } from "@/components/cipher/CipherNav";
import { CipherPageContentWrapper } from "@/components/cipher/CipherPageContentWrapper";
import { CipherInputs } from "@/components/cipher/CipherInputs";
import { CipherModeToggle } from "@/components/cipher/CipherModeToggle";
import { CipherResult } from "@/components/cipher/results/CipherResult";
import { GeneralStepByStepAnimation, AnimationStep } from "@/components/cipher/shared/GeneralStepByStepAnimation";
import { Button } from "@/components/ui/button";
import { morseCode, MORSE_CODE_MAPPING } from "@/utils/ciphers";
import { initializeAudio, playMorseCharacter, isAudioSupported } from "@/utils/morse-audio";
import { createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/hooks/use-progress";
import { AchievementNotification } from "@/components/achievement-notification";

export const Route = createFileRoute("/ciphers/morse")({
  component: MorseCodePage,
});

function MorseCodePage() {
  const { trackAction } = useProgress();
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [message, setMessage] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentCharToHighlight, setCurrentCharToHighlight] = useState<
    string | undefined
  >(undefined);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const [isStepAnimationPlaying, setIsStepAnimationPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Sample messages for kids to try
  const sampleMessages = mode === "encode" ? [
    "SOS", // The famous distress signal
    "HELLO WORLD", // Classic programming greeting
    "MORSE CODE IS FUN", // Educational
    "QUICK BROWN FOX", // Contains many letters
    "SECRET MESSAGE", // Feels spy-like
  ] : [
    "... --- ...", // SOS
    ".... . .-.. .-.. --- / .-- --- .-. .-.. -..", // HELLO WORLD
    "-- --- .-. ... . / -.-. --- -.. . / .. ... / ..-. ..- -.", // MORSE CODE IS FUN
    "... . -.-. .-. . - / -- . ... ... .- --. .", // SECRET MESSAGE
    "--.- ..- .. -.-. -.- / -... .-. --- .-- -. / ..-. --- -..-", // QUICK BROWN FOX
  ];

  // Generate animation steps for the GeneralStepByStepAnimation
  const generateAnimationSteps = useCallback(() => {
    if (!message) {
      setAnimationSteps([]);
      return;
    }

    const steps: AnimationStep[] = [];
    const cleanMessage = message.toUpperCase();

    if (mode === "encode") {
      for (let i = 0; i < cleanMessage.length; i++) {
        const char = cleanMessage[i];
        
        if (MORSE_CODE_MAPPING[char]) {
          const morseChar = MORSE_CODE_MAPPING[char];
          steps.push({
            originalChar: char,
            transformedChar: morseChar,
            position: i,
            explanation: `${char} → ${morseChar}`,
          });
        }
      }
    } else {
      // For decode mode, split by spaces first
      const morseChars = message.split(' ').filter(char => char.length > 0);
      const reverseMorseMap = Object.fromEntries(
        Object.entries(MORSE_CODE_MAPPING).map(([k, v]) => [v, k]).filter(([k]) => k !== '/')
      );
      
      morseChars.forEach((morseChar, i) => {
        if (morseChar === '/') {
          steps.push({
            originalChar: morseChar,
            transformedChar: ' ',
            position: i,
            explanation: `/ → (space)`,
          });
        } else if (reverseMorseMap[morseChar]) {
          const letter = reverseMorseMap[morseChar];
          steps.push({
            originalChar: morseChar,
            transformedChar: letter,
            position: i,
            explanation: `${morseChar} → ${letter}`,
          });
        }
      });
    }

    setAnimationSteps(steps);
  }, [message, mode]);

  // Handle mode changes - auto-populate input with previous result for better UX
  useEffect(() => {
    // If we have an output and the mode changed, use it as the new input
    if (output && output !== message) {
      setMessage(output);
    }
    
    setOutput("");
    setCurrentCharToHighlight(undefined);
    setShowStepByStep(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally excluding output to prevent infinite loops
  }, [mode]);

  // Reset animation states if message changes
  useEffect(() => {
    setOutput("");
    setCurrentCharToHighlight(undefined);
    setShowStepByStep(false);
    generateAnimationSteps();
  }, [message, generateAnimationSteps]);

  // Initialize audio when component mounts
  useEffect(() => {
    setAudioEnabled(isAudioSupported());
  }, []);

  const playCharacterAudio = async (char: string) => {
    if (!audioEnabled || isPlayingAudio) return;
    
    const morsePattern = MORSE_CODE_MAPPING[char];
    if (morsePattern && morsePattern !== '/') {
      try {
        setIsPlayingAudio(true);
        await playMorseCharacter(morsePattern);
      } catch (error) {
        console.warn('Audio playback failed:', error);
      } finally {
        setIsPlayingAudio(false);
      }
    }
  };

  const handleAction = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setOutput("");
    setCurrentCharToHighlight(undefined);

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    
    if (mode === "encode") {
      // Use the core morseCode function for encoding
      const result = morseCode(message, false);
      
      // For encode mode, set the result directly
      setOutput(result);
      
      // Track the action for achievements
      if (result && message) {
        try {
          const trackResult = trackAction("morse", "encode");
          if (trackResult && trackResult.length > 0) {
            setNewAchievements(trackResult);
          }
        } catch (error) {
          console.warn("Achievement tracking failed:", error);
        }
      }
    } else {
      // Decode mode - animate the actual decoding process (fixed from original)
      const morseChars = message.split(' ').filter(char => char.length > 0);
      const reverseMorseMap = Object.fromEntries(
        Object.entries(MORSE_CODE_MAPPING).map(([k, v]) => [v, k]).filter(([k]) => k !== '/')
      );
      
      let currentAnimatedOutput = "";
      
      for (let i = 0; i < morseChars.length; i++) {
        const morseChar = morseChars[i];
        setCurrentCharToHighlight(morseChar);
        
        if (morseChar === '/') {
          // Word separator becomes space
          currentAnimatedOutput += ' ';
        } else if (reverseMorseMap[morseChar]) {
          // Decode this morse character to its letter
          const letter = reverseMorseMap[morseChar];
          currentAnimatedOutput += letter;
        } else {
          // Unknown morse pattern, keep as-is
          currentAnimatedOutput += morseChar;
        }
        
        setOutput(currentAnimatedOutput);
        await delay(500); // Show each morse symbol being decoded
      }
      
      // Ensure the final output is correct
      const finalResult = morseCode(message, true);
      setOutput(finalResult);
      
      // Track the action for achievements
      if (finalResult && message) {
        try {
          const trackResult = trackAction("morse", "decode");
          if (trackResult && trackResult.length > 0) {
            setNewAchievements(trackResult);
          }
        } catch (error) {
          console.warn("Achievement tracking failed:", error);
        }
      }
    }

    setCurrentCharToHighlight(undefined);
    setIsAnimating(false);
  };

  // Create visual morse code representation
  const MorseCodeVisualizer = () => {
    if (!currentCharToHighlight) {
      return (
        <div className="bg-muted/20 p-4 rounded-lg">
          <div className="text-center text-muted-fg">
            Type a message to see the Morse code patterns!
          </div>
        </div>
      );
    }

    // Handle both individual characters and morse patterns
    let morsePattern: string;
    let displayChar: string;
    
    if (MORSE_CODE_MAPPING[currentCharToHighlight]) {
      // It's a character, show its morse code
      morsePattern = MORSE_CODE_MAPPING[currentCharToHighlight];
      displayChar = currentCharToHighlight;
    } else {
      // It's a morse pattern, show it directly
      morsePattern = currentCharToHighlight;
      // Find the corresponding letter
      const reverseMorseMap = Object.fromEntries(
        Object.entries(MORSE_CODE_MAPPING).map(([k, v]) => [v, k]).filter(([k]) => k !== '/')
      );
      displayChar = reverseMorseMap[currentCharToHighlight] || '?';
    }
    
    return (
      <div className="bg-accent/10 p-6 rounded-lg border-2 border-accent/30">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-accent mb-2">
            {mode === "encode" ? currentCharToHighlight : `${currentCharToHighlight} → ${displayChar}`}
          </div>
          <div className="text-3xl font-mono tracking-widest text-primary">
            {morsePattern.split('').map((symbol, index) => (
              <span 
                key={index}
                className={symbol === '.' ? "text-warning" : "text-danger"}
              >
                {symbol === '.' ? '●' : '▬'}
              </span>
            ))}
          </div>
          <div className="text-sm text-muted-fg mt-2">
            {morsePattern}
          </div>
          
          {audioEnabled && (
            <div className="mt-4">
              <Button
                intent="secondary"
                size="small"
                 onPress={() => {
                   initializeAudio();
                   // For decode mode, play the morse pattern; for encode mode, play the character
                   const charToPlay = mode === "encode" ? currentCharToHighlight : displayChar;
                   playCharacterAudio(charToPlay);
                 }}                isDisabled={isPlayingAudio}
              >
                {isPlayingAudio ? "🔊 Playing..." : "🔊 Listen"}
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-warning text-lg">●</span>
            <span className="text-muted-fg">Dot (short beep)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-danger text-lg">▬</span>
            <span className="text-muted-fg">Dash (long beep)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <CipherPageContentWrapper>
      <CipherNav activeCipher="morse" />

      <CipherModeToggle
        mode={mode}
        setMode={(newMode) => {
          if (!isAnimating && newMode !== "crack") setMode(newMode as "encode" | "decode");
        }}
        hideCrack={true}
      />

      <CipherInputs
        mode={mode}
        message={message}
        setMessage={(newMessage: string) => {
          if (!isAnimating) setMessage(newMessage);
        }}
        handleAction={handleAction}
        isAnimating={isAnimating}
        placeholder={mode === "encode" ? "Type your message..." : "Enter Morse code (use spaces between characters)..."}
      />

      {!message && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
          <div className="font-medium mb-2 text-fg">Try these {mode === "encode" ? "messages" : "Morse codes"}:</div>
          <div className="text-xs text-muted-fg mb-2">
            <span className="bg-warning/20 px-1 py-0.5 rounded">Fun fact:</span> SOS (... --- ...) is the most famous Morse code message!
          </div>
          <div className="grid gap-2">
            {sampleMessages.map((sample, index) => (
              <div 
                key={index} 
                className="bg-bg p-2 rounded border border-muted/30 cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => setMessage(sample)}
              >
                <code className="font-mono text-accent">{sample}</code>
                {index === 0 && <div className="text-xs text-muted-fg mt-1">🆘 Emergency distress signal</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <CipherResult
        output={output}
        visualizer={<MorseCodeVisualizer />}
      />

      {/* Step-by-Step Animation Section */}
      <div className="border-t pt-4 border-muted/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-primary">Step-by-Step Animation</h3>
          <Button 
            intent="secondary" 
            size="small"
            onPress={() => {
              setShowStepByStep(!showStepByStep);
              if (!showStepByStep && message) {
                setIsStepAnimationPlaying(true);
              }
            }}
            isDisabled={!message}
          >
            {showStepByStep ? "Hide" : "Show"} Animation
          </Button>
        </div>
        
        {showStepByStep && (
          <GeneralStepByStepAnimation
            steps={animationSteps}
            isPlaying={isStepAnimationPlaying}
            onPlayingChange={(playing) => setIsStepAnimationPlaying(playing)}
            mode={mode}
            cipherType="morse"
            title="Morse Code Translation"
            speed={1200}
          />
        )}
      </div>

      <div className="pt-4 border-t mt-4 space-y-4">
        <h3 className="text-lg font-semibold mb-3 text-fg flex items-center">
          📡 How It Works: Morse Code
        </h3>

        <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
          <h4 className="font-semibold text-primary mb-2 flex items-center">
            🔤 The Dot and Dash Language
          </h4>
          <p className="text-sm text-muted-fg mb-3">
            Morse code turns letters into patterns of short beeps (dots) and long beeps (dashes):
          </p>

          <div className="bg-bg p-4 rounded mb-3 border-2 border-dashed border-primary/30">
            {/* Letters A-Z */}
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-accent mb-2 text-center">Letters</h5>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 text-xs font-mono">
                {Object.entries(MORSE_CODE_MAPPING)
                  .filter(([letter]) => letter.match(/[A-Z]/))
                  .map(([letter, morse]) => (
                    <div key={letter} className="text-center p-1 bg-muted/10 rounded">
                      <div className="font-bold text-accent">{letter}</div>
                      <div className="text-primary text-xs">{morse}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Numbers 0-9 */}
            <div className="mb-2">
              <h5 className="text-sm font-semibold text-accent mb-2 text-center">Numbers</h5>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2 text-xs font-mono">
                {Object.entries(MORSE_CODE_MAPPING)
                  .filter(([char]) => char.match(/[0-9]/))
                  .map(([number, morse]) => (
                    <div key={number} className="text-center p-1 bg-muted/10 rounded">
                      <div className="font-bold text-accent">{number}</div>
                      <div className="text-primary text-xs">{morse}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Special Characters */}
            <div className="text-center mt-3 pt-2 border-t border-muted/30">
              <div className="text-xs text-muted-fg">
                <span className="font-semibold text-accent">Special:</span> 
                <span className="font-mono mx-1 px-2 py-1 bg-muted/20 rounded">/ = word space</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
          <h4 className="font-semibold text-success mb-2 flex items-center">
            🎯 How to {mode === "encode" ? "Encode" : "Decode"} Messages
          </h4>
          <div className="space-y-2">
            {mode === "encode" ? (
              <>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 1:</span> Take each letter in your message
                </p>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 2:</span> Look up its dot-dash pattern
                </p>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 3:</span> Put a space between each letter's code
                </p>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 4:</span> Use "/" to separate words
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 1:</span> Split the code by spaces to get each letter
                </p>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 2:</span> Look up what each dot-dash pattern means
                </p>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 3:</span> Put the letters together
                </p>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 4:</span> Replace "/" with spaces between words
                </p>
              </>
            )}
          </div>

          <div className="mt-3 p-3 bg-bg rounded border-2 border-dashed border-success/30">
            <div className="text-center">
              <div className="text-sm font-semibold text-success mb-2">
                🧩 Example:
              </div>
              <div className="font-mono text-lg">
                {mode === "encode" ? (
                  <>
                    <span className="bg-warning/20 px-2 py-1 rounded mr-2">
                      HI
                    </span>
                    <span className="text-success">→</span>
                    <span className="bg-success/20 px-2 py-1 rounded ml-2">
                      .... ..
                    </span>
                  </>
                ) : (
                  <>
                    <span className="bg-warning/20 px-2 py-1 rounded mr-2">
                      .... ..
                    </span>
                    <span className="text-success">→</span>
                    <span className="bg-success/20 px-2 py-1 rounded ml-2">
                      HI
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
          <h4 className="font-semibold text-accent mb-2 flex items-center">
            📻 Real-World Uses
          </h4>
          <p className="text-sm text-muted-fg mb-2">
            Developed by Samuel Morse, Joseph Henry, and Alfred Vail around 1837 for electrical telegraphy. 
            Vail estimated letter frequencies by counting newspaper type, giving common letters shorter codes! Still used today by:{' '}
            <a 
              href="https://en.wikipedia.org/wiki/Morse_code" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              (Learn more)
            </a>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-accent">🚢 Ships in distress</div>
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-accent">✈️ Pilots and air traffic</div>
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-accent">📡 Ham radio operators</div>
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-accent">🏕️ Scouts and campers</div>
          </div>
        </div>

        <div className="bg-warning/10 p-4 rounded-lg border-l-4 border-warning">
          <h4 className="font-semibold text-warning mb-2 flex items-center">
            🎮 Try It Yourself!
          </h4>
          <p className="text-sm text-muted-fg mb-2">
            Try encoding your name or a secret message! Remember:
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-warning">Dots are short beeps</div>
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-warning">Dashes are long beeps</div>
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-warning">Spaces separate letters</div>
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-warning">/ separates words</div>
          </div>
        </div>
      </div>
      
      {/* Achievement notifications */}
      {newAchievements.length > 0 && (
        <AchievementNotification
          achievements={newAchievements}
          onClose={() => setNewAchievements([])}
        />
      )}
    </CipherPageContentWrapper>
  );
}