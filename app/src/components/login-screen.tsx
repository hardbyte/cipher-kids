import { useState } from "react";
import { useUser, UserInitial } from "@/context/user-context";

// Define the available users
const availableUsers: { initial: UserInitial; color: string }[] = [
  { initial: "A", color: "bg-red-600" },
  { initial: "L", color: "bg-blue-600" },
  { initial: "I", color: "bg-green-600" },
  { initial: "J", color: "bg-purple-600" },
  { initial: "F", color: "bg-yellow-600" },
];

export function LoginScreen() {
  const { setCurrentUser } = useUser();
  const [hoveredUser, setHoveredUser] = useState<UserInitial | null>(null);

  const handleUserSelect = (user: UserInitial) => {
    setCurrentUser(user);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Who's coding today?</h1>
          <p className="text-xl text-gray-400">Choose your profile</p>
        </div>

        <div className="flex flex-wrap justify-center gap-10 max-w-4xl mx-auto">
          {availableUsers.map((user) => (
            <div
              key={user.initial}
              className="flex flex-col items-center group"
              onMouseEnter={() => setHoveredUser(user.initial)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              <button
                onClick={() => handleUserSelect(user.initial)}
                className={`${
                  user.color
                } w-32 h-32 rounded-md flex items-center justify-center text-5xl font-bold text-white shadow-lg transition-all duration-300 ${
                  hoveredUser === user.initial
                    ? "ring-4 ring-white scale-110"
                    : "opacity-90 hover:opacity-100"
                }`}
                aria-label={`Select user ${user.initial}`}
              >
                {user.initial}
              </button>
              <span className={`mt-4 text-xl font-medium transition-all duration-300 ${
                hoveredUser === user.initial ? "text-white scale-110" : "text-gray-400"
              }`}>{user.initial}</span>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16 text-sm text-gray-500">
          <p>Click on your initial to begin coding</p>
        </div>
      </div>
    </div>
  );
}