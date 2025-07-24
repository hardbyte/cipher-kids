import { useState, useEffect, useCallback } from "react";
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

export const Route = createFileRoute("/ciphers/pigpen")({
  component: PigpenCipherPage,
});

function PigpenCipherPage() {
  const { trackAction } = useProgress();
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [mode, setMode] = useState<"encrypt" | "decrypt" | "crack">("encrypt");
  const [message, setMessage] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [highlightChar, setHighlightChar] = useState<string | undefined>(undefined);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const [isStepAnimationPlaying, setIsStepAnimationPlaying] = useState(false);

  const generateAnimationSteps = useCallback(() => {
    if (!message) {
      setAnimationSteps([]);
      return;
    }

    const steps: AnimationStep[] = [];
    const reverseMapping: Record<string, string> = Object.fromEntries(
      Object.entries(PIGPEN_MAPPING).map(([k, v]) => [v, k])
    );

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
  }, [message, mode]);

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

  const handleAction = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setOutput("");
    
    const result = pigpenCipher(message, mode === "decrypt" || mode === 'crack');
    
    // Animate the output
    let currentAnimatedOutput = "";
    const items = mode === 'encrypt' ? result.split(' ') : result.split('');
    const sourceItems = mode === 'encrypt' ? message.toUpperCase().split('') : message.split(' ');

    for (let i = 0; i < items.length; i++) {
      setHighlightChar(sourceItems[i]);
      await new Promise(resolve => setTimeout(resolve, 100));
      currentAnimatedOutput = mode === 'encrypt' 
        ? (currentAnimatedOutput ? currentAnimatedOutput + ' ' : '') + items[i]
        : currentAnimatedOutput + items[i];
      setOutput(currentAnimatedOutput);
    }


    setHighlightChar(undefined);
    setIsAnimating(false);
    
    // Track the action for achievements
    if (currentAnimatedOutput && message) {
      try {
        const trackResult = trackAction("pigpen", mode === "encrypt" ? "encode" : "decode");
        if (trackResult && trackResult.length > 0) {
          setNewAchievements(trackResult);
        }
      } catch (error) {
        console.warn("Achievement tracking failed:", error);
      }
    }
  };

  const handleCrack = async () => {
    // In crack mode, we just decrypt.
    const result = pigpenCipher(message, true);
    setOutput(result);
    
    // Track the crack action for achievements
    if (result && message) {
      try {
        const trackResult = trackAction("pigpen", "crack");
        if (trackResult && trackResult.length > 0) {
          setNewAchievements(trackResult);
        }
      } catch (error) {
        console.warn("Achievement tracking failed:", error);
      }
    }
  };

  return (
    <CipherPageContentWrapper>
      <CipherNav activeCipher="pigpen" />
      <div className="text-center space-y-4">
        <p className="text-lg lg:text-xl text-muted-fg max-w-3xl mx-auto">
          The super secret spy cipher that uses cool shapes instead of letters!
        </p>
      </div>

      <div className="flex justify-center">
        <CipherModeToggle
          mode={mode}
          setMode={(newMode) => {
            if (!isAnimating) setMode(newMode);
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          <CipherInputs
            mode={mode}
            message={message}
            setMessage={(newMessage: string) => {
              if (!isAnimating) setMessage(newMessage);
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
                  href="https://en.wikipedia.org/wiki/Pigpen_cipher" 
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
                  onClick={() => setShowStepByStep(!showStepByStep)}
                  className="px-3 py-1 bg-success hover:bg-success/90 rounded text-sm transition-colors"
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
