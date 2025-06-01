import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DEFAULT_ALPHABET,
  mapCharToNumber,
  mapNumberToChar,
} from "@/utils/ciphers";

interface StepByStepAnimationProps {
  alphabet?: string;
  message: string;
  keyword: string;
  mode: "encrypt" | "decrypt";
  isPlaying: boolean;
  onComplete: () => void;
  onStepChange?: (stepIndex: number) => void;
  speed?: number; // milliseconds between steps
  initialStep?: number;
}

interface AnimationStep {
  messageChar: string;
  keyChar: string;
  shift: number;
  resultChar: string;
  position: number;
}

export const StepByStepAnimation: React.FC<StepByStepAnimationProps> = ({
  alphabet = DEFAULT_ALPHABET,
  message,
  keyword,
  mode,
  isPlaying,
  onComplete,
  onStepChange,
  speed = 2500,
  initialStep = -1,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isManualControl, setIsManualControl] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const animationInterval = useRef<number | null>(null);
  const onStepChangeRef = useRef(onStepChange);
  const onCompleteRef = useRef(onComplete);

  // Generate animation steps
  useEffect(() => {
    const cleanMessage = message
      .toUpperCase()
      .split("")
      .filter((char) => alphabet.includes(char))
      .join("");
    const cleanKeyword = keyword
      .toUpperCase()
      .split("")
      .filter((char) => alphabet.includes(char))
      .join("");
    
    if (!cleanMessage || !cleanKeyword) {
      setSteps([]);
      return;
    }

    const newSteps: AnimationStep[] = [];
    let keyIndex = 0;

    for (let i = 0; i < cleanMessage.length; i++) {
      try {
        const messageChar = cleanMessage[i];
        const keyChar = cleanKeyword[keyIndex % cleanKeyword.length];

        const shift = mapCharToNumber(keyChar, alphabet);
        const messageIndex = mapCharToNumber(messageChar, alphabet);

        let resultChar: string;
        if (mode === "encrypt") {
          resultChar = mapNumberToChar(
            (messageIndex + shift) % alphabet.length,
            alphabet
          );
        } else {
          resultChar = mapNumberToChar(
            (messageIndex - shift + alphabet.length) % alphabet.length,
            alphabet
          );
        }

        newSteps.push({
          messageChar,
          keyChar,
          shift,
          resultChar,
          position: i,
        });

        keyIndex++;
      } catch (error) {
        console.error("Error generating animation step:", error);
        // Skip this character if it's not in the alphabet or causes an error
      }
    }

    setSteps(newSteps);
  }, [message, keyword, mode, alphabet]);

  // Update callback refs when they change
  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  }, [onStepChange]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Animation control
  useEffect(() => {
    // Clear any existing interval first
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
      animationInterval.current = null;
    }

    if (!isPlaying || steps.length === 0 || isManualControl || isPaused) {
      return;
    }

    // Reset state for new animation
    setCurrentStep(-1);
    setIsComplete(false);
    setIsPaused(false);

    // Small delay to ensure state is updated
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) {
            const nextStep = prev + 1;
            if (onStepChangeRef.current) {
              onStepChangeRef.current(nextStep);
            }
            return nextStep;
          } else {
            // Animation complete
            setIsComplete(true);
            if (animationInterval.current) {
              clearInterval(animationInterval.current);
              animationInterval.current = null;
            }
            setTimeout(() => {
              if (onCompleteRef.current) {
                onCompleteRef.current();
              }
            }, 500);
            return prev;
          }
        });
      }, speed);

      animationInterval.current = interval;
    }, 100);

    return () => {
      clearTimeout(startTimeout);
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
        animationInterval.current = null;
      }
    };
  }, [isPlaying, steps.length, speed, isManualControl, isPaused]);

  // Functions for manual navigation
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (currentStep + 1 === steps.length - 1) {
        setIsComplete(true);
      }
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsComplete(false);
    }
  };

  const goToStep = (step: number) => {
    if (step >= -1 && step < steps.length) {
      setCurrentStep(step);
      setIsComplete(step === steps.length - 1);
    }
  };

  const pauseAnimation = () => {
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
      animationInterval.current = null;
      setIsPaused(true);
    }
  };

  const resumeAnimation = () => {
    if (isPaused && currentStep < steps.length - 1) {
      setIsPaused(false);
      
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) {
            const nextStep = prev + 1;
            if (onStepChangeRef.current) {
              onStepChangeRef.current(nextStep);
            }
            return nextStep;
          } else {
            setIsComplete(true);
            if (animationInterval.current) {
              clearInterval(animationInterval.current);
              animationInterval.current = null;
            }
            setTimeout(onComplete, 500); // Prop onComplete used here
            return prev;
          }
        });
      }, speed);
      
      animationInterval.current = interval;
    }
  };

  const startAnimation = () => {
    setIsManualControl(true); // Should this be false when auto-starting?
    setCurrentStep(-1);
    setIsComplete(false);
    setIsPaused(false);
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          if (onStepChangeRef.current) { // Call onStepChange during manual start as well
            onStepChangeRef.current(prev + 1);
          }
          return prev + 1;
        } else {
          setIsComplete(true);
          if (animationInterval.current) {
            clearInterval(animationInterval.current);
            animationInterval.current = null;
          }
          setTimeout(onCompleteRef.current, 500); // Use ref for onComplete
          return prev;
        }
      });
    }, speed);
    
    animationInterval.current = interval;
  };

  if (steps.length === 0) {
    return (
      <div className="text-center text-muted-fg p-8">
        <p>Enter a message and keyword (using the current alphabet) to see the step-by-step animation</p>
      </div>
    );
  }

  return (
    <div className="bg-muted/5 rounded-lg p-6 border border-muted">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-primary mb-2">
          Step-by-Step {mode === "encrypt" ? "Encryption" : "Decryption"}
        </h3>
        <p className="text-sm text-muted-fg">
          Watch how each letter is {mode === "encrypt" ? "encrypted" : "decrypted"} using the keyword
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-fg mb-2">
          <span>Progress</span>
          <span>{currentStep + 1} / {steps.length}</span>
        </div>
        <div 
          className="w-full bg-muted/30 rounded-full h-4 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            const stepIndex = Math.floor(percentage * steps.length);
            setIsManualControl(true);
            goToStep(stepIndex < 0 ? 0 : stepIndex);
          }}
        >
          <motion.div
            className="h-4 bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ 
              width: currentStep >= 0 ? `${((currentStep + 1) / steps.length) * 100}%` : "0%" 
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Current step display */}
      <AnimatePresence mode="wait">
        {currentStep >= 0 && currentStep < steps.length && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <div className="bg-bg rounded-lg p-4 border-2 border-primary/30">
              <div className="text-center mb-4">
                <span className="text-sm text-muted-fg">Step {currentStep + 1}:</span>
                <h4 className="text-lg font-semibold text-primary">
                  {mode === "encrypt" ? "Encrypting" : "Decrypting"} letter "{steps[currentStep].messageChar}"
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                {/* Input letter */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-fg">
                    {mode === "encrypt" ? "Plaintext" : "Ciphertext"}
                  </div>
                  <motion.div
                    className="w-16 h-16 mx-auto bg-info/20 border-2 border-info rounded-lg flex items-center justify-center text-2xl font-bold text-info-fg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {steps[currentStep].messageChar}
                  </motion.div>
                  <div className="text-xs text-muted-fg">
                    Position: {mapCharToNumber(steps[currentStep].messageChar, alphabet) + 1}
                  </div>
                </div>

                {/* Key letter */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-fg">Key Letter</div>
                  <motion.div
                    className="w-16 h-16 mx-auto bg-warning/20 border-2 border-warning rounded-lg flex items-center justify-center text-2xl font-bold text-warning-fg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {steps[currentStep].keyChar}
                  </motion.div>
                  <div className="text-xs text-muted-fg">
                    Shift value: {steps[currentStep].shift} (from '{steps[currentStep].keyChar}')
                  </div>
                </div>

                {/* Result letter */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-fg">
                    {mode === "encrypt" ? "Ciphertext" : "Plaintext"}
                  </div>
                  <motion.div
                    className="w-16 h-16 mx-auto bg-success/20 border-2 border-success rounded-lg flex items-center justify-center text-2xl font-bold text-success-fg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {steps[currentStep].resultChar}
                  </motion.div>
                  <div className="text-xs text-muted-fg">
                    Position: {mapCharToNumber(steps[currentStep].resultChar, alphabet) + 1}
                  </div>
                </div>
              </div>

              {/* Calculation display */}
              <motion.div
                className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="text-center font-mono text-lg">
                  {mode === "encrypt" ? (
                    <>
                      <span className="text-info-fg">{steps[currentStep].messageChar}</span>
                      <span className="text-muted-fg mx-2">+</span>
                      <span className="text-warning-fg">{steps[currentStep].keyChar}</span>
                      <span className="text-muted-fg mx-2">=</span>
                      <span className="text-success-fg font-bold">{steps[currentStep].resultChar}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-info-fg">{steps[currentStep].messageChar}</span>
                      <span className="text-muted-fg mx-2">-</span>
                      <span className="text-warning-fg">{steps[currentStep].keyChar}</span>
                      <span className="text-muted-fg mx-2">=</span>
                      <span className="text-success-fg font-bold">{steps[currentStep].resultChar}</span>
                    </>
                  )}
                </div>
                <div className="text-center text-xs text-muted-fg mt-2">
                  (idx {mapCharToNumber(steps[currentStep].messageChar, alphabet)}) {" "}
                  {mode === "encrypt" ? "+" : "-"} (shift {steps[currentStep].shift}) {" "}
                  % {alphabet.length} = (idx {mapCharToNumber(steps[currentStep].resultChar, alphabet)})
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input display */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-fg">
            {mode === "encrypt" ? "Original Message:" : "Encrypted Message:"}
          </div>
          <div className="flex flex-wrap gap-1 p-3 bg-info/5 rounded-lg border border-info/30">
            {steps.map((step, index) => (
              <motion.span
                key={`input-${index}`}
                className={`w-8 h-8 flex items-center justify-center rounded font-mono text-sm border ${
                  index <= currentStep
                    ? "bg-info/20 border-info text-info-fg"
                    : "bg-muted/20 border-muted text-muted-fg"
                }`}
                initial={{ opacity: 0.3 }}
                animate={{ 
                  opacity: index <= currentStep ? 1 : 0.3,
                  scale: index === currentStep ? 1.1 : 1 
                }}
                transition={{ duration: 0.2 }}
              >
                {step.messageChar}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Output display */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-fg">
            {mode === "encrypt" ? "Encrypted Result:" : "Decrypted Result:"}
          </div>
          <div className="flex flex-wrap gap-1 p-3 bg-success/5 rounded-lg border border-success/30">
            {steps.map((step, index) => (
              <motion.span
                key={`output-${index}`}
                className={`w-8 h-8 flex items-center justify-center rounded font-mono text-sm border ${
                  index <= currentStep
                    ? "bg-success/20 border-success text-success-fg font-bold"
                    : "bg-muted/20 border-muted text-muted-fg"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: index <= currentStep ? 1 : 0.3,
                  scale: index <= currentStep ? 1 : 0.8 
                }}
                transition={{ duration: 0.3, delay: index <= currentStep ? 0.1 : 0 }}
              >
                {index <= currentStep ? step.resultChar : "?"}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Animation controls */}
      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => {
            if (animationInterval) { // Check if animationInterval itself is not null
              if (animationInterval.current) {
                clearInterval(animationInterval.current);
                animationInterval.current = null;
              }
            }
            setCurrentStep(-1);
            setIsComplete(false);
            setIsPaused(false);
            setIsManualControl(true); // Set to true to stop any ongoing auto-play
            if(onStepChangeRef.current) onStepChangeRef.current(-1); // Notify parent of reset
          }}
          className="px-3 py-2 bg-muted rounded-md text-muted-fg hover:bg-muted/80 text-sm"
        >
          🔄 Reset
        </button>
        
        {!isPaused && !isComplete && isPlaying ? ( // Only show Pause if playing
          <button
            onClick={pauseAnimation}
            className="px-3 py-2 bg-primary rounded-md text-primary-fg hover:bg-primary/80 text-sm"
          >
            ⏸️ Pause
          </button>
        ) : (
          <button
            onClick={() => {
              if (isPaused) {
                setIsManualControl(false); // Resume auto-play
                resumeAnimation();
              } else {
                 setIsManualControl(false); // Start auto-play
                 // Ensure isPlaying prop is true or handle internally
                 // For now, assume parent controls isPlaying for initial start
                 // This button might be better as a "Play" that respects isPlaying prop
                 // or we trigger parent's play function.
                 // For simplicity, if currentStep is -1, it implies a fresh start.
                 if (currentStep === -1) {
                    setCurrentStep(-1); // Reset to trigger useEffect for playing
                    setIsComplete(false);
                    setIsPaused(false);
                 } else { // If not paused and not -1, it means it was manually stepped. Resume from here.
                    resumeAnimation();
                 }
              }
            }}
            className="px-3 py-2 bg-primary rounded-md text-primary-fg hover:bg-primary/80 text-sm"
            disabled={isComplete || !isPlaying && currentStep !== -1} // Disable if complete or if not playing and not at start
          >
            ▶️ {isPaused || currentStep !== -1 ? "Resume" : "Play"}
          </button>
        )}
      </div>

      {/* Navigation controls */}
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={() => {
            setIsManualControl(true);
            pauseAnimation(); // Pause auto-play if active
            goToPrevStep();
            if(onStepChangeRef.current) onStepChangeRef.current(currentStep > 0 ? currentStep -1 : 0);
          }}
          className="px-4 py-2 bg-muted rounded-md text-muted-fg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentStep <= 0}
        >
          Previous Step
        </button>
        <button
          onClick={() => {
            setIsManualControl(true);
            pauseAnimation(); // Pause auto-play if active
            goToNextStep();
            if(onStepChangeRef.current) onStepChangeRef.current(currentStep < steps.length -1 ? currentStep + 1 : steps.length -1);
          }}
          className="px-4 py-2 bg-primary rounded-md text-primary-fg hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentStep >= steps.length - 1}
        >
          Next Step
        </button>
      </div>

      {/* Step selector */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsManualControl(true);
              pauseAnimation(); // Pause auto-play if active
              goToStep(index);
              if(onStepChangeRef.current) onStepChangeRef.current(index);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
              currentStep === index
                ? "bg-primary text-primary-fg"
                : currentStep > index
                ? "bg-primary/30 text-primary-fg"
                : "bg-muted text-muted-fg"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Completion message */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-success/10 rounded-lg border border-success/30 text-center"
          >
            <div className="text-success-fg font-semibold mb-2">
              🎉 {mode === "encrypt" ? "Encryption" : "Decryption"} Complete!
            </div>
            <div className="text-sm text-muted-fg">
              {mode === "encrypt" 
                ? "Your message has been successfully encrypted using the Vigenère cipher."
                : "Your message has been successfully decrypted back to its original form."
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};