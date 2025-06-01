import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DEFAULT_ALPHABET,
  mapCharToNumber,
  mapNumberToChar,
} from "@/utils/ciphers";
import "./vigenere.css";

interface VigenereTableProps {
  alphabet?: string;
  keyword: string;
  plaintextChar?: string;
  keywordChar?: string;
  mode: "encrypt" | "decrypt" | "crack";
  currentAnimationStep?: number;
  animationMessage?: string;
}

export const VigenereTable: React.FC<VigenereTableProps> = ({
  alphabet = DEFAULT_ALPHABET,
  keyword,
  plaintextChar,
  keywordChar,
  mode,
  currentAnimationStep = -1,
  animationMessage = "",
}) => {
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null);
  const [highlightedCell, setHighlightedCell] = useState<{row: number, col: number} | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showKeywordRows, setShowKeywordRows] = useState(true);
  const [selectedKeyRow, setSelectedKeyRow] = useState<number | null>(null);
  const [interactionMode, setInteractionMode] = useState<"waiting_for_key" | "waiting_for_cipher" | "complete">("waiting_for_key");

  // Clean up keyword for display
  const cleanKeyword = keyword
    .toUpperCase()
    .split("")
    .filter((char) => alphabet.includes(char))
    .join("");
  
  // Generate Vigenère table (alphabet.length × alphabet.length grid)
  const table = Array.from({ length: alphabet.length }, (_, rowIdx) => {
    return Array.from({ length: alphabet.length }, (_, colIdx) => {
      return mapNumberToChar(
        (rowIdx + colIdx) % alphabet.length,
        alphabet
      );
    });
  });

  // Get indices for keyword characters
  const keywordIndices = showKeywordRows && cleanKeyword
    ? [...new Set(cleanKeyword.split('').map(char => mapCharToNumber(char, alphabet)))]
        .filter(idx => idx >= 0) // mapCharToNumber throws error, so this filter might be redundant but safe
    : [];

  // Enhanced interaction handler for decrypt mode
  const handleCellInteraction = useCallback((row: number, col: number, isKeyColumn: boolean = false) => {
    if (row >= 0 && col >= 0 && row < alphabet.length && col < alphabet.length) {
      if (mode === "decrypt") {
        if (isKeyColumn && interactionMode === "waiting_for_key") {
          // User clicked a key letter - highlight the row and wait for cipher letter
          setSelectedKeyRow(row);
          setHighlightedRow(row);
          setHighlightedCol(null);
          setHighlightedCell(null);
          setInteractionMode("waiting_for_cipher");
        } else if (!isKeyColumn && interactionMode === "waiting_for_cipher" && selectedKeyRow !== null) {
          // User clicked a cipher letter in the highlighted row - complete the lookup
          setHighlightedCol(col);
          setHighlightedCell({ row: selectedKeyRow, col });
          setInteractionMode("complete");
        } else if (interactionMode === "complete") {
          // Reset interaction
          setSelectedKeyRow(null);
          setHighlightedRow(null);
          setHighlightedCol(null);
          setHighlightedCell(null);
          setInteractionMode("waiting_for_key");
        }
      } else {
        // Original behavior for encrypt mode
        setHighlightedRow(row);
        setHighlightedCol(col);
        setHighlightedCell({ row, col });
      }
    }
  }, [mode, interactionMode, selectedKeyRow, alphabet]);

  // Effect to sync with StepByStepAnimation or handle direct character highlighting
  useEffect(() => {
    if (currentAnimationStep >= 0 && animationMessage) {
      // Sync with StepByStepAnimation
      const cleanMessage = animationMessage
        .toUpperCase()
        .split("")
        .filter((char) => alphabet.includes(char))
        .join("");
      const cleanKeywordEffect = keyword // Already cleaned based on alphabet at the top
        .toUpperCase()
        .split("")
        .filter((char) => alphabet.includes(char))
        .join("");
      
      if (currentAnimationStep < cleanMessage.length && cleanKeyword) {
        const messageChar = cleanMessage[currentAnimationStep];
        const keyChar = cleanKeyword[currentAnimationStep % cleanKeyword.length];
        
        try {
          const plainIdx = mapCharToNumber(messageChar, alphabet);
          const keyIdx = mapCharToNumber(keyChar, alphabet);
        
          setHighlightedRow(keyIdx);
          setHighlightedCol(plainIdx);
          setHighlightedCell({ row: keyIdx, col: plainIdx });
        } catch (e) {
          // char not in alphabet, ignore
          console.error("Error in animation effect:", e);
        }
      }
    } else if (plaintextChar && keywordChar && !isAnimating) {
      // Original behavior for direct character highlighting
      try {
        const plainIdx = mapCharToNumber(plaintextChar.toUpperCase(), alphabet);
        const keyIdx = mapCharToNumber(keywordChar.toUpperCase(), alphabet);

        setIsAnimating(true);
        
        // Clear previous highlights immediately
        setHighlightedRow(null);
        setHighlightedCol(null);
        setHighlightedCell(null);

        const animationSteps = [
          // Animate row highlight
          () => setHighlightedRow(keyIdx),
          // Animate column highlight
          () => setHighlightedCol(plainIdx),
          // Animate cell highlight
          () => {
            setHighlightedCell({ row: keyIdx, col: plainIdx });
            setIsAnimating(false);
          }
        ];

        // Use a single animation timeline with proper cleanup
        const timeouts: number[] = [];
        animationSteps.forEach((step, index) => {
          const timeout = window.setTimeout(step, 300 * (index + 1));
          timeouts.push(timeout);
        });

        return () => timeouts.forEach(t => window.clearTimeout(t));
      } catch (e) {
         // char not in alphabet, ignore
         console.error("Error in direct highlighting effect:", e);
      }
    }
  }, [plaintextChar, keywordChar, isAnimating, currentAnimationStep, animationMessage, keyword, alphabet]);

  return (
    <div className="flex flex-col items-center p-2">
      <div className="mb-3 text-center">
        <h3 className="text-sm font-medium text-muted-fg">
          {mode === "encrypt" 
            ? "✨ Vigenère Encryption Table ✨" 
            : "✨ Vigenère Decryption Table ✨"}
        </h3>
        <p className="text-xs text-muted-fg mt-1 max-w-md">
          {mode === "encrypt"
            ? "Find your plaintext letter along the top row, find your keyword letter on the left column, then find where they intersect!"
            : mode === "decrypt" && interactionMode === "waiting_for_key"
            ? "Step 1: Click a keyword letter on the left to highlight its row"
            : mode === "decrypt" && interactionMode === "waiting_for_cipher"
            ? "Step 2: Click a ciphertext letter in the highlighted row to find the plaintext"
            : mode === "decrypt" && interactionMode === "complete"
            ? "✨ Found the plaintext letter! Click anywhere to try again."
            : "Find your keyword letter on the left column, find your ciphertext letter in that row, then look up to find the plaintext letter!"}
        </p>
        
        {cleanKeyword && (
          <div className="flex items-center gap-2 justify-center mt-2 bg-muted/20 p-2 rounded">
            <div className="text-xs text-muted-fg">Keyword: </div>
            {cleanKeyword.split('').map((char, idx) => (
              <span key={`key-${idx}`} className="px-2 py-1 bg-warning/20 rounded font-mono text-warning-fg">
                {char}
              </span>
            ))}
            <div className="ml-2">
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  checked={showKeywordRows}
                  onChange={() => setShowKeywordRows(!showKeywordRows)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-muted/30 rounded-full peer 
                    peer-checked:bg-warning/30 peer-focus:outline-none
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:rounded-full after:h-4 after:w-4
                    after:transition-all peer-checked:after:translate-x-full">
                </div>
              </label>
            </div>
            <span className="text-xs text-muted-fg">Highlight key rows</span>
          </div>
        )}
      </div>

      <div className="vigenere-table-container overflow-auto max-w-full">
        <div
          className="vigenere-table inline-grid gap-0.5 bg-muted/20 p-0.5 rounded-lg font-mono text-xs"
          style={{
            gridTemplateRows: `repeat(${alphabet.length + 1}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${alphabet.length + 1}, minmax(0, 1fr))`,
          }}
        >
          {/* Empty corner cell */}
          <div className="flex items-center justify-center w-6 h-6 bg-primary/20 font-bold rounded-tl-md">
            +
          </div>

          {/* Top row header (plaintext letters) */}
          {alphabet.split("").map((letter, idx) => (
            <motion.div
              key={`header-${letter}`}
              className={`flex items-center justify-center w-6 h-6 rounded-sm font-bold
                ${highlightedCol === idx ? "bg-success text-white" : "bg-primary/10"}
                ${mode === "encrypt" ? "cursor-pointer hover:bg-primary/20" : ""}`}
              animate={{
                scale: highlightedCol === idx ? 1.1 : 1,
                backgroundColor: highlightedCol === idx ? "rgb(var(--color-success))" : "rgba(var(--color-primary), 0.1)"
              }}
              onClick={() => mode === "encrypt" && setHighlightedCol(idx)}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--color-primary), 0.2)" }}
              transition={{ duration: 0.2 }}
            >
              {letter}
            </motion.div>
          ))}

          {/* Left column header (keyword letters) */}
          {alphabet.split("").map((letter, idx) => {
            const isKeywordRow = keywordIndices.includes(idx);
            return (
              <motion.div
                key={`row-${letter}`}
                className={`flex items-center justify-center w-6 h-6 rounded-sm font-bold
                  ${highlightedRow === idx ? "bg-warning text-warning-fg" : isKeywordRow ? "bg-warning/30 text-warning-fg" : "bg-primary/10"}
                  cursor-pointer hover:bg-primary/20`}
                animate={{
                  scale: highlightedRow === idx ? 1.1 : isKeywordRow ? 1.05 : 1,
                  backgroundColor: highlightedRow === idx 
                    ? "rgb(var(--color-warning))" 
                    : selectedKeyRow === idx
                    ? "rgba(var(--color-warning), 0.5)"
                    : isKeywordRow 
                    ? "rgba(var(--color-warning), 0.3)" 
                    : "rgba(var(--color-primary), 0.1)"
                }}
                onClick={() => handleCellInteraction(idx, 0, true)}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--color-warning), 0.2)" }}
                transition={{ duration: 0.2 }}
              >
                {letter}
              </motion.div>
            )
          })}

          {/* Table cells */}
          {table.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              const isHighlighted = highlightedCell?.row === rowIdx && highlightedCell?.col === colIdx;
              const isInHighlightedRow = highlightedRow === rowIdx;
              const isInHighlightedCol = highlightedCol === colIdx;
              const isKeywordRow = keywordIndices.includes(rowIdx);
              
              return (
                <motion.div
                  key={`cell-${rowIdx}-${colIdx}`}
                  className={`flex items-center justify-center w-6 h-6 border border-transparent
                    ${isHighlighted ? "bg-accent text-accent-fg font-bold" : 
                      isInHighlightedRow && isInHighlightedCol ? "bg-primary/30" :
                      isInHighlightedRow ? "bg-warning/20" : 
                      isInHighlightedCol ? "bg-success/20" : 
                      isKeywordRow ? "bg-warning/10" :
                      "bg-bg"}`}
                  animate={{
                    scale: isHighlighted ? 1.2 : isKeywordRow ? 1.02 : 1,
                    backgroundColor: isHighlighted 
                      ? "rgb(var(--color-accent))" 
                      : isInHighlightedRow && isInHighlightedCol
                      ? "rgba(var(--color-primary), 0.3)"
                      : isInHighlightedRow 
                      ? "rgba(var(--color-warning), 0.2)" 
                      : isInHighlightedCol
                      ? "rgba(var(--color-success), 0.2)"
                      : isKeywordRow
                      ? "rgba(var(--color-warning), 0.1)"
                      : "rgb(var(--color-bg))"
                  }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleCellInteraction(rowIdx, colIdx, false)}
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: "rgba(var(--color-accent), 0.1)"
                  }}
                >
                  {cell}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {highlightedCell && (
        <div className="mt-3 p-2 bg-accent/10 rounded-md text-sm">
          <div className="font-medium">
            {mode === "encrypt" ? (
              <>
                <span className="text-success">{mapNumberToChar(highlightedCell.col, alphabet)}</span>
                <span className="mx-1">+</span>
                <span className="text-warning">{mapNumberToChar(highlightedCell.row, alphabet)}</span>
                <span className="mx-1">=</span>
                <span className="text-accent font-bold">{table[highlightedCell.row][highlightedCell.col]}</span>
              </>
            ) : (
              <>
                <span className="text-warning">{mapNumberToChar(highlightedCell.row, alphabet)}</span>
                <span className="mx-1">+</span>
                <span className="text-accent font-bold">{table[highlightedCell.row][highlightedCell.col]}</span>
                <span className="mx-1">=</span>
                <span className="text-success">{mapNumberToChar(highlightedCell.col, alphabet)}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 w-full">
        <div className="text-sm font-medium mb-1 text-muted-fg">
          {mode === "decrypt" ? "Decrypt Instructions:" : "Try it yourself:"}
        </div>
        <div className="bg-muted/20 p-3 rounded-lg text-sm">
          {mode === "decrypt" ? (
            <>
              <p className="mb-2"><strong>How to decrypt using this table:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click a <span className="text-warning font-medium">keyword letter</span> on the left to highlight its row</li>
                <li>Click a <span className="text-accent font-medium">ciphertext letter</span> in that row</li>
                <li>Look up to the <span className="text-success font-medium">top header</span> - that's your plaintext letter!</li>
              </ol>
              <p className="mt-2 text-xs text-muted-fg italic">
                This reverse lookup is how you decrypt each letter of a Vigenère cipher.
              </p>
            </>
          ) : (
            <>
              <p className="mb-2"><strong>How to use this table:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click a letter in the <span className="text-success font-medium">top row</span> (your plaintext)</li>
                <li>Click a letter in the <span className="text-warning font-medium">left column</span> (your key letter)</li>
                <li>See where they intersect - that's your <span className="text-accent font-medium">encrypted letter</span>!</li>
              </ol>
              <p className="mt-2 text-xs text-muted-fg italic">This is the core of the Vigenère cipher - each letter has its own Caesar shift!</p>
            </>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {!(highlightedRow !== null && highlightedCol !== null) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 bg-info/10 p-3 rounded-lg text-center"
          >
            <p className="text-info text-sm font-medium">👆 Click the letters above to see the encryption in action!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};