import { useState, useEffect, useCallback } from "react";
import { AnimatedMapping } from "@/components/cipher/AnimatedMapping";
import { CipherNav } from "@/components/cipher/CipherNav";
import { CipherPageContentWrapper } from "@/components/cipher/CipherPageContentWrapper";
import { CipherInputs } from "@/components/cipher/CipherInputs";
import { CipherModeToggle } from "@/components/cipher/CipherModeToggle";
import { CipherResult } from "@/components/cipher/results/CipherResult";
import { keywordCipher, ALPHABET } from "@/utils/ciphers";
import { createFileRoute } from "@tanstack/react-router";
import { CrackButton } from "@/components/cipher/CrackButton";

export const Route = createFileRoute("/ciphers/keyword")({
  component: KeywordCipherPage,
});

function KeywordCipherPage() {
  const [mode, setMode] = useState<"encrypt" | "decrypt" | "crack">("encrypt");
  const [message, setMessage] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [crackResults, setCrackResults] = useState<string>("");
  const [crackAttempts, setCrackAttempts] = useState<Array<{keyword: string, result: string, score: number}>>([]);
  const [extendedKeywords, setExtendedKeywords] = useState<string[]>([]);

  // Common keywords to try when cracking (single words and phrases)
  const commonKeywords = [
    // Single words
    'SECRET', 'PASSWORD', 'KEY', 'CIPHER', 'CODE', 'MAGIC', 'MYSTERY', 'PUZZLE',
    'HIDDEN', 'ENCRYPT', 'CRYPTO', 'SECURE', 'LOCK', 'SAFE', 'GUARD', 'SHIELD',
    'CASTLE', 'DRAGON', 'KNIGHT', 'SWORD', 'TREASURE', 'GOLD', 'SILVER', 'DIAMOND',
    'SCHOOL', 'TEACHER', 'STUDENT', 'LEARN', 'STUDY', 'BOOK', 'READ', 'WRITE',
    'FAMILY', 'FRIEND', 'LOVE', 'HAPPY', 'SMILE', 'LAUGH', 'PLAY', 'GAME',
    'COMPUTER', 'INTERNET', 'PHONE', 'EMAIL', 'MESSAGE', 'TEXT', 'WORD', 'LETTER',
    // Two word combinations
    'TOP SECRET', 'SECRET CODE', 'MAGIC WORD', 'CIPHER KEY', 'HIDDEN MESSAGE',
    'SECRET AGENT', 'CODE WORD', 'SAFE HOUSE', 'TREASURE MAP', 'KNIGHT SWORD',
    'DRAGON FIRE', 'CASTLE GUARD', 'GOLD COIN', 'MAGIC SPELL', 'SECRET DOOR',
    'PUZZLE PIECE', 'BOOK CODE', 'FAMILY NAME', 'HAPPY DAY', 'COMPUTER GAME',
    // Three word combinations
    'TOP SECRET CODE', 'MAGIC SPELL BOOK', 'TREASURE MAP KEY', 'SECRET AGENT CODE',
    'CASTLE GUARD KNIGHT', 'DRAGON FIRE SWORD', 'HIDDEN TREASURE MAP', 'CIPHER CODE KEY',
    'SAFE HOUSE KEY', 'MAGIC DOOR CODE', 'SECRET MESSAGE CODE', 'PUZZLE PIECE KEY'
  ];

  // Keyword strength rating
  const getKeywordStrength = useCallback((keyword: string): { rating: string, score: number, advice: string } => {
    if (!keyword.trim()) return { rating: "No Keyword", score: 0, advice: "Enter a keyword to see its strength!" };
    
    const cleanKeyword = keyword.toUpperCase().replace(/[^A-Z ]/g, "");
    let score = 0;
    
    // Length scoring
    if (cleanKeyword.length >= 8) score += 3;
    else if (cleanKeyword.length >= 5) score += 2;
    else if (cleanKeyword.length >= 3) score += 1;
    
    // Check if it's not in common keywords list
    const isCommon = commonKeywords.some(common => common === cleanKeyword);
    if (!isCommon) score += 2;
    
    // Multiple words bonus
    if (cleanKeyword.includes(' ')) score += 1;
    
    // Unique letters bonus
    const uniqueLetters = new Set(cleanKeyword.replace(/\s/g, '')).size;
    if (uniqueLetters >= 8) score += 2;
    else if (uniqueLetters >= 5) score += 1;
    
    if (score >= 7) return { rating: "Very Strong", score, advice: "Excellent! This would be very hard to crack!" };
    if (score >= 5) return { rating: "Strong", score, advice: "Good choice! Much better than common words." };
    if (score >= 3) return { rating: "Okay", score, advice: "Not bad, but could be stronger." };
    if (score >= 1) return { rating: "Weak", score, advice: "Too easy to guess. Try a longer or more unique word." };
    return { rating: "Very Weak", score, advice: "Very easy to crack! Pick something less obvious." };
  }, [commonKeywords]);

  // Handle mode changes - auto-populate input with previous result for better UX
  useEffect(() => {
    // If we have an output and the mode changed, use it as the new input
    if (output && output !== message) {
      setMessage(output);
    }
    
    setOutput("");
    setCrackResults("");
    setCrackAttempts([]);
  }, [mode]);

  // Real-time feedback effect for message and keyword changes
  useEffect(() => {
    if (mode !== "crack" && message.trim() && keyword.trim() && !isAnimating) {
      const result = keywordCipher(message, keyword, mode === "decrypt");
      setOutput(result);
    } else if (mode === "crack") {
      setOutput("");
    }
  }, [message, keyword, isAnimating]);

  // Sample messages for crack mode - pre-encrypted messages that can be cracked
  const crackSamples = [
    { encrypted: 'DTIIL WLOIR', keyword: 'SECRET', original: 'HELLO WORLD' },
    { encrypted: 'GQOOE LQU', keyword: 'MAGIC', original: 'PIZZA DAY' },
    { encrypted: 'MPZPS LDSSDQF', keyword: 'DRAGON', original: 'SECRET MESSAGE' },
    { encrypted: 'OXDKDQ HQYFS', keyword: 'TREASURE', original: 'HAPPY TIMES' },
    { encrypted: 'EDDFYR KXSXP', keyword: 'CASTLE', original: 'AMAZING STORY' }
  ];

  const handleTrySample = () => {
    if (mode === "crack") {
      // For crack mode, provide a pre-encrypted message
      const randomSample = crackSamples[Math.floor(Math.random() * crackSamples.length)];
      setMessage(randomSample.encrypted);
      // Clear previous crack results
      setCrackResults("");
      setCrackAttempts([]);
    } else {
      // For encrypt/decrypt modes, use regular sample messages
      const samples = [
        "HELLO WORLD",
        "SECRET MESSAGE", 
        "HAPPY BIRTHDAY",
        "TREASURE HUNT",
        "MAGIC SPELL"
      ];
      const randomSample = samples[Math.floor(Math.random() * samples.length)];
      setMessage(randomSample);
    }
  };

  // Load additional keywords from API for enhanced cracking (with offline fallback)
  const loadExtendedKeywords = useCallback(async (): Promise<string[]> => {
    try {
      // Use a public word list API (like Wordnik or similar)
      const response = await fetch('https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&includePartOfSpeech=noun,adjective&minCorpusCount=1000&maxCorpusCount=10000&minDictionaryCount=1&maxDictionaryCount=10&minLength=4&maxLength=12&limit=50&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        const words = await response.json();
        return words.map((word: { word: string }) => word.word.toUpperCase());
      }
    } catch (error) {
      console.info('Using offline keywords only:', error);
    }
    
    // Fallback: additional offline keywords for enhanced cracking
    return [
      'BIRTHDAY', 'CHRISTMAS', 'VACATION', 'SUNSHINE', 'RAINBOW', 'BUTTERFLY',
      'ELEPHANT', 'DINOSAUR', 'ADVENTURE', 'DISCOVERY', 'JOURNEY', 'EXPLORER',
      'FREEDOM', 'VICTORY', 'WISDOM', 'COURAGE', 'STRENGTH', 'LOYALTY',
      'PRINCESS', 'KINGDOM', 'FANTASY', 'LEGEND', 'DESTINY', 'MIRACLE',
      'OCEAN', 'MOUNTAIN', 'FOREST', 'DESERT', 'RIVER', 'MEADOW',
      'LIGHTNING', 'THUNDER', 'STORM', 'CLOUDS', 'SUNRISE', 'SUNSET',
      'GALAXY', 'PLANET', 'ROCKET', 'ASTRONAUT', 'UNIVERSE', 'COMET',
      'ROBOT', 'FUTURE', 'SCIENCE', 'INVENTION', 'DISCOVERY', 'GENIUS'
    ];
  }, []);

  // Load extended keywords on component mount
  useEffect(() => {
    loadExtendedKeywords().then(setExtendedKeywords);
  }, [loadExtendedKeywords]);

  // Advanced scoring function with n-gram analysis
  const scoreText = useCallback((text: string): number => {
    if (!text || text.length < 2) return 0;
    
    const cleanText = text.toUpperCase().replace(/[^A-Z\s]/g, '');
    let score = 0;
    
    // 1. Common word scoring
    const commonWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'HAVE', 'THAT', 'WILL', 'THIS', 'WITH', 'FROM', 'THEY', 'KNOW', 'WANT', 'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST', 'LIKE', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH', 'TAKE', 'THAN', 'THEM', 'WELL', 'WERE'];
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    words.forEach(word => {
      if (commonWords.includes(word)) score += 15;
      if (word.length >= 3 && word.length <= 8) score += 3;
    });
    
    // 2. Letter frequency analysis (English letter frequencies)
    const expectedFreq = { E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3, H: 6.1, R: 6.0, D: 4.3, L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4, F: 2.2, G: 2.0, Y: 2.0, P: 1.9, B: 1.3, V: 1.0, K: 0.8, J: 0.15, X: 0.15, Q: 0.10, Z: 0.07 };
    const letterCounts = cleanText.replace(/\s/g, '').split('').reduce((acc, char) => {
      if (/[A-Z]/.test(char)) acc[char] = (acc[char] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalLetters = Object.values(letterCounts).reduce((sum, count) => sum + count, 0);
    if (totalLetters > 0) {
      Object.entries(expectedFreq).forEach(([letter, expectedPercent]) => {
        const actualCount = letterCounts[letter] || 0;
        const actualPercent = (actualCount / totalLetters) * 100;
        const difference = Math.abs(actualPercent - expectedPercent);
        score += Math.max(0, 5 - difference); // Reward closer matches to expected frequency
      });
    }
    
    // 3. Bigram analysis (common English letter pairs)
    const commonBigrams = ['TH', 'HE', 'IN', 'ER', 'AN', 'RE', 'ED', 'ND', 'ON', 'EN', 'AT', 'OU', 'IT', 'IS', 'OR', 'TI', 'HI', 'AS', 'TO', 'ET'];
    const textNospaces = cleanText.replace(/\s/g, '');
    for (let i = 0; i < textNospaces.length - 1; i++) {
      const bigram = textNospaces.substr(i, 2);
      if (commonBigrams.includes(bigram)) score += 4;
    }
    
    // 4. Trigram analysis (common English three-letter combinations)
    const commonTrigrams = ['THE', 'AND', 'ING', 'HER', 'HAT', 'HIS', 'THA', 'ERE', 'FOR', 'ENT', 'ION', 'TER', 'HAS', 'YOU', 'ITH', 'VER', 'ALL', 'WIT', 'THI', 'TIO'];
    for (let i = 0; i < textNospaces.length - 2; i++) {
      const trigram = textNospaces.substr(i, 3);
      if (commonTrigrams.includes(trigram)) score += 6;
    }
    
    // 5. Vowel-consonant pattern scoring
    const vowels = 'AEIOU';
    let vowelCount = 0;
    let consonantCount = 0;
    textNospaces.split('').forEach(char => {
      if (/[A-Z]/.test(char)) {
        if (vowels.includes(char)) vowelCount++;
        else consonantCount++;
      }
    });
    const totalAlpha = vowelCount + consonantCount;
    if (totalAlpha > 0) {
      const vowelRatio = vowelCount / totalAlpha;
      // English has roughly 38-42% vowels
      if (vowelRatio >= 0.35 && vowelRatio <= 0.45) score += 10;
      else if (vowelRatio >= 0.25 && vowelRatio <= 0.55) score += 5;
    }
    
    return Math.round(score);
  }, []);

  const handleAction = () => {
    if (mode === "crack") {
      // In crack mode, we can't easily crack a keyword cipher without the keyword
      // Show educational message instead
      setCrackResults("Keyword ciphers are difficult to crack without knowing the keyword! Try using frequency analysis or looking for common words.");
      setOutput("");
    } else {
      const result = keywordCipher(message, keyword, mode === "decrypt");
      setOutput(result);
      setCrackResults("");
    }
  };

  const handleCrack = () => {
    if (!message.trim()) {
      setCrackResults("Please enter an encrypted message to crack!");
      return;
    }

    const keywordCount = commonKeywords.length + extendedKeywords.length;
    setCrackResults(`🔍 Attempting to crack with ${keywordCount} keywords...`);
    setCrackAttempts([]);
    
    // Combine base keywords with extended ones (online + offline fallback)
    const allKeywords = [...commonKeywords, ...extendedKeywords];
    
    // Try each keyword
    const attempts = allKeywords.map(testKeyword => {
      const decrypted = keywordCipher(message, testKeyword, true);
      const score = scoreText(decrypted);
      return { keyword: testKeyword, result: decrypted, score };
    });
    
    // Sort by score (highest first)
    attempts.sort((a, b) => b.score - a.score);
    setCrackAttempts(attempts);
    
    const bestAttempt = attempts[0];
    if (bestAttempt && bestAttempt.score > 50) {
      setCrackResults(`🎯 Possible crack found! Keyword "${bestAttempt.keyword}" gives readable text.`);
      setOutput(bestAttempt.result);
    } else if (bestAttempt && bestAttempt.score > 30) {
      setCrackResults(`🤔 Found a possible solution with keyword "${bestAttempt.keyword}", but it might not be perfect.`);
      setOutput(bestAttempt.result);
    } else {
      setCrackResults("❌ No obvious solution found with common keywords. The cipher may use an uncommon keyword, or this might not be a keyword cipher.");
    }
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
    <CipherPageContentWrapper>
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
          param={mode !== "crack" ? keyword : undefined}
          setParam={mode !== "crack" ? setKeyword : undefined}
          paramPlaceholder="Enter keyword"
          handleAction={mode !== "crack" ? handleAction : undefined}
          isAnimating={isAnimating}
          customSampleHandler={handleTrySample}
        />

        {/* Keyword Strength Meter */}
        {mode !== "crack" && keyword && (
          <div className="bg-muted/5 p-4 rounded-lg border border-muted/20">
            <h4 className="font-semibold text-fg mb-2 flex items-center">
              🛡️ Keyword Security Rating
            </h4>
            {(() => {
              const strength = getKeywordStrength(keyword);
              const strengthColors = {
                "No Keyword": "text-muted-fg",
                "Very Weak": "text-destructive",
                "Weak": "text-warning",
                "Okay": "text-accent",
                "Strong": "text-success",
                "Very Strong": "text-primary"
              };
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-fg">Strength:</span>
                    <span className={`font-semibold ${strengthColors[strength.rating as keyof typeof strengthColors]}`}>
                      {strength.rating}
                    </span>
                  </div>
                  <div className="w-full bg-muted/20 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        strength.score >= 7 ? 'bg-primary' :
                        strength.score >= 5 ? 'bg-success' :
                        strength.score >= 3 ? 'bg-accent' :
                        strength.score >= 1 ? 'bg-warning' :
                        'bg-destructive'
                      }`}
                      style={{ width: `${Math.max(10, (strength.score / 8) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-fg">{strength.advice}</p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Crack Mode Button */}
        {mode === "crack" && (
          <CrackButton
            onClick={handleCrack}
            isAnimating={isAnimating}
            message={message}
            label="Crack Keyword Cipher"
            description={`Try to crack this cipher using ${commonKeywords.length + extendedKeywords.length} keywords and see the weaknesses!`}
          />
        )}

        <CipherResult 
          output={output}
          visualizer={keyword && mode !== "crack" && (
            <AnimatedMapping 
              from={mode === "encrypt" ? ALPHABET.split("") : cipherAlphabet.split("")} 
              to={mode === "encrypt" ? cipherAlphabet.split("") : ALPHABET.split("")}
              direction={mode === "encrypt" ? "down" : "up"}
            />
          )}
        />

        {/* Crack Results */}
        {mode === "crack" && crackResults && (
          <div className="bg-muted/5 rounded-lg p-6 border-2 border-muted/20">
            <h3 className="text-xl font-semibold mb-4 text-fg flex items-center">
              🕵️‍♀️ Crack Analysis
            </h3>
            <div className="space-y-4">
              <p className="text-fg">{crackResults}</p>
              
              {/* Show top crack attempts */}
              {crackAttempts.length > 0 && (
                <div className="bg-bg p-4 rounded border border-muted">
                  <h4 className="font-semibold text-fg mb-3">🎯 Top Crack Attempts:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {crackAttempts.slice(0, 10).map((attempt, index) => (
                      <div key={attempt.keyword} className={`p-2 rounded text-xs ${index === 0 && attempt.score > 50 ? 'bg-success/10 border border-success/30' : attempt.score > 30 ? 'bg-accent/10 border border-accent/30' : 'bg-muted/10'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono font-semibold">Keyword: {attempt.keyword}</span>
                          <span className={`px-2 py-1 rounded ${attempt.score > 50 ? 'bg-success/20 text-success' : attempt.score > 30 ? 'bg-accent/20 text-accent' : 'bg-muted/20 text-muted-fg'}`}>
                            Score: {attempt.score}
                          </span>
                        </div>
                        <div className="font-mono text-muted-fg break-all">
                          {attempt.result.length > 80 ? attempt.result.substring(0, 80) + '...' : attempt.result}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-bg p-4 rounded border border-muted">
                <h4 className="font-semibold text-fg mb-2">🔍 Why This Cipher Can Be Broken:</h4>
                <div className="space-y-3 text-sm text-muted-fg">
                  <div className="bg-destructive/10 p-3 rounded border-l-4 border-destructive/50">
                    <h5 className="font-semibold text-destructive mb-1">1. Guessable Keywords</h5>
                    <p>Most people pick easy words like "SECRET" or "PASSWORD". Our computer tries all the popular words first!</p>
                  </div>
                  <div className="bg-warning/10 p-3 rounded border-l-4 border-warning/50">
                    <h5 className="font-semibold text-warning mb-1">2. Letter Clues Stay the Same</h5>
                    <p>Common letters like "E" and "T" still appear often, giving us hints about what the message says.</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded border-l-4 border-accent/50">
                    <h5 className="font-semibold text-accent mb-1">3. Repeating Letter Patterns</h5>
                    <p>Words like "THAT" always become the same scrambled letters, making it easier to spot patterns.</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded border-l-4 border-primary/50">
                    <h5 className="font-semibold text-primary mb-1">4. One Clue Reveals Everything</h5>
                    <p>If we figure out what one word means, we can decode the whole alphabet and read everything!</p>
                  </div>
                </div>
              </div>

              <div className="bg-bg p-4 rounded border border-muted">
                <h4 className="font-semibold text-fg mb-2">🕵️ How To Be a Code Detective:</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-fg">
                  <div>
                    <h6 className="font-semibold">📚 Try Popular Words:</h6>
                    <p>Test words like "SECRET", "MAGIC", or "TREASURE"</p>
                  </div>
                  <div>
                    <h6 className="font-semibold">🔢 Count the Letters:</h6>
                    <p>See which scrambled letters appear most often</p>
                  </div>
                  <div>
                    <h6 className="font-semibold">🔄 Spot Repeating Patterns:</h6>
                    <p>Look for the same groups of letters appearing again</p>
                  </div>
                  <div>
                    <h6 className="font-semibold">💡 Use Word Clues:</h6>
                    <p>If you guess one word, use it to figure out others!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
    </CipherPageContentWrapper>
  );
}