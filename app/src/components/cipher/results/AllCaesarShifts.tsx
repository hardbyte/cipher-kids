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
  // Track which item was copied last and show feedback
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
    // Show success feedback for 1.5 seconds
    setTimeout(() => setCopiedShift(null), 1500);
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
          <p className="mt-2 text-xs bg-gray-50 p-2 rounded-t border border-gray-200 border-b-0">
            <span className="font-bold">Note:</span> Each "Shift" number shows the encryption shift. For example, "Shift = 3" means A→D, B→E, etc.
          </p>
          <div className="text-xs bg-purple-50 p-2 rounded-b border border-gray-200 border-t-0 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded font-semibold">Detective Tip:</span>
            <span>If you find readable text at Shift = 3, the original encrypter used "Encrypt with shift 3"!</span>
          </div>
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
                <div>
                  <span>Shift = {shift}</span>
                  {shift !== 0 && <span className="ml-1 text-xs text-muted-fg">(decrypt with: {(26 - shift) % 26})</span>}
                  {shift === 0 && " (No shift)"}
                </div>
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
                  intent={copiedShift === shift ? "secondary" : "outline"}
                  size="extra-small"
                  onPress={(e) => handleCopyToClipboard(e as unknown as React.MouseEvent, result, shift)}
                  className="flex items-center gap-1 transition-all duration-200"
                >
                  <span role="img" aria-label={copiedShift === shift ? "check" : "copy"} className="text-xs">
                    {copiedShift === shift ? "✅" : "📋"}
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
              {/* We don't need the tooltip since the button itself shows the copied state */}
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
          <div className="bg-info/5 p-2 rounded mt-3 border border-info/10">
            <div className="flex gap-2 items-center mb-1">
              <div className="bg-info/20 text-info text-xs px-2 py-0.5 rounded-full font-bold">Encryption vs Decryption</div>
            </div>
            <p className="text-xs text-muted-fg">
              In the shift display above, if you find a readable message at "Shift = 3", it means the original message was <span className="font-semibold">encrypted with shift 3</span>. To decrypt it with the Caesar cipher tool, you would use "Decrypt with shift 3".
            </p>
            <p className="text-xs text-muted-fg mt-1">
              Example: The word "KHOOR" at Shift = 3 shows "HELLO" - meaning the original message "HELLO" was encrypted using shift 3.
            </p>
          </div>
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
        <div className="bg-white/50 rounded p-2 border border-success/20 flex gap-3 items-center mt-2">
          <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center text-success font-bold text-lg">
            ?
          </div>
          <div className="text-xs">
            <span className="font-semibold block mb-1">Wait, why is "Shift = 3" different from "decrypt with 3"?</span>
            <span className="text-muted-fg">Because encryption and decryption go in opposite directions! When we encrypt with shift 3, we decrypt with shift 3 in the opposite direction (which is equivalent to shift 23).</span>
          </div>
        </div>
      </div>
    </div>
  );
};