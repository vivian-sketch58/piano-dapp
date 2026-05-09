"use client";

import { useEffect, useState } from "react";
import { useConnection, useConnect, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export default function ConnectWallet() {
  const { address, isConnected, chainId } = useConnection();
  const { mutate: connect, isPending, error: connectError } = useConnect();
  const connectors = useConnectors();
  const { mutate: disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isWrongNetwork = isConnected && chainId !== baseSepolia.id;

  if (isWrongNetwork) {
    return (
      <button
        onClick={() => switchChain({ chainId: baseSepolia.id })}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition"
      >
        Switch to Base Sepolia
      </button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300 font-mono">
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const metamask = connectors[0];

  if (!metamask) {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noreferrer"
        className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2 rounded-lg transition"
      >
        Install MetaMask
      </a>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => connect({ connector: metamask })}
        disabled={isPending}
        className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition"
      >
        {isPending ? "Connecting…" : "Connect MetaMask"}
      </button>
      {connectError && (
        <span className="text-red-400 text-xs">{connectError.message.slice(0, 80)}</span>
      )}
    </div>
  );
}
