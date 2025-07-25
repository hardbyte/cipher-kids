import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CipherNav } from "@/components/cipher/CipherNav";
import { CipherPageContentWrapper } from "@/components/cipher/CipherPageContentWrapper";
import { CipherInputs } from "@/components/cipher/CipherInputs";
import { CipherResult } from "@/components/cipher/results/CipherResult";
import { pigpenCipher, PIGPEN_MAPPING } from "@/utils/ciphers";
import { PigpenGrid } from "@/components/cipher/PigpenGrid";
import { createFileRoute } from "@tanstack/react-router";
import { CipherModeToggle } from "@/components/cipher/CipherModeToggle";
import { GeneralStepByStepAnimation, AnimationStep } from "@/components/cipher/shared/GeneralStepByStepAnimation";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/use-progress";
import { AchievementNotification } from "@/components/achievement-notification";

// Types
type CipherMode = "encrypt" | "decrypt" | "crack";

// Constants
const PIGPEN_INFO = {
  WIKI_URL: "https://en.wikipedia.org/wiki/Pigpen_cipher",
  ANIMATION_DELAY: 100,
  DESCRIPTION: "The super secret spy cipher that uses cool shapes instead of letters!"
} as const;

export const Route = createFileRoute("/ciphers/pigpen")({
  component: PigpenCipherPage,
});

function PigpenCipherPage() {
  const { trackAction } = useProgress();
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [mode, setMode] = useState<CipherMode>("encrypt");
  const [message, setMessage] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [highlightChar, setHighlightChar] = useState<string | undefined>(undefined);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const [isStepAnimationPlaying, setIsStepAnimationPlaying] = useState(false);
  const animationRef = useRef<boolean>(false);

  // Helper function to safely track achievements
  const trackAchievement = useCallback((actionType: "encode" | "decode" | "crack") => {
    try {
      const result = trackAction("pigpen", actionType);
      if (result && result.length > 0) {
        setNewAchievements(result);
      }
    } catch (error) {
      console.warn("Achievement tracking failed:", error);
    }
  }, [trackAction]);

  // Memoize reverse mapping for performance
  const reverseMapping = useMemo(() => 
    Object.fromEntries(Object.entries(PIGPEN_MAPPING).map(([k, v]) => [v, k])),
    []
  );

  const generateAnimationSteps = useCallback(() => {
    if (!message) {
      setAnimationSteps([]);
      return;
    }

    const steps: AnimationStep[] = [];

    if (mode === 'decrypt' || mode === 'crack') {
      const symbols = message.split(' ').filter(s => s);
      for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        const transformedChar = reverseMapping[symbol] || symbol;
        steps.push({
          originalChar: symbol,
          transformedChar: transformedChar,
          position: i,
          explanation: `Symbol '${symbol}' is in the grid, it decrypts to '${transformedChar}'.`,
        });
      }
    } else { // encrypt
      const cleanMessage = message.toUpperCase();
      for (let i = 0; i < cleanMessage.length; i++) {
        const char = cleanMessage[i];
        const transformedChar = pigpenCipher(char, false);
        steps.push({
          originalChar: char,
          transformedChar: transformedChar,
          position: i,
          explanation: `Letter '${char}' is in the grid, it encrypts to the symbol '${transformedChar}'.`,
        });
      }
    }
    setAnimationSteps(steps);
  }, [message, mode, reverseMapping]);

  // Handle mode changes - auto-populate input with previous result for better UX
  useEffect(() => {
    // If we have an output and the mode changed, use it as the new input
    if (output && output !== message) {
      setMessage(output);
    }
    
    setOutput("");
    setHighlightChar(undefined);
    setShowStepByStep(false);
    generateAnimationSteps();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally excluding output to prevent infinite loops
  }, [mode]); // Only respond to mode changes

  // Handle message changes separately
  useEffect(() => {
    setOutput("");
    setHighlightChar(undefined);
    setShowStepByStep(false);
    generateAnimationSteps();
  }, [message, generateAnimationSteps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animationRef.current = false;
    };
  }, []);

  const handleAction = useCallback(async () => {
    if (isAnimating || animationRef.current || !message.trim()) return;
    
    animationRef.current = true;
    setIsAnimating(true);
    setOutput("");
    
    try {
      const result = pigpenCipher(message, mode === "decrypt" || mode === 'crack');
      
      // Animate the output
      let currentAnimatedOutput = "";
      const items = mode === 'encrypt' ? result.split(' ') : result.split('');
      const sourceItems = mode === 'encrypt' ? message.toUpperCase().split('') : message.split(' ');

      for (let i = 0; i < items.length; i++) {
        // Check if animation was cancelled
        if (!animationRef.current) break;
        
        setHighlightChar(sourceItems[i]);
        await new Promise(resolve => setTimeout(resolve, PIGPEN_INFO.ANIMATION_DELAY));
        currentAnimatedOutput = mode === 'encrypt' 
          ? (currentAnimatedOutput ? currentAnimatedOutput + ' ' : '') + items[i]
          : currentAnimatedOutput + items[i];
        setOutput(currentAnimatedOutput);
      }

      // Track the action for achievements
      if (currentAnimatedOutput && message) {
        trackAchievement(mode === "encrypt" ? "encode" : "decode");
      }
    } catch (error) {
      console.error("Animation error:", error);
      // Fallback: show the result without animation
      const result = pigpenCipher(message, mode === "decrypt" || mode === 'crack');
      setOutput(result);
    } finally {
      setHighlightChar(undefined);
      animationRef.current = false;
      setIsAnimating(false);
    }
  }, [isAnimating, message, mode, trackAchievement]);

  const handleCrack = useCallback(() => {
    if (!message.trim()) return;
    
    try {
      // In crack mode, we just decrypt.
      const result = pigpenCipher(message, true);
      setOutput(result);
      
      // Track the crack action for achievements
      if (result && message) {
        trackAchievement("crack");
      }
    } catch (error) {
      console.error("Crack operation failed:", error);
      setOutput("");
    }
  }, [message, trackAchievement]);

  return (
    <CipherPageContentWrapper>
      <CipherNav activeCipher="pigpen" />
      <div className="text-center space-y-4">
        <p className="text-lg lg:text-xl text-muted-fg max-w-3xl mx-auto">
          {PIGPEN_INFO.DESCRIPTION}
        </p>
      </div>

      <div className="flex justify-center">
        <CipherModeToggle
          mode={mode}
          setMode={(newMode) => {
            if (!isAnimating && !animationRef.current) {
              // Cancel any ongoing animation
              animationRef.current = false;
              setMode(newMode);
            }
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          <CipherInputs
            mode={mode}
            message={message}
            setMessage={(newMessage: string) => {
              if (!isAnimating && !animationRef.current) setMessage(newMessage);
            }}
            handleAction={mode !== "crack" ? handleAction : undefined}
            isAnimating={isAnimating}
          />

          {mode === "crack" && (
            <div className="bg-info/10 p-4 rounded-lg border-l-4 border-info">
                <h4 className="font-semibold text-info mb-2 flex items-center">
                    Ready to Crack?
                </h4>
                <p className="text-sm text-muted-fg mb-3">
                    The Pigpen cipher doesn't have a secret key, so "cracking" it is the same as decrypting it. We just need to reverse the process by looking up the symbols in the grid to find the original letters.
                </p>
                <Button
                  intent="primary"
                  onPress={handleCrack}
                  isDisabled={isAnimating || !message}
                  className="w-full"
                >
                  Crack the Code (by Decrypting)
                </Button>
            </div>
          )}

          <div className="bg-secondary rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-accent">📚 About Pigpen</h3>
            <div className="space-y-2 text-secondary-fg">
              <p>
                <strong>Secret Shapes:</strong> Instead of shifting letters like Caesar, Pigpen uses special shapes from a grid.
              </p>
              <p>
                <strong>No Key Needed!</strong> Just like Atbash, you don't need a secret key for Pigpen. The grid itself is the key!
              </p>
              <p>
                <strong>How it works:</strong> Each letter is replaced by the part of the grid that surrounds it.
              </p>
              <p>
                <strong>Ancient Origins:</strong> Possibly used by Hebrew rabbis and Knights Templar during the Crusades! 
                Freemasons adopted it in the early 18th century for secret correspondence and even carved it on tombstones.{' '}
                <a 
                  href={PIGPEN_INFO.WIKI_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  (Learn more)
                </a>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t mt-4 space-y-4">
            <h3 className="text-lg font-semibold mb-3 text-fg flex items-center">
              🐷 How It Works: The Pigpen Grid
            </h3>
            <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
              <h4 className="font-semibold text-primary mb-2 flex items-center">
                🎯 How the Grid Creates the Shapes
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-primary text-sm mb-2">Step 1: Draw Two Tic-Tac-Toe Grids</h5>
                  <div className="bg-bg p-3 rounded border border-primary/30">
                    <div className="grid grid-cols-2 gap-8 text-center text-xs font-mono">
                      <div>
                        <div className="mb-2 font-semibold text-primary">Grid 1: Letters A-I</div>
                        <div className="grid grid-cols-3 gap-1 max-w-20 mx-auto">
                          <div className="border-r border-b border-primary/50 p-1 text-xs font-bold">A</div>
                          <div className="border-l border-r border-b border-primary/50 p-1 text-xs font-bold">B</div>
                          <div className="border-l border-b border-primary/50 p-1 text-xs font-bold">C</div>
                          <div className="border-r border-t border-b border-primary/50 p-1 text-xs font-bold">D</div>
                          <div className="border border-primary/50 p-1 text-xs font-bold">E</div>
                          <div className="border-l border-t border-b border-primary/50 p-1 text-xs font-bold">F</div>
                          <div className="border-r border-t border-primary/50 p-1 text-xs font-bold">G</div>
                          <div className="border-l border-r border-t border-primary/50 p-1 text-xs font-bold">H</div>
                          <div className="border-l border-t border-primary/50 p-1 text-xs font-bold">I</div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 font-semibold text-primary">Grid 2: Letters J-R (with dots)</div>
                        <div className="grid grid-cols-3 gap-1 max-w-20 mx-auto">
                          <div className="border-r border-b border-primary/50 p-1 text-xs font-bold">J<span className="text-warning">•</span></div>
                          <div className="border-l border-r border-b border-primary/50 p-1 text-xs font-bold">K<span className="text-warning">•</span></div>
                          <div className="border-l border-b border-primary/50 p-1 text-xs font-bold">L<span className="text-warning">•</span></div>
                          <div className="border-r border-t border-b border-primary/50 p-1 text-xs font-bold">M<span className="text-warning">•</span></div>
                          <div className="border border-primary/50 p-1 text-xs font-bold">N<span className="text-warning">•</span></div>
                          <div className="border-l border-t border-b border-primary/50 p-1 text-xs font-bold">O<span className="text-warning">•</span></div>
                          <div className="border-r border-t border-primary/50 p-1 text-xs font-bold">P<span className="text-warning">•</span></div>
                          <div className="border-l border-r border-t border-primary/50 p-1 text-xs font-bold">Q<span className="text-warning">•</span></div>
                          <div className="border-l border-t border-primary/50 p-1 text-xs font-bold">R<span className="text-warning">•</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-primary text-sm mb-2">Step 2: Add X-Pattern for S-Z</h5>
                  <div className="bg-bg p-3 rounded border border-primary/30">
                    <div className="grid grid-cols-2 gap-8 text-center text-xs font-mono">
                      <div>
                        <div className="mb-2 font-semibold text-primary">X-Pattern: Letters S-V</div>
                        <div className="grid grid-cols-2 gap-1 max-w-12 mx-auto">
                          <div className="border-r border-b border-primary/50 p-1 text-xs font-bold transform rotate-45" style={{fontSize: '10px'}}>S</div>
                          <div className="border-l border-b border-primary/50 p-1 text-xs font-bold transform rotate-45" style={{fontSize: '10px'}}>T</div>
                          <div className="border-r border-t border-primary/50 p-1 text-xs font-bold transform rotate-45" style={{fontSize: '10px'}}>U</div>
                          <div className="border-l border-t border-primary/50 p-1 text-xs font-bold transform rotate-45" style={{fontSize: '10px'}}>V</div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 font-semibold text-primary">X-Pattern: Letters W-Z (with dots)</div>
                        <div className="grid grid-cols-2 gap-1 max-w-12 mx-auto">
                          <div className="border-r border-b border-primary/50 p-1 text-xs font-bold transform rotate-45" style={{fontSize: '10px'}}>W<span className="text-warning">•</span></div>
                          <div className="border-l border-b border-primary/50 p-1 text-xs font-bold transform rotate-45" style={{fontSize: '10px'}}>X<span className="text-warning">•</span></div>
                          <div className="border-r border-t border-primary/50 p-1 text-xs font-bold transform rotate-45" style={{fontSize: '10px'}}>Y<span className="text-warning">•</span></div>
                          <div className="border-l border-t border-primary/50 p-1 text-xs font-bold transform rotate-45" style={{fontSize: '10px'}}>Z<span className="text-warning">•</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-primary text-sm mb-2">Step 3: The Shape = The Lines Around Each Letter</h5>
                  <div className="bg-bg p-3 rounded border border-primary/30 text-sm text-muted-fg">
                    <p className="mb-2">Each letter's symbol is made from the lines that surround it in the grid:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div><span className="font-bold text-primary">A</span> (top-left corner) → <span className="font-mono">┘</span></div>
                      <div><span className="font-bold text-primary">E</span> (center) → <span className="font-mono">┼</span></div>
                      <div><span className="font-bold text-primary">J</span> (top-left with dot) → <span className="font-mono">┘•</span></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <PigpenGrid />
              </div>
            </div>
            <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
              <h4 className="font-semibold text-success mb-2 flex items-center">
                Encoding Your Message
              </h4>
              <p className="text-sm text-muted-fg">
                To encode a letter, you just find it in the grid and draw the "pen" or shape that's around it. For example, the letter 'A' is in the top-left corner, which looks like a backwards 'L' (┘).
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-secondary rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-center text-warning">
              🐷 Pigpen Grid
            </h3>
            <PigpenGrid highlightChar={highlightChar} />
          </div>

          <CipherResult output={output} mode={mode} isAnimating={isAnimating} />

          {animationSteps.length > 0 && (
            <div className="bg-secondary rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-success">
                  🔍 Step-by-Step
                </h3>
                <Button
                  onPress={() => setShowStepByStep(!showStepByStep)}
                  intent="secondary"
                  size="small"
                  isDisabled={!message}
                >
                  {showStepByStep ? "Hide" : "Show"} Steps
                </Button>
              </div>

              {showStepByStep && (
                <GeneralStepByStepAnimation
                  steps={animationSteps}
                  isPlaying={isStepAnimationPlaying}
                  onPlayingChange={setIsStepAnimationPlaying}
                  mode={mode}
                  cipherType="pigpen"
                  title="🐷 Pigpen Step-by-Step"
                />
              )}
            </div>
          )}
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
