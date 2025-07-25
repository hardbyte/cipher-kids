import React from 'react';
import { PIGPEN_MAPPING } from '@/utils/ciphers';

interface PigpenGridProps {
  highlightChar?: string;
}

export const PigpenGrid: React.FC<PigpenGridProps> = ({ highlightChar }) => {
  const grids = [
    { letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] },
    { letters: ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'] },
    { letters: ['S', 'T', 'U', 'V'] },
    { letters: ['W', 'X', 'Y', 'Z'] },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {grids.map((grid, gridIndex) => (
        <div key={gridIndex} className="grid grid-cols-3 gap-1">
          {grid.letters.map((char) => {
            const isHighlighted = highlightChar && highlightChar.toUpperCase() === char;
            return (
              <div
                key={char}
                className={`w-12 h-12 flex items-center justify-center text-2xl font-mono border-2 transition-all duration-300 ${
                  isHighlighted ? 'bg-accent/30 border-accent' : 'border-muted'
                }`}
              >
                <span className={isHighlighted ? 'text-accent-fg' : ''}>{PIGPEN_MAPPING[char]}</span>
                <span className="ml-1 text-sm text-muted-fg">{char}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
