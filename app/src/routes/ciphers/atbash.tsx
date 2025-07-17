import { useState, useEffect, useCallback } from "react";
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

export const Route = createFileRoute("/ciphers/atbash")({
  component: AtbashCipherPage,
});

function AtbashCipherPage() {
  const [mode, setMode] = useState<"encrypt" | "decrypt" | "crack">("encrypt");
  const [message, setMessage] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentCharToHighlight, setCurrentCharToHighlight] = useState<
    string | undefined
  >(undefined);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const [isStepAnimationPlaying, setIsStepAnimationPlaying] = useState(false);
  
  // Use the sample messages hook
  useSampleMessages();

  // Create Atbash alphabet mapping for visualization
  const ALPHABET_FALLBACK = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const alphabet = ALPHABET || ALPHABET_FALLBACK;

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
      
      if (alphabet.includes(char)) {
        const charIndex = alphabet.indexOf(char);
        const transformedChar = alphabet[25 - charIndex];

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
  }, [message, alphabet]);

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
  }, [mode, message, output, generateAnimationSteps]); // Only respond to mode changes

  // Handle message changes separately
  useEffect(() => {
    setOutput("");
    setCurrentCharToHighlight(undefined);
    setShowStepByStep(false);
    generateAnimationSteps();
  }, [message, output, generateAnimationSteps]);

  const handleAction = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setOutput("");
    setCurrentCharToHighlight(undefined);

    // Using environment-aware delay function
    
    // Get the full result using the utility function to ensure consistency
    const fullResult = atbashCipher(message);
    let currentAnimatedOutput = "";

    for (let i = 0; i < message.length; i++) {
      const char = message[i];
      const upperChar = char.toUpperCase();

      if (alphabet.includes(upperChar)) {
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

    setCurrentCharToHighlight(undefined);
    setIsAnimating(false);
  };

  const handleInstantAction = () => {
    if (isAnimating) return;
    
    // Use the utility function for consistency
    const result = atbashCipher(message);
    setOutput(result);
    setCurrentCharToHighlight(undefined);
  };

  const handleCrack = () => {
    // For Atbash, cracking is just applying the cipher again (self-inverse)
    handleInstantAction();
  };


  return (
    <CipherPageContentWrapper>
      <CipherNav activeCipher="atbash" />

        {/* Header */}
        <div className="text-center space-y-4">
          <p className="text-lg lg:text-xl text-muted-fg max-w-3xl mx-auto">
            The ancient mirror alphabet cipher where A becomes Z, B becomes Y, and so on.
            Used in biblical cryptography over 2,500 years ago! 📜
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
              <h3 className="text-xl font-semibold text-accent">📚 About Atbash</h3>
              <div className="space-y-2 text-secondary-fg">
                <p>
                  <strong>No Key Needed!</strong> The Atbash cipher is special because encryption 
                  and decryption are the same operation.
                </p>
                <p>
                  <strong>Historical:</strong> Used in ancient Hebrew texts and biblical manuscripts.
                  The name comes from the first (Aleph-Taw) and last (Beth-Shin) Hebrew letters.
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
                from={mode === "decrypt" ? alphabet.split("").map((char, i) => alphabet[25 - i]) : alphabet.split("")}
                to={mode === "decrypt" ? alphabet.split("") : alphabet.split("").map((char, i) => alphabet[25 - i])}
                highlightChar={currentCharToHighlight}
                direction={mode === "decrypt" ? "up" : "down"}
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
    </CipherPageContentWrapper>
  );
}