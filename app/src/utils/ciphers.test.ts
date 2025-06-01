import {
  mapCharToNumber,
  mapNumberToChar,
  vigenereCipher,
  DEFAULT_ALPHABET,
  caesarCipher, // caesarCipher and keywordCipher are also in ciphers.ts
  keywordCipher, // Might as well add basic tests if time permits, or focus on Vigenere
} from "./ciphers";

describe("Cipher Utility Functions", () => {
  describe("mapCharToNumber", () => {
    it("should return correct index for DEFAULT_ALPHABET", () => {
      expect(mapCharToNumber("A", DEFAULT_ALPHABET)).toBe(0);
      expect(mapCharToNumber("M", DEFAULT_ALPHABET)).toBe(12);
      expect(mapCharToNumber("Z", DEFAULT_ALPHABET)).toBe(25);
    });

    it("should return correct index for a custom alphabet", () => {
      const customAlphabet = "ABC";
      expect(mapCharToNumber("A", customAlphabet)).toBe(0);
      expect(mapCharToNumber("B", customAlphabet)).toBe(1);
      expect(mapCharToNumber("C", customAlphabet)).toBe(2);
    });

    it("should be case sensitive (as per current usage, inputs are uppercased before calling)", () => {
      // Assuming inputs to mapCharToNumber are already uppercased by calling functions
      expect(() => mapCharToNumber("a", DEFAULT_ALPHABET)).toThrow();
      expect(mapCharToNumber("A", DEFAULT_ALPHABET)).toBe(0);
    });

    it("should throw error for characters not in the alphabet", () => {
      expect(() => mapCharToNumber("X", "ABC")).toThrow(
        'Character "X" not found in alphabet "ABC".'
      );
      expect(() => mapCharToNumber("1", DEFAULT_ALPHABET)).toThrow();
      expect(() => mapCharToNumber("$", DEFAULT_ALPHABET)).toThrow();
    });
  });

  describe("mapNumberToChar", () => {
    it("should return correct char for DEFAULT_ALPHABET", () => {
      expect(mapNumberToChar(0, DEFAULT_ALPHABET)).toBe("A");
      expect(mapNumberToChar(12, DEFAULT_ALPHABET)).toBe("M");
      expect(mapNumberToChar(25, DEFAULT_ALPHABET)).toBe("Z");
    });

    it("should return correct char for a custom alphabet", () => {
      const customAlphabet = "ABC";
      expect(mapNumberToChar(0, customAlphabet)).toBe("A");
      expect(mapNumberToChar(1, customAlphabet)).toBe("B");
      expect(mapNumberToChar(2, customAlphabet)).toBe("C");
    });

    it("should throw error for out-of-bounds indices", () => {
      const customAlphabet = "ABC";
      expect(() => mapNumberToChar(3, customAlphabet)).toThrow(
        'Number 3 is out of bounds for alphabet "ABC" (length 3).'
      );
      expect(() => mapNumberToChar(-1, customAlphabet)).toThrow();
      expect(() => mapNumberToChar(26, DEFAULT_ALPHABET)).toThrow();
    });
  });

  describe("vigenereCipher", () => {
    // Test with DEFAULT_ALPHABET
    it("should encrypt correctly with DEFAULT_ALPHABET", () => {
      expect(vigenereCipher("HELLO", "KEY", false, DEFAULT_ALPHABET)).toBe("RIJVS");
      expect(vigenereCipher("ATTACKATDAWN", "LEMON", false, DEFAULT_ALPHABET)).toBe("LXFOPVEFRNHR");
    });

    it("should decrypt correctly with DEFAULT_ALPHABET", () => {
      expect(vigenereCipher("RIJVS", "KEY", true, DEFAULT_ALPHABET)).toBe("HELLO");
      expect(vigenereCipher("LXFOPVEFRNHR", "LEMON", true, DEFAULT_ALPHABET)).toBe("ATTACKATDAWN");
    });

    // Test with a short custom alphabet
    const shortAlphabet = "ABCDEFG"; // length 7
    it("should encrypt correctly with a short custom alphabet", () => {
      // Message "ACE", Keyword "BAD", Alphabet "ABCDEFG"
      // A (idx 0) + B (idx 1) % 7 = idx 1 -> B
      // C (idx 2) + A (idx 0) % 7 = idx 2 -> C
      // E (idx 4) + D (idx 3) % 7 = idx 0 -> A
      // Expected: BCA
      expect(vigenereCipher("ACE", "BAD", false, shortAlphabet)).toBe("BCA");
    });

    it("should decrypt correctly with a short custom alphabet", () => {
      expect(vigenereCipher("BCA", "BAD", true, shortAlphabet)).toBe("ACE");
    });

    // Test with a numeric alphabet
    const numAlphabet = "0123456789"; // length 10
    it("should encrypt correctly with a numeric alphabet", () => {
      // M: 012 K: 123
      // 0(0) + 1(1) = 1(1)
      // 1(1) + 2(2) = 3(3)
      // 2(2) + 3(3) = 5(5)
      // Expected: 135
      expect(vigenereCipher("012", "123", false, numAlphabet)).toBe("135");
    });

    it("should decrypt correctly with a numeric alphabet", () => {
      expect(vigenereCipher("135", "123", true, numAlphabet)).toBe("012");
    });

    it("should ignore keyword characters not in the custom alphabet", () => {
      // Using shortAlphabet "ABCDEFG"
      // Message "ACE", Keyword "BXA" -> effective keyword "BA" (X ignored)
      // A(0) + B(1) = B(1)
      // C(2) + A(0) = C(2)
      // E(4) + B(1) = F(5)  -- Wait, keyword is "BA", so for E, it's B again.
      // A(0) + B(1) % 7 = B(1)
      // C(2) + A(0) % 7 = C(2)
      // E(4) + B(1) % 7 = F(5)
      // Expected: BCF
      expect(vigenereCipher("ACE", "BXA", false, shortAlphabet)).toBe("BCF");
      expect(vigenereCipher("BCF", "BXA", true, shortAlphabet)).toBe("ACE");
    });

    it("should preserve message characters not in the custom alphabet", () => {
      // Using shortAlphabet "ABCDEFG"
      // Message "A!C?E", Keyword "BAD"
      // A(0) + B(1) = B(1)
      // ! preserved
      // C(2) + A(0) = C(2)
      // ? preserved
      // E(4) + D(3) = A(0)
      // Expected: B!C?A
      expect(vigenereCipher("A!C?E", "BAD", false, shortAlphabet)).toBe("B!C?A");
      expect(vigenereCipher("B!C?A", "BAD", true, shortAlphabet)).toBe("A!C?E");
    });

    it("should return original text if processed keyword is empty", () => {
      expect(vigenereCipher("HELLO", "XYZ", false, DEFAULT_ALPHABET)).toBe("HELLO");
      expect(vigenereCipher("HELLO", "XYZ", false, "ABC")).toBe("HELLO");
      expect(vigenereCipher("ACE", "XYZ", false, shortAlphabet)).toBe("ACE");
    });

    it("should return original text for an empty keyword string", () => {
      expect(vigenereCipher("HELLO", "", false, DEFAULT_ALPHABET)).toBe("HELLO");
      expect(vigenereCipher("012", "", false, numAlphabet)).toBe("012");
    });

    it("should handle mixed case inputs by converting to uppercase", () => {
      expect(vigenereCipher("hello", "key", false, DEFAULT_ALPHABET)).toBe("RIJVS");
      expect(vigenereCipher("RIJVS", "key", true, DEFAULT_ALPHABET)).toBe("HELLO");
    });

    it("should handle long messages and repeating keywords correctly", () => {
      const message = "THISISALONGMESSAGEFORENCRYPTION";
      const keyword = "SHORTKEY";
      const encrypted = vigenereCipher(message, keyword, false, DEFAULT_ALPHABET);
      const decrypted = vigenereCipher(encrypted, keyword, true, DEFAULT_ALPHABET);
      expect(decrypted).toBe(message);
    });
  });

  // Basic tests for Caesar and Keyword ciphers with custom alphabets
  describe("caesarCipher with custom alphabet", () => {
    const customAlphabet = "ABCDEFG";
    it("should encrypt correctly", () => {
      expect(caesarCipher("ACE", 1, false, customAlphabet)).toBe("BDF");
    });
    it("should decrypt correctly", () => {
      expect(caesarCipher("BDF", 1, true, customAlphabet)).toBe("ACE");
    });
    it("should handle wrap-around", () => {
      expect(caesarCipher("EFG", 1, false, customAlphabet)).toBe("FGA"); // E->F, F->G, G->A
    });
    it("should preserve characters not in alphabet", () => {
      expect(caesarCipher("A!B?C", 1, false, customAlphabet)).toBe("B!C?D");
    });
  });

  describe("keywordCipher with custom alphabet", () => {
    const customAlphabet = "FEDCBA"; // Reversed
    it("should encrypt correctly with custom alphabet", () => {
      // Keyword: "CAB" -> "CBA" (unique from "FEDCBA")
      // Cipher alphabet: CBAFED (CBA + remaining FED)
      // Original: FEDCBA
      // F -> C, E -> B, D -> A, C -> F, B -> E, A -> D
      expect(keywordCipher("ACE", "CAB", false, customAlphabet)).toBe("DBF"); // A->D, C->B, E->F
    });
    it("should decrypt correctly with custom alphabet", () => {
      expect(keywordCipher("DBF", "CAB", true, customAlphabet)).toBe("ACE");
    });
    it("should preserve characters not in alphabet", () => {
      expect(keywordCipher("A!C?E", "CAB", false, customAlphabet)).toBe("D!B?F");
    });
  });
});
