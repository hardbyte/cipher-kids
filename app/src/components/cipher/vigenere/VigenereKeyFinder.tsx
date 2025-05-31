import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { InfoIcon } from "@/components/info-icon";

interface VigenereKeyFinderProps {
  ciphertext: string;
  onKeyLengthDetected?: (length: number) => void;
}

interface CoincidenceResult {
  keyLength: number;
  ioc: number;
  normalized: number;
}

export const VigenereKeyFinder: React.FC<VigenereKeyFinderProps> = ({
  ciphertext,
  onKeyLengthDetected,
}) => {
  const [results, setResults] = useState<CoincidenceResult[]>([]);
  const [selectedKeyLength, setSelectedKeyLength] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [detectedKeyLength, setDetectedKeyLength] = useState<number | null>(null);

  useEffect(() => {
    if (!ciphertext) {
      setResults([]);
      setSelectedKeyLength(null);
      return;
    }
  }, [ciphertext]);

  // Calculate Index of Coincidence for a text
  const calculateIoC = (text: string): number => {
    const cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
    if (cleanText.length <= 1) return 0;

    const frequencies: { [key: string]: number } = {};
    for (const char of cleanText) {
      frequencies[char] = (frequencies[char] || 0) + 1;
    }

    let sum = 0;
    for (const char in frequencies) {
      // Formula: sum( n_i * (n_i - 1) ) / (n * (n - 1))
      const freq = frequencies[char];
      sum += freq * (freq - 1);
    }

    const textLength = cleanText.length;
    const ioc = sum / (textLength * (textLength - 1));
    return ioc;
  };

  // Expected IoC for different languages (typically English = ~0.067)
  const EXPECTED_IOC = 0.067;

  // Find most likely key length
  const analyzeKeyLength = () => {
    setIsAnalyzing(true);
    setResults([]);

    // Clean the ciphertext first
    const cleanText = ciphertext.toUpperCase().replace(/[^A-Z]/g, "");
    if (cleanText.length < 20) {
      setExplanation("The ciphertext is too short for reliable analysis. Try with at least 20 characters.");
      setIsAnalyzing(false);
      return;
    }

    // Try key lengths from 1 to 10 (or less if text is short)
    const maxTestLength = Math.min(10, Math.floor(cleanText.length / 2));
    const newResults: CoincidenceResult[] = [];

    setTimeout(() => {
      // Try each possible key length
      for (let keyLength = 1; keyLength <= maxTestLength; keyLength++) {
        // Split text into columns (each encrypted with same shift)
        const columns: string[] = Array(keyLength).fill("");
        
        for (let i = 0; i < cleanText.length; i++) {
          const columnIndex = i % keyLength;
          columns[columnIndex] += cleanText[i];
        }
        
        // Calculate average IoC across all columns
        let totalIoC = 0;
        for (const column of columns) {
          totalIoC += calculateIoC(column);
        }
        const avgIoC = totalIoC / keyLength;
        
        // Add to results
        newResults.push({
          keyLength,
          ioc: avgIoC,
          normalized: avgIoC / EXPECTED_IOC, // How close to expected English?
        });
      }
      
      // Sort by normalized IoC (closest to English)
      newResults.sort((a, b) => b.normalized - a.normalized);
      setResults(newResults);
      
      // Set the most likely key length
      if (newResults.length > 0) {
        const bestMatch = newResults[0];
        const detectedLength = bestMatch.keyLength;
        setSelectedKeyLength(detectedLength);
        setDetectedKeyLength(detectedLength);
        if (onKeyLengthDetected) {
          onKeyLengthDetected(detectedLength);
        }
        
        setExplanation(`Analysis suggests a key length of ${detectedLength} is most likely, with an IoC of ${bestMatch.ioc.toFixed(4)} (${(bestMatch.normalized * 100).toFixed(1)}% match to English text patterns).`);
      }
      
      setIsAnalyzing(false);
    }, 500); // Small delay for visual feedback
  };

  // Get visual assessment of a key length
  const getQualityIndicator = (normalized: number) => {
    if (normalized > 0.9) return { color: "text-success", label: "Excellent" };
    if (normalized > 0.8) return { color: "text-success", label: "Good" };
    if (normalized > 0.7) return { color: "text-warning", label: "Fair" };
    return { color: "text-muted-fg", label: "Poor" };
  };

  return (
    <div className="bg-muted/5 rounded-lg p-4 border border-muted">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-medium text-primary">Key Length Analysis</h3>
        <InfoIcon
          content={
            <div className="space-y-2">
              <p className="font-medium">Index of Coincidence (IoC)</p>
              <p>IoC measures how often letters repeat in text. English text has an IoC of ~0.067.</p>
              <p>When we split a Vigenère cipher by the correct key length, each column should look like English (high IoC).</p>
              <p>Wrong key lengths create random-looking text (low IoC).</p>
            </div>
          }
          size="md"
        />
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-muted-fg">
          The first step in cracking a Vigenère cipher is finding the key length using the "Index of Coincidence" method.
        </p>
      </div>
      
      <div className="flex justify-center mb-6">
        <button
          className="px-4 py-2 bg-primary text-primary-fg rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          onClick={analyzeKeyLength}
          disabled={isAnalyzing || !ciphertext || ciphertext.length < 10}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Key Length"}
        </button>
      </div>
      
      {isAnalyzing && (
        <div className="p-4 border border-muted rounded-md bg-muted/10 flex justify-center items-center h-16">
          <div className="animate-spin h-6 w-6 border-t-2 border-primary rounded-full mr-2"></div>
          <span>Analyzing patterns...</span>
        </div>
      )}
      
      {explanation && !isAnalyzing && (
        <div className="p-4 border border-info/30 rounded-md bg-info/10 mb-4">
          <p className="text-sm">{explanation}</p>
        </div>
      )}
      
      {results.length > 0 && !isAnalyzing && (
        <>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-medium text-fg">Key Length Rankings</h4>
              <InfoIcon
                content={
                  <div className="space-y-1">
                    <p>Higher IoC values (closer to 0.067) suggest the correct key length.</p>
                    <p>The percentage shows how close each result is to typical English text patterns.</p>
                  </div>
                }
                size="sm"
              />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((result) => {
                const quality = getQualityIndicator(result.normalized);
                return (
                  <div 
                    key={result.keyLength}
                    className={`p-2 border rounded-md flex items-center cursor-pointer transition-colors ${
                      selectedKeyLength === result.keyLength 
                        ? "bg-primary/20 border-primary/40" 
                        : "bg-muted/5 border-muted hover:bg-muted/10"
                    }`}
                    onClick={() => {
                      const keyLength = result.keyLength;
                      setSelectedKeyLength(keyLength);
                      setDetectedKeyLength(keyLength);
                      if (onKeyLengthDetected) {
                        onKeyLengthDetected(keyLength);
                      }
                    }}
                  >
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-medium mr-2">
                      {result.keyLength}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Key Length: <span className="font-medium">{result.keyLength}</span></div>
                        <div className={`text-xs ${quality.color}`}>{quality.label}</div>
                      </div>
                      <div className="mt-1 bg-muted/20 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.normalized * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-fg mt-1">
                        <span>IoC: {result.ioc.toFixed(3)}</span>
                        <span>Match: {(result.normalized * 100).toFixed()}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 border border-warning/30 bg-warning/10 rounded-md">
            <h4 className="text-sm font-medium text-warning-fg mb-1">Next Steps:</h4>
            <p className="text-xs text-muted-fg">
              Now that we have determined a likely key length of {detectedKeyLength || selectedKeyLength}, 
              we can use frequency analysis on each position to determine the key.
            </p>
          </div>
        </>
      )}
    </div>
  );
};