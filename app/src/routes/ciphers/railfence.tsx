import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CipherNav } from "@/components/cipher/CipherNav";
import { CipherInputs } from "@/components/cipher/CipherInputs";
import { CipherModeToggle } from "@/components/cipher/CipherModeToggle";
import { CipherResult } from "@/components/cipher/results/CipherResult";
import { GeneralStepByStepAnimation, AnimationStep } from "@/components/cipher/shared/GeneralStepByStepAnimation";
import { Slider } from "@/components/ui/slider";
import { CrackButton } from "@/components/cipher/CrackButton";
import { useSampleMessages } from "@/hooks/useSampleMessages";
import { railFenceCipher } from "@/utils/ciphers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ciphers/railfence")({
  component: RailFenceCipherPage,
});

function RailFenceCipherPage() {
  const [mode, setMode] = useState<"encrypt" | "decrypt" | "crack">("encrypt");
  const [message, setMessage] = useState<string>("");
  const [rails, setRails] = useState<number>(3);
  const [output, setOutput] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const [isStepAnimationPlaying, setIsStepAnimationPlaying] = useState(false);
  const [crackResults, setCrackResults] = useState<Array<{rails: number, result: string}>>([]);
  
  // Use the sample messages hook
  const { getRandomMessage } = useSampleMessages();

  // Generate Rail Fence visualization data
  const generateRailVisualization = useCallback((text: string, numRails: number) => {
    if (!text || numRails <= 1) return [];
    
    const cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
    const rails: Array<Array<{char: string, position: number}>> = Array.from(
      { length: numRails }, 
      () => []
    );
    
    let rail = 0;
    let direction = 1;
    
    for (let i = 0; i < cleanText.length; i++) {
      rails[rail].push({ char: cleanText[i], position: i });
      
      if (rail === 0) {
        direction = 1;
      } else if (rail === numRails - 1) {
        direction = -1;
      }
      
      rail += direction;
    }
    
    return rails;
  }, []);

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

  // Reset animation states if mode, message, or rails change
  useEffect(() => {
    setOutput("");
    setShowStepByStep(false);
    setCrackResults([]);
    generateAnimationSteps();
  }, [mode, message, rails, generateAnimationSteps]);

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
  };

  // Load a sample message
  const loadSample = () => {
    const randomSample = getRandomMessage();
    setMessage(randomSample);
  };

  const railVisualization = generateRailVisualization(
    message.toUpperCase().replace(/[^A-Z]/g, ''), 
    rails
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
        <CipherNav activeCipher="railfence" />

        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-red-600">Rail Fence Cipher</h1>
          <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">
            Write your message in a zigzag pattern across multiple "rails" 🚂
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
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold text-blue-400">🧠 About Rail Fence</h3>
              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>Transposition Cipher:</strong> Unlike substitution ciphers, this scrambles the position of letters rather than changing them.
                </p>
                <p>
                  <strong>How it works:</strong> Write letters in a zigzag pattern across {rails} rails, then read each rail left-to-right.
                </p>
                <p>
                  <strong>Historical:</strong> Used in classical cryptography for simple field communications.
                </p>
              </div>
              
              <button
                onClick={loadSample}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors text-white"
              >
                🎲 Try Sample Message
              </button>
            </div>
          </div>

          {/* Right Column - Visualization and Output */}
          <div className="space-y-6">
            {/* Rail Fence Visualization */}
            {railVisualization.length > 0 && (
              <motion.div 
                className="bg-gray-800 rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-xl font-semibold mb-4 text-center text-yellow-400">
                  🚂 Zigzag Pattern ({rails} Rails)
                </h3>
                <div className="space-y-3 font-mono text-center">
                  <AnimatePresence mode="wait">
                    {railVisualization.map((rail, railIndex) => (
                      <motion.div 
                        key={`${rails}-${railIndex}`}
                        className="flex justify-center items-center min-h-8"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: railIndex * 0.1,
                          ease: "easeOut"
                        }}
                      >
                        <span className="text-yellow-300 mr-2 w-12 text-xs lg:text-sm font-semibold">
                          Rail {railIndex + 1}:
                        </span>
                        <div className="flex gap-1 flex-wrap justify-center">
                          {rail.map(({ char, position }, charIndex) => (
                            <motion.span
                              key={`${position}-${char}`}
                              className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-lg"
                              initial={{ 
                                opacity: 0, 
                                scale: 0,
                                y: -20 
                              }}
                              animate={{ 
                                opacity: 1, 
                                scale: 1,
                                y: 0 
                              }}
                              transition={{ 
                                duration: 0.4,
                                delay: railIndex * 0.2 + charIndex * 0.1,
                                ease: "backOut",
                                scale: {
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 20
                                }
                              }}
                              whileHover={{ 
                                scale: 1.1,
                                backgroundColor: "#3b82f6",
                                transition: { duration: 0.2 }
                              }}
                            >
                              {char}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                {/* Add a visual separator showing the reading order */}
                {railVisualization.length > 0 && (
                  <motion.div 
                    className="mt-4 pt-4 border-t border-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: railVisualization.length * 0.2 + 0.5 }}
                  >
                    <p className="text-xs text-gray-400 text-center">
                      💡 Reading order: Rail 1 → Rail 2 → Rail 3 → ...
                    </p>
                  </motion.div>
                )}
              </motion.div>
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
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-green-400">
                    🔍 Step-by-Step
                  </h3>
                  <button
                    onClick={() => setShowStepByStep(!showStepByStep)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors"
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
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-400">🔍 Crack Results</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {crackResults.map(({ rails: r, result }) => (
                <div key={r} className="bg-gray-700 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-yellow-300 font-semibold">
                      {r} Rails:
                    </span>
                    <button
                      onClick={() => setOutput(result)}
                      className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded transition-colors"
                    >
                      Use This
                    </button>
                  </div>
                  <div className="text-gray-100 font-mono break-all">
                    {result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}