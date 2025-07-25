import React from "react";
import { Link } from "@tanstack/react-router";

type CipherType = "atbash" | "caesar" | "keyword" | "railfence" | "vigenere" | "pigpen" | "morse";

interface CipherNavProps {
  activeCipher: CipherType;
}

export const CipherNav: React.FC<CipherNavProps> = ({ activeCipher }) => {
  const cipherData = {
    atbash: { name: "Atbash Cipher", path: "/ciphers/atbash" },
    caesar: { name: "Caesar Cipher", path: "/ciphers/caesar" },
    keyword: { name: "Keyword Cipher", path: "/ciphers/keyword" },
    railfence: { name: "Rail Fence Cipher", path: "/ciphers/railfence" },
    vigenere: { name: "Vigenère Cipher", path: "/ciphers/vigenere" },
    pigpen: { name: "Pigpen Cipher", path: "/ciphers/pigpen" },
    morse: { name: "Morse Code", path: "/ciphers/morse" },
  };

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2 lg:gap-0">
      <h1 className="text-xl md:text-2xl font-bold">
        {cipherData[activeCipher]?.name}
      </h1>
      {/* Mobile-friendly breadcrumb - only show Home > Ciphers */}
      <nav className="flex gap-1 md:gap-2 text-xs md:text-sm items-center">
        <Link
          to="/"
          className="text-primary hover:underline whitespace-nowrap"
          activeProps={{ className: "text-primary hover:underline font-bold" }}
        >
          Home
        </Link>
        <span className="text-muted-fg">/</span>
        <span className="text-fg font-medium">
          Ciphers
        </span>
      </nav>
    </div>
  );
};
