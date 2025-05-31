import { useState, useEffect } from "react";
import { AnimatedMapping } from "@/components/cipher/AnimatedMapping";
import { CipherNav } from "@/components/cipher/CipherNav";
import { CipherInputs } from "@/components/cipher/CipherInputs";
import { Slider } from "@/components/ui/slider"; // Assuming shadcn/ui structure
import { CipherModeToggle } from "@/components/cipher/CipherModeToggle";
import { CipherResult } from "@/components/cipher/results/CipherResult";
import { AllCaesarShifts } from "@/components/cipher/results/AllCaesarShifts";
import { caesarCipher, ALPHABET } from "@/utils/ciphers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ciphers/caesar")({
  component: CaesarCipherPage,
});

function CaesarCipherPage() {
  const [mode, setMode] = useState<"encrypt" | "decrypt" | "crack">("encrypt");
  const [message, setMessage] = useState<string>("");
  const [shift, setShift] = useState<number>(3); // Default shift to 3, type is number
  const [output, setOutput] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentCharToHighlight, setCurrentCharToHighlight] = useState<
    string | undefined
  >(undefined);
  
  // Sample messages for kids to try decoding in crack mode
  const sampleMessages = [
    "KHOOR ZRUOG", // "HELLO WORLD" with shift 3 (Caesar's actual shift!)
    "FDHVDU FLSKHU LV IXQ", // "CAESAR CIPHER IS FUN" with shift 3
    "L FDPH, L VDZ, L FRQTXHUHG", // "I CAME, I SAW, I CONQUERED" - Caesar's famous quote with shift 3
    "VHFXULWB EB REVFXULWB", // "SECURITY BY OBSCURITY" with shift 3
    "WKH TXLFN EURZQ IRA", // "THE QUICK BROWN FOX" with shift 3
  ];

  // Reset animation states if mode, message or shift changes
  useEffect(() => {
    setOutput("");
    setCurrentCharToHighlight(undefined);
    // setIsAnimating(false); // Might be too aggressive, could stop an ongoing animation
  }, [mode, message, shift]);

  const handleAction = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setOutput("");
    setCurrentCharToHighlight(undefined);

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    let currentAnimatedOutput = "";

    for (let i = 0; i < message.length; i++) {
      const char = message[i];
      const upperChar = char.toUpperCase();

      if (ALPHABET.includes(upperChar)) {
        setCurrentCharToHighlight(upperChar);

        const charIndex = ALPHABET.indexOf(upperChar);
        let newIndex;
        if (mode === "decrypt") {
          newIndex = (charIndex - shift + 26) % 26;
        } else {
          newIndex = (charIndex + shift) % 26;
        }
        const cipheredChar = ALPHABET[newIndex];

        // Preserve case
        const resultChar =
          char === upperChar ? cipheredChar : cipheredChar.toLowerCase();
        currentAnimatedOutput += resultChar;
        setOutput(currentAnimatedOutput);
        await delay(350); // Animation step delay for processing a character
      } else {
        // Non-alphabetic characters
        setCurrentCharToHighlight(undefined); // No highlight for non-alpha
        currentAnimatedOutput += char;
        setOutput(currentAnimatedOutput);
        await delay(50); // Shorter delay for non-alpha characters
      }
    }

    setCurrentCharToHighlight(undefined); // Clear highlight at the end
    setIsAnimating(false);
  };

  // Slider ensures shift is within 0-25.
  // The modulo 26 for index calculation handles positive shifts correctly.
  const shiftedAlphabet = ALPHABET.split("").map(
    (_, i) => ALPHABET[(i + shift + 26) % 26], // Ensure positive result before modulo
  );

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <CipherNav activeCipher="caesar" />

      <div className="rounded-lg border p-4 space-y-4">
        <CipherModeToggle
          mode={mode}
          setMode={(newMode) => {
            if (!isAnimating) setMode(newMode);
          }}
        />

        {mode !== "crack" && (
          <Slider
            label={`Shift: ${shift}`}
            minValue={0}
            maxValue={25}
            step={1}
            value={[shift]}
            onChange={(val: number | number[]) => {
              if (isAnimating) return;
              if (Array.isArray(val)) {
                setShift(val[0]);
              } else {
                setShift(val);
              }
            }}
            className="my-2"
            isDisabled={isAnimating}
          />
        )}

        <CipherInputs
          mode={mode}
          message={message}
          setMessage={(newMessage: string) => {
            if (!isAnimating) setMessage(newMessage);
          }}
          // param, setParam, and paramPlaceholder are removed as shift is handled by slider
          handleAction={mode !== "crack" ? handleAction : undefined}
          // Assuming CipherInputs can take an isProcessing/isDisabled prop
          // and apply it to its internal message input and button.
          // This is a placeholder for now. A more robust solution would be
          // to modify CipherInputs to accept and use such a prop.
          // For the button, its onPress={handleAction} will be guarded by isAnimating check within handleAction.
          // For the message input, the setMessage guard above helps.
        />

        {mode === "crack" ? (
            <>
              {!message && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="font-medium mb-2">Try to decode these secret messages:</div>
                  <div className="text-xs text-gray-600 mb-2">
                    <span className="bg-yellow-100 px-1 py-0.5 rounded">Fun fact:</span> Julius Caesar used shift 3 for his own secret messages!
                  </div>
                  <div className="grid gap-2">
                    {sampleMessages.map((sample, index) => (
                      <div 
                        key={index} 
                        className="bg-white p-2 rounded border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors"
                        onClick={() => setMessage(sample)}
                      >
                        <code className="font-mono text-purple-700">{sample}</code>
                        {index === 2 && <div className="text-xs text-gray-500 mt-1">🏛️ Caesar's famous quote</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <AllCaesarShifts message={message} currentShift={shift} />
            </>
          ) : (
            <CipherResult
              output={output}
              visualizer={
                <AnimatedMapping
                  from={mode === "encrypt" ? ALPHABET.split("") : shiftedAlphabet}
                  to={mode === "encrypt" ? shiftedAlphabet : ALPHABET.split("")}
                  highlightChar={currentCharToHighlight}
                  direction={mode === "encrypt" ? "down" : "up"}
                />
              }
            />
          )}

        <div className="pt-4 border-t mt-4 space-y-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
            🏛️ How It Works: Caesar Cipher
          </h3>

          <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
            <h4 className="font-semibold text-primary mb-2 flex items-center">
              📜 The Secret Alphabet Strips
            </h4>
            <p className="text-sm text-muted-fg mb-3">
              Imagine you're a Roman spy with two magic alphabet strips:
            </p>

            <div className="bg-bg p-3 rounded mb-3 border-2 border-dashed border-primary/30">
              <div className="text-center">
                  {mode === "encrypt" ? (
                    <>
                      <div className="text-xs text-muted-fg mb-1">
                        🔤 Normal Alphabet
                      </div>
                      <div className="font-mono text-sm tracking-wider bg-muted p-2 rounded">
                        A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
                      </div>
                      <div className="my-2 text-primary">
                        ↓ Slide by {shift} positions ↓
                      </div>
                      <div className="text-xs text-muted-fg mb-1">
                        🔐 Secret Alphabet
                      </div>
                      <div className="font-mono text-sm tracking-wider bg-primary/10 p-2 rounded text-primary">
                        {shiftedAlphabet.join(" ")}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-muted-fg mb-1">
                        🔐 Secret Alphabet
                      </div>
                      <div className="font-mono text-sm tracking-wider bg-primary/10 p-2 rounded text-primary">
                        {shiftedAlphabet.join(" ")}
                      </div>
                      <div className="my-2 text-primary">
                        ↑ Slide back by {shift} positions ↑
                      </div>
                      <div className="text-xs text-muted-fg mb-1">
                        🔤 Normal Alphabet
                      </div>
                      <div className="font-mono text-sm tracking-wider bg-muted p-2 rounded">
                        A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
                      </div>
                    </>
                  )}
                </div>
            </div>
          </div>

          <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
            <h4 className="font-semibold text-success mb-2 flex items-center">
              🎯 {mode === "encrypt" ? "How to Encode a Message" : "How to Decode a Message"}
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-muted-fg">
                <span className="font-semibold">Step 1:</span> Pick your secret
                shift number (like {shift})
              </p>
              {mode === "encrypt" ? (
                <>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 2:</span> For each letter
                    in your message, find it in the normal alphabet
                  </p>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 3:</span> Look directly
                    below it in the secret alphabet
                  </p>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 4:</span> Replace your
                    letter with the secret one!
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 2:</span> For each letter
                    in your secret message, find it in the secret alphabet
                  </p>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 3:</span> Look directly
                    above it to find the normal alphabet letter
                  </p>
                  <p className="text-sm text-muted-fg">
                    <span className="font-semibold">Step 4:</span> Replace the
                    secret letter with the normal one!
                  </p>
                </>
              )}
            </div>

            <div className="mt-3 p-3 bg-bg rounded border-2 border-dashed border-success/30">
              <div className="text-center">
                <div className="text-sm font-semibold text-success mb-2">
                  🧩 Example with shift {shift}:
                </div>
                <div className="font-mono text-lg">
                  {mode === "encrypt" ? (
                    <>
                      <span className="bg-warning/20 px-2 py-1 rounded mr-2">
                        HELLO
                      </span>
                      <span className="text-success">→</span>
                      <span className="bg-success/20 px-2 py-1 rounded ml-2">
                        {caesarCipher("HELLO", shift, false)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="bg-warning/20 px-2 py-1 rounded mr-2">
                        {caesarCipher("HELLO", shift, false)}
                      </span>
                      <span className="text-success">→</span>
                      <span className="bg-success/20 px-2 py-1 rounded ml-2">
                        HELLO
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {mode === "encrypt" ? (
            <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
              <h4 className="font-semibold text-accent mb-2 flex items-center">
                🔄 To Decode (Decrypt)
              </h4>
              <p className="text-sm text-muted-fg mb-2">
                Just do the opposite! Slide the alphabet strip back by the same
                number of steps. If you encoded with shift {shift}, decode with
                shift {shift}.
              </p>
              <div className="text-center">
                <div className="inline-block bg-bg p-2 rounded border-2 border-dashed border-accent/30">
                  <span className="text-accent font-mono">
                    🔑 Same key, reverse direction!
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
              <h4 className="font-semibold text-accent mb-2 flex items-center">
                🔄 To Encode (Encrypt)
              </h4>
              <p className="text-sm text-muted-fg mb-2">
                Just do the opposite! Slide the alphabet strip forward by the same
                number of steps. If you decoded with shift {shift}, encode with
                shift {shift}.
              </p>
              <div className="text-center">
                <div className="inline-block bg-bg p-2 rounded border-2 border-dashed border-accent/30">
                  <span className="text-accent font-mono">
                    🔑 Same key, opposite direction!
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-warning/10 p-4 rounded-lg border-l-4 border-warning">
            <h4 className="font-semibold text-warning mb-2 flex items-center">
              🎮 Try It Yourself!
            </h4>
            <p className="text-sm text-muted-fg">
              Use the slider above to change your shift number and watch the
              {mode === "encrypt" ? " secret" : " cipher"} alphabet change! Then type a message and click "
              {mode === "encrypt" ? "Encrypt" : "Decrypt"}" to see the
              step-by-step animation.
            </p>
          </div>
          
          <div className="bg-purple-100 p-4 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-700 mb-2 flex items-center">
              🕵️‍♀️ Crack the Code!
            </h4>
            <p className="text-sm text-muted-fg mb-3">
              Switch to "Crack" mode to see all 26 possible shifts at once! This shows 
              how easy it is to break a Caesar cipher through "brute force" - trying 
              every possible key until you find one that makes sense.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="bg-white/50 border border-purple-200 rounded px-2 py-1 text-purple-800">Fact: Caesar used shift 3</div>
              <div className="bg-white/50 border border-purple-200 rounded px-2 py-1 text-purple-800">Spies needed better ciphers</div>
              <div className="bg-white/50 border border-purple-200 rounded px-2 py-1 text-purple-800">Easy for computers to crack</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
