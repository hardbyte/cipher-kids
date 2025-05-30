import React from "react";
import { TextField as Input } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CipherInputsProps {
  mode: "encrypt" | "decrypt" | "crack";
  message: string;
  setMessage: (message: string) => void;
  param?: string;
  setParam?: (param: string) => void;
  paramPlaceholder?: string;
  handleAction?: () => void;
}

export const CipherInputs: React.FC<CipherInputsProps> = ({
  mode,
  message,
  setMessage,
  param,
  setParam,
  paramPlaceholder,
  handleAction,
}) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute top-2 left-2 text-lg">
        {mode === "encrypt" ? "✉️" : mode === "decrypt" ? "📬" : "🔍"}
      </div>
        <Input
          label="Your Secret Message"
          placeholder="Enter your message here"
          value={message}
          onChange={(value: string) => setMessage(value)}
          className="pl-9"
        />
        <div className="text-xs text-muted-fg mt-1 ml-2">
          {message.length === 0 ? 
          mode === "crack" ? "Type a message to crack the code!" : "Type something to begin your adventure!" : 
          `Characters: ${message.length}`}
        </div>
      </div>

      {setParam && (
        <div className="relative">
          <div className="absolute top-2 left-2 text-lg">
            {mode === "encrypt" ? "🔑" : "🗝️"}
          </div>
          <Input
            label="Secret Key"
            placeholder={paramPlaceholder || ""}
            value={param || ""}
            onChange={(value: string) => setParam(value)}
            className="pl-9"
          />
        </div>
      )}

      {mode !== "crack" && handleAction && (
        <motion.div 
          className="flex justify-center mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            intent="primary" 
            onPress={handleAction}
            className="px-8 py-2 text-base font-medium flex items-center gap-2"
          >
            <span role="img" aria-label="magic wand" className="text-lg">
              {mode === "encrypt" ? "🔐" : "🔓"}
            </span>
            <span>{mode === "encrypt" ? "Encrypt" : "Decrypt"}</span>
            <span role="img" aria-label="sparkles" className="text-lg">
              ✨
            </span>
          </Button>
        </motion.div>
      )}
      {mode === "crack" && (
        <motion.div 
          className="flex justify-center mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-purple-100 text-purple-800 px-6 py-3 rounded-lg shadow-sm border border-purple-200 flex items-center gap-3">
            <span role="img" aria-label="detective" className="text-xl">🕵️‍♀️</span>
            <span className="font-medium">Type a message above to see all possible shifts!</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};