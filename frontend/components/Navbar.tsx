"use client";

import Link from "next/link";
import ConnectWallet from "./ConnectWallet";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
        🎹 PianoChain
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/" className="text-gray-300 hover:text-white transition text-sm">
          Browse
        </Link>
        <Link href="/list" className="text-gray-300 hover:text-white transition text-sm">
          Sell a Piano
        </Link>
        <ConnectWallet />
      </div>
    </nav>
  );
}
