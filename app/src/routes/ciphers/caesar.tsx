import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatedMapping } from "@/components/cipher/AnimatedMapping";
import { CipherNav } from "@/components/cipher/CipherNav";
import { CipherPageContentWrapper } from "@/components/cipher/CipherPageContentWrapper";
import { CipherInputs } from "@/components/cipher/CipherInputs";
import { Slider } from "@/components/ui/slider"; // Assuming shadcn/ui structure
import { CipherModeToggle } from "@/components/cipher/CipherModeToggle";
import { CipherResult } from "@/components/cipher/results/CipherResult";
import { AllCaesarShifts } from "@/components/cipher/results/AllCaesarShifts";
import { GeneralStepByStepAnimation, AnimationStep } from "@/components/cipher/shared/GeneralStepByStepAnimation";
import { Button } from "@/components/ui/button";
import { caesarCipher, ALPHABET } from "@/utils/ciphers";
import { createDelay, ANIMATION_TIMINGS } from "@/utils/animation-config";
import { createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/hooks/use-progress";
import { AchievementNotification } from "@/components/achievement-notification";

export const Route = createFileRoute("/ciphers/caesar")({
  component: CaesarCipherPage,
});

function CaesarCipherPage() {
  const { trackAction } = useProgress();
  const [mode, setMode] = useState<"encrypt" | "decrypt" | "crack">("encrypt");
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [shift, setShift] = useState<number>(3); // Default shift to 3, type is number
  const [output, setOutput] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentCharToHighlight, setCurrentCharToHighlight] = useState<
    string | undefined
  >(undefined);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const [isStepAnimationPlaying, setIsStepAnimationPlaying] = useState(false);
  const animationRef = useRef<boolean>(false);
  
  // Sample messages for kids to try decoding in crack mode
  const sampleMessages = [
    "KHOOR ZRUOG", // "HELLO WORLD" with shift 3 (Caesar's actual shift!)
    "FDHVDU FLSKHU LV IXQ", // "CAESAR CIPHER IS FUN" with shift 3
    "L FDPH, L VDZ, L FRQTXHUHG", // "I CAME, I SAW, I CONQUERED" - Caesar's famous quote with shift 3
    "VHFXULWB EB REVFXULWB", // "SECURITY BY OBSCURITY" with shift 3
    "WKH TXLFN EURZQ IRA", // "THE QUICK BROWN FOX" with shift 3
  ];

  // Generate animation steps for the GeneralStepByStepAnimation
  const generateAnimationSteps = useCallback(() => {
    if (!message) {
      setAnimationSteps([]);
      return;
    }

    const steps: AnimationStep[] = [];
    const cleanMessage = message.toUpperCase();

    for (let i = 0; i < cleanMessage.length; i++) {
      const char = cleanMessage[i];
      
      if (ALPHABET.includes(char)) {
        // Use the utility function for consistency
        const transformedChar = caesarCipher(char, shift, mode === "decrypt");

        steps.push({
          originalChar: char,
          transformedChar,
          position: i,
          shift,
          explanation: `${char} ${mode === "encrypt" ? "+" : "-"} ${shift} = ${transformedChar}`,
        });
      }
    }

    setAnimationSteps(steps);
  }, [message, mode, shift]);

  // Handle mode changes - auto-populate input with previous result for better UX
  useEffect(() => {
    // Cancel any ongoing animation
    animationRef.current = false;
    
    setOutput("");
    setCurrentCharToHighlight(undefined);
    setShowStepByStep(false);
    setIsAnimating(false);
  }, [mode]); // Only respond to mode changes

  // Handle message and shift changes separately to avoid infinite loops
  useEffect(() => {
    setOutput("");
    setCurrentCharToHighlight(undefined);
    setShowStepByStep(false);
    generateAnimationSteps();
  }, [message, shift, generateAnimationSteps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animationRef.current = false;
    };
  }, []);

  const handleAction = async () => {
    if (isAnimating || animationRef.current) return;

    animationRef.current = true;
    setIsAnimating(true);
    setOutput("");
    setCurrentCharToHighlight(undefined);

    // Using environment-aware delay function
    let currentAnimatedOutput = "";

    try {
      for (let i = 0; i < message.length; i++) {
        // Check if animation was cancelled
        if (!animationRef.current) break;

        const char = message[i];
        const upperChar = char.toUpperCase();

        if (ALPHABET.includes(upperChar)) {
          setCurrentCharToHighlight(upperChar);

          // Use the utility function for the actual cipher logic
          const cipheredChar = caesarCipher(upperChar, shift, mode === "decrypt");

          // Preserve case
          const resultChar =
            char === upperChar ? cipheredChar : cipheredChar.toLowerCase();
          currentAnimatedOutput += resultChar;
          setOutput(currentAnimatedOutput);
          await createDelay(ANIMATION_TIMINGS.CHARACTER_PROCESS);
        } else {
          // Non-alphabetic characters
          setCurrentCharToHighlight(undefined); // No highlight for non-alpha
          currentAnimatedOutput += char;
          setOutput(currentAnimatedOutput);
          await createDelay(ANIMATION_TIMINGS.NON_ALPHA_CHARACTER);
        }
      }
    } finally {
      setCurrentCharToHighlight(undefined); // Clear highlight at the end
      animationRef.current = false;
      setIsAnimating(false);
      
      // Track the action for achievements
      if (currentAnimatedOutput && message) {
        try {
          const result = trackAction("caesar", mode === "encrypt" ? "encode" : "decode");
          if (result && result.length > 0) {
            setNewAchievements(result);
          }
        } catch (error) {
          console.warn("Achievement tracking failed:", error);
        }
      }
    }
  };

  // Slider ensures shift is within 0-25.
  // The modulo 26 for index calculation handles positive shifts correctly.
  const shiftedAlphabet = ALPHABET.split("").map(
    (_, i) => ALPHABET[(i + shift + 26) % 26], // Ensure positive result before modulo
  );

  return (
    <CipherPageContentWrapper>
      <CipherNav activeCipher="caesar" />

      <CipherModeToggle
          mode={mode}
          setMode={(newMode) => {
            if (!isAnimating) setMode(newMode);
          }}
        />

        {mode !== "crack" && (
          <Slider
            label={`Shift: ${shift}`}
            minValue={0}
            maxValue={25}
            step={1}
            value={[shift]}
            onChange={(val: number | number[]) => {
              if (isAnimating) return;
              if (Array.isArray(val)) {
                setShift(val[0]);
              } else {
                setShift(val);
              }
            }}
            className="my-2"
            isDisabled={isAnimating}
          />
        )}

        <CipherInputs
          mode={mode}
          message={message}
          setMessage={(newMessage: string) => {
            if (!isAnimating) setMessage(newMessage);
          }}
          handleAction={mode !== "crack" ? handleAction : undefined}
          isAnimating={isAnimating}
        />

        {mode === "crack" ? (
            <>
              {!message && (
                <div className="mb-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                  <div className="font-medium mb-2 text-fg">Try to decode these secret messages:</div>
                  <div className="text-xs text-muted-fg mb-2">
                    <span className="bg-warning/20 px-1 py-0.5 rounded">Fun fact:</span> Julius Caesar used shift 3 for his own secret messages!
                  </div>
                  <div className="grid gap-2">
                    {sampleMessages.map((sample, index) => (
                      <div 
                        key={index} 
                        className="bg-bg p-2 rounded border border-muted/30 cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => setMessage(sample)}
                      >
                        <code className="font-mono text-accent">{sample}</code>
                        {index === 2 && <div className="text-xs text-muted-fg mt-1">🏛️ Caesar's famous quote</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <AllCaesarShifts 
                message={message} 
                currentShift={shift} 
                onCrack={async () => {
                  // Track the crack action for achievements
                  try {
                    const result = trackAction("caesar", "crack");
                    if (result && result.length > 0) {
                      setNewAchievements(result);
                    }
                  } catch (error) {
                    console.warn("Achievement tracking failed:", error);
                  }
                }}
              />
            </>
          ) : (
            <CipherResult
              output={output}
              visualizer={
                <AnimatedMapping
                  from={mode === "encrypt" ? ALPHABET.split("") : shiftedAlphabet}
                  to={mode === "encrypt" ? shiftedAlphabet : ALPHABET.split("")}
                  highlightChar={currentCharToHighlight}
                  direction={mode === "encrypt" ? "down" : "up"}
                />
              }
            />
          )}

        {/* Step-by-Step Animation Section */}
        {mode !== "crack" && (
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
                onPlayingChange={setIsStepAnimationPlaying}
                mode={mode}
                cipherType="caesar"
                title={`Caesar Cipher - Shift ${shift}`}
                speed={1000}
              />
            )}
          </div>
        )}

        <div className="pt-4 border-t mt-4 space-y-4">
          <h3 className="text-lg font-semibold mb-3 text-fg flex items-center">
            🏛️ How It Works: Caesar Cipher
          </h3>

          <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
            <h4 className="font-semibold text-primary mb-2 flex items-center">
              📜 The Secret Alphabet Strips
            </h4>
            <p className="text-sm text-muted-fg mb-3">
              Imagine you're a Roman spy with two magic alphabet strips:
            </p>

            <div className="bg-bg p-3 rounded mb-3 border-2 border-dashed border-primary/30">
              <div className="text-center">
                  {mode === "encrypt" ? (
                    <>
                      <div className="text-xs text-muted-fg mb-1">
                        🔤 Normal Alphabet
                      </div>
                      <div className="font-mono text-sm tracking-wider bg-muted p-2 rounded">
                        A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
                      </div>
                      <div className="my-2 text-primary">
                        ↓ Slide by {shift} positions ↓
                      </div>
                      <div className="text-xs text-muted-fg mb-1">
                        🔐 Secret Alphabet
                      </div>
                      <div className="font-mono text-sm tracking-wider bg-primary/10 p-2 rounded text-primary">
                        {shiftedAlphabet.join(" ")}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-muted-fg mb-1">
                        🔐 Secret Alphabet
                      </div>
                      <div className="font-mono text-sm tracking-wider bg-primary/10 p-2 rounded text-primary">
                        {shiftedAlphabet.join(" ")}
                      </div>
                      <div className="my-2 text-primary">
                        ↑ Slide back by {shift} positions ↑
                      </div>
                      <div className="text-xs text-muted-fg mb-1">
                        🔤 Normal Alphabet
                      </div>
                      <div className="font-mono text-sm tracking-wider bg-muted p-2 rounded">
                        A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
                      </div>
                    </>
                  )}
                </div>
            </div>
          </div>

          <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
            <h4 className="font-semibold text-success mb-2 flex items-center">
              🎯 {mode === "encrypt" ? "How to Encode a Message" : "How to Decode a Message"}
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-muted-fg">
                <span className="font-semibold">Step 1:</span> Pick your secret
                shift number (like {shift})
              </p>
              {mode === "encrypt" ? (
                <>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 2:</span> For each letter
                    in your message, find it in the normal alphabet
                  </p>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 3:</span> Look directly
                    below it in the secret alphabet
                  </p>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 4:</span> Replace your
                    letter with the secret one!
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 2:</span> For each letter
                    in your secret message, find it in the secret alphabet
                  </p>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 3:</span> Look directly
                    above it to find the normal alphabet letter
                  </p>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 4:</span> Replace the
                    secret letter with the normal one!
                  </p>
                </>
              )}
            </div>

            <div className="mt-3 p-3 bg-bg rounded border-2 border-dashed border-success/30">
              <div className="text-center">
                <div className="text-sm font-semibold text-success mb-2">
                  🧩 Example with shift {shift}:
                </div>
                <div className="font-mono text-lg">
                  {mode === "encrypt" ? (
                    <>
                      <span className="bg-warning/20 px-2 py-1 rounded mr-2">
                        HELLO
                      </span>
                      <span className="text-success">→</span>
                      <span className="bg-success/20 px-2 py-1 rounded ml-2">
                        {caesarCipher("HELLO", shift, false)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="bg-warning/20 px-2 py-1 rounded mr-2">
                        {caesarCipher("HELLO", shift, false)}
                      </span>
                      <span className="text-success">→</span>
                      <span className="bg-success/20 px-2 py-1 rounded ml-2">
                        HELLO
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {mode === "encrypt" ? (
            <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
              <h4 className="font-semibold text-accent mb-2 flex items-center">
                🔄 To Decode (Decrypt)
              </h4>
              <p className="text-sm text-muted-fg mb-2">
                Just do the opposite! Slide the alphabet strip back by the same
                number of steps. If you encoded with shift {shift}, decode with
                shift {shift}.
              </p>
              <div className="text-center">
                <div className="inline-block bg-bg p-2 rounded border-2 border-dashed border-accent/30">
                  <span className="text-accent font-mono">
                    🔑 Same key, reverse direction!
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
              <h4 className="font-semibold text-accent mb-2 flex items-center">
                🔄 To Encode (Encrypt)
              </h4>
              <p className="text-sm text-muted-fg mb-2">
                Just do the opposite! Slide the alphabet strip forward by the same
                number of steps. If you decoded with shift {shift}, encode with
                shift {shift}.
              </p>
              <div className="text-center">
                <div className="inline-block bg-bg p-2 rounded border-2 border-dashed border-accent/30">
                  <span className="text-accent font-mono">
                    🔑 Same key, opposite direction!
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-warning/10 p-4 rounded-lg border-l-4 border-warning">
            <h4 className="font-semibold text-warning mb-2 flex items-center">
              🎮 Try It Yourself!
            </h4>
            <p className="text-sm text-muted-fg">
              Use the slider above to change your shift number and watch the
              {mode === "encrypt" ? " secret" : " cipher"} alphabet change! Then type a message and click "
              {mode === "encrypt" ? "Encrypt" : "Decrypt"}" to see the
              step-by-step animation.
            </p>
          </div>
          
          <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
            <h4 className="font-semibold text-accent mb-2 flex items-center">
              🕵️‍♀️ Crack the Code!
            </h4>
            <p className="text-sm text-muted-fg mb-3">
              Switch to "Crack" mode to see all 26 possible shifts at once! This shows 
              how easy it is to break a Caesar cipher through "brute force" - trying 
              every possible key until you find one that makes sense.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-accent">Fact: Caesar used shift 3</div>
              <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-accent">Spies needed better ciphers</div>
              <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-accent">Easy for computers to crack</div>
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
