import React from "react";
import { motion } from "framer-motion";

interface AnimatedMappingProps {
  from: string[];
  to: string[];
  isProcessing?: boolean;
  highlightChar?: string;
}

export const AnimatedMapping: React.FC<AnimatedMappingProps> = ({
  from,
  to,
  isProcessing,
  highlightChar,
}) => {
  return (
    <motion.div
      className="grid grid-cols-13 gap-1 text-xs font-mono mt-2"
      animate={{ scale: isProcessing ? 1.03 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {from.map((fromChar, i) => {
        const isHighlighted =
          highlightChar &&
          fromChar.toUpperCase() === highlightChar.toUpperCase();
        return (
          <motion.div
            key={`map-${i}-${fromChar}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: isHighlighted ? 1.2 : 1,
            }}
            transition={{ delay: i * 0.3 }}
            className={`flex flex-col items-center p-1 rounded ${
              isHighlighted ? "bg-accent/20 border-2 border-accent" : ""
            }`}
          >
            <div className={isHighlighted ? "font-bold text-accent-fg" : ""}>
              {fromChar}
            </div>
            <div className="text-primary">↓</div>
            <div className={`text-primary ${isHighlighted ? "font-bold" : ""}`}>
              {to[i]}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
