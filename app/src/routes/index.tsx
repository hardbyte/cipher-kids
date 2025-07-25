import { createFileRoute, Link } from "@tanstack/react-router";
import { useUser } from "@/context/use-user";
import { CipherPageContentWrapper } from "@/components/cipher/CipherPageContentWrapper";

export const Route = createFileRoute("/")({
  component: CipherIndex,
});

// Define available ciphers
const AVAILABLE_CIPHERS = [
  { 
    id: "atbash", 
    name: "Atbash Cipher", 
    description: "Ancient mirror alphabet cipher where A becomes Z, B becomes Y, etc.",
    to: "/ciphers/atbash"
  },
  { 
    id: "caesar", 
    name: "Caesar Cipher", 
    description: "A simple substitution cipher that shifts letters by a fixed number of positions.",
    to: "/ciphers/caesar"
  },
  { 
    id: "keyword", 
    name: "Keyword Cipher", 
    description: "Uses a keyword to create a mixed alphabet for substitution.",
    to: "/ciphers/keyword"
  },
  { 
    id: "railfence", 
    name: "Rail Fence Cipher", 
    description: "Write message in zigzag pattern, then read off row by row.",
    to: "/ciphers/railfence"
  },
  { 
    id: "vigenere", 
    name: "Vigenère Cipher", 
    description: "A polyalphabetic substitution cipher using a keyword to determine shifts.",
    to: "/ciphers/vigenere"
  },
  {
    id: "pigpen",
    name: "Pigpen Cipher",
    description: "A geometric substitution cipher using symbols from a grid.",
    to: "/ciphers/pigpen"
  },
  {
    id: "morse",
    name: "Morse Code",
    description: "Encode messages using dots and dashes for telegraph-style communication.",
    to: "/ciphers/morse"
  },
];

function CipherIndex() {
  const { currentUser, getEnabledCiphers } = useUser();
  
  const enabledCiphers = getEnabledCiphers();
  const visibleCiphers = AVAILABLE_CIPHERS.filter(cipher => enabledCiphers.includes(cipher.id));
  
  // Get the color based on the user initial for personalization
  const getUserColor = (initial: string): string => {
    const colorMap: Record<string, string> = {
      'A': 'bg-[var(--user-a)] border-[var(--user-a)]',
      'L': 'bg-[var(--user-l)] border-[var(--user-l)]',
      'I': 'bg-[var(--user-i)] border-[var(--user-i)]',
      'J': 'bg-[var(--user-j)] border-[var(--user-j)]',
      'F': 'bg-[var(--user-f)] border-[var(--user-f)]',
    };
    
    return colorMap[initial || ''] || 'bg-[var(--user-fallback)] border-[var(--user-fallback)]';
  };
  
  const userColor = getUserColor(currentUser || '');
  
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`${userColor.split(' ')[0]} w-10 h-10 rounded-md flex items-center justify-center text-white font-bold`}>
            {currentUser}
          </div>
          <h1 className="text-4xl font-bold text-fg">Cipher Tools</h1>
        </div>
        <p className="text-muted-fg text-lg">
          Welcome {currentUser}, ready to explore secret codes?
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {visibleCiphers.length > 0 ? (
          visibleCiphers.map((cipher) => (
            <Link
              key={cipher.id}
              to={cipher.to}
              className="block"
            >
              <CipherPageContentWrapper className="h-full hover:bg-muted transition-all transform hover:-translate-y-1 hover:shadow-xl">
                <h2 className="text-2xl font-semibold mb-3 text-secondary-fg">{cipher.name}</h2>
                <p className="text-muted-fg">
                  {cipher.description}
                </p>
              </CipherPageContentWrapper>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-fg mb-4">
              <p className="text-xl">No ciphers are currently enabled.</p>
              <p>Visit the configuration page to enable ciphers.</p>
            </div>
            <Link
              to="/config"
              className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-fg rounded-md transition-colors"
            >
              Go to Configuration
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-border">
        <div className="flex justify-center">
          <Link
            to="/config"
            className="text-muted-fg hover:text-fg text-sm transition-colors"
          >
            Admin Configuration
          </Link>
        </div>
      </footer>
    </div>
  );
}
