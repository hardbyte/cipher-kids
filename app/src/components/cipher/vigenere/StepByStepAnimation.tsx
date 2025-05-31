import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALPHABET } from "@/utils/ciphers";

interface StepByStepAnimationProps {
  message: string;
  keyword: string;
  mode: "encrypt" | "decrypt";
  isPlaying: boolean;
  onComplete: () => void;
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
  message,
  keyword,
  mode,
  isPlaying,
  onComplete,
  speed = 2500,
  initialStep = -1,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isManualControl, setIsManualControl] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationInterval, setAnimationInterval] = useState<number | null>(null);

  // Generate animation steps
  useEffect(() => {
    const cleanMessage = message.toUpperCase().replace(/[^A-Z]/g, "");
    const cleanKeyword = keyword.toUpperCase().replace(/[^A-Z]/g, "");
    
    if (!cleanMessage || !cleanKeyword) {
      setSteps([]);
      return;
    }

    const newSteps: AnimationStep[] = [];
    let keyIndex = 0;

    for (let i = 0; i < cleanMessage.length; i++) {
      const messageChar = cleanMessage[i];
      const keyChar = cleanKeyword[keyIndex % cleanKeyword.length];
      const shift = ALPHABET.indexOf(keyChar);
      
      let resultChar: string;
      if (mode === "encrypt") {
        const messageIndex = ALPHABET.indexOf(messageChar);
        resultChar = ALPHABET[(messageIndex + shift) % 26];
      } else {
        const messageIndex = ALPHABET.indexOf(messageChar);
        resultChar = ALPHABET[(messageIndex - shift + 26) % 26];
      }

      newSteps.push({
        messageChar,
        keyChar,
        shift,
        resultChar,
        position: i,
      });

      keyIndex++;
    }

    setSteps(newSteps);
  }, [message, keyword, mode]);

  // Animation control
  useEffect(() => {
    if (!isPlaying || steps.length === 0 || isManualControl || isPaused) {
      return;
    }

    setCurrentStep(-1);
    setIsComplete(false);
    setIsPaused(false);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          setIsComplete(true);
          clearInterval(interval);
          setAnimationInterval(null);
          setTimeout(onComplete, 500);
          return prev;
        }
      });
    }, speed);

    setAnimationInterval(interval);
    return () => {
      clearInterval(interval);
      setAnimationInterval(null);
    };
  }, [isPlaying, steps, speed, onComplete, isManualControl, isPaused]);

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
    if (animationInterval) {
      clearInterval(animationInterval);
      setAnimationInterval(null);
      setIsPaused(true);
    }
  };

  const resumeAnimation = () => {
    if (isPaused && currentStep < steps.length - 1) {
      setIsPaused(false);
      
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsComplete(true);
            clearInterval(interval);
            setAnimationInterval(null);
            setTimeout(onComplete, 500);
            return prev;
          }
        });
      }, speed);
      
      setAnimationInterval(interval);
    }
  };

  const startAnimation = () => {
    setIsManualControl(true);
    setCurrentStep(-1);
    setIsComplete(false);
    setIsPaused(false);
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          setIsComplete(true);
          clearInterval(interval);
          setAnimationInterval(null);
          return prev;
        }
      });
    }, speed);
    
    setAnimationInterval(interval);
  };

  if (steps.length === 0) {
    return (
      <div className="text-center text-muted-fg p-8">
        <p>Enter a message and keyword to see the step-by-step animation</p>
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
                    Position: {ALPHABET.indexOf(steps[currentStep].messageChar) + 1}
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
                    Shift: {mode === "encrypt" ? "+" : "-"}{steps[currentStep].shift}
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
                    Position: {ALPHABET.indexOf(steps[currentStep].resultChar) + 1}
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
                  ({ALPHABET.indexOf(steps[currentStep].messageChar) + 1} {mode === "encrypt" ? "+" : "-"} {steps[currentStep].shift} = {ALPHABET.indexOf(steps[currentStep].resultChar) + 1})
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
            if (animationInterval) {
              clearInterval(animationInterval);
              setAnimationInterval(null);
            }
            setCurrentStep(-1);
            setIsComplete(false);
            setIsPaused(false);
            setIsManualControl(true);
          }}
          className="px-3 py-2 bg-muted rounded-md text-muted-fg hover:bg-muted/80 text-sm"
        >
          🔄 Reset
        </button>
        
        {!isPaused && !isComplete ? (
          <button
            onClick={currentStep === -1 ? startAnimation : pauseAnimation}
            className="px-3 py-2 bg-primary rounded-md text-primary-fg hover:bg-primary/80 text-sm"
          >
            {currentStep === -1 ? "▶️ Start" : "⏸️ Pause"}
          </button>
        ) : (
          <button
            onClick={resumeAnimation}
            className="px-3 py-2 bg-primary rounded-md text-primary-fg hover:bg-primary/80 text-sm"
            disabled={isComplete}
          >
            ▶️ Resume
          </button>
        )}
      </div>

      {/* Navigation controls */}
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={() => {
            setIsManualControl(true);
            goToPrevStep();
          }}
          className="px-4 py-2 bg-muted rounded-md text-muted-fg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentStep <= 0}
        >
          Previous Step
        </button>
        <button
          onClick={() => {
            setIsManualControl(true);
            goToNextStep();
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
              goToStep(index);
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