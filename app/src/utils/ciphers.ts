export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Applies an Atbash cipher to the input text.
 * The Atbash cipher is a self-inverse substitution cipher where A↔Z, B↔Y, C↔X, etc.
 * @param text - The message to encrypt or decrypt.
 * @returns The transformed text (encryption and decryption are the same operation).
 */
export function atbashCipher(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((char) => {
      const idx = ALPHABET.indexOf(char);
      if (idx === -1) return char; // Preserve non-alphabetic characters
      return ALPHABET[25 - idx]; // Mirror position: A(0)↔Z(25), B(1)↔Y(24), etc.
    })
    .join("");
}

/**
 * Applies a Rail Fence (Zigzag) cipher to the input text.
 * @param text - The message to encrypt or decrypt.
 * @param rails - Number of rails (2-8 recommended range).
 * @param decrypt - Whether to decrypt (true) or encrypt (false).
 * @returns The transformed text.
 */
export function railFenceCipher(
  text: string,
  rails: number,
  decrypt = false
): string {
  if (rails <= 1) return text;
  
  const cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (cleanText.length === 0) return text;
  
  if (decrypt) {
    return railFenceDecrypt(cleanText, rails);
  } else {
    return railFenceEncrypt(cleanText, rails);
  }
}

/**
 * Encrypts text using the Rail Fence cipher.
 */
function railFenceEncrypt(text: string, rails: number): string {
  const fence: string[][] = Array.from({ length: rails }, () => []);
  let rail = 0;
  let direction = 1;
  
  // Place characters on the zigzag pattern
  for (let i = 0; i < text.length; i++) {
    fence[rail].push(text[i]);
    
    // Change direction at top and bottom rails
    if (rail === 0) {
      direction = 1;
    } else if (rail === rails - 1) {
      direction = -1;
    }
    
    rail += direction;
  }
  
  // Read off row by row
  return fence.map(row => row.join('')).join('');
}

/**
 * Decrypts text using the Rail Fence cipher.
 */
function railFenceDecrypt(cipherText: string, rails: number): string {
  // Create the zigzag pattern to determine where characters go
  const fence: (string | null)[][] = Array.from({ length: rails }, () => 
    Array(cipherText.length).fill(null)
  );
  
  let rail = 0;
  let direction = 1;
  
  // Mark the zigzag positions
  for (let i = 0; i < cipherText.length; i++) {
    fence[rail][i] = '*'; // Mark position
    
    if (rail === 0) {
      direction = 1;
    } else if (rail === rails - 1) {
      direction = -1;
    }
    
    rail += direction;
  }
  
  // Fill in the characters row by row from the cipher text
  let index = 0;
  for (let r = 0; r < rails; r++) {
    for (let c = 0; c < cipherText.length; c++) {
      if (fence[r][c] === '*' && index < cipherText.length) {
        fence[r][c] = cipherText[index++];
      }
    }
  }
  
  // Read off following the zigzag pattern
  const result: string[] = [];
  rail = 0;
  direction = 1;
  
  for (let i = 0; i < cipherText.length; i++) {
    result.push(fence[rail][i] as string);
    
    if (rail === 0) {
      direction = 1;
    } else if (rail === rails - 1) {
      direction = -1;
    }
    
    rail += direction;
  }
  
  return result.join('');
}

/**
 * Applies a Caesar cipher to the input text.
 * @param text - The message to encrypt or decrypt.
 * @param shift - Number of positions to shift.
 * @param decrypt - Whether to decrypt (true) or encrypt (false).
 * @returns The transformed text.
 */
export function caesarCipher(
  text: string,
  shift: number,
  decrypt = false
): string {
  const normalizedShift = ((decrypt ? -shift : shift) % 26 + 26) % 26;
  return text
    .toUpperCase()
    .split("")
    .map((char) => {
      const idx = ALPHABET.indexOf(char);
      if (idx === -1) return char;
      return ALPHABET[(idx + normalizedShift) % 26];
    })
    .join("");
}

/**
 * Applies a Keyword cipher to the input text.
 * @param text - The message to encrypt or decrypt.
 * @param keyword - The keyword for generating the cipher alphabet.
 * @param decrypt - Whether to decrypt (true) or encrypt (false).
 * @returns The transformed text.
 */
export function keywordCipher(
  text: string,
  keyword: string,
  decrypt = false
): string {
  const cleanKeyword = Array.from(
    new Set(keyword.toUpperCase().replace(/[^A-Z]/g, ""))
  ).join("");
  const remainingLetters = ALPHABET.split("").filter(
    (c) => !cleanKeyword.includes(c)
  );
  const cipherAlphabet = cleanKeyword + remainingLetters.join("");
  const mapping = decrypt
    ? Object.fromEntries(
        cipherAlphabet.split("").map((c, i) => [c, ALPHABET[i]])
      )
    : Object.fromEntries(
        ALPHABET.split("").map((c, i) => [c, cipherAlphabet[i]])
      );

  return text
    .toUpperCase()
    .split("")
    .map((char) => mapping[char] || char)
    .join("");
}

/**
 * Applies a Vigenère cipher to the input text.
 * @param text - The message to encrypt or decrypt.
 * @param keyword - The keyword to derive shifts from.
 * @param decrypt - Whether to decrypt (true) or encrypt (false).
 * @returns The transformed text.
 */
export function vigenereCipher(
  text: string,
  keyword: string,
  decrypt = false
): string {
  const cleanKeyword = keyword.toUpperCase().replace(/[^A-Z]/g, "");
  if (cleanKeyword.length === 0) return text;

  return text
    .toUpperCase()
    .split("")
    .map((char, i) => {
      const idx = ALPHABET.indexOf(char);
      if (idx === -1) return char;
      const keyChar = cleanKeyword[i % cleanKeyword.length];
      const keyShift = ALPHABET.indexOf(keyChar);
      const shift = decrypt ? 26 - keyShift : keyShift;
      return ALPHABET[(idx + shift) % 26];
    })
    .join("");
}