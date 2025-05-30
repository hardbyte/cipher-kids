import React from "react";
import { Link } from "@tanstack/react-router";

type CipherType = "caesar" | "keyword" | "vigenere";

interface CipherNavProps {
  activeCipher: CipherType;
}

export const CipherNav: React.FC<CipherNavProps> = ({ activeCipher }) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">
        {activeCipher === "caesar" && "Caesar Cipher"}
        {activeCipher === "keyword" && "Keyword Cipher"}
        {activeCipher === "vigenere" && "Vigenère Cipher"}
      </h1>
      <nav className="flex gap-2 text-sm">
        <Link
          to="/"
          className="text-primary hover:underline"
          activeProps={{ className: "text-primary hover:underline font-bold" }}
        >
          Home
        </Link>
        <span>/</span>
        <Link
          to="/ciphers/caesar"
          className="text-primary hover:underline"
          activeProps={{ className: "text-primary hover:underline font-bold" }}
        >
          Caesar
        </Link>
        <span>/</span>
        <Link
          to="/ciphers/keyword"
          className="text-primary hover:underline"
          activeProps={{ className: "text-primary hover:underline font-bold" }}
        >
          Keyword
        </Link>
        <span>/</span>
        <Link
          to="/ciphers/vigenere"
          className="text-primary hover:underline"
          activeProps={{ className: "text-primary hover:underline font-bold" }}
        >
          Vigenère
        </Link>
      </nav>
    </div>
  );
};
