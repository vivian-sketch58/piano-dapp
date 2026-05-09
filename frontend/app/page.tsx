"use client";

import { useReadContract } from "wagmi";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, Listing } from "@/lib/contracts";
import PianoCard from "@/components/PianoCard";
import Link from "next/link";

export default function Home() {
  const { data: listings, isLoading, error } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "getAllListings",
  });

  const active = (listings as Listing[] | undefined)?.filter((l) => l.status === 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Browse Pianos</h1>
          <p className="text-gray-400 mt-1">Buy second-hand pianos with USDC — secured by blockchain escrow</p>
        </div>
        <Link
          href="/list"
          className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-5 py-2.5 rounded-lg transition"
        >
          + Sell a Piano
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl h-72 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-gray-400">
          <p>Could not load listings. Make sure your wallet is connected to Base Sepolia.</p>
        </div>
      )}

      {!isLoading && !error && active?.length === 0 && (
        <div className="text-center py-24 text-gray-500">
          <p className="text-5xl mb-4">🎹</p>
          <p className="text-lg">No pianos listed yet.</p>
          <Link href="/list" className="text-orange-400 hover:underline mt-2 inline-block">
            Be the first to sell one →
          </Link>
        </div>
      )}

      {active && active.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {active.map((listing) => (
            <PianoCard key={String(listing.id)} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
