"use client";

import { useState, useEffect } from "react";
import { useConnection, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { parseUnits } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/lib/contracts";
import { useRouter } from "next/navigation";
import ConnectWallet from "@/components/ConnectWallet";

const CONDITIONS = ["Excellent", "Good", "Fair"];
const PIANO_TYPES = ["Upright", "Grand", "Baby Grand", "Digital", "Hybrid"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://viviancao-bluerosemart-api.hf.space";

export default function ListPage() {
  const { isConnected } = useConnection();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    yearMade: "",
    condition: "Good",
    description: "",
    imageHash: "",
    price: "",
    type: "Upright",
  });

  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [predicting, setPredicting] = useState(false);

  async function predictPrice() {
    if (!form.brand || !form.yearMade || !form.type || !form.condition) return;
    setPredicting(true);
    try {
      const res = await fetch(`${API_URL}/predict-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: form.brand,
          type: form.type,
          condition: form.condition,
          year_made: Number(form.yearMade),
        }),
      });
      const data = await res.json();
      setSuggestedPrice(data.predicted_price_usdc);
    } catch {
      setSuggestedPrice(null);
    } finally {
      setPredicting(false);
    }
  }

  const { mutate: writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  useEffect(() => { if (isSuccess) router.push("/"); }, [isSuccess, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "listPiano",
      args: [
        form.brand,
        form.model,
        Number(form.yearMade) as unknown as number,
        form.condition,
        form.description,
        form.imageHash,
        parseUnits(form.price, 6),
      ],
    });
  }

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-4">
        <p className="text-gray-400 text-lg">Connect your MetaMask wallet to list a piano.</p>
        <ConnectWallet />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">List a Piano for Sale</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Brand" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Yamaha" required />
          <Field label="Model" name="model" value={form.model} onChange={handleChange} placeholder="e.g. U1" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Year Made" name="yearMade" type="number" value={form.yearMade} onChange={handleChange} placeholder="e.g. 2010" required />
          <div>
            <label className="block text-sm text-gray-400 mb-1">Condition</label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Piano Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {PIANO_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">AI Price Suggestion</p>
            <button
              type="button"
              onClick={predictPrice}
              disabled={predicting || !form.brand || !form.yearMade}
              className="text-xs bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white px-3 py-1 rounded-lg transition"
            >
              {predicting ? "Predicting…" : "Get Suggested Price"}
            </button>
          </div>
          {suggestedPrice && (
            <div className="flex items-center justify-between">
              <p className="text-orange-400 font-bold text-lg">${suggestedPrice.toLocaleString()} USDC</p>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, price: String(Math.round(suggestedPrice)) }))}
                className="text-xs text-gray-400 hover:text-white underline"
              >
                Use this price
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe the piano's history, any repairs, accessories included…"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>

        <Field
          label="IPFS Image Hash (optional)"
          name="imageHash"
          value={form.imageHash}
          onChange={handleChange}
          placeholder="QmXyz… (upload to Pinata first)"
        />

        <Field
          label="Price (USDC)"
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="e.g. 1500"
          required
        />

        {error && (
          <p className="text-red-400 text-sm">{(error as Error).message.slice(0, 120)}</p>
        )}

        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
        >
          {isPending ? "Confirm in MetaMask…" : isConfirming ? "Waiting for confirmation…" : "List Piano"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label, name, value, onChange, placeholder, type = "text", required,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
  );
}
