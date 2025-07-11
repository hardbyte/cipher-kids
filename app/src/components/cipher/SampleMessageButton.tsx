import { useSampleMessages } from "@/hooks/useSampleMessages";

interface SampleMessageButtonProps {
  onLoadSample: (message: string) => void;
  isDisabled?: boolean;
  className?: string;
}

export function SampleMessageButton({ 
  onLoadSample, 
  isDisabled = false, 
  className = "" 
}: SampleMessageButtonProps) {
  const { getRandomMessage } = useSampleMessages();

  const handleClick = () => {
    if (!isDisabled) {
      const sample = getRandomMessage();
      onLoadSample(sample);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`px-3 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors text-accent-fg text-sm font-medium ${className}`}
    >
      🎲 Try Sample
    </button>
  );
}