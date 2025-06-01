import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StepByStepAnimation } from "./StepByStepAnimation";
import { DEFAULT_ALPHABET } from "@/utils/ciphers";

// Mock framer-motion
jest.mock("framer-motion", () => {
  const actual = jest.requireActual("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
      span: jest.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    },
    AnimatePresence: jest.fn(({ children }) => <>{children}</>),
  };
});

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));


describe("StepByStepAnimation (Vigenere)", () => {
  const baseProps = {
    mode: "encrypt" as "encrypt" | "decrypt",
    isPlaying: false, // Start with manual control or step-by-step
    onComplete: jest.fn(),
    onStepChange: jest.fn(),
    speed: 100, // Faster for tests
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const runTimersAndAwaitUpdate = async (component: ReturnType<typeof render>) => {
    await act(async () => {
      jest.runOnlyPendingTimers(); // For intervals/timeouts in useEffect
    });
    // May need component.rerender(...) or additional waits if state updates are complex
  };

  describe("Step Generation with DEFAULT_ALPHABET", () => {
    it("should generate correct first step for encryption", async () => {
      render(
        <StepByStepAnimation
          {...baseProps}
          message="HELLO"
          keyword="KEY"
          alphabet={DEFAULT_ALPHABET}
          initialStep={0} // Start at the first step
        />
      );

      // Wait for steps to be generated and UI to update
      // await screen.findByText(/Step 1:/); // Wait for the first step UI
      // await act(async () => { jest.advanceTimersByTime(100); });


      // Check current step display
      // H (7) + K (10) = R (17)
      expect(screen.getByText('Encrypting letter "H"')).toBeInTheDocument();
      expect(screen.getByText((content, el) => el?.textContent === "H" && el.classList.contains('text-info-fg'))).toBeInTheDocument();
      expect(screen.getByText("Position: 8")).toBeInTheDocument(); // H is 7+1 = 8th letter

      expect(screen.getByText((content, el) => el?.textContent === "K" && el.classList.contains('text-warning-fg'))).toBeInTheDocument();
      expect(screen.getByText("Shift value: 10 (from 'K')")).toBeInTheDocument();

      expect(screen.getByText((content, el) => el?.textContent === "R" && el.classList.contains('text-success-fg'))).toBeInTheDocument();
      expect(screen.getByText("Position: 18")).toBeInTheDocument(); // R is 17+1 = 18th letter

      // Check calculation display
      // (idx H) + (shift K) % 26 = (idx R)
      // (7) + (10) % 26 = (17)
      expect(screen.getByText("(idx 7) + (shift 10) % 26 = (idx 17)")).toBeInTheDocument();
    });

    it("should generate correct first step for decryption", async () => {
       render(
        <StepByStepAnimation
          {...baseProps}
          message="RIJVS" // Encrypted HELLO with KEY
          keyword="KEY"
          mode="decrypt"
          alphabet={DEFAULT_ALPHABET}
          initialStep={0}
        />
      );
      // await screen.findByText(/Step 1:/);
      // await act(async () => { jest.advanceTimersByTime(100); });


      // R (17) - K (10) = H (7)
      expect(screen.getByText('Decrypting letter "R"')).toBeInTheDocument();
      expect(screen.getByText((content, el) => el?.textContent === "R" && el.classList.contains('text-info-fg'))).toBeInTheDocument();
      expect(screen.getByText("Position: 18")).toBeInTheDocument();

      expect(screen.getByText((content, el) => el?.textContent === "K" && el.classList.contains('text-warning-fg'))).toBeInTheDocument();
      expect(screen.getByText("Shift value: 10 (from 'K')")).toBeInTheDocument();

      expect(screen.getByText((content, el) => el?.textContent === "H" && el.classList.contains('text-success-fg'))).toBeInTheDocument();
      expect(screen.getByText("Position: 8")).toBeInTheDocument();

      // (idx R) - (shift K) % 26 = (idx H)
      // (17) - (10) % 26 = (7)
      expect(screen.getByText("(idx 17) - (shift 10) % 26 = (idx 7)")).toBeInTheDocument();
    });
  });

  describe("Step Generation with Custom Alphabet", () => {
    const customAlphabet = "012345"; // length 6
    it("should generate correct first step for encryption with custom alphabet", async () => {
       render(
        <StepByStepAnimation
          {...baseProps}
          message="010"
          keyword="1" // Shift by 1
          alphabet={customAlphabet}
          initialStep={0}
        />
      );
      // await screen.findByText(/Step 1:/);
      // await act(async () => { jest.advanceTimersByTime(100); });


      // M: 0 (idx 0), K: 1 (idx 1, shift 1) -> R: (0+1)%6 = 1 -> '1'
      expect(screen.getByText('Encrypting letter "0"')).toBeInTheDocument();
      expect(screen.getByText((content, el) => el?.textContent === "0" && el.classList.contains('text-info-fg'))).toBeInTheDocument();
      expect(screen.getByText("Position: 1")).toBeInTheDocument(); // 0 is 0+1 = 1st char

      expect(screen.getByText((content, el) => el?.textContent === "1" && el.classList.contains('text-warning-fg'))).toBeInTheDocument(); // Key char
      expect(screen.getByText("Shift value: 1 (from '1')")).toBeInTheDocument();

      expect(screen.getByText((content, el) => el?.textContent === "1" && el.classList.contains('text-success-fg'))).toBeInTheDocument(); // Result char
      expect(screen.getByText("Position: 2")).toBeInTheDocument(); // 1 is 1+1 = 2nd char

      // (idx 0) + (shift 1) % 6 = (idx 1)
      expect(screen.getByText("(idx 0) + (shift 1) % 6 = (idx 1)")).toBeInTheDocument();
    });

    it("should generate correct first step for decryption with custom alphabet", async () => {
      render(
        <StepByStepAnimation
          {...baseProps}
          message="121" // Encrypted "010" with key "1" and alphabet "012345"
          keyword="1"   // Shift by 1
          mode="decrypt"
          alphabet={customAlphabet}
          initialStep={0}
        />
      );
      // await screen.findByText(/Step 1:/);
      // await act(async () => { jest.advanceTimersByTime(100); });


      // M: 1 (idx 1), K: 1 (idx 1, shift 1) -> R: (1-1+6)%6 = 0 -> '0'
      expect(screen.getByText('Decrypting letter "1"')).toBeInTheDocument(); // Ciphertext char
      expect(screen.getAllByText((content, el) => el?.textContent === "1" && el.classList.contains('text-info-fg'))[0]).toBeInTheDocument();
      expect(screen.getByText("Position: 2")).toBeInTheDocument(); // 1 is 1+1 = 2nd char

      // Key char '1'
      expect(screen.getAllByText((content, el) => el?.textContent === "1" && el.classList.contains('text-warning-fg'))[0]).toBeInTheDocument();
      expect(screen.getByText("Shift value: 1 (from '1')")).toBeInTheDocument();

      // Result char '0'
      expect(screen.getByText((content, el) => el?.textContent === "0" && el.classList.contains('text-success-fg'))).toBeInTheDocument();
      expect(screen.getByText("Position: 1")).toBeInTheDocument(); // 0 is 0+1 = 1st char

      // (idx 1) - (shift 1) % 6 = (idx 0)
      expect(screen.getByText("(idx 1) - (shift 1) % 6 = (idx 0)")).toBeInTheDocument();
    });
  });

  describe("Filtering of Characters Not in Alphabet", () => {
    it("should filter characters from message and keyword not in DEFAULT_ALPHABET", async () => {
      render(
        <StepByStepAnimation
          {...baseProps}
          message="H E L L O!" // Space and ! should be filtered
          keyword="K E Y?"   // ? should be filtered
          alphabet={DEFAULT_ALPHABET}
          initialStep={0}
        />
      );
      // await screen.findByText(/Step 1:/);
      // await act(async () => { jest.advanceTimersByTime(100); });


      // Effective message: HELLO, Effective keyword: KEY
      // First step: H + K = R
      expect(screen.getByText('Encrypting letter "H"')).toBeInTheDocument();
      expect(screen.getByText("(idx 7) + (shift 10) % 26 = (idx 17)")).toBeInTheDocument();

      // Check total steps based on filtered message "HELLO" (5 steps)
      expect(screen.getByText("/ 5")).toBeInTheDocument(); // Progress "1 / 5" or similar
    });

    it("should filter characters from message and keyword not in custom_alphabet", async () => {
      const customAlphabet = "AB01";
      render(
        <StepByStepAnimation
          {...baseProps}
          message="A B C 0 1 2" // C and 2 should be filtered, spaces too
          keyword="0 D 1 E"   // D and E should be filtered, spaces too
          alphabet={customAlphabet}
          initialStep={0}
        />
      );
      // await screen.findByText(/Step 1:/);
      // await act(async () => { jest.advanceTimersByTime(100); });


      // Effective message: AB01, Effective keyword: 01
      // First step: A (idx 0) + 0 (idx 2, shift 2) % 4 = idx 2 -> '0'
      expect(screen.getByText('Encrypting letter "A"')).toBeInTheDocument();
      expect(screen.getByText("(idx 0) + (shift 2) % 4 = (idx 2)")).toBeInTheDocument();
      expect(screen.getByText((content, el) => el?.textContent === "0" && el.classList.contains('text-warning-fg'))).toBeInTheDocument(); // Key char
      expect(screen.getByText((content, el) => el?.textContent === "0" && el.classList.contains('text-success-fg'))).toBeInTheDocument(); // Result char


      // Check total steps based on filtered message "AB01" (4 steps)
      expect(screen.getByText("/ 4")).toBeInTheDocument();
    });
  });
});
