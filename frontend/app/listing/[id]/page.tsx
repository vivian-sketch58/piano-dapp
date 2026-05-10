"use client";

import { use, useEffect, useState } from "react";
import { useConnection, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { maxUint256 } from "viem";
import {
  MARKETPLACE_ADDRESS, MARKETPLACE_ABI,
  USDC_ADDRESS, ERC20_ABI,
  Listing, ListingStatus, formatUSDC,
} from "@/lib/contracts";
import ConnectWallet from "@/components/ConnectWallet";
import Link from "next/link";

const STATUS_LABELS: Record<number, string> = {
  [ListingStatus.Listed]: "Available",
  [ListingStatus.AwaitingDelivery]: "Awaiting Delivery",
  [ListingStatus.Sold]: "Sold",
  [ListingStatus.Cancelled]: "Cancelled",
};

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { address, isConnected } = useConnection();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: listing, isLoading, refetch } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "getListing",
    args: [BigInt(id)],
  }) as { data: Listing | undefined; isLoading: boolean; refetch: () => void };

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address ?? "0x0", MARKETPLACE_ADDRESS],
    query: { enabled: !!address },
  });

  const { mutate: approve, data: approveTx, isPending: isApproving } = useWriteContract();
  const { mutate: write, data: writeTx, isPending: isWriting } = useWriteContract();

  const { isLoading: awaitingApprove, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTx });
  const { isLoading: awaitingWrite, isSuccess: writeSuccess } = useWaitForTransactionReceipt({ hash: writeTx });

  if (writeSuccess) refetch();

  if (!mounted) return null;

  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 rounded-xl h-96 max-w-2xl mx-auto" />;
  }

  if (!listing || listing.seller === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="text-center py-24 text-gray-400">
        <p>Listing not found.</p>
        <Link href="/" className="text-brand-400 hover:underline mt-2 inline-block">← Back to Browse</Link>
      </div>
    );
  }

  const isSeller = address?.toLowerCase() === listing.seller.toLowerCase();
  const isBuyer = address?.toLowerCase() === listing.buyer.toLowerCase();
  const needsApproval = (allowance ?? 0n) < listing.price;
  const imgSrc = listing.imageHash
    ? `https://gateway.pinata.cloud/ipfs/${listing.imageHash}`
    : "/piano-placeholder.jpg";

  function handleApprove() {
    approve({ address: USDC_ADDRESS, abi: ERC20_ABI, functionName: "approve", args: [MARKETPLACE_ADDRESS, maxUint256] });
  }

  function handleBuy() {
    write({ address: MARKETPLACE_ADDRESS, abi: MARKETPLACE_ABI, functionName: "buyPiano", args: [listing!.id] });
  }

  function handleConfirmDelivery() {
    write({ address: MARKETPLACE_ADDRESS, abi: MARKETPLACE_ABI, functionName: "confirmDelivery", args: [listing!.id] });
  }

  function handleCancel() {
    write({ address: MARKETPLACE_ADDRESS, abi: MARKETPLACE_ABI, functionName: "cancelListing", args: [listing!.id] });
  }

  const busy = isApproving || awaitingApprove || isWriting || awaitingWrite;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/" className="text-gray-400 hover:text-white text-sm">← Back to Browse</Link>

      <img
        src={imgSrc}
        alt={`${listing.brand} ${listing.model}`}
        className="w-full h-72 object-cover rounded-xl bg-gray-800"
        onError={(e) => ((e.target as HTMLImageElement).src = "/piano-placeholder.jpg")}
      />

      <div className="bg-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-white">
            {listing.brand} {listing.model}
          </h1>
          <span className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
            {STATUS_LABELS[listing.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-400">
          <Info label="Year" value={String(listing.yearMade)} />
          <Info label="Condition" value={listing.condition} />
          <Info label="Seller" value={`${listing.seller.slice(0, 6)}…${listing.seller.slice(-4)}`} />
          {listing.buyer !== "0x0000000000000000000000000000000000000000" && (
            <Info label="Buyer" value={`${listing.buyer.slice(0, 6)}…${listing.buyer.slice(-4)}`} />
          )}
        </div>

        {listing.description && (
          <p className="text-gray-300 text-sm leading-relaxed">{listing.description}</p>
        )}

        <p className="text-3xl font-bold text-brand-400">${formatUSDC(listing.price)} USDC</p>

        {!isConnected && (
          <div className="pt-2">
            <p className="text-gray-400 text-sm mb-3">Connect your wallet to interact.</p>
            <ConnectWallet />
          </div>
        )}

        {isConnected && listing.status === ListingStatus.Listed && !isSeller && (
          <div className="space-y-3 pt-2">
            {needsApproval && !approveSuccess ? (
              <button
                onClick={handleApprove}
                disabled={busy}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
              >
                {isApproving || awaitingApprove ? "Approving USDC…" : "1. Approve USDC"}
              </button>
            ) : (
              <button
                onClick={handleBuy}
                disabled={busy}
                className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
              >
                {isWriting || awaitingWrite ? "Processing…" : `Buy for $${formatUSDC(listing.price)} USDC`}
              </button>
            )}
          </div>
        )}

        {isConnected && listing.status === ListingStatus.AwaitingDelivery && isBuyer && (
          <button
            onClick={handleConfirmDelivery}
            disabled={busy}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
          >
            {busy ? "Processing…" : "Confirm Delivery (releases payment to seller)"}
          </button>
        )}

        {isConnected && listing.status === ListingStatus.Listed && isSeller && (
          <button
            onClick={handleCancel}
            disabled={busy}
            className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
          >
            {busy ? "Cancelling…" : "Cancel Listing"}
          </button>
        )}

        {listing.status === ListingStatus.AwaitingDelivery && !isBuyer && (
          <p className="text-yellow-500 text-sm text-center pt-2">
            This piano has been purchased and is awaiting delivery confirmation.
          </p>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-500 block">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
