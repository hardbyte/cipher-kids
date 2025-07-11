import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ZigzagVisualizationProps {
  message: string;
  rails: number;
  isAnimating?: boolean;
}

interface PositionData {
  char: string;
  rail: number;
  position: number;
  x: number; // Position in the zigzag
}

type AnimationPhase = "zigzag" | "reading" | "complete";

export function ZigzagVisualization({ message, rails, isAnimating = false }: ZigzagVisualizationProps) {
  const [animatedPositions, setAnimatedPositions] = useState<PositionData[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConnectingLines, setShowConnectingLines] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("zigzag");
  const [highlightedRail, setHighlightedRail] = useState<number | null>(null);
  const [builtCiphertext, setBuiltCiphertext] = useState("");

  const cleanMessage = message.toUpperCase().replace(/[^A-Z]/g, '');
  
  // Calculate zigzag pattern
  const generateZigzagData = (): PositionData[] => {
    if (!cleanMessage || rails <= 1) return [];
    
    const positions: PositionData[] = [];
    let rail = 0;
    let direction = 1;
    
    for (let i = 0; i < cleanMessage.length; i++) {
      positions.push({
        char: cleanMessage[i],
        rail,
        position: i,
        x: i
      });
      
      if (rail === 0) {
        direction = 1;
      } else if (rail === rails - 1) {
        direction = -1;
      }
      
      rail += direction;
    }
    
    return positions;
  };

  const allPositions = generateZigzagData();

  // Get characters for each rail
  const getRailChars = (railIndex: number): PositionData[] => {
    return allPositions.filter(pos => pos.rail === railIndex);
  };

  // Animation effect
  useEffect(() => {
    if (!isAnimating || allPositions.length === 0) {
      setAnimatedPositions(allPositions);
      setCurrentStep(allPositions.length);
      setShowConnectingLines(true);
      setAnimationPhase("complete");
      // Build correct ciphertext by reading rails in order
      let finalCiphertext = "";
      for (let railIndex = 0; railIndex < rails; railIndex++) {
        const railChars = getRailChars(railIndex).map(p => p.char).join('');
        finalCiphertext += railChars;
      }
      setBuiltCiphertext(finalCiphertext);
      return;
    }

    // Reset all states
    setAnimatedPositions([]);
    setCurrentStep(0);
    setShowConnectingLines(false);
    setAnimationPhase("zigzag");
    setHighlightedRail(null);
    setBuiltCiphertext("");

    // Phase 1: Draw zigzag pattern
    const zigzagTimer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= allPositions.length) {
          setShowConnectingLines(true);
          clearInterval(zigzagTimer);
          
          // Phase 2: Start reading rails after a delay
          setTimeout(() => {
            setAnimationPhase("reading");
            let railIndex = 0;
            let cipherText = "";
            
            const readRailsTimer = setInterval(() => {
              if (railIndex >= rails) {
                setAnimationPhase("complete");
                clearInterval(readRailsTimer);
                setHighlightedRail(null);
                return;
              }
              
              setHighlightedRail(railIndex);
              const railChars = getRailChars(railIndex).map(p => p.char).join('');
              cipherText += railChars;
              setBuiltCiphertext(cipherText);
              
              railIndex++;
            }, 800); // 800ms per rail
          }, 1000); // 1 second delay before reading
          
          return prev;
        }
        
        setAnimatedPositions(allPositions.slice(0, prev + 1));
        return prev + 1;
      });
    }, 200); // Faster zigzag drawing - 200ms per character

    return () => clearInterval(zigzagTimer);
  }, [isAnimating, message, rails]);

  if (allPositions.length === 0) return null;

  // Calculate responsive dimensions
  const maxX = Math.max(...allPositions.map(p => p.x));
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 800; // SSR fallback
  const cellWidth = Math.max(30, Math.min(50, windowWidth / (maxX + 3))); // Responsive cell width
  const cellHeight = 50;
  const padding = 20;
  const svgWidth = (maxX + 1) * cellWidth + padding * 2;
  const svgHeight = rails * cellHeight + padding * 2;

  return (
    <div className="bg-secondary rounded-lg p-3 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center text-warning">
        🚂 Zigzag Pattern ({rails} Rails)
        {animationPhase === "reading" && (
          <span className="block text-sm text-accent mt-1">
            📖 Reading Rails in Order...
          </span>
        )}
      </h3>
      
      {/* Mobile-responsive SVG container */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-full flex justify-center">
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full max-w-full h-auto"
            style={{ 
              minHeight: '200px',
              maxHeight: '400px',
              aspectRatio: `${svgWidth} / ${svgHeight}`
            }}
          >
            {/* Rail lines */}
            {Array.from({ length: rails }, (_, railIndex) => (
              <line
                key={`rail-line-${railIndex}`}
                x1={padding}
                y1={padding + railIndex * cellHeight + cellHeight / 2}
                x2={svgWidth - padding}
                y2={padding + railIndex * cellHeight + cellHeight / 2}
                stroke="var(--border)"
                strokeDasharray="5,5"
                opacity={highlightedRail === railIndex ? "0.8" : "0.3"}
                strokeWidth={highlightedRail === railIndex ? "2" : "1"}
              />
            ))}

            {/* Connecting zigzag lines */}
            {showConnectingLines && animatedPositions.length > 1 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 0.5 }}
              >
                {animatedPositions.slice(0, -1).map((pos, index) => {
                  const nextPos = animatedPositions[index + 1];
                  return (
                    <motion.line
                      key={`connect-${index}`}
                      x1={padding + pos.x * cellWidth + cellWidth / 2}
                      y1={padding + pos.rail * cellHeight + cellHeight / 2}
                      x2={padding + nextPos.x * cellWidth + cellWidth / 2}
                      y2={padding + nextPos.rail * cellHeight + cellHeight / 2}
                      stroke="var(--primary)"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ 
                        duration: 0.3,
                        delay: index * 0.05
                      }}
                    />
                  );
                })}
              </motion.g>
            )}

            {/* Characters */}
            <AnimatePresence>
              {animatedPositions.map((pos, index) => {
                const isHighlighted = highlightedRail === pos.rail && animationPhase === "reading";
                return (
                  <motion.g key={`char-${pos.position}-${pos.char}`}>
                    {/* Character circle */}
                    <motion.circle
                      cx={padding + pos.x * cellWidth + cellWidth / 2}
                      cy={padding + pos.rail * cellHeight + cellHeight / 2}
                      r="14"
                      fill={isHighlighted ? "var(--accent)" : "var(--primary)"}
                      stroke={isHighlighted ? "var(--accent-fg)" : "var(--primary-fg)"}
                      strokeWidth="2"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: isHighlighted ? 1.2 : 1, 
                        opacity: 1 
                      }}
                      transition={{ 
                        duration: 0.4,
                        ease: "backOut"
                      }}
                    />
                    
                    {/* Character text */}
                    <motion.text
                      x={padding + pos.x * cellWidth + cellWidth / 2}
                      y={padding + pos.rail * cellHeight + cellHeight / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isHighlighted ? "var(--accent-fg)" : "var(--primary-fg)"}
                      fontSize="12"
                      fontWeight="bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        duration: 0.2,
                        delay: 0.2 
                      }}
                    >
                      {pos.char}
                    </motion.text>

                    {/* Position number */}
                    <motion.text
                      x={padding + pos.x * cellWidth + cellWidth / 2}
                      y={padding + pos.rail * cellHeight + cellHeight / 2 - 22}
                      textAnchor="middle"
                      fill="var(--muted-fg)"
                      fontSize="9"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        duration: 0.2,
                        delay: 0.4 
                      }}
                    >
                      {pos.position + 1}
                    </motion.text>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </svg>
        </div>
      </div>

      {/* Rail reading order */}
      <motion.div 
        className="mt-4 sm:mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: showConnectingLines ? 1 : 0 }}
      >
        <h4 className="text-center text-sm font-semibold text-accent mb-3">
          📖 Reading Order by Rails:
        </h4>
        <div className="space-y-2">
          {Array.from({ length: rails }, (_, railIndex) => {
            const railChars = getRailChars(railIndex);
            const isCurrentRail = highlightedRail === railIndex;
            return (
              <motion.div 
                key={railIndex} 
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 text-sm p-2 rounded ${
                  isCurrentRail ? 'bg-accent/20 border border-accent' : ''
                }`}
                animate={{ 
                  scale: isCurrentRail ? 1.05 : 1,
                  backgroundColor: isCurrentRail ? "var(--accent)" : "transparent"
                }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-warning font-semibold min-w-16">
                  Rail {railIndex + 1}:
                </span>
                <div className="flex gap-1 flex-wrap justify-center">
                  {railChars.map((pos, index) => (
                    <motion.span
                      key={`rail-${railIndex}-${index}`}
                      className={`w-6 h-6 border rounded flex items-center justify-center text-xs font-mono ${
                        isCurrentRail 
                          ? 'bg-accent text-accent-fg border-accent-fg' 
                          : 'bg-primary/20 border-primary text-fg'
                      }`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1
                      }}
                      transition={{ 
                        delay: showConnectingLines ? 1.2 + index * 0.1 : 0
                      }}
                    >
                      {pos.char}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Show built ciphertext during reading phase */}
        {(animationPhase === "reading" || animationPhase === "complete") && builtCiphertext && (
          <motion.div 
            className="mt-4 p-3 bg-primary/10 border border-primary rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h5 className="text-center text-sm font-semibold text-primary mb-2">
              🔤 Final Ciphertext:
            </h5>
            <div className="text-center font-mono text-lg font-bold text-primary break-all">
              {builtCiphertext}
            </div>
          </motion.div>
        )}
        
        <motion.p 
          className="text-xs text-muted-fg text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: showConnectingLines ? 2 : 0 }}
        >
          💡 {animationPhase === "reading" ? "Watch each rail being read in order!" : "Final result: Read all rails left-to-right in order"}
        </motion.p>
      </motion.div>
    </div>
  );
}