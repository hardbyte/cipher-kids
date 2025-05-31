import React from "react";
import { Tooltip } from "./ui/tooltip";
import { motion } from "framer-motion";

interface InfoIconProps {
  content: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export const InfoIcon: React.FC<InfoIconProps> = ({
  content,
  size = "sm",
  className = "",
  placement = "top",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  return (
    <Tooltip>
      <Tooltip.Trigger
        className={`inline-flex items-center justify-center rounded-full bg-muted/20 text-muted-fg hover:bg-muted/30 hover:text-fg transition-colors cursor-help ${sizeClasses[size]} ${className}`}
        aria-label="Information"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3 h-3"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </motion.svg>
      </Tooltip.Trigger>
      <Tooltip.Content placement={placement} className="max-w-xs">
        {content}
      </Tooltip.Content>
    </Tooltip>
  );
};