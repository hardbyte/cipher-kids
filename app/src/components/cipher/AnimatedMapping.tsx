
import React from "react";
import { motion } from "framer-motion";

interface AnimatedMappingProps {
  from: string[];
  to: string[];
  isProcessing?: boolean;
  highlightChar?: string;
  direction?: "down" | "up";
}

export const AnimatedMapping: React.FC<AnimatedMappingProps> = ({
  from,
  to,
  isProcessing,
  highlightChar,
  direction = "down",
}) => {
  return (
    <motion.div
      className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 gap-0.5 text-xs font-mono mt-2 max-w-full overflow-x-auto p-1"
      animate={{ scale: isProcessing ? 1.03 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {from.map((fromChar, i) => {
        const isSourceHighlighted =
          highlightChar &&
          fromChar.toUpperCase() === highlightChar.toUpperCase();
        
        // For Atbash cipher, also highlight the mirror character
        const isTargetHighlighted =
          highlightChar &&
          to[i].toUpperCase() === highlightChar.toUpperCase();
        
        const isHighlighted = isSourceHighlighted || isTargetHighlighted;
        
        return (
          <motion.div
            key={`map-${i}-${fromChar}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{ 
              delay: i * 0.05,
            }}
            className={`flex flex-col items-center p-1 rounded transition-all duration-300 ${
              isHighlighted 
                ? "bg-accent/30 border-2 border-accent shadow-lg ring-2 ring-accent/50" 
                : "hover:bg-gray-700/50 border-2 border-transparent"
            }`}
          >
            <motion.div 
              className={`${isHighlighted ? "font-bold text-accent-fg" : ""} ${direction === "up" ? "order-3" : "order-1"}`}
              animate={{
                color: isSourceHighlighted ? "#22d3ee" : isTargetHighlighted ? "#f59e0b" : "",
              }}
              transition={{ duration: 0.2 }}
            >
              {fromChar}
            </motion.div>
            <motion.div 
              className={`text-primary order-2`}
              animate={{
                color: isHighlighted ? "#22d3ee" : "",
              }}
              transition={{ duration: 0.2 }}
            >
              {direction === "down" ? "↓" : "↑"}
            </motion.div>
            <motion.div 
              className={`text-primary ${isHighlighted ? "font-bold" : ""} ${direction === "up" ? "order-1" : "order-3"}`}
              animate={{
                color: isTargetHighlighted ? "#22d3ee" : isSourceHighlighted ? "#f59e0b" : "",
              }}
              transition={{ duration: 0.2 }}
            >
              {to[i]}
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
