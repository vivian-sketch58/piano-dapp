import Link from "next/link";
import { Listing, ListingStatus, formatUSDC } from "@/lib/contracts";

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  [ListingStatus.Listed]: { label: "Available", color: "bg-orange-500" },
  [ListingStatus.AwaitingDelivery]: { label: "Awaiting Delivery", color: "bg-yellow-600" },
  [ListingStatus.Sold]: { label: "Sold", color: "bg-gray-600" },
  [ListingStatus.Cancelled]: { label: "Cancelled", color: "bg-red-700" },
};

export default function PianoCard({ listing }: { listing: Listing }) {
  const { label, color } = STATUS_LABELS[listing.status] ?? { label: "Unknown", color: "bg-gray-600" };
  const imgSrc = listing.imageHash
    ? `https://gateway.pinata.cloud/ipfs/${listing.imageHash}`
    : "/piano-placeholder.jpg";

  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-brand-500 transition cursor-pointer">
        <img
          src={imgSrc}
          alt={`${listing.brand} ${listing.model}`}
          className="w-full h-48 object-cover bg-gray-700"
          onError={(e) => ((e.target as HTMLImageElement).src = "/piano-placeholder.jpg")}
        />
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-white font-semibold text-lg">
              {listing.brand} {listing.model}
            </h3>
            <span className={`text-xs text-white px-2 py-0.5 rounded-full ${color}`}>{label}</span>
          </div>
          <p className="text-gray-400 text-sm">
            {listing.yearMade} · {listing.condition}
          </p>
          <p className="text-brand-400 font-bold text-lg">${formatUSDC(listing.price)} USDC</p>
        </div>
      </div>
    </Link>
  );
}
