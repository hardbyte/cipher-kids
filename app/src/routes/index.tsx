import { createFileRoute, Link } from "@tanstack/react-router";
import { useUser } from "@/context/user-context";

export const Route = createFileRoute("/")({
  component: CipherIndex,
});

function CipherIndex() {
  const { currentUser } = useUser();
  
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
        <Link
          to="/ciphers/caesar"
          className={`block p-6 rounded-lg bg-gray-800 border-2 ${userColor.split(' ')[1]} hover:bg-gray-700 transition-all transform hover:-translate-y-1 hover:shadow-xl`}
        >
          <h2 className="text-2xl font-semibold mb-3 text-white">Caesar Cipher</h2>
          <p className="text-gray-400">
            A simple substitution cipher that shifts letters by a fixed number
            of positions.
          </p>
        </Link>

        <Link
          to="/ciphers/keyword"
          className={`block p-6 rounded-lg bg-gray-800 border-2 ${userColor.split(' ')[1]} hover:bg-gray-700 transition-all transform hover:-translate-y-1 hover:shadow-xl`}
        >
          <h2 className="text-2xl font-semibold mb-3 text-white">Keyword Cipher</h2>
          <p className="text-gray-400">
            Uses a keyword to create a mixed alphabet for substitution.
          </p>
        </Link>

        <Link
          to="/ciphers/vigenere"
          className={`block p-6 rounded-lg bg-gray-800 border-2 ${userColor.split(' ')[1]} hover:bg-gray-700 transition-all transform hover:-translate-y-1 hover:shadow-xl`}
        >
          <h2 className="text-2xl font-semibold mb-3 text-white">Vigenère Cipher</h2>
          <p className="text-gray-400">
            A polyalphabetic substitution cipher using a keyword to determine
            shifts.
          </p>
        </Link>
      </div>
    </div>
  );
}
