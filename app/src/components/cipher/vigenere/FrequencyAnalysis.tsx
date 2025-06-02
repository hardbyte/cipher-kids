import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mapCharToNumber, mapNumberToChar } from "@/utils/ciphers"; // Import helpers
import { toast } from "sonner";

interface FrequencyAnalysisProps {
  ciphertext: string;
  keyLength?: number;
  showAnalysis: boolean;
  alphabet: string; // Added alphabet prop
}

interface KeyCharacter {
  position: number;
  character: string;
  confidence: number;
}

interface LetterFrequency {
  letter: string;
  count: number;
  frequency: number;
  expectedFrequency: number; // This will be less accurate for non-standard alphabets
  normalized: number; // This will be less accurate for non-standard alphabets
}

// Common English letter frequencies (approximate percentages)
// Note: This is specific to English and the standard A-Z alphabet.
// For custom alphabets, these expected frequencies might not be meaningful
// unless the custom alphabet is a simple permutation of A-Z.
const ENGLISH_FREQUENCIES: Record<string, number> = {
  'E': 12.7, 'T': 9.1, 'A': 8.2, 'O': 7.5, 'I': 7.0, 'N': 6.7,
  'S': 6.3, 'H': 6.1, 'R': 6.0, 'D': 4.3, 'L': 4.0, 'C': 2.8,
  'U': 2.8, 'M': 2.4, 'W': 2.4, 'F': 2.2, 'G': 2.0, 'Y': 2.0,
  'P': 1.9, 'B': 1.3, 'V': 1.0, 'K': 0.8, 'J': 0.15, 'X': 0.15,
  'Q': 0.10, 'Z': 0.07
};

export const FrequencyAnalysis: React.FC<FrequencyAnalysisProps> = ({
  ciphertext,
  keyLength = 3,
  showAnalysis,
  alphabet, // Use the passed alphabet
}) => {
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [groups, setGroups] = useState<LetterFrequency[][]>([]);
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [discoveredKey, setDiscoveredKey] = useState<KeyCharacter[]>([]);
  const [showDiscoveredKey, setShowDiscoveredKey] = useState(false);

  // Generate some example discovered keys based on frequency analysis
  useEffect(() => {
    if (groups.length > 0 && !discoveredKey.length && alphabet) {
      const newDiscoveredKey: KeyCharacter[] = [];
      const mostCommonEnglishLetter = 'E'; // Or could be alphabet[0] for generic case

      for (let i = 0; i < keyLength; i++) {
        if (groups[i] && groups[i].length > 0) {
          const mostFrequentInCipherSegment = groups[i][0];
          try {
            const mostFrequentCipherIndex = mapCharToNumber(mostFrequentInCipherSegment.letter, alphabet);
            let assumedPlaintextIndex;

            if (alphabet.includes(mostCommonEnglishLetter)) {
              assumedPlaintextIndex = mapCharToNumber(mostCommonEnglishLetter, alphabet);
            } else {
              // Fallback: assume it maps to the first char of the custom alphabet if 'E' is not present
              assumedPlaintextIndex = 0;
            }

            const shift = (mostFrequentCipherIndex - assumedPlaintextIndex + alphabet.length) % alphabet.length;
            const keyChar = mapNumberToChar(shift, alphabet);
            newDiscoveredKey.push({
              position: i + 1,
              character: keyChar,
              confidence: Math.min(mostFrequentInCipherSegment.frequency * 2, 95) // Heuristic
            });
          } catch (error) {
            // console.warn(`Could not guess key for group ${i} due to alphabet mismatch:`, error);
            // Could push a placeholder if needed, or skip this key char
          }
        }
      }
      if (newDiscoveredKey.length > 0) {
        setDiscoveredKey(newDiscoveredKey);
      }
    }
  }, [groups, keyLength, discoveredKey.length, alphabet]);

  // Calculate frequency analysis for each key position
  useEffect(() => {
    if (!ciphertext || !showAnalysis || !alphabet) {
      setGroups([]);
      setShowDiscoveredKey(false);
      return;
    }

    const cleanText = ciphertext.toUpperCase().split("").filter(char => alphabet.includes(char)).join("");
    const newGroups: LetterFrequency[][] = [];

    for (let groupIndex = 0; groupIndex < keyLength; groupIndex++) {
      const groupLetters: string[] = [];
      
      // Extract letters for this key position
      for (let i = groupIndex; i < cleanText.length; i += keyLength) {
        groupLetters.push(cleanText[i]);
      }

      // Calculate frequencies
      const letterCounts: Record<string, number> = {};
      groupLetters.forEach(letter => {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      });

      // Add to results
      const groupFrequencies: LetterFrequency[] = alphabet.split('').map(letter => ({
        letter,
        count: letterCounts[letter] || 0,
        frequency: groupLetters.length > 0 ? ((letterCounts[letter] || 0) / groupLetters.length) * 100 : 0,
        expectedFrequency: ENGLISH_FREQUENCIES[letter] || 0, // Still uses ENGLISH_FREQUENCIES
        normalized: (ENGLISH_FREQUENCIES[letter] || 0) > 0 
          ? (((letterCounts[letter] || 0) / groupLetters.length) * 100) / (ENGLISH_FREQUENCIES[letter] || 1) 
          : 0,
      }));

      // Sort by frequency (descending)
      groupFrequencies.sort((a, b) => b.frequency - a.frequency);
      newGroups.push(groupFrequencies);
    }

    setGroups(newGroups);
  }, [ciphertext, keyLength, showAnalysis, alphabet]);

  // Animation effect
  useEffect(() => {
    if (showAnalysis && groups.length > 0) {
      setAnimationStep(0);
      const timer = setInterval(() => {
        setAnimationStep(prev => {
          if (prev < groups[selectedGroup]?.length - 1) {
            return prev + 1;
          } else {
            clearInterval(timer);
            return prev;
          }
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [showAnalysis, groups, selectedGroup]);

  if (!showAnalysis || groups.length === 0) {
    return (
      <div className="text-center text-muted-fg p-8">
        <p>Enter ciphertext and ensure alphabet is set to see frequency analysis</p>
      </div>
    );
  }

  const currentGroup = groups[selectedGroup] || [];
  const maxFrequency = Math.max(...currentGroup.map(f => f.frequency), 0); // Ensure maxFrequency is not -Infinity

  return (
    <div className="bg-muted/5 rounded-lg p-6 border border-muted">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary mb-2">
          Frequency Analysis for Cracking
        </h3>
        <p className="text-sm text-muted-fg mb-4">
          By analyzing letter frequencies in each key position, we can identify the most likely shifts.
        </p>

        {/* Group selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {groups.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedGroup(index)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedGroup === index
                  ? "bg-primary text-primary-fg"
                  : "bg-muted/30 text-muted-fg hover:bg-muted/50"
              }`}
            >
              Key Position {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency chart */}
        <div className="space-y-4">
          <h4 className="font-semibold text-fg">Letter Frequencies (Top 10 for Group {selectedGroup + 1})</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {currentGroup.slice(0, 10).map((freq, index) => (
              <motion.div
                key={freq.letter}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: index <= animationStep ? 1 : 0.3,
                  x: 0 
                }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center font-mono font-bold text-primary-fg">
                  {freq.letter}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-muted-fg mb-1">
                    <span>Observed: {freq.frequency.toFixed(1)}%</span>
                    {alphabet.includes(freq.letter) && ENGLISH_FREQUENCIES[freq.letter] && (
                       <span>Expected (Eng): {freq.expectedFrequency.toFixed(1)}%</span>
                    )}
                  </div>
                  <div className="relative h-6 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: index <= animationStep && maxFrequency > 0
                          ? `${(freq.frequency / maxFrequency) * 100}%` 
                          : "0%" 
                      }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                    />
                    {alphabet.includes(freq.letter) && ENGLISH_FREQUENCIES[freq.letter] && (
                       <motion.div
                        className="absolute left-0 top-0 h-full bg-warning/40 border-l-2 border-warning"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: index <= animationStep ? 0.7 : 0,
                          left: maxFrequency > 0 ? `${(freq.expectedFrequency / maxFrequency) * 100}%` : "0%"
                        }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                        style={{ width: '2px' }}
                      />
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-fg w-12 text-right">
                  {freq.count}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Analysis insights */}
        <div className="space-y-4">
          <h4 className="font-semibold text-fg">Cracking Insights</h4>
          
          <div className="bg-info/10 p-4 rounded-lg border border-info/30">
            <h5 className="text-info-fg font-medium mb-2">🔍 What to Look For:</h5>
            <ul className="text-sm text-muted-fg space-y-1">
              <li>• Letters with high observed frequencies.</li>
              <li>• If using a standard alphabet, compare to expected English frequencies (e.g., 'E', 'T', 'A').</li>
            </ul>
          </div>

          <div className="bg-warning/10 p-4 rounded-lg border border-warning/30">
            <h5 className="text-warning-fg font-medium mb-2">🎯 Most Likely Key Letter (Guess):</h5>
            <AnimatePresence>
              {currentGroup.length > 0 && alphabet && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-warning-fg mb-2">
                    {(() => {
                      const mostFrequentInCipherSegment = currentGroup[0];
                      const mostCommonEnglishLetter = 'E';
                      try {
                        // Heuristic: only guess if frequency is somewhat high
                        if (mostFrequentInCipherSegment.frequency > 5 && alphabet.includes(mostFrequentInCipherSegment.letter)) {
                          const mostFrequentCipherIndex = mapCharToNumber(mostFrequentInCipherSegment.letter, alphabet);
                          let assumedPlaintextIndex;
                          if (alphabet.includes(mostCommonEnglishLetter)) {
                            assumedPlaintextIndex = mapCharToNumber(mostCommonEnglishLetter, alphabet);
                          } else {
                            // Fallback: assume maps to the first char of the custom alphabet
                            assumedPlaintextIndex = 0;
                          }
                          const shift = (mostFrequentCipherIndex - assumedPlaintextIndex + alphabet.length) % alphabet.length;
                          return mapNumberToChar(shift, alphabet);
                        }
                      } catch (e) { /* fall through to return "?" if any error */ }
                      return "?";
                    })()}
                  </div>
                  <div className="text-xs text-muted-fg">
                    Assuming '{currentGroup[0]?.letter}' in cipher segment represents '{alphabet.includes('E') ? 'E' : alphabet[0]}'
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {discoveredKey.length > 0 && showDiscoveredKey && (
            <div className="bg-success/10 p-4 rounded-lg border border-success/30 mt-4">
              <h5 className="text-success-fg font-medium mb-2">✨ Discovered Key:</h5>
              <div className="text-center">
                <div className="inline-flex bg-bg p-2 rounded-md border border-success/20">
                  {discoveredKey.map((keyChar, idx) => (
                    <div key={`key-${idx}`} className="flex flex-col items-center mx-2">
                      <div className="text-xs text-muted-fg mb-1">Pos {keyChar.position}</div>
                      <div className="text-lg font-bold font-mono text-success-fg mb-1">
                        {keyChar.character}
                      </div>
                      <div className="w-full h-1 bg-muted/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success/70"
                          style={{ width: `${keyChar.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm mt-2 font-medium text-success-fg">
                  Possible Key: <span className="bg-success/20 px-2 py-1 rounded font-mono">{discoveredKey.map(k => k.character).join('')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-success/10 p-4 rounded-lg border border-success/30">
            <h5 className="text-success-fg font-medium mb-2">📊 Analysis Quality:</h5>
            <div className="space-y-2">
              {(() => {
                const sampleSize = currentGroup.reduce((sum, freq) => sum + freq.count, 0);
                const topFreq = currentGroup[0]?.frequency || 0;
                
                let quality = "Poor";
                let color = "text-danger-fg";
                let description = "Need more data";
                
                if (sampleSize > 20 && topFreq > 10) {
                  quality = "Good";
                  color = "text-success-fg";
                  description = "Reliable for analysis";
                } else if (sampleSize > 10 && topFreq > 6) {
                  quality = "Fair";
                  color = "text-warning-fg";
                  description = "Somewhat reliable";
                }
                
                return (
                  <>
                    <div className={`font-medium ${color}`}>
                      {quality} ({sampleSize} letters)
                    </div>
                    <div className="text-xs text-muted-fg">{description}</div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="bg-accent/10 p-4 rounded-lg border border-accent/30">
            <h5 className="text-accent-fg font-medium mb-2">💡 Next Steps:</h5>
            <ol className="text-sm text-muted-fg space-y-1 list-decimal list-inside">
              <li>Try the suggested key letter</li>
              <li>Apply Caesar decryption to this group</li>
              <li>Check if result looks like English</li>
              <li>Repeat for all key positions</li>
              <li>Combine to form complete key</li>
            </ol>
            {discoveredKey.length > 0 && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => setShowDiscoveredKey(!showDiscoveredKey)}
                  className="px-3 py-1 bg-accent/30 hover:bg-accent/40 text-accent-fg rounded-md text-sm transition-colors"
                >
                  {showDiscoveredKey ? "Hide" : "Show"} Discovered Key
                </button>
              </div>
            )}
            {discoveredKey.length > 0 && showDiscoveredKey && (
              <div className="mt-3 pt-3 border-t border-accent/30">
                <div className="flex gap-2">
                  <button 
                    className="bg-accent/20 text-accent-fg px-3 py-1 rounded-md text-sm hover:bg-accent/30 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(discoveredKey.map(k => k.character).join(''))
                        .then(() => toast.success("Key copied to clipboard!"))
                        .catch(() => toast.error("Failed to copy key"))
                    }}
                  >
                    Copy discovered key
                  </button>
                  <button
                    className="bg-muted/20 text-muted-fg px-3 py-1 rounded-md text-sm hover:bg-muted/30 transition-colors"
                    onClick={() => {
                      toast.info(`Try the key "${discoveredKey.map(k => k.character).join('')}" with your decryption tool!`);
                    }}
                  >
                    Test this key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-3 bg-muted/20 rounded-lg">
        <div className="flex flex-wrap gap-4 text-xs text-muted-fg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 bg-primary rounded"></div>
            <span>Observed frequency</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 bg-warning/40 border-l-2 border-warning"></div>
            <span>Expected English frequency</span>
          </div>
        </div>
      </div>
    </div>
  );
};