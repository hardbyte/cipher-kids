import { useCallback } from 'react';

// Kid-friendly sample messages for cipher practice
const SAMPLE_MESSAGES = [
  "PIZZA IS THE BEST FOOD EVER",
  "MY CAT LIKES TO CHASE BUTTERFLIES",
  "UNICORNS LOVE RAINBOW SPRINKLES",
  "DRAGONS ARE JUST BIG FLYING PUPPIES",
  "ICE CREAM FOR BREAKFAST IS AWESOME",
  "ROBOTS DREAM OF ELECTRIC COOKIES",
  "PENGUINS WADDLE TO THE DISCO",
  "NINJAS SNEAK THROUGH THE PLAYGROUND",
  "ALIENS PROBABLY LOVE CHOCOLATE TOO",
  "WIZARDS MAKE THE BEST PIZZA TOPPINGS"
];

export interface UseSampleMessagesReturn {
  getRandomMessage: () => string;
  getAllMessages: () => string[];
  getMessageByIndex: (index: number) => string;
}

export function useSampleMessages(): UseSampleMessagesReturn {
  const getRandomMessage = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_MESSAGES.length);
    return SAMPLE_MESSAGES[randomIndex];
  }, []);

  const getAllMessages = useCallback(() => {
    return [...SAMPLE_MESSAGES];
  }, []);

  const getMessageByIndex = useCallback((index: number) => {
    return SAMPLE_MESSAGES[index % SAMPLE_MESSAGES.length];
  }, []);

  return {
    getRandomMessage,
    getAllMessages,
    getMessageByIndex,
  };
}