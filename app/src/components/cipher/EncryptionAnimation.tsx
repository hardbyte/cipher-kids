// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// interface EncryptionAnimationProps {
//   message: string;
//   fromAlphabet: string[];
//   toAlphabet: string[];
//   isActive: boolean;
//   onComplete: (result: string) => void;
//   mode: "encrypt" | "decrypt";
// }

// export const EncryptionAnimation: React.FC<EncryptionAnimationProps> = ({
//   message,
//   fromAlphabet,
//   toAlphabet,
//   isActive,
//   onComplete,
//   mode,
// }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [result, setResult] = useState("");
//   const [highlightedChar, setHighlightedChar] = useState<string | null>(null);
//   const [highlightedMapping, setHighlightedMapping] = useState<number | null>(null);

//   useEffect(() => {
//     if (!isActive) {
//       setCurrentIndex(0);
//       setResult("");
//       setHighlightedChar(null);
//       setHighlightedMapping(null);
//       return;
//     }

//     if (currentIndex >= message.length) {
//       onComplete(result);
//       return;
//     }

//     const char = message[currentIndex].toUpperCase();
//     setHighlightedChar(char);

//     // Only process alphabetic characters
//     if (char >= 'A' && char <= 'Z') {
//       const charIndex = fromAlphabet.indexOf(char);
//       setHighlightedMapping(charIndex);

//       const timer = setTimeout(() => {
//         const mappedChar = charIndex !== -1 ? toAlphabet[charIndex] : char;
//         setResult(prev => prev + mappedChar);
//         setCurrentIndex(prev => prev + 1);
//         setHighlightedMapping(null);
//       }, 800);

//       return () => clearTimeout(timer);
//     } else {
//       // Non-alphabetic characters pass through unchanged
//       const timer = setTimeout(() => {
//         setResult(prev => prev + char);
//         setCurrentIndex(prev => prev + 1);
//         setHighlightedChar(null);
//       }, 300);

//       return () => clearTimeout(timer);
//     }
//   }, [currentIndex, isActive, message, fromAlphabet, toAlphabet, result, onComplete]);

//   if (!isActive) return null;

//   return (
//     <div className="space-y-4 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
//       <div className="text-center">
//         <h3 className="text-lg font-semibold text-primary mb-2">
//           🔍 {mode === "encrypt" ? "Encrypting" : "Decrypting"} Step by Step
//         </h3>

//         {/* Current character being processed */}
//         <div className="mb-4">
//           <p className="text-sm text-muted-fg mb-1">Processing character:</p>
//           <motion.div
//             key={currentIndex}
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             className="inline-block text-2xl font-bold text-primary bg-warning/20 px-3 py-1 rounded-lg"
//           >
//             {highlightedChar || "..."}
//           </motion.div>
//         </div>

//         {/* Message progress */}
//         <div className="mb-4">
//           <p className="text-sm text-muted-fg mb-2">Message progress:</p>
//           <div className="font-mono text-lg bg-bg p-2 rounded border min-h-[2rem] flex items-center justify-center">
//             <span className="text-muted-fg">{message.slice(0, currentIndex)}</span>
//             <motion.span
//               animate={{ opacity: [1, 0.3, 1] }}
//               transition={{ duration: 0.8, repeat: Infinity }}
//               className="bg-warning/30 px-1 mx-1 rounded"
//             >
//               {message[currentIndex] || ""}
//             </motion.span>
//             <span className="text-muted-fg/60">{message.slice(currentIndex + 1)}</span>
//           </div>
//         </div>

//         {/* Result building up */}
//         <div className="mb-4">
//           <p className="text-sm text-muted-fg mb-2">Result so far:</p>
//           <div className="font-mono text-lg bg-success/10 p-2 rounded border min-h-[2rem] flex items-center justify-center">
//             <AnimatePresence>
//               {result.split("").map((char, i) => (
//                 <motion.span
//                   key={`result-${i}`}
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="text-success"
//                 >
//                   {char}
//                 </motion.span>
//               ))}
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>

//       {/* Alphabet mapping with highlighting */}
//       {highlightedMapping !== null && (
//         <div className="space-y-2">
//           <p className="text-sm text-muted-fg text-center">Looking up in cipher alphabet:</p>
//           <div className="grid grid-cols-13 gap-1 text-xs font-mono">
//             {fromAlphabet.map((char, i) => (
//               <motion.div
//                 key={`lookup-${i}`}
//                 className={`flex flex-col items-center p-1 rounded ${
//                   i === highlightedMapping
//                     ? "bg-warning/30 border-2 border-warning"
//                     : "bg-muted"
//                 }`}
//                 animate={i === highlightedMapping ? { scale: [1, 1.1, 1] } : {}}
//                 transition={{ duration: 0.5 }}
//               >
//                 <div className={i === highlightedMapping ? "font-bold" : ""}>{char}</div>
//                 <div className="text-primary">↓</div>
//                 <div className={`text-primary ${i === highlightedMapping ? "font-bold" : ""}`}>
//                   {toAlphabet[i]}
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
