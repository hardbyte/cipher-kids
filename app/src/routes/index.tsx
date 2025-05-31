import { createFileRoute, Link } from "@tanstack/react-router";
import { useUser } from "@/context/user-context";

export const Route = createFileRoute("/")({
  component: CipherIndex,
});

// Define available ciphers
const AVAILABLE_CIPHERS = [
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
    id: "vigenere", 
    name: "Vigenère Cipher", 
    description: "A polyalphabetic substitution cipher using a keyword to determine shifts.",
    to: "/ciphers/vigenere"
  },
];

function CipherIndex() {
  const { currentUser, getEnabledCiphers } = useUser();
  
  const enabledCiphers = getEnabledCiphers();
  const visibleCiphers = AVAILABLE_CIPHERS.filter(cipher => enabledCiphers.includes(cipher.id));
  
  // Get the color based on the user initial for personalization
  const getUserColor = (initial: string): string => {
    const colorMap: Record<string, string> = {
      'A': 'bg-red-600 border-red-500',
      'L': 'bg-blue-600 border-blue-500',
      'I': 'bg-green-600 border-green-500',
      'J': 'bg-purple-600 border-purple-500',
      'F': 'bg-yellow-600 border-yellow-500',
    };
    
    return colorMap[initial || ''] || 'bg-gray-700 border-gray-600';
  };
  
  const userColor = getUserColor(currentUser || '');
  
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`${userColor.split(' ')[0]} w-10 h-10 rounded-md flex items-center justify-center text-white font-bold`}>
            {currentUser}
          </div>
          <h1 className="text-4xl font-bold text-white">Cipher Tools</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Welcome {currentUser}, ready to explore secret codes?
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {visibleCiphers.length > 0 ? (
          visibleCiphers.map((cipher) => (
            <Link
              key={cipher.id}
              to={cipher.to}
              className={`block p-6 rounded-lg bg-gray-800 border-2 ${userColor.split(' ')[1]} hover:bg-gray-700 transition-all transform hover:-translate-y-1 hover:shadow-xl`}
            >
              <h2 className="text-2xl font-semibold mb-3 text-white">{cipher.name}</h2>
              <p className="text-gray-400">
                {cipher.description}
              </p>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <p className="text-xl">No ciphers are currently enabled.</p>
              <p>Visit the configuration page to enable ciphers.</p>
            </div>
            <Link
              to="/config"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
            >
              Go to Configuration
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-800">
        <div className="flex justify-center">
          <Link
            to="/config"
            className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
          >
            Admin Configuration
          </Link>
        </div>
      </footer>
    </div>
  );
}
