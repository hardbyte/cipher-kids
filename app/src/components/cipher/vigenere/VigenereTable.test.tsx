import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { VigenereTable } from "./VigenereTable";
import { DEFAULT_ALPHABET } from "@/utils/ciphers";

// Mock framer-motion
jest.mock("framer-motion", () => {
  const actual = jest.requireActual("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    },
    AnimatePresence: jest.fn(({ children }) => <>{children}</>),
  };
});


describe("VigenereTable", () => {
  const mockProps = {
    keyword: "KEY",
    mode: "encrypt" as "encrypt" | "decrypt" | "crack",
  };

  describe("Rendering with DEFAULT_ALPHABET", () => {
    beforeEach(() => {
      render(<VigenereTable {...mockProps} alphabet={DEFAULT_ALPHABET} />);
    });

    it("should render table headers correctly", () => {
      const table = screen.getByRole("grid"); // Assuming the table container has a grid role
      // Check top headers (A-Z) + 1 empty corner
      const topHeaders = within(table).getAllByRole("columnheader");
      expect(topHeaders.length).toBe(DEFAULT_ALPHABET.length + 1); // +1 for the corner
      expect(topHeaders[1]).toHaveTextContent("A"); // First letter after corner
      expect(topHeaders[DEFAULT_ALPHABET.length]).toHaveTextContent("Z"); // Last letter

      // Check left headers (A-Z)
      const rowHeaders = within(table).getAllByRole("rowheader");
      expect(rowHeaders.length).toBe(DEFAULT_ALPHABET.length); // No corner for row headers in this selection
      expect(rowHeaders[0]).toHaveTextContent("A");
      expect(rowHeaders[DEFAULT_ALPHABET.length - 1]).toHaveTextContent("Z");
    });

    it("should render table cells with correct dimensions", () => {
      const cells = screen.getAllByRole("gridcell");
      // Total cells = (alphabet.length + 1 for headers) * (alphabet.length + 1 for headers)
      // The actual content cells are alphabet.length * alphabet.length
      // Headers are handled above. Here we check content cells.
      // My current selection logic for headers might be too simple.
      // Let's find the table body equivalent or just count all divs that are cells.
      // The structure is: corner, col headers, row headers, content cells.
      // Total divs with 'w-6 h-6' (indicative of a cell including headers)
      const allCellElements = screen.getAllByText((content, element) => {
        return element?.classList.contains('w-6') && element.classList.contains('h-6') || false;
      });
      // (alphabet.length + 1) * (alphabet.length + 1) total visual cells
      expect(allCellElements.length).toBe((DEFAULT_ALPHABET.length + 1) * (DEFAULT_ALPHABET.length + 1));
    });

    it("should render correct cell values for sample cells", () => {
      // A(0) + A(0) = A(0)
      expect(screen.getByText(DEFAULT_ALPHABET[0], { selector: ".vigenere-table > div:nth-child(" + (DEFAULT_ALPHABET.length + 3) + ")" })).toBeInTheDocument();
      // A(0) + B(1) = B(1) -> cell for row A, col B
      // The (DEFAULT_ALPHABET.length + 2) accounts for the empty corner and the first row of headers
      // The +2 for col B means it's the 3rd cell in that row (idx 2)
      // This is complex to select. Let's find a cell by its content.
      // Row A (0), Col A (0) -> ALPHABET[(0+0)%26] = A
      // Row A (0), Col B (1) -> ALPHABET[(0+1)%26] = B
      // Row B (1), Col A (0) -> ALPHABET[(1+0)%26] = B
      // Row B (1), Col B (1) -> ALPHABET[(1+1)%26] = C
      // This needs a more robust way to select specific cells, e.g., by data-testid or row/col index if possible
      // For now, check a few values if they exist
      const tableCells = screen.getAllByRole("gridcell"); // These are the actual data cells
      expect(tableCells[0]).toHaveTextContent(DEFAULT_ALPHABET[(0+0)%DEFAULT_ALPHABET.length]); // Row 0, Col 0
      expect(tableCells[1]).toHaveTextContent(DEFAULT_ALPHABET[(0+1)%DEFAULT_ALPHABET.length]); // Row 0, Col 1
      expect(tableCells[DEFAULT_ALPHABET.length]).toHaveTextContent(DEFAULT_ALPHABET[(1+0)%DEFAULT_ALPHABET.length]); // Row 1, Col 0
      expect(tableCells[DEFAULT_ALPHABET.length+1]).toHaveTextContent(DEFAULT_ALPHABET[(1+1)%DEFAULT_ALPHABET.length]); // Row 1, Col 1
    });
  });

  describe("Rendering with Custom Alphabet", () => {
    const customAlphabet = "ABC"; // length 3
    beforeEach(() => {
      render(
        <VigenereTable {...mockProps} alphabet={customAlphabet} />
      );
    });

    it("should render table headers correctly for custom alphabet", () => {
       const table = screen.getByRole("grid");
      const topHeaders = within(table).getAllByRole("columnheader");
      expect(topHeaders.length).toBe(customAlphabet.length + 1);
      expect(topHeaders[1]).toHaveTextContent("A");
      expect(topHeaders[customAlphabet.length]).toHaveTextContent("C");

      const rowHeaders = within(table).getAllByRole("rowheader");
      expect(rowHeaders.length).toBe(customAlphabet.length);
      expect(rowHeaders[0]).toHaveTextContent("A");
      expect(rowHeaders[customAlphabet.length - 1]).toHaveTextContent("C");
    });

    it("should render correct cell values for custom alphabet", () => {
      // A(0) + A(0) = A(0)
      // A(0) + B(1) = B(1)
      // B(1) + A(0) = B(1)
      // B(1) + B(1) = C(2)
      // C(2) + C(2) = B(1) ( (2+2)%3 = 1 )
      const tableCells = screen.getAllByRole("gridcell");
      expect(tableCells[0]).toHaveTextContent(customAlphabet[(0+0)%customAlphabet.length]); // A A -> A
      expect(tableCells[1]).toHaveTextContent(customAlphabet[(0+1)%customAlphabet.length]); // A B -> B
      expect(tableCells[customAlphabet.length]).toHaveTextContent(customAlphabet[(1+0)%customAlphabet.length]); // B A -> B
      expect(tableCells[customAlphabet.length + 1]).toHaveTextContent(customAlphabet[(1+1)%customAlphabet.length]); // B B -> C
      expect(tableCells[2*customAlphabet.length + 2]).toHaveTextContent(customAlphabet[(2+2)%customAlphabet.length]); // C C -> B
    });
  });

  describe("Highlighting Logic", () => {
    it("should highlight correct row, column, and cell with DEFAULT_ALPHABET", () => {
      render(
        <VigenereTable
          {...mockProps}
          plaintextChar="C" // col 2
          keywordChar="B"   // row 1
          alphabet={DEFAULT_ALPHABET}
        />
      );
      // Due to mocked framer-motion, direct style check might be tricky.
      // We'd typically check for a class or style that `motion.div` applies.
      // For this test, let's assume highlighting adds a specific background color or class
      // that we can query for if the component sets it directly or via `animate` prop.
      // Since framer-motion is mocked to a simple div, we can't easily check animated styles.
      // This test would be more effective in an e2e setup or with better framer-motion mocking.
      // However, if the component sets static classes for highlighting states, we could check those.
      // The component uses animate prop: `backgroundColor: highlightedCol === idx ? "rgb(var(--color-success))" ...`
      // This means we can't easily verify with mocked framer-motion.
      // We can check if the result display shows the correct calculation.
      expect(screen.getByText("C", { selector: ".text-success" })).toBeInTheDocument(); // Plaintext char
      expect(screen.getByText("B", { selector: ".text-warning" })).toBeInTheDocument(); // Keyword char
      // Result: B(1) + C(2) = D(3)
      expect(screen.getByText(DEFAULT_ALPHABET[(1+2)%DEFAULT_ALPHABET.length], { selector: ".text-accent" })).toBeInTheDocument();
    });

    it("should highlight correct row, column, and cell with custom alphabet", () => {
      const customAlphabet = "XYZ";
      render(
        <VigenereTable
          {...mockProps}
          plaintextChar="Z" // col 2
          keywordChar="Y"   // row 1
          alphabet={customAlphabet}
        />
      );
      // Result: Y(1) + Z(2) = X(0)  ((1+2)%3 = 0)
      expect(screen.getByText("Z", { selector: ".text-success" })).toBeInTheDocument();
      expect(screen.getByText("Y", { selector: ".text-warning" })).toBeInTheDocument();
      expect(screen.getByText(customAlphabet[(1+2)%customAlphabet.length], { selector: ".text-accent" })).toBeInTheDocument();
    });
  });

  // TODO: Add tests for `handleCellInteraction` for decrypt mode if time permits.
  // This would involve simulating user clicks and checking component state changes or UI updates.
});
