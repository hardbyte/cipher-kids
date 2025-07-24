import { useState, useEffect, useCallback } from "react";
import { CipherNav } from "@/components/cipher/CipherNav";
import { CipherPageContentWrapper } from "@/components/cipher/CipherPageContentWrapper";
import { CipherInputs } from "@/components/cipher/CipherInputs";
import { CipherModeToggle } from "@/components/cipher/CipherModeToggle";
import { CipherResult } from "@/components/cipher/results/CipherResult";
import { GeneralStepByStepAnimation, AnimationStep } from "@/components/cipher/shared/GeneralStepByStepAnimation";
import { ZigzagVisualization } from "@/components/cipher/ZigzagVisualization";
import { Slider } from "@/components/ui/slider";
import { CrackButton } from "@/components/cipher/CrackButton";
import { useProgress } from "@/hooks/use-progress";
import { AchievementNotification } from "@/components/achievement-notification";
import { railFenceCipher } from "@/utils/ciphers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ciphers/railfence")({
  component: RailFenceCipherPage,
});

function RailFenceCipherPage() {
  const { trackAction } = useProgress();
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [mode, setMode] = useState<"encrypt" | "decrypt" | "crack">("encrypt");
  const [message, setMessage] = useState<string>("");
  const [rails, setRails] = useState<number>(3);
  const [output, setOutput] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const [isStepAnimationPlaying, setIsStepAnimationPlaying] = useState(false);
  const [crackResults, setCrackResults] = useState<Array<{rails: number, result: string}>>([]);
  


  // Generate animation steps for the GeneralStepByStepAnimation
  const generateAnimationSteps = useCallback(() => {
    if (!message) {
      setAnimationSteps([]);
      return;
    }

    const steps: AnimationStep[] = [];
    const cleanMessage = message.toUpperCase().replace(/[^A-Z]/g, '');
    
    // For rail fence, we'll show the zigzag pattern formation
    let rail = 0;
    let direction = 1;
    
    for (let i = 0; i < cleanMessage.length; i++) {
      const char = cleanMessage[i];
      
      steps.push({
        originalChar: char,
        transformedChar: char, // Rail fence doesn't transform individual characters
        position: i,
        shift: rail, // We'll use shift to indicate which rail
        explanation: `${char} goes to rail ${rail + 1}`,
      });
      
      if (rail === 0) {
        direction = 1;
      } else if (rail === rails - 1) {
        direction = -1;
      }
      
      rail += direction;
    }

    setAnimationSteps(steps);
  }, [message, rails]);

  // Handle mode changes - auto-populate input with previous result for better UX
  useEffect(() => {
    // If we have an output and the mode changed, use it as the new input
    if (output && output !== message) {
      setMessage(output);
    }
    
    setOutput("");
    setShowStepByStep(false);
    setCrackResults([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally excluding output to prevent infinite loops
  }, [mode]);

  // Reset animation states if message or rails change
  useEffect(() => {
    setOutput("");
    setShowStepByStep(false);
    setCrackResults([]);
    generateAnimationSteps();
  }, [message, rails, generateAnimationSteps]);

  const handleAction = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setOutput("");

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // For Rail Fence, we'll show the zigzag pattern being built
    // Animate building the pattern
    await delay(500);
    
    // Then show the final result
    const result = railFenceCipher(message, rails, mode === "decrypt");
    setOutput(result);
    
    setIsAnimating(false);
    
    // Track the action for achievements
    if (result && message) {
      try {
        const trackResult = trackAction("railfence", mode === "encrypt" ? "encode" : "decode");
        if (trackResult && trackResult.length > 0) {
          setNewAchievements(trackResult);
        }
      } catch (error) {
        console.warn("Achievement tracking failed:", error);
      }
    }
  };


  const handleCrack = () => {
    if (isAnimating || !message) return;
    
    const results: Array<{rails: number, result: string}> = [];
    
    // Try different numbers of rails (2-8)
    for (let r = 2; r <= 8; r++) {
      const result = railFenceCipher(message, r, true); // Always decrypt for cracking
      results.push({ rails: r, result });
    }
    
    setCrackResults(results);
    setOutput(""); // Clear single output when showing multiple results
    
    // Track the crack action for achievements
    if (results.length > 0 && message) {
      try {
        const trackResult = trackAction("railfence", "crack");
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
      <CipherNav activeCipher="railfence" />

      <div className="text-center space-y-4">
          <p className="text-lg lg:text-xl text-muted-fg max-w-3xl mx-auto">
            Write your message in a zigzag pattern across multiple "rails" 🚂
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <CipherModeToggle
            mode={mode}
            setMode={(newMode) => {
              if (!isAnimating) {
                setMode(newMode);
              }
            }}
          />
        </div>

        {/* Rails Slider */}
        {mode !== "crack" && (
          <div className="max-w-md mx-auto">
            <Slider
              label={`Rails: ${rails}`}
              minValue={2}
              maxValue={8}
              step={1}
              value={[rails]}
              onChange={(values) => setRails(Array.isArray(values) ? values[0] : values)}
              className="my-2"
              isDisabled={isAnimating}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Input and Controls */}
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

            {/* Crack Mode Button */}
            {mode === "crack" && (
              <CrackButton
                onClick={handleCrack}
                isAnimating={isAnimating}
                message={message}
                label="Try All Rail Counts (2-8)"
                description="This will try decrypting with 2, 3, 4, 5, 6, 7, and 8 rails to find the right one."
              />
            )}

            {/* Educational Info */}
            <div className="bg-secondary rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold text-accent">🧠 About Rail Fence</h3>
              <div className="space-y-3 text-secondary-fg">
                <p>
                  <strong>Transposition Cipher:</strong> Unlike substitution ciphers that change letters (like Caesar), this scrambles the position of letters while keeping them the same.
                </p>
                <p>
                  <strong>How it works:</strong> Write letters in a zigzag pattern across {rails} rails, then read each rail left-to-right to get your cipher.
                </p>
                <p>
                  <strong>Classical Origins:</strong> A classical transposition cipher method mentioned in cryptographic literature. 
                  Named after the zigzag fence pattern used around railway lines, though exact historical origins are unclear.{' '}
                  <a 
                    href="https://en.wikipedia.org/wiki/Rail_fence_cipher" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    (Learn more)
                  </a>
                </p>
                <p>
                  <strong>Security:</strong> The key is the number of rails - more rails make it harder to crack, but also harder to encode by hand!
                </p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="bg-primary/10 rounded-lg p-6 border-l-4 border-primary space-y-4">
              <h3 className="text-xl font-semibold text-primary">📝 How to Encrypt</h3>
              <div className="space-y-3 text-secondary-fg">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Step 1: Set up the Rails</h4>
                  <p className="text-sm">Draw {rails} horizontal lines (rails) with space between them.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Step 2: Write in Zigzag</h4>
                  <p className="text-sm">Write your message letter by letter, moving down and up between rails in a zigzag pattern.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Step 3: Read Each Rail</h4>
                  <p className="text-sm">Read the letters on rail 1 (top), then rail 2, then rail 3, etc. That's your cipher!</p>
                </div>
              </div>
            </div>

            {/* Examples with Different Rail Counts */}
            <div className="bg-info/10 rounded-lg p-6 border-l-4 border-info space-y-4">
              <h3 className="text-xl font-semibold text-info">🔢 Examples with Different Rails</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-info mb-2">2 Rails Example: "HELLO"</h4>
                  <div className="bg-bg p-3 rounded border border-info/30">
                    <div className="font-mono text-sm space-y-1">
                      <div>Rail 1: H _ L _ O</div>
                      <div>Rail 2: _ E _ L _</div>
                      <div className="mt-2 text-success font-bold">Result: HLOEL</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-info mb-2">3 Rails Example: "HELLO"</h4>
                  <div className="bg-bg p-3 rounded border border-info/30">
                    <div className="font-mono text-sm space-y-1">
                      <div>Rail 1: H _ _ _ O</div>
                      <div>Rail 2: _ E _ L _</div>
                      <div>Rail 3: _ _ L _ _</div>
                      <div className="mt-2 text-success font-bold">Result: HOELL</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-info mb-2">4 Rails Example: "ATTACKATDAWN"</h4>
                  <div className="bg-bg p-3 rounded border border-info/30">
                    <div className="font-mono text-sm space-y-1">
                      <div>Rail 1: A _ _ _ _ _ A _ _ _ _ N</div>
                      <div>Rail 2: _ T _ _ _ K _ T _ _ W _</div>
                      <div>Rail 3: _ _ T _ C _ _ _ D _ _ _</div>
                      <div>Rail 4: _ _ _ A _ _ _ _ _ A _ _</div>
                      <div className="mt-2 text-success font-bold">Result: AANTKTWTCDAA</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-fg italic">
                💡 Notice how more rails spread the letters out more, making the cipher harder to recognize!
              </div>
            </div>
          </div>

          {/* Right Column - Visualization and Output */}
          <div className="space-y-6">
            {/* Rail Fence Zigzag Visualization */}
            {message && (
              <ZigzagVisualization 
                message={message}
                rails={rails}
                isAnimating={isAnimating}
              />
            )}

            {/* Output */}
            {mode !== "crack" && (
              <CipherResult
                output={output}
                mode={mode}
                isAnimating={isAnimating}
              />
            )}

            {/* Step-by-Step Animation */}
            {animationSteps.length > 0 && (
              <div className="bg-secondary rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-success">
                    🔍 Step-by-Step
                  </h3>
                  <button
                    onClick={() => setShowStepByStep(!showStepByStep)}
                    className="px-3 py-1 bg-success hover:bg-success/90 rounded text-sm transition-colors"
                  >
                    {showStepByStep ? "Hide" : "Show"} Steps
                  </button>
                </div>
                
                {showStepByStep && (
                  <GeneralStepByStepAnimation
                    steps={animationSteps}
                    isPlaying={isStepAnimationPlaying}
                    onPlayingChange={setIsStepAnimationPlaying}
                    mode={mode}
                    cipherType="railfence"
                    title="🔍 Rail Fence Step-by-Step"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Crack Results */}
        {mode === "crack" && crackResults.length > 0 && (
          <div className="bg-secondary rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-danger">🔍 Crack Results</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {crackResults.map(({ rails: r, result }) => (
                <div key={r} className="bg-muted rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-warning font-semibold">
                      {r} Rails:
                    </span>
                    <button
                      onClick={() => setOutput(result)}
                      className="text-xs bg-primary hover:bg-primary/90 px-2 py-1 rounded transition-colors"
                    >
                      Use This
                    </button>
                  </div>
                  <div className="text-fg font-mono break-all">
                    {result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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