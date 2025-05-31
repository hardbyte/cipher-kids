import { useState } from "react";
import { AnimatedMapping } from "@/components/cipher/AnimatedMapping";
import { CipherNav } from "@/components/cipher/CipherNav";
import { CipherInputs } from "@/components/cipher/CipherInputs";
import { CipherModeToggle } from "@/components/cipher/CipherModeToggle";
import { CipherResult } from "@/components/cipher/results/CipherResult";
import { keywordCipher, ALPHABET } from "@/utils/ciphers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ciphers/keyword")({
  component: KeywordCipherPage,
});

function KeywordCipherPage() {
  const [mode, setMode] = useState<"encrypt" | "decrypt" | "crack">("encrypt");
  const [message, setMessage] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [output, setOutput] = useState<string>("");

  const handleAction = () => {
    const result = keywordCipher(message, keyword, mode === "decrypt");
    setOutput(result);
  };

  // Generate the cipher alphabet for visualization
  const cleanKeyword = Array.from(
    new Set(keyword.toUpperCase().replace(/[^A-Z]/g, ""))
  ).join("");
  const remaining = ALPHABET.split("").filter(
    (c) => !cleanKeyword.includes(c)
  );
  const cipherAlphabet = cleanKeyword + remaining.join("");

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <CipherNav activeCipher="keyword" />
      
      <div className="rounded-lg border p-4 space-y-4">
        <CipherModeToggle 
          mode={mode} 
          setMode={setMode} 
        />

        <CipherInputs
          mode={mode}
          message={message}
          setMessage={setMessage}
          param={keyword}
          setParam={setKeyword}
          paramPlaceholder="Enter keyword"
          handleAction={handleAction}
        />

        <CipherResult 
          output={output}
          visualizer={keyword && (
            <AnimatedMapping 
              from={mode === "encrypt" ? ALPHABET.split("") : cipherAlphabet.split("")} 
              to={mode === "encrypt" ? cipherAlphabet.split("") : ALPHABET.split("")}
              direction={mode === "encrypt" ? "down" : "up"}
            />
          )}
        />

        <div className="pt-4 border-t mt-4 space-y-4">
          <h3 className="text-lg font-semibold mb-3 text-fg flex items-center">
            🗝️ How It Works: Keyword Cipher
          </h3>
          
          <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
            <h4 className="font-semibold text-primary mb-2 flex items-center">
              🎭 The Secret Handshake for Alphabets
            </h4>
            <p className="text-sm text-muted-fg mb-3">
              The Keyword cipher is like creating a secret club password! You pick a special word that becomes the key to your secret alphabet.
            </p>
            
            <div className="bg-bg p-3 rounded mb-3 border-2 border-dashed border-primary/30">
              <div className="text-center">
                <div className="text-xs text-muted-fg mb-1">🔤 Step 1: Remove duplicate letters</div>
                <div className="font-mono text-sm tracking-wider bg-muted p-2 rounded mb-2">
                  SECRET → SECRT
                </div>
                <div className="text-xs text-muted-fg mb-1">🔤 Step 2: Add remaining alphabet</div>
                <div className="font-mono text-sm tracking-wider bg-primary/10 p-2 rounded text-primary">
                  SECRT + ABDFGHIJKLMNOPQUVWXYZ
                </div>
                <div className="mt-3 text-xs text-muted-fg mb-1">
                  {mode === "encrypt" ? "🔐 Encryption Direction ↓" : "🔓 Decryption Direction ↑"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
            <h4 className="font-semibold text-success mb-2 flex items-center">
              {mode === "encrypt" ? "🎯 How to Encrypt with Your Keyword" : "🎯 How to Decrypt with Your Keyword"}
            </h4>
            <div className="space-y-2">
              {mode === "encrypt" ? (
                <>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 1:</span> Find your letter in the normal alphabet (top row)
                  </p>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 2:</span> Look directly below it in your keyword alphabet (bottom row)
                  </p>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 3:</span> Replace it with the keyword alphabet letter!
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 1:</span> Find your letter in the keyword alphabet (bottom row)
                  </p>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 2:</span> Look directly above it to find the normal alphabet letter (top row)
                  </p>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 3:</span> Replace it with the normal alphabet letter!
                  </p>
                </>
              )}
            </div>
            
            <div className="mt-3 p-3 bg-bg rounded border-2 border-dashed border-success/30">
              <div className="text-center">
                <div className="text-sm font-semibold text-success mb-2">🧩 Example with keyword "SECRET":</div>
                <div className="font-mono text-lg">
                  {mode === "encrypt" ? (
                    <>
                      <span className="bg-warning/20 px-2 py-1 rounded mr-2">HELLO</span>
                      <span className="text-success">→</span>
                      <span className="bg-success/20 px-2 py-1 rounded ml-2">JDMMS</span>
                    </>
                  ) : (
                    <>
                      <span className="bg-warning/20 px-2 py-1 rounded mr-2">JDMMS</span>
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
              {mode === "encrypt" ? "🔄 To Decode (Decrypt)" : "🔄 To Encode (Encrypt)"}
            </h4>
            <p className="text-sm text-muted-fg mb-2">
              {mode === "encrypt" 
                ? "Do the reverse! Find the coded letter in your keyword alphabet (bottom row) and see what the original letter is in the normal alphabet (top row)."
                : "Do the reverse! Find your letter in the normal alphabet (top row) and see what the cipher letter is in the keyword alphabet (bottom row)."}
            </p>
            <div className="text-center">
              <div className="inline-block bg-bg p-2 rounded border-2 border-dashed border-accent/30">
                <span className="text-accent font-mono">🔑 Same keyword, {mode === "encrypt" ? "reverse" : "forward"} lookup!</span>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 p-4 rounded-lg border-l-4 border-warning">
            <h4 className="font-semibold text-warning mb-2 flex items-center">
              🎮 Try It Yourself!
            </h4>
            <p className="text-sm text-muted-fg">
              Type in your own keyword above and watch the alphabet mapping change! The animation shows you exactly how each letter maps in {mode === "encrypt" ? "encryption" : "decryption"} mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}