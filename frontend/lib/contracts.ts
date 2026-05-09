export const MARKETPLACE_ADDRESS =
  (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`) || "0x0000000000000000000000000000000000000000";

export const USDC_ADDRESS =
  (process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`) ||
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC

export const MARKETPLACE_ABI = [
  // Read
  {
    name: "getListing",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "seller", type: "address" },
          { name: "buyer", type: "address" },
          { name: "brand", type: "string" },
          { name: "model", type: "string" },
          { name: "yearMade", type: "uint16" },
          { name: "condition", type: "string" },
          { name: "description", type: "string" },
          { name: "imageHash", type: "string" },
          { name: "price", type: "uint256" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
  },
  {
    name: "getAllListings",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "seller", type: "address" },
          { name: "buyer", type: "address" },
          { name: "brand", type: "string" },
          { name: "model", type: "string" },
          { name: "yearMade", type: "uint16" },
          { name: "condition", type: "string" },
          { name: "description", type: "string" },
          { name: "imageHash", type: "string" },
          { name: "price", type: "uint256" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
  },
  { name: "nextId", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  // Write
  {
    name: "listPiano",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "brand", type: "string" },
      { name: "model", type: "string" },
      { name: "yearMade", type: "uint16" },
      { name: "condition", type: "string" },
      { name: "description", type: "string" },
      { name: "imageHash", type: "string" },
      { name: "price", type: "uint256" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    name: "buyPiano",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    name: "confirmDelivery",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    name: "cancelListing",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
] as const;

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export enum ListingStatus {
  Listed = 0,
  AwaitingDelivery = 1,
  Sold = 2,
  Cancelled = 3,
}

export type Listing = {
  id: bigint;
  seller: `0x${string}`;
  buyer: `0x${string}`;
  brand: string;
  model: string;
  yearMade: number;
  condition: string;
  description: string;
  imageHash: string;
  price: bigint;
  status: number;
};

export function formatUSDC(amount: bigint): string {
  return (Number(amount) / 1e6).toFixed(2);
}
