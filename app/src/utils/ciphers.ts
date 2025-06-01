export const DEFAULT_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Maps a character to its index in the given alphabet.
 * @param char - The character to map.
 * @param alphabet - The alphabet string.
 * @returns The index of the character in the alphabet.
 * @throws Error if the character is not found in the alphabet.
 */
export function mapCharToNumber(char: string, alphabet: string): number {
  const index = alphabet.indexOf(char);
  if (index === -1) {
    throw new Error(`Character "${char}" not found in alphabet "${alphabet}".`);
  }
  return index;
}

/**
 * Maps a number (index) to its character in the given alphabet.
 * @param num - The number (index) to map.
 * @param alphabet - The alphabet string.
 * @returns The character at the given index in the alphabet.
 * @throws Error if the number is out of bounds for the alphabet.
 */
export function mapNumberToChar(num: number, alphabet: string): string {
  if (num < 0 || num >= alphabet.length) {
    throw new Error(
      `Number ${num} is out of bounds for alphabet "${alphabet}" (length ${alphabet.length}).`
    );
  }
  return alphabet[num];
}

/**
 * Applies a Caesar cipher to the input text.
 * @param text - The message to encrypt or decrypt.
 * @param shift - Number of positions to shift.
 * @param decrypt - Whether to decrypt (true) or encrypt (false).
 * @param alphabet - Optional alphabet to use. Defaults to DEFAULT_ALPHABET.
 * @returns The transformed text.
 */
export function caesarCipher(
  text: string,
  shift: number,
  decrypt = false,
  alphabet: string = DEFAULT_ALPHABET
): string {
  const normalizedShift =
    ((decrypt ? -shift : shift) % alphabet.length + alphabet.length) %
    alphabet.length;
  return text
    .toUpperCase()
    .split("")
    .map((char) => {
      try {
        const idx = mapCharToNumber(char, alphabet);
        return mapNumberToChar(
          (idx + normalizedShift) % alphabet.length,
          alphabet
        );
      } catch (e) {
        // Character not in alphabet, return as is
        return char;
      }
    })
    .join("");
}

/**
 * Applies a Keyword cipher to the input text.
 * @param text - The message to encrypt or decrypt.
 * @param keyword - The keyword for generating the cipher alphabet.
 * @param decrypt - Whether to decrypt (true) or encrypt (false).
 * @param alphabet - Optional alphabet to use. Defaults to DEFAULT_ALPHABET.
 * @returns The transformed text.
 */
export function keywordCipher(
  text: string,
  keyword: string,
  decrypt = false,
  alphabet: string = DEFAULT_ALPHABET
): string {
  const cleanKeyword = Array.from(
    new Set(
      keyword
        .toUpperCase()
        .split("")
        .filter((char) => alphabet.includes(char))
        .join("")
    )
  ).join("");
  const remainingLetters = alphabet
    .split("")
    .filter((c) => !cleanKeyword.includes(c));
  const cipherAlphabet = cleanKeyword + remainingLetters.join("");
  const mapping = decrypt
    ? Object.fromEntries(
        cipherAlphabet
          .split("")
          .map((c, i) => [c, alphabet[i]]) // Map back to original alphabet
      )
    : Object.fromEntries(
        alphabet
          .split("")
          .map((c, i) => [c, cipherAlphabet[i]]) // Map from original alphabet
      );

  return text
    .toUpperCase()
    .split("")
    .map((char) => {
      // Only map characters that are part of the provided alphabet
      if (alphabet.includes(char)) {
        return mapping[char] || char;
      }
      return char;
    })
    .join("");
}

/**
 * Applies a Vigenère cipher to the input text.
 * @param text - The message to encrypt or decrypt.
 * @param keyword - The keyword to derive shifts from.
 * @param decrypt - Whether to decrypt (true) or encrypt (false).
 * @param alphabet - Optional alphabet to use. Defaults to DEFAULT_ALPHABET.
 * @returns The transformed text.
 */
export function vigenereCipher(
  text: string,
  keyword: string,
  decrypt = false,
  alphabet: string = DEFAULT_ALPHABET
): string {
  const cleanKeyword = keyword
    .toUpperCase()
    .split("")
    .filter((char) => alphabet.includes(char))
    .join("");

  if (cleanKeyword.length === 0) return text;

  return text
    .toUpperCase()
    .split("")
    .map((char, i) => {
      try {
        const idx = mapCharToNumber(char, alphabet);
        const keyChar = cleanKeyword[i % cleanKeyword.length];
        const keyShift = mapCharToNumber(keyChar, alphabet);
        const shift = decrypt ? alphabet.length - keyShift : keyShift;
        return mapNumberToChar((idx + shift) % alphabet.length, alphabet);
      } catch (e) {
        // Character not in alphabet, return as is
        return char;
      }
    })
    .join("");
}