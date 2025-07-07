import React from "react";
import { Link } from "@tanstack/react-router";

type CipherType = "atbash" | "caesar" | "keyword" | "railfence" | "vigenere";

interface CipherNavProps {
  activeCipher: CipherType;
}

export const CipherNav: React.FC<CipherNavProps> = ({ activeCipher }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2 lg:gap-0">
      <h1 className="text-2xl font-bold">
        {activeCipher === "atbash" && "Atbash Cipher"}
        {activeCipher === "caesar" && "Caesar Cipher"}
        {activeCipher === "keyword" && "Keyword Cipher"}
        {activeCipher === "railfence" && "Rail Fence Cipher"}
        {activeCipher === "vigenere" && "Vigenère Cipher"}
      </h1>
      <nav className="flex gap-1 md:gap-2 text-xs md:text-sm flex-wrap">
        <Link
          to="/"
          className="text-primary hover:underline whitespace-nowrap"
          activeProps={{ className: "text-primary hover:underline font-bold" }}
        >
          Home
        </Link>
        <span>/</span>
        <Link
          to="/ciphers/atbash"
          className="text-primary hover:underline whitespace-nowrap"
          activeProps={{ className: "text-primary hover:underline font-bold" }}
        >
          Atbash
        </Link>
        <span>/</span>
        <Link
          to="/ciphers/caesar"
          className="text-primary hover:underline whitespace-nowrap"
          activeProps={{ className: "text-primary hover:underline font-bold" }}
        >
          Caesar
        </Link>
        <span>/</span>
        <Link
          to="/ciphers/keyword"
          className="text-primary hover:underline whitespace-nowrap"
          activeProps={{ className: "text-primary hover:underline font-bold" }}
        >
          Keyword
        </Link>
        <span>/</span>
        <Link
          to="/ciphers/railfence"
          className="text-primary hover:underline whitespace-nowrap"
          activeProps={{ className: "text-primary hover:underline font-bold" }}
        >
          Rail Fence
        </Link>
        <span>/</span>
        <Link
          to="/ciphers/vigenere"
          className="text-primary hover:underline whitespace-nowrap"
          activeProps={{ className: "text-primary hover:underline font-bold" }}
        >
          Vigenère
        </Link>
      </nav>
    </div>
  );
};
