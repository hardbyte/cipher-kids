import React, { useState } from "react";
import { motion } from "framer-motion";
import { caesarCipher } from "@/utils/ciphers";
import { Button } from "@/components/ui/button";

interface AllCaesarShiftsProps {
  message: string;
  currentShift?: number; // Optional prop to highlight a specific shift
}

export const AllCaesarShifts: React.FC<AllCaesarShiftsProps> = ({
  message,
  currentShift,
}) => {
  // Track which shift the user thinks is correct for the challenge
  const [userGuess, setUserGuess] = useState<number | null>(null);
  // Simple scoring system for fun
  const [score, setScore] = useState<number>(0);
  // Track which item was copied last
  const [copiedShift, setCopiedShift] = useState<number | null>(null);

  // Don't process empty messages
  if (!message) {
    return (
      <div className="text-center p-8 text-muted-fg italic">
        <div className="text-5xl mb-4">🔍</div>
        <div className="text-xl font-medium mb-2">Detective Mode Activated!</div>
        <div>Enter a secret message to crack all 26 possible Caesar shifts</div>
      </div>
    );
  }

  // Generate all possible shifts (0-25)
  const allShifts = Array.from({ length: 26 }, (_, i) => ({
    shift: i,
    result: caesarCipher(message, i, false),
  }));

  // Handle user clicking on a potential solution
  const handleSelectSolution = (shift: number) => {
    setUserGuess(shift);
    // Give some points for finding words - this is just for fun!
    // In a real educational app, we'd check for actual English words
    setScore(prevScore => prevScore + 10);
  };
  
  // Handle copying a shift result to clipboard
  const handleCopyToClipboard = (event: React.MouseEvent, text: string, shift: number) => {
    event.stopPropagation(); // Prevent triggering the parent click event
    navigator.clipboard.writeText(text);
    setCopiedShift(shift);
    setTimeout(() => setCopiedShift(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-900/20 border border-purple-500/30 p-5 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl font-bold text-purple-600">🔓 Cracking Caesar Cipher</div>
          <div className="bg-warning/20 text-warning text-xs px-2 py-1 rounded-full">
            All 26 possible shifts
          </div>
        </div>
        
        <div className="text-sm text-muted-fg mb-4">
          <p>When you see all 26 possible shifts, one of them will make sense in English. That's the original message!</p>
          <p className="mt-2">Look through the results - <strong>can you find the hidden message?</strong></p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">All Possible Shifts</div>
        {userGuess !== null && (
          <div className="bg-success/20 text-success px-3 py-1 rounded-full flex items-center gap-2">
            <span>Detective Score: {score}</span>
            <span className="text-xl">🏆</span>
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {allShifts.map(({ shift, result }) => (
          <motion.div
            key={shift}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shift * 0.03 }} // Stagger animation
            className={`p-3 rounded-lg border-2 cursor-pointer ${
              shift === currentShift
                ? "border-success bg-success/10" 
                : shift === userGuess
                ? "border-purple-500 bg-purple-100/50"
                : "border-muted/40 hover:border-primary/60"
            } transition-all hover:shadow-md`}
            onClick={() => handleSelectSolution(shift)}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-mono font-bold flex items-center gap-2">
                {shift === userGuess && <span className="text-xl">🔍</span>}
                Shift = {shift}
                {shift === 0 && " (No shift)"}
              </div>
              <div className="flex items-center gap-2">
                {shift === currentShift && (
                  <div className="bg-success/20 text-success text-xs px-2 py-0.5 rounded-full">
                    Current
                  </div>
                )}
                {shift === userGuess && (
                  <div className="bg-purple-200 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                    Your guess
                  </div>
                )}
                <Button 
                  intent="outline" 
                  size="extra-small"
                  onPress={(e) => handleCopyToClipboard(e as unknown as React.MouseEvent, result, shift)}
                  className="flex items-center gap-1"
                >
                  <span role="img" aria-label="copy" className="text-xs">
                    {copiedShift === shift ? "✓" : "📋"}
                  </span>
                  <span className="text-xs">{copiedShift === shift ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
            </div>
            <div className={`font-mono p-2 rounded ${
              shift === currentShift 
                ? "bg-success/5" 
                : shift === userGuess
                ? "bg-purple-100"
                : "bg-muted/20"
            } relative`}>
              {result}
              {copiedShift === shift && (
                <motion.div 
                  className="absolute top-0 right-0 mt-1 mr-2 bg-success text-white px-2 py-1 rounded-md text-xs"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  Copied!
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <div className="bg-info/10 p-4 rounded-lg border-l-4 border-info">
          <h4 className="font-semibold text-info mb-2 flex items-center">
            💡 Did you know?
          </h4>
          <p className="text-sm text-muted-fg">
            With only 26 possible shifts, the Caesar cipher is very easy to crack! 
            An attacker can just try all possibilities and see which one makes sense.
            This is called a <strong>"brute force"</strong> attack.
          </p>
        </div>
        
        <div className="bg-warning/10 p-4 rounded-lg border-l-4 border-warning">
          <h4 className="font-semibold text-warning mb-2 flex items-center">
            📊 Frequency Analysis
          </h4>
          <p className="text-sm text-muted-fg">
            Another way to crack Caesar ciphers is by looking at which letters appear most often.
            In English, 'E' is the most common letter. So in an encrypted message, the most common letter 
            is probably 'E' shifted!
          </p>
        </div>
      </div>
      
      <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success mt-4">
        <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
          <span>🔐</span> Challenge
        </h4>
        <p className="text-sm text-muted-fg mb-3">
          Click on the shift you think contains the real message! If you need better security than Caesar
          ciphers, try the more advanced ciphers in this app. Can you figure out why they're harder to crack?
        </p>
      </div>
    </div>
  );
};