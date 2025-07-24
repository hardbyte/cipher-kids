import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { AnimatedMapping } from "@/components/cipher/AnimatedMapping";
import { CipherNav } from "@/components/cipher/CipherNav";
import { CipherPageContentWrapper } from "@/components/cipher/CipherPageContentWrapper";
import { CipherInputs } from "@/components/cipher/CipherInputs";
import { CipherModeToggle } from "@/components/cipher/CipherModeToggle";
import { CipherResult } from "@/components/cipher/results/CipherResult";
import { vigenereCipher, ALPHABET } from "@/utils/ciphers";
import { createFileRoute } from "@tanstack/react-router";
import { VigenereTable } from "@/components/cipher/vigenere/VigenereTable";
import { KeywordRepetition } from "@/components/cipher/vigenere/KeywordRepetition";
import { VigenereCrackExplanation } from "@/components/cipher/vigenere/VigenereCrackExplanation";
import { StepByStepAnimation } from "@/components/cipher/vigenere/StepByStepAnimation";
import { FrequencyAnalysis } from "@/components/cipher/vigenere/FrequencyAnalysis";
import { VigenereKeyFinder } from "@/components/cipher/vigenere/VigenereKeyFinder";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useProgress } from "@/hooks/use-progress";
import { AchievementNotification } from "@/components/achievement-notification";

export const Route = createFileRoute("/ciphers/vigenere")({
  component: VigenereCipherPage,
});

function VigenereCipherPage() {
  const { trackAction } = useProgress();
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [mode, setMode] = useState<"encrypt" | "decrypt" | "crack">("encrypt");
  const [message, setMessage] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [showFullTable, setShowFullTable] = useState(false);
  const [animateKeywordRepetition, setAnimateKeywordRepetition] = useState(false);
  const [currentPlaintextChar, setCurrentPlaintextChar] = useState<string | undefined>(undefined);
  const [currentKeyChar, setCurrentKeyChar] = useState<string | undefined>(undefined);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [isStepAnimationPlaying, setIsStepAnimationPlaying] = useState(false);
  const [showFrequencyAnalysis, setShowFrequencyAnalysis] = useState(false);
  const [keyLength, setKeyLength] = useState(3); // Default key length for analysis
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Stable callback functions for animation
  const handleAnimationComplete = useCallback(() => {
    setIsStepAnimationPlaying(false);
  }, []);

  const handleStepChange = useCallback((stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  }, []);

  // Handle mode changes - auto-populate input with previous result for better UX
  useEffect(() => {
    // If we have an output and the mode changed, use it as the new input
    if (output && output !== message) {
      setMessage(output);
    }
    
    setOutput("");
    // Clear keyword when switching to crack mode
    if (mode === "crack") {
      setKeyword("");
    }
    setShowStepByStep(false);
    setIsStepAnimationPlaying(false);
    setShowFrequencyAnalysis(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally excluding output to prevent infinite loops
  }, [message, mode]);

  const handleAction = async () => {
    if (!message.trim() || !keyword.trim()) {
      toast.error("Please enter both a message and a keyword!");
      return;
    }
    
    const result = vigenereCipher(message, keyword, mode === "decrypt");
    setOutput(result);
    
    // Track the action for achievements
    if (result && message) {
      try {
        const trackResult = trackAction("vigenere", mode === "encrypt" ? "encode" : "decode");
        if (trackResult && trackResult.length > 0) {
          setNewAchievements(trackResult);
        }
      } catch (error) {
        console.warn("Achievement tracking failed:", error);
      }
    }
    
    // Trigger animation for keyword repetition (only if not already animating)
    if (!animateKeywordRepetition) {
      setAnimateKeywordRepetition(true);
      setTimeout(() => setAnimateKeywordRepetition(false), message.length * 500 + 1000);
    }
    
    // Show success toast
    toast.success(`Message ${mode === "encrypt" ? "encrypted" : "decrypted"} successfully!`);
    
    // Scroll to results after a brief delay
    setTimeout(() => {
      const resultElement = document.querySelector('[data-result-section]');
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Clean keyword for visualization
  const cleanKeyword = keyword.toUpperCase().replace(/[^A-Z]/g, "");

  // Effect to demonstrate a single character when the full table isn't shown
  useEffect(() => {
    if (!showFullTable && cleanKeyword && message) {
      const plainChar = message[0]?.toUpperCase();
      const keyChar = cleanKeyword[0]?.toUpperCase();
      
      if (plainChar && keyChar && /[A-Z]/.test(plainChar) && /[A-Z]/.test(keyChar)) {
        setCurrentPlaintextChar(plainChar);
        setCurrentKeyChar(keyChar);
      }
    }
  }, [message, cleanKeyword, showFullTable]);

  return (
    <CipherPageContentWrapper>
      <CipherNav activeCipher="vigenere" />
      
      {/* Educational Header */}
      <div className="text-center space-y-4 mb-6">
        <p className="text-lg lg:text-xl text-muted-fg max-w-4xl mx-auto">
          The "uncrackable" cipher that ruled cryptography for 300 years! 🏰
        </p>
        <div className="bg-warning/10 rounded-lg p-4 border-l-4 border-warning max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-warning mb-2">📚 Historical Context</h3>
          <p className="text-sm text-secondary-fg">
            <strong>Created in 1553</strong> by Giovan Battista Bellaso, but named after Blaise de Vigenère who described it in 1586. 
            Called <em>"le chiffre indéchiffrable"</em> (the indecipherable cipher) in French, it remained unbroken until 1863! 
            Used by the Confederacy in the American Civil War and even by diplomatic services into the 20th century.{' '}
            <a 
              href="https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              (Learn more)
            </a>
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <CipherModeToggle 
          mode={mode} 
          setMode={setMode}
        />

        {mode === "crack" ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter Encrypted Message
              </label>
              <textarea
                value={message}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                placeholder="Enter the message you want to crack"
                className="w-full min-h-24 flex rounded-md border border-input bg-bg px-3 py-2 text-sm ring-offset-bg placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        ) : (
          <>
            <CipherInputs
              mode={mode}
              message={message}
              setMessage={setMessage}
              param={keyword}
              setParam={setKeyword}
              paramPlaceholder="Enter keyword"
              handleAction={handleAction}
              isAnimating={isAnimating}
            />
              
            {message && keyword && (
              <div className="bg-primary/10 p-3 rounded-lg border border-primary/30 text-center">
                <p className="text-sm text-primary-fg">
                  ✨ Ready to {mode}! Click the button above to see your result.
                </p>
              </div>
            )}
          </>
        )}

        {mode === "crack" ? (
          <div className="space-y-6">
            <div className="bg-info/10 p-4 rounded-lg">
              <h4 className="text-info-fg font-semibold mb-2">Crack Mode</h4>
              <p className="text-sm text-muted-fg">
                In this mode, we'll attempt to break a Vigenère cipher without knowing the key. 
                Enter the encrypted message above, then work through the steps below.
              </p>
            </div>
            <VigenereCrackExplanation />

            <div className="bg-accent/10 p-4 rounded-lg border border-accent/30 mb-4">
              <h4 className="font-semibold text-accent-fg mb-2">Sample Encrypted Messages</h4>
              <p className="text-sm text-muted-fg mb-3">
                Try cracking these messages as practice (both encrypted with the keyword "SPY"):
              </p>
              <div className="space-y-2 font-mono text-sm">
                <div 
                  className="bg-bg p-2 rounded cursor-pointer hover:bg-muted/20 border border-muted/30" 
                  onClick={() => setMessage("LZIJQM HEWSDCF")}
                >
                  LZIJQM HEWSDCF
                </div>
                <div 
                  className="bg-bg p-2 rounded cursor-pointer hover:bg-muted/20 border border-muted/30"
                  onClick={() => setMessage("BGPXVR CSRBVLY CYJPHMN")}
                >
                  BGPXVR CSRBVLY CYJPHMN
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6 border-muted/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">Step 1: Find the Key Length</h3>
              </div>
              
              <VigenereKeyFinder 
                ciphertext={message}
                onKeyLengthDetected={async (length) => {
                  setShowFrequencyAnalysis(true);
                  // Pass detected key length to FrequencyAnalysis
                  if (length > 0) {
                    setKeyLength(length);
                  }
                }}
              />
            </div>
            
            <div className="border-t pt-6 border-muted/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">Step 2: Letter Frequency Analysis</h3>
                <Button 
                  intent="secondary" 
                  size="small"
                  onPress={() => setShowFrequencyAnalysis(!showFrequencyAnalysis)}
                >
                  {showFrequencyAnalysis ? "Hide" : "Show"} Analysis
                </Button>
              </div>
              
              <FrequencyAnalysis 
                ciphertext={message}
                keyLength={keyLength}
                showAnalysis={showFrequencyAnalysis}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="border-t pt-4 border-muted/30">
              <div className="flex flex-wrap justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-primary">Interactive Vigenère Visualization</h3>
                <Button 
                  intent="outline" 
                  size="small"
                  onPress={() => setShowFullTable(!showFullTable)}
                >
                  {showFullTable ? "Hide Full Table" : "Show Full Table"}
                </Button>
              </div>
              
              {showFullTable ? (
                <div className="bg-muted/10 rounded-lg p-2 border border-muted overflow-auto">
                  <VigenereTable
                    keyword={cleanKeyword}
                    plaintextChar={currentPlaintextChar}
                    keywordChar={currentKeyChar}
                    mode={mode}
                    currentAnimationStep={showStepByStep ? currentStepIndex : -1}
                    animationMessage={showStepByStep ? message : ""}
                  />
                </div>
              ) : (
                <div className="bg-muted/5 rounded-lg p-4 border border-muted text-center">
                  <p className="text-sm text-muted-fg mb-3">
                    The Vigenère cipher uses multiple Caesar ciphers based on the letters of a keyword.
                  </p>
                  <button 
                    className="text-primary hover:underline focus:outline-none"
                    onClick={() => setShowFullTable(true)}
                  >
                    Click to see the full Vigenère table
                  </button>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4 border-muted/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">Step-by-Step Animation</h3>
                <Button 
                  intent="secondary" 
                  size="small"
                  onPress={() => {
                    setShowStepByStep(!showStepByStep);
                    if (!showStepByStep && cleanKeyword && message) {
                      setIsStepAnimationPlaying(true);
                    }
                  }}
                  isDisabled={!cleanKeyword || !message}
                >
                  {showStepByStep ? "Hide" : "Show"} Animation
                </Button>
              </div>
              
              {showStepByStep && (
                <StepByStepAnimation
                  message={message}
                  keyword={cleanKeyword}
                  mode={mode}
                  isPlaying={isStepAnimationPlaying}
                  onComplete={handleAnimationComplete}
                  onStepChange={handleStepChange}
                  speed={1200}
                />
              )}
            </div>

            <div className="border-t pt-4 border-muted/30">
              <h3 className="text-lg font-semibold text-primary mb-3">How the Keyword Works</h3>
              <KeywordRepetition 
                keyword={cleanKeyword} 
                message={message}
                isAnimating={animateKeywordRepetition}
              />
            </div>

            {output && (
              <div className="border-t-4 border-success pt-6 mt-6 bg-success/5 p-4 rounded-lg" data-result-section>
                <h3 className="text-2xl font-bold text-success mb-4 text-center">
                  {mode === "encrypt" ? "🔐 Encrypted Result" : "🔓 Decrypted Result"}
                </h3>
                <div className="bg-success/10 p-6 rounded-lg border-2 border-success/30 mb-4 shadow-lg">
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold text-success-fg bg-bg px-6 py-4 rounded-lg border-2 border-success/30 shadow-sm">
                      {output}
                    </div>
                    <div className="mt-4 flex justify-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(output)
                            .then(() => toast.success("Result copied to clipboard!"))
                            .catch(() => toast.error("Failed to copy result"))
                        }}
                        className="px-4 py-2 bg-success/20 text-success-fg rounded-md text-sm hover:bg-success/30 transition-colors font-medium"
                      >
                        📋 Copy Result
                      </button>
                    </div>
                    <div className="mt-3 text-base text-success-fg font-medium">
                      ✨ Your {mode === "encrypt" ? "encrypted" : "decrypted"} message is ready! ✨
                    </div>
                  </div>
                </div>
              </div>
            )}

            <CipherResult 
              output={output}
              visualizer={cleanKeyword && (
                <div className="space-y-6">
                  <div className="bg-info/10 p-3 rounded-lg mb-4">
                    <h4 className="font-medium text-info-fg mb-2">Alphabet Mapping Explained</h4>
                    <p className="text-sm mb-2">
                      Below you'll see a separate Caesar cipher shift for <strong>each letter</strong> in your keyword "{cleanKeyword}".
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {cleanKeyword.split("").map((char, idx) => (
                        <div key={`badge-${idx}`} className="px-2 py-1 bg-warning/20 text-warning-fg rounded-md text-sm">
                          {char} = shift {ALPHABET.indexOf(char)}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-fg">
                      The arrows show how letters are transformed. {mode === "encrypt" ? 
                        "Downward arrows mean A→B→C (forward shift)." : 
                        "Upward arrows mean C→B→A (backward shift)."}
                    </p>
                  </div>
                  
                  {cleanKeyword.split("").map((char, idx) => {
                    const shift = ALPHABET.indexOf(char);
                    const shiftedAlphabet = ALPHABET.split("").map(
                      (_, i) => ALPHABET[(i + shift) % 26]
                    );
                    return (
                      <div key={idx} className="mb-4 bg-muted/10 p-3 rounded-lg border border-muted/20">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-primary/20 text-primary-fg px-2 py-1 rounded font-mono font-bold">
                            {char}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Shift {shift}:</span>
                            <span className="text-muted-fg ml-2">
                              {mode === "encrypt" ? 
                                `A → ${ALPHABET[shift]}, B → ${ALPHABET[(1 + shift) % 26]}, etc.` : 
                                `${ALPHABET[shift]} → A, ${ALPHABET[(1 + shift) % 26]} → B, etc.`}
                            </span>
                          </div>
                        </div>
                        <AnimatedMapping
                          from={mode === "encrypt" ? ALPHABET.split("") : shiftedAlphabet}
                          to={mode === "encrypt" ? shiftedAlphabet : ALPHABET.split("")}
                          direction={mode === "encrypt" ? "down" : "up"}
                        />
                      </div>
                    );
                  })}
                  
                  <div className="text-xs italic text-muted-fg text-center mt-2">
                    Each letter of your message will be encrypted with one of these shifts, 
                    cycling through them as the keyword repeats.
                  </div>
                </div>
              )}
            />
          </>
        )}

        <div className="pt-4 border-t mt-4 space-y-4">
          <motion.h3 
            className="text-lg font-semibold mb-3 text-fg flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            🔢 How It Works: Vigenère Cipher
          </motion.h3>
          
          <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
            <h4 className="font-semibold text-primary mb-2 flex items-center">
              🎪 Many Caesar Ciphers in One! (Polyalphabetic)
            </h4>
            <p className="text-sm text-muted-fg mb-3">
              <strong>Polyalphabetic</strong> means "many alphabets" - the Vigenère cipher uses multiple Caesar cipher shifts instead of just one! 
              Each letter in your keyword creates a different Caesar cipher shift, making it much harder to crack than simple substitution ciphers.
            </p>
            
            <div className="bg-bg p-3 rounded mb-3 border-2 border-dashed border-primary/30">
              <div className="text-center">
                <div className="text-xs text-muted-fg mb-1">🔤 Keyword repeats over your message</div>
                <div className="font-mono text-sm tracking-wider bg-muted p-2 rounded mb-2">
                  K E Y K E<br />
                  H E L L O
                </div>
                <div className="text-xs text-muted-fg">Each keyword letter = different shift amount!</div>
              </div>
            </div>
            
            <div className="bg-primary/5 p-3 rounded border border-primary/20">
              <h5 className="text-xs font-semibold text-primary mb-2">📖 Why "Polyalphabetic"?</h5>
              <div className="text-xs text-muted-fg space-y-1">
                <div><strong>Monoalphabetic</strong> (like Caesar): A→D, B→E, C→F (same shift for all)</div>
                <div><strong>Polyalphabetic</strong> (like Vigenère): A→K, A→E, A→Y (different shifts each time)</div>
              </div>
            </div>
          </div>

          <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success shadow-sm">
            <h4 className="font-semibold text-success mb-2 flex items-center">
              🎯 {mode === "encrypt" ? "How Each Letter Gets Encoded" : "How Each Letter Gets Decoded"}
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-muted-fg">
                <span className="font-semibold">Step 1:</span> Line up your keyword above your {mode === "encrypt" ? "message" : "encrypted message"} (repeat as needed)
              </p>
              <p className="text-sm text-muted-fg">
                <span className="font-semibold">Step 2:</span> Each keyword letter tells you how much to {mode === "encrypt" ? "shift" : "shift back"}
              </p>
              <p className="text-sm text-muted-fg">
                <span className="font-semibold">Step 3:</span> 'K' = shift by {mode === "encrypt" ? "10" : "16 (26-10)"}, 'E' = shift by {mode === "encrypt" ? "4" : "22 (26-4)"}, 'Y' = shift by {mode === "encrypt" ? "24" : "2 (26-24)"}
              </p>
              <p className="text-sm text-muted-fg">
                <span className="font-semibold">Step 4:</span> Apply different {mode === "encrypt" ? "shifts" : "reverse shifts"} to each {mode === "encrypt" ? "message" : "encrypted"} letter!
              </p>
            </div>
            
            <div className="mt-3 p-3 bg-bg rounded border-2 border-dashed border-success/30">
              <div className="text-center">
                <div className="text-sm font-semibold text-success mb-2">🧩 Example with keyword "KEY":</div>
                <div className="font-mono text-sm space-y-1">
                  {mode === "encrypt" ? (
                    <>
                      <div>H + K(10) = R</div>
                      <div>E + E(4) = I</div>
                      <div>L + Y(24) = J</div>
                      <div>L + K(10) = V</div>
                      <div>O + E(4) = S</div>
                    </>
                  ) : (
                    <>
                      <div>R - K(10) = H</div>
                      <div>I - E(4) = E</div>
                      <div>J - Y(24) = L</div>
                      <div>V - K(10) = L</div>
                      <div>S - E(4) = O</div>
                    </>
                  )}
                </div>
                <div className="font-mono text-lg mt-2">
                  {mode === "encrypt" ? (
                    <>
                      <span className="bg-warning/20 px-2 py-1 rounded mr-2">HELLO</span>
                      <span className="text-success">→</span>
                      <span className="bg-success/20 px-2 py-1 rounded ml-2">RIJVS</span>
                    </>
                  ) : (
                    <>
                      <span className="bg-warning/20 px-2 py-1 rounded mr-2">RIJVS</span>
                      <span className="text-success">→</span>
                      <span className="bg-success/20 px-2 py-1 rounded ml-2">HELLO</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
            <h4 className="font-semibold text-accent mb-2 flex items-center">
              {mode === "encrypt" ? "🛡️ Why It's Super Secure" : "🔑 How To Reverse the Process"}
            </h4>
            <p className="text-sm text-muted-fg mb-2">
              {mode === "encrypt" 
                ? "This makes it much harder to crack than a simple Caesar cipher because the same letter in your message might be coded differently each time! The letter 'L' in \"HELLO\" becomes 'J' the first time and 'V' the second time."
                : "To decrypt, you must know the exact keyword. For each letter in the encrypted message, you look up which Caesar shift was used based on the keyword position, then reverse that shift. The arrows in the mappings above show this reverse lookup direction."}
            </p>
            <div className="text-center">
              <div className="inline-block bg-bg p-2 rounded border-2 border-dashed border-accent/30">
                <span className="text-accent font-mono">
                  {mode === "encrypt" ? "🔒 Same letter, different codes!" : "🔓 Same key, reverse each shift!"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 p-4 rounded-lg border-l-4 border-warning">
            <h4 className="font-semibold text-warning mb-2 flex items-center">
              🎮 Understanding the Animations
            </h4>
            <p className="text-sm text-muted-fg">
              The animations above show you a separate Caesar cipher mapping for each letter of your keyword. The first animation uses the first letter of your keyword, the second uses the second letter, and so on. {mode === "encrypt" 
                ? "This shows how each part of your message gets a different shift!" 
                : "In decrypt mode, the arrows point upward to show how you reverse each shift to get back the original letter."}
            </p>
          </div>

          {mode === "encrypt" && (
            <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent shadow-sm">
              <h4 className="font-semibold text-accent-fg mb-2 flex items-center">
                🔐 Why Vigenère is Hard to Crack
              </h4>
              <p className="text-sm text-muted-fg mb-3">
                Unlike Caesar cipher, Vigenère is much harder to break because:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-fg">
                <li>The same letter can be encoded differently each time it appears</li>
                <li>You need to figure out the keyword length first</li>
                <li>Even short keywords create complex patterns</li>
              </ul>
              <div className="mt-3">
                <Button 
                  intent="secondary" 
                  size="small" 
                  onPress={() => setMode("crack")}
                  className="text-xs"
                >
                  Learn How to Crack It →
                </Button>
              </div>
            </div>
          )}

          {mode === "decrypt" && (
            <div className="bg-info/10 p-4 rounded-lg border-l-4 border-info shadow-sm">
              <h4 className="font-semibold text-info-fg mb-2 flex items-center">
                🔍 Decryption Challenge
              </h4>
              <p className="text-sm text-muted-fg mb-3">
                Try decrypting these messages with the keyword "SPY":
              </p>
              <div className="space-y-2 font-mono text-sm">
                <div className="bg-bg p-2 rounded cursor-pointer hover:bg-muted/20 border border-muted/30" onClick={() => setMessage("LZIJQM HEWSDCF")}>
                  LZIJQM HEWSDCF
                </div>
                <div className="bg-bg p-2 rounded cursor-pointer hover:bg-muted/20 border border-muted/30" onClick={() => setMessage("BGPXVR CSRBV")}>
                  BGPXVR CSRBV
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Achievement notifications */}
      {newAchievements.length > 0 && (
        <AchievementNotification
          achievements={newAchievements}
          onClose={() => setNewAchievements([])}
        />
      )}
    </CipherPageContentWrapper>
  );
}