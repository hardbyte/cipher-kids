import React from "react";
import { motion } from "framer-motion";

interface CipherModeToggleProps {
  mode: "encrypt" | "decrypt" | "encode" | "decode" | "crack";
  setMode: (mode: "encrypt" | "decrypt" | "encode" | "decode" | "crack") => void;
  hideCrack?: boolean;
}

export const CipherModeToggle: React.FC<CipherModeToggleProps> = ({
  mode,
  setMode,
  hideCrack = false,
}) => {
  // Determine if we're using encode/decode terminology (for Morse) or encrypt/decrypt
  const isEncodeMode = mode === "encode" || mode === "decode";
  const firstMode = isEncodeMode ? "encode" : "encrypt";
  const secondMode = isEncodeMode ? "decode" : "decrypt";
  return (
    <div className="mb-4">
      <div className="bg-muted/50 p-1 rounded-xl flex justify-between max-w-md mx-auto">
        <motion.button
          className={`relative px-6 py-2 rounded-lg text-center transition-colors flex items-center justify-center gap-2 ${
            mode === firstMode 
              ? "bg-primary text-primary-fg" 
              : "hover:bg-muted"
          }`}
          onClick={() => setMode(firstMode as any)}
          whileTap={{ scale: 0.95 }}
        >
          <span role="img" aria-label="lock" className="text-lg">
            🔒
          </span>
          <span>{isEncodeMode ? "Encode" : "Encrypt"}</span>
          {mode === firstMode && (
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-accent"
              layoutId="activeMode"
              initial={false}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
              }}
            />
          )}
        </motion.button>

        <motion.button
          className={`relative px-6 py-2 rounded-lg text-center transition-colors flex items-center justify-center gap-2 ${
            mode === secondMode 
              ? "bg-primary text-primary-fg" 
              : "hover:bg-muted"
          }`}
          onClick={() => setMode(secondMode as any)}
          whileTap={{ scale: 0.95 }}
        >
          <span role="img" aria-label="unlock" className="text-lg">
            🔓
          </span>
          <span>{isEncodeMode ? "Decode" : "Decrypt"}</span>
          {mode === secondMode && (
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-accent"
              layoutId="activeMode"
              initial={false}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
              }}
            />
          )}
        </motion.button>
        
        {!hideCrack && (
          <motion.button
            className={`relative px-5 py-2 rounded-lg text-center transition-colors flex items-center justify-center gap-2 ${
              mode === "crack" 
                ? "bg-primary text-primary-fg" 
                : "hover:bg-muted"
            }`}
            onClick={() => setMode("crack")}
            whileTap={{ scale: 0.95 }}
          >
            <span role="img" aria-label="detective" className="text-lg">
              🕵️‍♀️
            </span>
            <span>Crack</span>
            {mode === "crack" && (
              <motion.div
                className="absolute inset-0 rounded-lg border-2 border-accent"
                layoutId="activeMode"
                initial={false}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30 
                }}
              />
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};