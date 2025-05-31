import React, { useState } from "react";
import { motion } from "framer-motion";

export const VigenereCrackExplanation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  
  const tabs = [
    { id: 0, title: "The Challenge", icon: "🔐" },
    { id: 1, title: "Key Length", icon: "📏" },
    { id: 2, title: "Frequency", icon: "📊" },
    { id: 3, title: "Cracking", icon: "🔓" },
  ];

  return (
    <div className="bg-overlay text-overlay-fg p-4 rounded-lg border border-border">
      <h3 className="text-lg font-bold mb-4 text-primary">Cracking the Vigenère Cipher</h3>
      
      {/* Tab navigation */}
      <div className="flex overflow-x-auto mb-4 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-3 py-2 mr-2 rounded-md transition-colors ${
              activeTab === tab.id 
                ? "bg-primary text-primary-fg" 
                : "bg-muted text-muted-fg hover:bg-muted/80"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            <span>{tab.title}</span>
          </button>
        ))}
      </div>
      
      {/* Content area */}
      <div className="min-h-[300px]">
        {/* Tab 1: The Challenge */}
        {activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-muted p-3 rounded-md">
              <h4 className="text-info font-semibold mb-2">What makes Vigenère harder to crack?</h4>
              <p className="text-muted-fg text-sm mb-2">
                Unlike the Caesar cipher where every letter is shifted by the same amount, 
                the Vigenère cipher uses multiple shifts determined by a keyword.
              </p>
              <div className="bg-muted/50 p-2 rounded-md text-xs text-muted-fg">
                <span className="font-bold text-warning">Key fact:</span> The same letter in your plaintext 
                can become different letters in the ciphertext!
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-muted rounded-md p-3 flex-1">
                <h5 className="text-success mb-1 font-medium text-sm">Caesar Cipher</h5>
                <div className="text-xs text-muted-fg">
                  <p className="mb-1">- One fixed shift</p>
                  <p className="mb-1">- 'A' always becomes the same letter</p>
                  <p>- Only 26 possible shifts</p>
                </div>
              </div>
              <div className="bg-info/20 rounded-md p-3 flex-1">
                <h5 className="text-info mb-1 font-medium text-sm">Vigenère Cipher</h5>
                <div className="text-xs text-muted-fg">
                  <p className="mb-1">- Multiple shifts (from keyword)</p>
                  <p className="mb-1">- 'A' becomes different letters</p>
                  <p>- Many possible keywords!</p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-fg italic">
              Vigenère remained unbroken for centuries and was known as "le chiffre indéchiffrable" 
              (the indecipherable cipher) until techniques were developed in the 19th century.
            </div>
          </motion.div>
        )}
        
        {/* Tab 2: Finding Key Length */}
        {activeTab === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-muted p-3 rounded-md">
              <h4 className="text-info font-semibold mb-2">Step 1: Finding the Key Length</h4>
              <p className="text-muted-fg text-sm">
                The first challenge is figuring out how long the keyword is. We use a technique called 
                <span className="font-bold text-warning"> Kasiski examination</span> or the
                <span className="font-bold text-warning"> Index of Coincidence</span>.
              </p>
            </div>
            
            <div className="bg-muted p-3 rounded-md">
              <h5 className="text-success mb-2 font-medium">Kasiski Examination:</h5>
              <ol className="text-sm text-muted-fg list-decimal pl-5 space-y-2">
                <li>Look for repeated sequences of letters in the ciphertext</li>
                <li>Calculate distances between repeated sequences</li>
                <li>Find factors of these distances</li>
                <li>The most common factors are likely to be the key length</li>
              </ol>
              <div className="mt-3 bg-muted/50 p-2 rounded-md text-xs">
                <span className="text-warning">Example:</span> If "QNX" appears at positions 7 and 28, 
                the distance is 21. Factors of 21 are 3 and 7. This suggests the key length 
                might be 3 or 7.
              </div>
            </div>
            
            <div className="bg-muted p-3 rounded-md">
              <h5 className="text-success mb-2 font-medium">Index of Coincidence:</h5>
              <p className="text-sm text-muted-fg mb-2">
                This statistical method measures the probability that two randomly selected letters are the same.
              </p>
              <ul className="text-sm text-muted-fg list-disc pl-5 space-y-1">
                <li>Natural English text has IoC ≈ 0.067</li>
                <li>Random text has IoC ≈ 0.038</li>
                <li>When we guess the key length correctly, the IoC approaches 0.067</li>
              </ul>
            </div>
          </motion.div>
        )}
        
        {/* Tab 3: Frequency Analysis */}
        {activeTab === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-muted p-3 rounded-md">
              <h4 className="text-info font-semibold mb-2">Step 2: Frequency Analysis</h4>
              <p className="text-muted-fg text-sm">
                Once we know the key length, we can use frequency analysis to crack each position 
                of the key individually.
              </p>
            </div>
            
            <div className="bg-muted p-3 rounded-md">
              <h5 className="text-success mb-2 font-medium">How it works:</h5>
              <ol className="text-sm text-muted-fg list-decimal pl-5 space-y-2">
                <li>Split the ciphertext into groups based on the key length</li>
                <li>Letters in the same position are encrypted with the same shift</li>
                <li>Apply frequency analysis to each group separately</li>
                <li>Each group becomes a simple Caesar cipher we can crack!</li>
              </ol>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md mt-2">
              <h5 className="text-warning mb-2 font-medium">Example with key "SPY" (length 3):</h5>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-muted p-2 rounded-md">
                  <div className="text-center font-bold text-info mb-1">Position 1 (S)</div>
                  <div className="text-muted-fg">
                    <div>H → Z</div>
                    <div>L → D</div>
                    <div>O → G</div>
                  </div>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <div className="text-center font-bold text-info mb-1">Position 2 (P)</div>
                  <div className="text-muted-fg">
                    <div>E → T</div>
                    <div>W → L</div>
                    <div>X → M</div>
                  </div>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <div className="text-center font-bold text-info mb-1">Position 3 (Y)</div>
                  <div className="text-muted-fg">
                    <div>L → J</div>
                    <div>D → B</div>
                    <div>P → N</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Tab 4: Putting it Together */}
        {activeTab === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-muted p-3 rounded-md">
              <h4 className="text-info font-semibold mb-2">Step 3: Cracking the Key</h4>
              <p className="text-muted-fg text-sm">
                Now we use frequency analysis on each character position to recover the keyword.
              </p>
            </div>
            
            <div className="bg-muted p-3 rounded-md">
              <h5 className="text-success mb-2 font-medium">For each position in the key:</h5>
              <ol className="text-sm text-muted-fg list-decimal pl-5 space-y-2">
                <li>Calculate letter frequencies for that position</li>
                <li>Compare with normal English frequencies</li>
                <li>Try all 26 shifts to find which one makes the frequencies match</li>
                <li>The shift gives you the key letter for that position</li>
              </ol>
            </div>
            
            <div className="bg-info/20 p-3 rounded-md mt-2">
              <h5 className="text-info mb-2 font-medium">Modern techniques:</h5>
              <ul className="text-sm text-muted-fg list-disc pl-5 space-y-1">
                <li>
                  <span className="font-bold text-warning">Chi-squared statistic</span>: Compares observed frequencies 
                  with expected frequencies
                </li>
                <li>
                  <span className="font-bold text-warning">Dictionary attacks</span>: Try common words as potential keys
                </li>
                <li>
                  <span className="font-bold text-warning">Computer analysis</span>: Modern computers can test thousands
                  of key combinations per second
                </li>
              </ul>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md mt-2">
              <h5 className="text-warning mb-1 text-sm font-medium">The Final Step:</h5>
              <p className="text-sm text-muted-fg">
                Once you have the key, decrypt the message and see if it produces readable text.
                If not, refine your analysis and try again!
              </p>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="mt-6 text-center">
        <div className="inline-block bg-warning/20 border border-warning/30 text-warning px-3 py-1 rounded-md text-sm">
          🔐 This is why Vigenère is much more secure than Caesar!
        </div>
      </div>
    </div>
  );
};