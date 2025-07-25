import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatedMapping } from "@/components/cipher/AnimatedMapping";
import { CipherNav } from "@/components/cipher/CipherNav";
import { CipherPageContentWrapper } from "@/components/cipher/CipherPageContentWrapper";
import { CipherInputs } from "@/components/cipher/CipherInputs";
import { CipherModeToggle } from "@/components/cipher/CipherModeToggle";
import { CipherResult } from "@/components/cipher/results/CipherResult";
import { GeneralStepByStepAnimation, AnimationStep } from "@/components/cipher/shared/GeneralStepByStepAnimation";
import { CrackButton } from "@/components/cipher/CrackButton";
import { useSampleMessages } from "@/hooks/useSampleMessages";
import { ALPHABET, atbashCipher } from "@/utils/ciphers";
import { createDelay, ANIMATION_TIMINGS } from "@/utils/animation-config";
import { createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/hooks/use-progress";
import { AchievementNotification } from "@/components/achievement-notification";

// Types
type CipherMode = "encrypt" | "decrypt" | "crack";

// Constants
const ATBASH_INFO = {
  TITLE: "📚 About Atbash",
  WIKI_URL: "https://en.wikipedia.org/wiki/Atbash",
  DESCRIPTION: "The ancient mirror alphabet cipher where A becomes Z, B becomes Y, and so on. Used in biblical cryptography over 2,500 years ago! 📜"
} as const;

export const Route = createFileRoute("/ciphers/atbash")({
  component: AtbashCipherPage,
});

function AtbashCipherPage() {
  const { trackAction } = useProgress();
  const [mode, setMode] = useState<CipherMode>("encrypt");
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentCharToHighlight, setCurrentCharToHighlight] = useState<string | undefined>(undefined);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const [isStepAnimationPlaying, setIsStepAnimationPlaying] = useState(false);
  
  // Use the sample messages hook
  useSampleMessages();

  // Memoize alphabet arrays to avoid recreation on every render
  const alphabetArrays = useMemo(() => ({
    normal: ALPHABET.split(""),
    reversed: ALPHABET.split("").reverse()
  }), []);

  // Memoize the animated mapping props based on mode
  const animatedMappingProps = useMemo(() => ({
    from: mode === "decrypt" ? alphabetArrays.reversed : alphabetArrays.normal,
    to: mode === "decrypt" ? alphabetArrays.normal : alphabetArrays.reversed,
    direction: mode === "decrypt" ? "up" as const : "down" as const
  }), [mode, alphabetArrays]);

  // Helper function to safely track achievements
  const trackAchievement = useCallback((actionType: "encode" | "decode" | "crack") => {
    try {
      const result = trackAction("atbash", actionType);
      if (result && result.length > 0) {
        setNewAchievements(result);
      }
    } catch (error) {
      console.warn("Achievement tracking failed:", error);
    }
  }, [trackAction]);

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
        const charIndex = ALPHABET.indexOf(char);
        const transformedChar = ALPHABET[25 - charIndex];

        steps.push({
          originalChar: char,
          transformedChar,
          position: i,
          shift: 0, // Not applicable for Atbash, but required by interface
          explanation: `${char} ↔ ${transformedChar} (mirror position)`,
        });
      }
    }

    setAnimationSteps(steps);
  }, [message]);

  // Handle mode changes - auto-populate input with previous result for better UX
  useEffect(() => {
    // If we have an output and the mode changed, use it as the new input
    if (output && output !== message) {
      setMessage(output);
    }
    
    setOutput("");
    setCurrentCharToHighlight(undefined);
    setShowStepByStep(false);
    generateAnimationSteps();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally excluding output to prevent infinite loops
  }, [mode]); // Only respond to mode changes

  // Handle message changes separately
  useEffect(() => {
    setOutput("");
    setCurrentCharToHighlight(undefined);
    setShowStepByStep(false);
    generateAnimationSteps();
  }, [message, generateAnimationSteps]);

  const handleAction = useCallback(async () => {
    if (isAnimating || !message.trim()) return;

    setIsAnimating(true);
    setOutput("");
    setCurrentCharToHighlight(undefined);

    try {
      // Get the full result using the utility function to ensure consistency
      const fullResult = atbashCipher(message);
      let currentAnimatedOutput = "";

      for (let i = 0; i < message.length; i++) {
        const char = message[i];
        const upperChar = char.toUpperCase();

        if (ALPHABET.includes(upperChar)) {
          // Highlight the character being processed
          setCurrentCharToHighlight(upperChar);
          await createDelay(ANIMATION_TIMINGS.STEP_REVEAL);

          // Show the mirror transformation visually by briefly highlighting both chars
          await createDelay(ANIMATION_TIMINGS.STEP_REVEAL);

          // Add the character from the full result to ensure consistency
          currentAnimatedOutput += fullResult[i];
          setOutput(currentAnimatedOutput);
          await createDelay(ANIMATION_TIMINGS.CHARACTER_PROCESS);
        } else {
          // Non-alphabetic characters
          currentAnimatedOutput += fullResult[i];
          setOutput(currentAnimatedOutput);
          await createDelay(ANIMATION_TIMINGS.NON_ALPHA_CHARACTER);
        }
      }

      // Track the action for achievements
      if (currentAnimatedOutput) {
        trackAchievement(mode === "encrypt" ? "encode" : "decode");
      }
    } catch (error) {
      console.error("Animation error:", error);
      // Fallback: show the result without animation
      setOutput(atbashCipher(message));
    } finally {
      setCurrentCharToHighlight(undefined);
      setIsAnimating(false);
    }
  }, [isAnimating, message, mode, trackAchievement]);


  const handleCrack = useCallback(() => {
    // For Atbash, cracking is just applying the cipher again (self-inverse)
    if (isAnimating || !message.trim()) return;
    
    try {
      const result = atbashCipher(message);
      setOutput(result);
      setCurrentCharToHighlight(undefined);
      
      // Track the crack action for achievements
      if (result) {
        trackAchievement("crack");
      }
    } catch (error) {
      console.error("Crack operation failed:", error);
    }
  }, [isAnimating, message, trackAchievement]);


  return (
    <CipherPageContentWrapper>
      <CipherNav activeCipher="atbash" />

        {/* Header */}
        <div className="text-center space-y-4">
          <p className="text-lg lg:text-xl text-muted-fg max-w-3xl mx-auto">
            {ATBASH_INFO.DESCRIPTION}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <CipherModeToggle
            mode={mode}
            setMode={(newMode) => {
              if (!isAnimating) setMode(newMode);
            }}
          />
        </div>

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
                label="Crack the Code (Apply Atbash)"
                description="For Atbash, cracking is the same as decrypting - just apply the cipher again!"
              />
            )}

            {/* Educational Info */}
            <div className="bg-secondary rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold text-accent">{ATBASH_INFO.TITLE}</h3>
              <div className="space-y-2 text-secondary-fg">
                <p>
                  <strong>No Key Needed!</strong> The Atbash cipher is special because encryption 
                  and decryption are the same operation.
                </p>
                <p>
                  <strong>Biblical Origins:</strong> Used in ancient Hebrew texts around the 6th century BCE. 
                  Found in the Bible - Jeremiah used "Sheshach" as Atbash code for "Babylon"! 
                  The name comes from Hebrew letters: Aleph-Taw-Beth-Shin.{' '}
                  <a 
                    href={ATBASH_INFO.WIKI_URL}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    (Learn more)
                  </a>
                </p>
                <p>
                  <strong>How it works:</strong> Each letter is replaced with its mirror position in the alphabet.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Visualization and Output */}
          <div className="space-y-6">
            {/* Alphabet Mapping */}
            <div className="bg-secondary rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-center text-warning">
                🪞 Mirror Alphabet {mode === "decrypt" ? "(Reversed)" : ""}
              </h3>
              <AnimatedMapping
                from={animatedMappingProps.from}
                to={animatedMappingProps.to}
                highlightChar={currentCharToHighlight}
                direction={animatedMappingProps.direction}
                highlightMode="source-only"
              />
            </div>

            {/* Output */}
            <CipherResult
              output={output}
              mode={mode}
              isAnimating={isAnimating}
            />

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
                    cipherType="atbash"
                    title="🔍 Atbash Step-by-Step"
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