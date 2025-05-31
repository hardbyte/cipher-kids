import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export interface AnimationStep {
  originalChar: string;
  transformedChar: string;
  position: number;
  shift?: number;
  keyChar?: string;
  explanation?: string;
}

export interface GeneralStepByStepAnimationProps {
  steps: AnimationStep[];
  isPlaying: boolean;
  onComplete: () => void;
  onStepChange?: (stepIndex: number) => void;
  speed?: number;
  title?: string;
  mode: "encrypt" | "decrypt";
  cipherType: "caesar" | "vigenere" | "keyword";
  initialStep?: number;
}

export const GeneralStepByStepAnimation: React.FC<GeneralStepByStepAnimationProps> = ({
  steps,
  isPlaying,
  onComplete,
  onStepChange,
  speed = 1500,
  title = "Step-by-Step Animation",
  mode,
  cipherType,
  initialStep = -1,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [isComplete, setIsComplete] = useState(false);
  const [isManualControl, setIsManualControl] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Reset when steps change
  useEffect(() => {
    setCurrentStep(initialStep);
    setIsComplete(false);
    setIsPaused(false);
  }, [steps, initialStep]);

  // Animation control
  useEffect(() => {
    if (!isPlaying || steps.length === 0 || isManualControl || isPaused) {
      return;
    }

    setCurrentStep(initialStep);
    setIsComplete(false);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          const nextStep = prev + 1;
          if (onStepChange) {
            onStepChange(nextStep);
          }
          return nextStep;
        } else {
          setIsComplete(true);
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return prev;
        }
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, steps, isManualControl, isPaused, speed, onComplete, onStepChange, initialStep]);

  const handleManualNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (onStepChange) {
        onStepChange(nextStep);
      }
    } else {
      setIsComplete(true);
      onComplete();
    }
  };

  const handleManualPrev = () => {
    if (currentStep > -1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (onStepChange) {
        onStepChange(prevStep);
      }
      setIsComplete(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(initialStep);
    setIsComplete(false);
    setIsPaused(false);
    if (onStepChange) {
      onStepChange(initialStep);
    }
  };

  const currentStepData = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  const getCipherSpecificContent = () => {
    if (!currentStepData) return null;

    switch (cipherType) {
      case "caesar":
        return (
          <div className="text-center space-y-3">
            <div className="text-sm text-muted-fg">
              Caesar Cipher - Shift by {currentStepData.shift}
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="text-2xl font-mono bg-warning/20 px-4 py-2 rounded-lg border-2 border-warning/30">
                {currentStepData.originalChar}
              </div>
              <div className="text-xl text-muted-fg">
                {mode === "encrypt" ? "+" : "-"} {currentStepData.shift}
              </div>
              <div className="text-2xl text-primary">→</div>
              <div className="text-2xl font-mono bg-success/20 px-4 py-2 rounded-lg border-2 border-success/30">
                {currentStepData.transformedChar}
              </div>
            </div>
            <div className="text-sm text-muted-fg">
              Position {currentStep + 1} of {steps.length}
            </div>
          </div>
        );

      case "vigenere":
        return (
          <div className="text-center space-y-3">
            <div className="text-sm text-muted-fg">
              Vigenère Cipher - Key: {currentStepData.keyChar} (shift {currentStepData.shift})
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-lg font-mono bg-warning/20 px-3 py-2 rounded border border-warning/30">
                {currentStepData.originalChar}
              </div>
              <div className="text-sm text-muted-fg">
                {mode === "encrypt" ? "+" : "-"}
              </div>
              <div className="text-lg font-mono bg-info/20 px-3 py-2 rounded border border-info/30">
                {currentStepData.keyChar}
              </div>
              <div className="text-lg text-primary">→</div>
              <div className="text-lg font-mono bg-success/20 px-3 py-2 rounded border border-success/30">
                {currentStepData.transformedChar}
              </div>
            </div>
            <div className="text-xs text-muted-fg">
              {currentStepData.explanation}
            </div>
            <div className="text-sm text-muted-fg">
              Character {currentStep + 1} of {steps.length}
            </div>
          </div>
        );

      case "keyword":
        return (
          <div className="text-center space-y-3">
            <div className="text-sm text-muted-fg">
              Keyword Cipher - Mixed Alphabet
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="text-2xl font-mono bg-warning/20 px-4 py-2 rounded-lg border-2 border-warning/30">
                {currentStepData.originalChar}
              </div>
              <div className="text-2xl text-primary">→</div>
              <div className="text-2xl font-mono bg-success/20 px-4 py-2 rounded-lg border-2 border-success/30">
                {currentStepData.transformedChar}
              </div>
            </div>
            <div className="text-xs text-muted-fg">
              {currentStepData.explanation}
            </div>
            <div className="text-sm text-muted-fg">
              Position {currentStep + 1} of {steps.length}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (steps.length === 0) {
    return (
      <div className="text-center p-8 text-muted-fg">
        <p>No animation steps available. Please enter a message to see the step-by-step process.</p>
      </div>
    );
  }

  return (
    <div className="bg-muted/5 rounded-lg p-6 border border-muted space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-primary">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            intent="outline"
            size="small"
            onPress={() => setIsManualControl(!isManualControl)}
          >
            {isManualControl ? "Auto" : "Manual"}
          </Button>
          {!isManualControl && (
            <Button
              intent="outline"
              size="small"
              onPress={() => setIsPaused(!isPaused)}
              isDisabled={!isPlaying}
            >
              {isPaused ? "Resume" : "Pause"}
            </Button>
          )}
          <Button
            intent="outline"
            size="small"
            onPress={handleReset}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted/20 rounded-full h-2">
        <motion.div
          className="bg-primary h-2 rounded-full"
          initial={{ width: "0%" }}
          animate={{ 
            width: steps.length > 0 ? `${((currentStep + 1) / steps.length) * 100}%` : "0%" 
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Animation content */}
      <div className="min-h-32 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentStepData ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {getCipherSpecificContent()}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-fg"
            >
              <p>Ready to start animation...</p>
              <p className="text-sm mt-2">
                {isManualControl ? "Use the controls below to step through." : "Animation will begin automatically."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual controls */}
      {isManualControl && (
        <div className="flex items-center justify-center gap-2">
          <Button
            intent="outline"
            size="small"
            onPress={handleManualPrev}
            isDisabled={currentStep <= -1}
          >
            ← Previous
          </Button>
          <span className="text-sm text-muted-fg px-4">
            Step {Math.max(0, currentStep + 1)} of {steps.length}
          </span>
          <Button
            intent="outline"
            size="small"
            onPress={handleManualNext}
            isDisabled={currentStep >= steps.length - 1}
          >
            Next →
          </Button>
        </div>
      )}

      {/* Completion message */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center p-4 bg-success/10 rounded-lg border border-success/30"
          >
            <div className="text-success-fg font-medium">
              ✨ Animation Complete! ✨
            </div>
            <div className="text-sm text-muted-fg mt-1">
              All {steps.length} characters have been processed.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result preview */}
      {currentStep >= 0 && (
        <div className="bg-muted/10 rounded-lg p-4 border border-muted/20">
          <h4 className="text-sm font-medium text-fg mb-2">Current Progress</h4>
          <div className="font-mono text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-fg">Input:</span>
              <span className="bg-warning/20 px-2 py-1 rounded">
                {steps.slice(0, currentStep + 1).map(s => s.originalChar).join("")}
                <span className="text-muted-fg">
                  {steps.slice(currentStep + 1).map(s => s.originalChar).join("")}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-fg">Output:</span>
              <span className="bg-success/20 px-2 py-1 rounded">
                {steps.slice(0, currentStep + 1).map(s => s.transformedChar).join("")}
                <span className="text-muted-fg/50">
                  {"_".repeat(steps.length - currentStep - 1)}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};