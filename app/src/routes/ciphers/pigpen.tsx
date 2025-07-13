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

export const Route = createFileRoute("/ciphers/pigpen")({
  component: PigpenCipherPage,
});

function PigpenCipherPage() {
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
  };

  const handleCrack = () => {
    // In crack mode, we just decrypt.
    const result = pigpenCipher(message, true);
    setOutput(result);
  };

  return (
    <CipherPageContentWrapper>
      <CipherNav activeCipher="pigpen" />
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">Pigpen Cipher</h1>
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
                <strong>Spy History:</strong> This cipher was used by the Freemasons in the 18th century to keep their messages secret!
              </p>
            </div>
          </div>

          <div className="pt-4 border-t mt-4 space-y-4">
            <h3 className="text-lg font-semibold mb-3 text-fg flex items-center">
              🐷 How It Works: The Pigpen Grid
            </h3>
            <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
              <h4 className="font-semibold text-primary mb-2 flex items-center">
                Drawing the Secret Shapes
              </h4>
              <p className="text-sm text-muted-fg mb-3">
                Imagine drawing a tic-tac-toe board, and then another one with dots in each space. That's the whole secret to the Pigpen cipher!
              </p>
              <div className="text-center">
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
    </CipherPageContentWrapper>
  );
}
