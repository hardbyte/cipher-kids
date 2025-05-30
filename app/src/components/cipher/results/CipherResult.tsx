import React, { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CipherResultProps {
  output: string;
  visualizer: ReactNode;
}

export const CipherResult: React.FC<CipherResultProps> = ({
  output,
  visualizer,
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (output) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [output]);
  
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  return (
    <div className="space-y-4">
      <motion.div
        className="mt-4 p-3 bg-muted/10 rounded-lg border border-muted"
        animate={{ opacity: output ? 1 : 0.7 }}
      >
        <div className="text-sm text-muted-fg mb-2 font-medium">
          Alphabet Mapping:
        </div>
        {visualizer}
      </motion.div>

      <div className="relative overflow-hidden">
        <motion.div
          className="font-mono whitespace-pre-wrap break-words p-4 bg-muted/30 rounded-lg border-2 border-primary/20 shadow-sm"
          initial={{ opacity: 0.8 }}
          animate={{
            opacity: 1,
            borderColor: output
              ? "rgba(var(--color-success), 0.4)"
              : "rgba(var(--color-primary), 0.2)",
            backgroundColor: output
              ? "rgba(var(--color-success), 0.05)"
              : "rgba(var(--color-muted), 0.3)",
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <span className="text-lg font-semibold text-primary mr-2">
                🔍 Result:
              </span>
              <AnimatePresence mode="wait">
                {showCelebration && output && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <span className="text-lg mx-1">✨</span>
                    <span className="text-lg mx-1">🎉</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {output && (
              <Button
                intent={copySuccess ? "secondary" : "outline"}
                size="small"
                onPress={() => {
                  navigator.clipboard.writeText(output);
                  setCopySuccess(true);
                }}
                className="flex items-center gap-1.5 transition-all duration-200"
              >
                <span role="img" aria-label={copySuccess ? "check" : "copy"} className="text-sm">
                  {copySuccess ? "✅" : "📋"}
                </span>
                <span>{copySuccess ? "Copied!" : "Copy"}</span>
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {output ? (
              <div className="relative">
                <motion.div
                  key="output"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-2 bg-bg rounded font-bold text-success text-lg tracking-wide"
                >
                  {output}
                </motion.div>
                
                {/* We no longer need the tooltip since the button itself shows the copied state */}
              </div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                className="text-muted-fg italic p-2"
              >
                Enter your message and click encrypt/decrypt to see the magic
                happen!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
