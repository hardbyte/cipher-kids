import { useState } from "react";
import { AnimatedMapping } from "@/components/cipher/AnimatedMapping";
import { CipherNav } from "@/components/cipher/CipherNav";
import { CipherInputs } from "@/components/cipher/CipherInputs";
import { CipherModeToggle } from "@/components/cipher/CipherModeToggle";
import { CipherResult } from "@/components/cipher/results/CipherResult";
import { vigenereCipher, ALPHABET } from "@/utils/ciphers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ciphers/vigenere")({
  component: VigenereCipherPage,
});

function VigenereCipherPage() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [message, setMessage] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [output, setOutput] = useState<string>("");

  const handleAction = () => {
    const result = vigenereCipher(message, keyword, mode === "decrypt");
    setOutput(result);
  };

  // Clean keyword for visualization
  const cleanKeyword = keyword.toUpperCase().replace(/[^A-Z]/g, "");

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <CipherNav activeCipher="vigenere" />
      
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
          visualizer={cleanKeyword && (
            <div className="space-y-4">
              {cleanKeyword.split("").map((char, idx) => {
                const shift = ALPHABET.indexOf(char);
                const shiftedAlphabet = ALPHABET.split("").map(
                  (_, i) => ALPHABET[(i + shift) % 26]
                );
                return (
                  <div key={idx} className="mb-2">
                    <div className="text-sm font-semibold mb-1">{char}:</div>
                    <AnimatedMapping
                      from={ALPHABET.split("")}
                      to={shiftedAlphabet}
                    />
                  </div>
                );
              })}
            </div>
          )}
        />

        <div className="pt-4 border-t mt-4 space-y-4">
          <h3 className="text-lg font-semibold mb-3 text-fg flex items-center">
            🔢 How It Works: Vigenère Cipher
          </h3>
          
          <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
            <h4 className="font-semibold text-primary mb-2 flex items-center">
              🎪 Many Caesar Ciphers in One!
            </h4>
            <p className="text-sm text-muted-fg mb-3">
              The Vigenère cipher is like having a whole circus of Caesar ciphers! Each letter in your keyword creates a different Caesar cipher shift.
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
          </div>

          <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
            <h4 className="font-semibold text-success mb-2 flex items-center">
              🎯 How Each Letter Gets Encoded
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-muted-fg">
                <span className="font-semibold">Step 1:</span> Line up your keyword above your message (repeat as needed)
              </p>
              <p className="text-sm text-muted-fg">
                <span className="font-semibold">Step 2:</span> Each keyword letter tells you how much to shift
              </p>
              <p className="text-sm text-muted-fg">
                <span className="font-semibold">Step 3:</span> 'K' = shift by 10, 'E' = shift by 4, 'Y' = shift by 24
              </p>
              <p className="text-sm text-muted-fg">
                <span className="font-semibold">Step 4:</span> Apply different shifts to each message letter!
              </p>
            </div>
            
            <div className="mt-3 p-3 bg-bg rounded border-2 border-dashed border-success/30">
              <div className="text-center">
                <div className="text-sm font-semibold text-success mb-2">🧩 Example with keyword "KEY":</div>
                <div className="font-mono text-sm space-y-1">
                  <div>H + K(10) = R</div>
                  <div>E + E(4) = I</div>
                  <div>L + Y(24) = J</div>
                  <div>L + K(10) = V</div>
                  <div>O + E(4) = S</div>
                </div>
                <div className="font-mono text-lg mt-2">
                  <span className="bg-warning/20 px-2 py-1 rounded mr-2">HELLO</span>
                  <span className="text-success">→</span>
                  <span className="bg-success/20 px-2 py-1 rounded ml-2">RIJVS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
            <h4 className="font-semibold text-accent mb-2 flex items-center">
              🛡️ Why It's Super Secure
            </h4>
            <p className="text-sm text-muted-fg mb-2">
              This makes it much harder to crack than a simple Caesar cipher because the same letter in your message might be coded differently each time! The letter 'L' in "HELLO" becomes 'J' the first time and 'V' the second time.
            </p>
            <div className="text-center">
              <div className="inline-block bg-bg p-2 rounded border-2 border-dashed border-accent/30">
                <span className="text-accent font-mono">🔒 Same letter, different codes!</span>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 p-4 rounded-lg border-l-4 border-warning">
            <h4 className="font-semibold text-warning mb-2 flex items-center">
              🎮 Understanding the Animations
            </h4>
            <p className="text-sm text-muted-fg">
              The animations above show you a separate Caesar cipher mapping for each letter of your keyword. The first animation uses the first letter of your keyword, the second uses the second letter, and so on. This shows how each part of your message gets a different shift!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}