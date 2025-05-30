export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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