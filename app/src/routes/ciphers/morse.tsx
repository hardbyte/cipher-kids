import { useState, useEffect, useCallback, useMemo } from "react";
import { CipherNav } from "@/components/cipher/CipherNav";
import { CipherPageContentWrapper } from "@/components/cipher/CipherPageContentWrapper";
import { CipherInputs } from "@/components/cipher/CipherInputs";
import { CipherModeToggle } from "@/components/cipher/CipherModeToggle";
import { CipherResult } from "@/components/cipher/results/CipherResult";
import { GeneralStepByStepAnimation, AnimationStep } from "@/components/cipher/shared/GeneralStepByStepAnimation";
import { Button } from "@/components/ui/button";
import { morseCode, MORSE_CODE_MAPPING } from "@/utils/ciphers";
import { initializeAudio, playMorseCharacter, playMorseString, isAudioSupported } from "@/utils/morse-audio";
import { createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/hooks/use-progress";
import { AchievementNotification } from "@/components/achievement-notification";

// Types for better type safety
interface AudioSettings {
  speed: number;
  volume: number;
  frequency: number;
}

interface AudioPreset {
  name: string;
  icon: string;
  settings: AudioSettings;
}

// Constants
const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  speed: 1,
  volume: 0.1,
  frequency: 600
};

const AUDIO_PRESETS: AudioPreset[] = [
  { name: "Classic Telegraph", icon: "📻", settings: { speed: 1, volume: 0.1, frequency: 600 } },
  { name: "Ship Radio", icon: "🚢", settings: { speed: 0.7, volume: 0.15, frequency: 800 } },
  { name: "Modern CW", icon: "⚡", settings: { speed: 1.5, volume: 0.08, frequency: 450 } },
  { name: "Kid-Friendly", icon: "🧒", settings: { speed: 0.8, volume: 0.12, frequency: 700 } }
];

export const Route = createFileRoute("/ciphers/morse")({
  component: MorseCodePage,
});

function MorseCodePage() {
  const { trackAction } = useProgress();
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [message, setMessage] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentCharToHighlight, setCurrentCharToHighlight] = useState<string | undefined>(undefined);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const [isStepAnimationPlaying, setIsStepAnimationPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [isPlayingFullMessage, setIsPlayingFullMessage] = useState(false);
  const [currentPlayingChar, setCurrentPlayingChar] = useState<string | null>(null);
  
  // Memoize sample messages to avoid recreation on every render
  const sampleMessages = useMemo(() => 
    mode === "encode" ? [
      "SOS", // The famous distress signal
      "HELLO WORLD", // Classic programming greeting
      "MORSE CODE IS FUN", // Educational
      "QUICK BROWN FOX", // Contains many letters
      "SECRET MESSAGE", // Feels spy-like
    ] : [
      "... --- ...", // SOS
      ".... . .-.. .-.. --- / .-- --- .-. .-.. -..", // HELLO WORLD
      "-- --- .-. ... . / -.-. --- -.. . / .. ... / ..-. ..- -.", // MORSE CODE IS FUN
      "... . -.-. .-. . - / -- . ... ... .- --. .", // SECRET MESSAGE
      "--.- ..- .. -.-. -.- / -... .-. --- .-- -. / ..-. --- -..-", // QUICK BROWN FOX
    ], [mode]);

  // Memoize reverse Morse mapping for decode operations
  const reverseMorseMap = useMemo(() => 
    Object.fromEntries(
      Object.entries(MORSE_CODE_MAPPING).map(([k, v]) => [v, k]).filter(([k]) => k !== '/')
    ), []);

  // Memoize organized character groups for the interactive table
  const characterGroups = useMemo(() => ({
    letters: Object.entries(MORSE_CODE_MAPPING).filter(([char]) => char.match(/[A-Z]/)),
    numbers: Object.entries(MORSE_CODE_MAPPING).filter(([char]) => char.match(/[0-9]/)),
    special: Object.entries(MORSE_CODE_MAPPING).filter(([char]) => !char.match(/[A-Z0-9]/))
  }), []);

  // Helper function to create audio settings for playback
  const createAudioPlaybackSettings = useCallback(() => ({
    volume: audioSettings.volume,
    frequency: audioSettings.frequency,
    dotDuration: Math.floor(100 / audioSettings.speed),
    dashDuration: Math.floor(300 / audioSettings.speed),
    pauseDuration: Math.floor(100 / audioSettings.speed),
  }), [audioSettings]);

  // Generate animation steps for the GeneralStepByStepAnimation
  const generateAnimationSteps = useCallback(() => {
    if (!message) {
      setAnimationSteps([]);
      return;
    }

    const steps: AnimationStep[] = [];
    const cleanMessage = message.toUpperCase();

    if (mode === "encode") {
      for (let i = 0; i < cleanMessage.length; i++) {
        const char = cleanMessage[i];
        
        if (MORSE_CODE_MAPPING[char]) {
          const morseChar = MORSE_CODE_MAPPING[char];
          steps.push({
            originalChar: char,
            transformedChar: morseChar,
            position: i,
            explanation: `${char} → ${morseChar}`,
          });
        }
      }
    } else {
      // For decode mode, split by spaces first
      const morseChars = message.split(' ').filter(char => char.length > 0);
      
      morseChars.forEach((morseChar, i) => {
        if (morseChar === '/') {
          steps.push({
            originalChar: morseChar,
            transformedChar: ' ',
            position: i,
            explanation: `/ → (space)`,
          });
        } else if (reverseMorseMap[morseChar]) {
          const letter = reverseMorseMap[morseChar];
          steps.push({
            originalChar: morseChar,
            transformedChar: letter,
            position: i,
            explanation: `${morseChar} → ${letter}`,
          });
        }
      });
    }

    setAnimationSteps(steps);
  }, [message, mode, reverseMorseMap]);

  // Handle mode changes - auto-populate input with previous result for better UX
  useEffect(() => {
    // If we have an output and the mode changed, use it as the new input
    if (output && output !== message) {
      setMessage(output);
    }
    
    setOutput("");
    setCurrentCharToHighlight(undefined);
    setShowStepByStep(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally excluding output to prevent infinite loops
  }, [mode]);

  // Reset animation states if message changes
  useEffect(() => {
    setOutput("");
    setCurrentCharToHighlight(undefined);
    setShowStepByStep(false);
    generateAnimationSteps();
  }, [message, generateAnimationSteps]);

  // Initialize audio when component mounts
  useEffect(() => {
    setAudioEnabled(isAudioSupported());
  }, []);

  const playCharacterAudio = useCallback(async (char: string) => {
    if (!audioEnabled || isPlayingAudio) return;
    
    const morsePattern = MORSE_CODE_MAPPING[char];
    if (morsePattern && morsePattern !== '/') {
      try {
        setIsPlayingAudio(true);
        setCurrentPlayingChar(char);
        const settings = createAudioPlaybackSettings();
        await playMorseCharacter(morsePattern, settings);
      } catch (error) {
        console.warn('Audio playback failed:', error);
      } finally {
        setIsPlayingAudio(false);
        setCurrentPlayingChar(null);
      }
    }
  }, [audioEnabled, isPlayingAudio, createAudioPlaybackSettings]);

  const playFullMessage = useCallback(async () => {
    if (!audioEnabled || isPlayingFullMessage || !output) return;
    
    try {
      setIsPlayingFullMessage(true);
      const settings = createAudioPlaybackSettings();
      await playMorseString(output, settings);
    } catch (error) {
      console.warn('Full message playback failed:', error);
    } finally {
      setIsPlayingFullMessage(false);
    }
  }, [audioEnabled, isPlayingFullMessage, output, createAudioPlaybackSettings]);

  const handleAction = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setOutput("");
    setCurrentCharToHighlight(undefined);

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    
    if (mode === "encode") {
      // Use the core morseCode function for encoding
      const result = morseCode(message, false);
      
      // For encode mode, set the result directly
      setOutput(result);
      
      // Track the action for achievements
      if (result && message) {
        try {
          const trackResult = trackAction("morse", "encode");
          if (trackResult && trackResult.length > 0) {
            setNewAchievements(trackResult);
          }
        } catch (error) {
          console.warn("Achievement tracking failed:", error);
        }
      }
    } else {
      // Decode mode - animate the actual decoding process (fixed from original)
      const morseChars = message.split(' ').filter(char => char.length > 0);
      
      let currentAnimatedOutput = "";
      
      for (let i = 0; i < morseChars.length; i++) {
        const morseChar = morseChars[i];
        setCurrentCharToHighlight(morseChar);
        
        if (morseChar === '/') {
          // Word separator becomes space
          currentAnimatedOutput += ' ';
        } else if (reverseMorseMap[morseChar]) {
          // Decode this morse character to its letter
          const letter = reverseMorseMap[morseChar];
          currentAnimatedOutput += letter;
        } else {
          // Unknown morse pattern, keep as-is
          currentAnimatedOutput += morseChar;
        }
        
        setOutput(currentAnimatedOutput);
        await delay(500); // Show each morse symbol being decoded
      }
      
      // Ensure the final output is correct
      const finalResult = morseCode(message, true);
      setOutput(finalResult);
      
      // Track the action for achievements
      if (finalResult && message) {
        try {
          const trackResult = trackAction("morse", "decode");
          if (trackResult && trackResult.length > 0) {
            setNewAchievements(trackResult);
          }
        } catch (error) {
          console.warn("Achievement tracking failed:", error);
        }
      }
    }

    setCurrentCharToHighlight(undefined);
    setIsAnimating(false);
  };

  // Create visual morse code representation
  const MorseCodeVisualizer = () => {
    if (!currentCharToHighlight) {
      return (
        <div className="bg-muted/20 p-4 rounded-lg">
          <div className="text-center text-muted-fg">
            Type a message to see the Morse code patterns!
          </div>
        </div>
      );
    }

    // Handle both individual characters and morse patterns
    let morsePattern: string;
    let displayChar: string;
    
    if (MORSE_CODE_MAPPING[currentCharToHighlight]) {
      // It's a character, show its morse code
      morsePattern = MORSE_CODE_MAPPING[currentCharToHighlight];
      displayChar = currentCharToHighlight;
    } else {
      // It's a morse pattern, show it directly
      morsePattern = currentCharToHighlight;
      // Find the corresponding letter
      const reverseMorseMap = Object.fromEntries(
        Object.entries(MORSE_CODE_MAPPING).map(([k, v]) => [v, k]).filter(([k]) => k !== '/')
      );
      displayChar = reverseMorseMap[currentCharToHighlight] || '?';
    }
    
    return (
      <div className="bg-accent/10 p-6 rounded-lg border-2 border-accent/30">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-accent mb-2">
            {mode === "encode" ? currentCharToHighlight : `${currentCharToHighlight} → ${displayChar}`}
          </div>
          <div className="text-3xl font-mono tracking-widest text-primary">
            {morsePattern.split('').map((symbol, index) => (
              <span 
                key={index}
                className={symbol === '.' ? "text-warning" : "text-danger"}
              >
                {symbol === '.' ? '●' : '▬'}
              </span>
            ))}
          </div>
          <div className="text-sm text-muted-fg mt-2">
            {morsePattern}
          </div>
          
          {audioEnabled && (
            <div className="mt-4">
              <Button
                intent="secondary"
                size="small"
                 onPress={() => {
                   initializeAudio();
                   // For decode mode, play the morse pattern; for encode mode, play the character
                   const charToPlay = mode === "encode" ? currentCharToHighlight : displayChar;
                   playCharacterAudio(charToPlay);
                 }}                isDisabled={isPlayingAudio}
              >
                {isPlayingAudio ? "🔊 Playing..." : "🔊 Listen"}
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-warning text-lg">●</span>
            <span className="text-muted-fg">Dot (short beep)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-danger text-lg">▬</span>
            <span className="text-muted-fg">Dash (long beep)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <CipherPageContentWrapper>
      <CipherNav activeCipher="morse" />

      <CipherModeToggle
        mode={mode}
        setMode={(newMode) => {
          if (!isAnimating && newMode !== "crack") setMode(newMode as "encode" | "decode");
        }}
        hideCrack={true}
      />

      <CipherInputs
        mode={mode}
        message={message}
        setMessage={(newMessage: string) => {
          if (!isAnimating) setMessage(newMessage);
        }}
        handleAction={handleAction}
        isAnimating={isAnimating}
        placeholder={mode === "encode" ? "Type your message..." : "Enter Morse code (use spaces between characters)..."}
      />

      {!message && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
          <div className="font-medium mb-2 text-fg">Try these {mode === "encode" ? "messages" : "Morse codes"}:</div>
          <div className="text-xs text-muted-fg mb-2">
            <span className="bg-warning/20 px-1 py-0.5 rounded">Fun fact:</span> SOS (... --- ...) is the most famous Morse code message!
          </div>
          <div className="grid gap-2">
            {sampleMessages.map((sample, index) => (
              <div 
                key={index} 
                className="bg-bg p-2 rounded border border-muted/30 cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => setMessage(sample)}
              >
                <code className="font-mono text-accent">{sample}</code>
                {index === 0 && <div className="text-xs text-muted-fg mt-1">🆘 Emergency distress signal</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <CipherResult
        output={output}
        visualizer={<MorseCodeVisualizer />}
      />

      {/* Enhanced Audio Controls Panel */}
      {audioEnabled && output && (
        <div className="bg-gradient-to-r from-warning/10 to-accent/10 rounded-lg p-6 border-2 border-warning/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-warning flex items-center gap-2">
              📻 Telegraph Station
            </h3>
            <Button
              intent="secondary"
              size="small"
              onPress={() => setShowAudioControls(!showAudioControls)}
            >
              ⚙️ Audio Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Button
              intent="primary"
              size="large"
              onPress={() => {
                initializeAudio();
                playFullMessage();
              }}
              isDisabled={isPlayingFullMessage || !output}
              className="w-full"
            >
              {isPlayingFullMessage ? "📡 Transmitting..." : "📡 Play Full Message"}
            </Button>
            
            <div className="bg-bg/50 p-3 rounded-lg border border-muted/30">
              <div className="text-xs text-muted-fg mb-1">Output Preview:</div>
              <div className="font-mono text-sm text-primary max-h-20 overflow-y-auto">
                {output}
              </div>
            </div>
          </div>

          {/* Audio Settings Panel */}
          {showAudioControls && (
            <div className="bg-bg/30 p-4 rounded-lg border border-muted/30 space-y-4">
              <h4 className="font-semibold text-accent">🎛️ Telegraph Settings</h4>
              
              {/* Preset Profiles */}
              <div>
                <label className="block text-sm font-medium mb-2">Quick Presets</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {AUDIO_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      intent="secondary"
                      size="small"
                      onPress={() => setAudioSettings(preset.settings)}
                      className="text-xs"
                    >
                      {preset.icon} {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Speed</label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={audioSettings.speed}
                    onChange={(e) => setAudioSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-fg mt-1">{audioSettings.speed}x</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Volume</label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.3"
                    step="0.01"
                    value={audioSettings.volume}
                    onChange={(e) => setAudioSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-fg mt-1">{Math.round(audioSettings.volume * 100)}%</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Pitch</label>
                  <input
                    type="range"
                    min="400"
                    max="1000"
                    step="50"
                    value={audioSettings.frequency}
                    onChange={(e) => setAudioSettings(prev => ({ ...prev, frequency: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-fg mt-1">{audioSettings.frequency}Hz</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Practice Mode */}
      {audioEnabled && (
        <div className="bg-gradient-to-r from-info/10 to-warning/10 rounded-lg p-6 border-2 border-info/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-info flex items-center gap-2">
              🥁 Morse Code Practice Station
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-bg/50 p-4 rounded-lg border border-muted/30">
                <h4 className="font-semibold text-info mb-2">🎯 Tap Practice</h4>
                <p className="text-sm text-muted-fg mb-3">
                  Practice the rhythm of Morse code! Tap the buttons to hear dots and dashes:
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    intent="warning"
                    size="large"
                    onPress={async () => {
                      if (!isPlayingAudio) {
                        initializeAudio();
                        setIsPlayingAudio(true);
                        try {
                          const settings = createAudioPlaybackSettings();
                          await playMorseCharacter('.', settings);
                        } finally {
                          setIsPlayingAudio(false);
                        }
                      }
                    }}
                    isDisabled={isPlayingAudio}
                    className="flex-1"
                  >
                    • DOT
                  </Button>
                  <Button
                    intent="danger"
                    size="large"
                    onPress={async () => {
                      if (!isPlayingAudio) {
                        initializeAudio();
                        setIsPlayingAudio(true);
                        try {
                          const settings = createAudioPlaybackSettings();
                          await playMorseCharacter('-', settings);
                        } finally {
                          setIsPlayingAudio(false);
                        }
                      }
                    }}
                    isDisabled={isPlayingAudio}
                    className="flex-1"
                  >
                    ▬ DASH
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-bg/50 p-4 rounded-lg border border-muted/30">
                <h4 className="font-semibold text-info mb-2">📚 Quick Reference</h4>
                <div className="text-xs space-y-1 font-mono">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-warning">SOS:</span> ••• ▬▬▬ •••</div>
                    <div><span className="text-warning">HELP:</span> •••• • •▬•• ▬••</div>
                    <div><span className="text-warning">HELLO:</span> •••• • •▬•• •▬•• ▬▬▬</div>
                    <div><span className="text-warning">MORSE:</span> ▬▬ ▬▬▬ •▬• ••• •</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-fg">
                  💡 Try tapping out these common patterns!
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="inline-block bg-info/20 px-4 py-2 rounded-lg border border-info/30">
              <span className="text-info font-semibold text-sm">
                🎵 Remember: Dots are quick taps, dashes are long holds!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step Animation Section */}
      <div className="border-t pt-4 border-muted/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-primary">Step-by-Step Animation</h3>
          <Button 
            intent="secondary" 
            size="small"
            onPress={() => {
              setShowStepByStep(!showStepByStep);
              if (!showStepByStep && message) {
                setIsStepAnimationPlaying(true);
              }
            }}
            isDisabled={!message}
          >
            {showStepByStep ? "Hide" : "Show"} Animation
          </Button>
        </div>
        
        {showStepByStep && (
          <GeneralStepByStepAnimation
            steps={animationSteps}
            isPlaying={isStepAnimationPlaying}
            onPlayingChange={(playing) => setIsStepAnimationPlaying(playing)}
            mode={mode}
            cipherType="morse"
            title="Morse Code Translation"
            speed={1200}
          />
        )}
      </div>

      <div className="pt-4 border-t mt-4 space-y-4">
        <h3 className="text-lg font-semibold mb-3 text-fg flex items-center">
          📡 How It Works: Morse Code
        </h3>

        <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
          <h4 className="font-semibold text-primary mb-2 flex items-center">
            🔤 The Dot and Dash Language
          </h4>
          <p className="text-sm text-muted-fg mb-3">
            Morse code turns letters into patterns of short beeps (dots) and long beeps (dashes):
          </p>

          <div className="bg-bg p-4 rounded mb-3 border-2 border-dashed border-primary/30">
            {/* Interactive Letters A-Z */}
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-accent mb-2 text-center">📻 Interactive Letters (Click to Hear!)</h5>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 text-xs font-mono">
                {characterGroups.letters.map(([letter, morse]) => (
                    <button
                      key={letter}
                      onClick={() => {
                        if (audioEnabled) {
                          initializeAudio();
                          playCharacterAudio(letter);
                        }
                      }}
                      className={`text-center p-2 rounded transition-all duration-200 border ${
                        currentPlayingChar === letter
                          ? 'bg-warning/30 border-warning scale-110 animate-pulse'
                          : audioEnabled
                          ? 'bg-muted/10 border-muted/30 hover:bg-accent/20 hover:border-accent hover:scale-105 cursor-pointer'
                          : 'bg-muted/5 border-muted/20 cursor-not-allowed opacity-50'
                      }`}
                      disabled={!audioEnabled || isPlayingAudio}
                      title={audioEnabled ? `Click to hear ${letter} in Morse code` : 'Audio not available'}
                    >
                      <div className="font-bold text-accent">{letter}</div>
                      <div className="text-primary text-xs">{morse}</div>
                      {audioEnabled && <div className="text-xs text-muted-fg mt-1">🔊</div>}
                    </button>
                  ))}
              </div>
              {!audioEnabled && (
                <div className="text-center text-xs text-muted-fg mt-2 italic">
                  Audio not available in this browser
                </div>
              )}
            </div>

            {/* Interactive Numbers 0-9 */}
            <div className="mb-2">
              <h5 className="text-sm font-semibold text-accent mb-2 text-center">📻 Interactive Numbers (Click to Hear!)</h5>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2 text-xs font-mono">
                {characterGroups.numbers.map(([number, morse]) => (
                    <button
                      key={number}
                      onClick={() => {
                        if (audioEnabled) {
                          initializeAudio();
                          playCharacterAudio(number);
                        }
                      }}
                      className={`text-center p-2 rounded transition-all duration-200 border ${
                        currentPlayingChar === number
                          ? 'bg-warning/30 border-warning scale-110 animate-pulse'
                          : audioEnabled
                          ? 'bg-muted/10 border-muted/30 hover:bg-accent/20 hover:border-accent hover:scale-105 cursor-pointer'
                          : 'bg-muted/5 border-muted/20 cursor-not-allowed opacity-50'
                      }`}
                      disabled={!audioEnabled || isPlayingAudio}
                      title={audioEnabled ? `Click to hear ${number} in Morse code` : 'Audio not available'}
                    >
                      <div className="font-bold text-accent">{number}</div>
                      <div className="text-primary text-xs">{morse}</div>
                      {audioEnabled && <div className="text-xs text-muted-fg mt-1">🔊</div>}
                    </button>
                  ))}
              </div>
            </div>

            {/* Interactive Special Characters */}
            <div className="mt-4 pt-3 border-t border-muted/30">
              <h5 className="text-sm font-semibold text-accent mb-2 text-center">📻 Interactive Special Characters (Click to Hear!)</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                {characterGroups.special.map(([char, morse]) => (
                    <button
                      key={char}
                      onClick={() => {
                        if (audioEnabled && char !== '/') {
                          initializeAudio();
                          playCharacterAudio(char);
                        }
                      }}
                      className={`text-center p-2 rounded transition-all duration-200 border ${
                        currentPlayingChar === char && char !== '/'
                          ? 'bg-warning/30 border-warning scale-110 animate-pulse'
                          : audioEnabled && char !== '/'
                          ? 'bg-muted/10 border-muted/30 hover:bg-accent/20 hover:border-accent hover:scale-105 cursor-pointer'
                          : 'bg-muted/5 border-muted/20 cursor-not-allowed opacity-50'
                      }`}
                      disabled={!audioEnabled || isPlayingAudio || char === '/'}
                      title={char === '/' ? 'Word separator (silent)' : audioEnabled ? `Click to hear ${char} in Morse code` : 'Audio not available'}
                    >
                      <div className="font-bold text-accent">
                        {char === '/' ? 'SPACE' : char}
                      </div>
                      <div className="text-primary text-xs">{morse}</div>
                      {audioEnabled && char !== '/' && <div className="text-xs text-muted-fg mt-1">🔊</div>}
                      {char === '/' && <div className="text-xs text-muted-fg mt-1">🔇</div>}
                    </button>
                  ))}
              </div>
              {!audioEnabled && (
                <div className="text-center text-xs text-muted-fg mt-2 italic">
                  Audio not available in this browser
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
          <h4 className="font-semibold text-success mb-2 flex items-center">
            🎯 How to {mode === "encode" ? "Encode" : "Decode"} Messages
          </h4>
          <div className="space-y-2">
            {mode === "encode" ? (
              <>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 1:</span> Take each letter in your message
                </p>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 2:</span> Look up its dot-dash pattern
                </p>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 3:</span> Put a space between each letter's code
                </p>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 4:</span> Use "/" to separate words
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 1:</span> Split the code by spaces to get each letter
                </p>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 2:</span> Look up what each dot-dash pattern means
                </p>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 3:</span> Put the letters together
                </p>
                <p className="text-sm text-muted-fg">
                  <span className="font-semibold">Step 4:</span> Replace "/" with spaces between words
                </p>
              </>
            )}
          </div>

          <div className="mt-3 p-3 bg-bg rounded border-2 border-dashed border-success/30">
            <div className="text-center">
              <div className="text-sm font-semibold text-success mb-2">
                🧩 Example:
              </div>
              <div className="font-mono text-lg">
                {mode === "encode" ? (
                  <>
                    <span className="bg-warning/20 px-2 py-1 rounded mr-2">
                      HI
                    </span>
                    <span className="text-success">→</span>
                    <span className="bg-success/20 px-2 py-1 rounded ml-2">
                      .... ..
                    </span>
                  </>
                ) : (
                  <>
                    <span className="bg-warning/20 px-2 py-1 rounded mr-2">
                      .... ..
                    </span>
                    <span className="text-success">→</span>
                    <span className="bg-success/20 px-2 py-1 rounded ml-2">
                      HI
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
          <h4 className="font-semibold text-accent mb-2 flex items-center">
            📻 Real-World Uses
          </h4>
          <p className="text-sm text-muted-fg mb-2">
            Developed by Samuel Morse, Joseph Henry, and Alfred Vail around 1837 for electrical telegraphy. 
            Vail estimated letter frequencies by counting newspaper type, giving common letters shorter codes! Still used today by:{' '}
            <a 
              href="https://en.wikipedia.org/wiki/Morse_code" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              (Learn more)
            </a>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-accent">🚢 Ships in distress</div>
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-accent">✈️ Pilots and air traffic</div>
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-accent">📡 Ham radio operators</div>
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-accent">🏕️ Scouts and campers</div>
          </div>
        </div>

        <div className="bg-warning/10 p-4 rounded-lg border-l-4 border-warning">
          <h4 className="font-semibold text-warning mb-2 flex items-center">
            🎮 Try It Yourself!
          </h4>
          <p className="text-sm text-muted-fg mb-2">
            Try encoding your name or a secret message! Remember:
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-warning">Dots are short beeps</div>
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-warning">Dashes are long beeps</div>
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-warning">Spaces separate letters</div>
            <div className="bg-bg border border-muted/30 rounded px-2 py-1 text-warning">/ separates words</div>
          </div>
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