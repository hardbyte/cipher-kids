import React from "react";
import { Button } from "@/components/ui/button";

interface CrackButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isAnimating?: boolean;
  message: string;
  label: string;
  description: string;
}

export const CrackButton: React.FC<CrackButtonProps> = ({
  onClick,
  disabled,
  isAnimating,
  message,
  label,
  description,
}) => {
  const isDisabled = disabled || !message || isAnimating;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <Button
        onClick={onClick}
        disabled={isDisabled}
        className="w-full bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
      >
        🔍 {label}
      </Button>
      <p className="text-xs text-gray-400 mt-2">
        {description}
      </p>
    </div>
  );
};