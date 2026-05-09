# PianoChain — 2nd-Hand Piano Marketplace DApp

A decentralised marketplace for buying and selling second-hand pianos, built on **Base Sepolia** (L2). Payments are made in **USDC** and held in smart-contract escrow until the buyer confirms delivery.

---

## Architecture

```
piano-dapp/
├── contracts/          # Solidity + Hardhat
│   ├── contracts/
│   │   ├── BlueRoseMart.sol       # Core marketplace contract
│   │   └── MockUSDC.sol           # ERC-20 mock for local testing
│   ├── scripts/deploy.js          # Deployment script
│   ├── test/BlueRoseMart.test.js  # 6 Hardhat tests
│   └── hardhat.config.js
└── frontend/           # Next.js 16 + wagmi v2 + Tailwind CSS
    ├── app/
    │   ├── page.tsx               # Browse listings
    │   ├── list/page.tsx          # Seller: create a listing
    │   └── listing/[id]/page.tsx  # Buyer: view & purchase
    ├── components/
    │   ├── Navbar.tsx
    │   ├── PianoCard.tsx
    │   ├── ConnectWallet.tsx
    │   └── Providers.tsx          # wagmi + React Query providers
    └── lib/
        ├── contracts.ts           # ABI + address constants
        └── wagmi.ts               # wagmi config (Base Sepolia)
```

---

## Smart Contract: `BlueRoseMart.sol`

### Listing lifecycle

```
Listed → AwaitingDelivery → Sold
   └──────── Cancelled (seller only, before any buyer)
```

| Status | Value |
|--------|-------|
| `Listed` | 0 |
| `AwaitingDelivery` | 1 |
| `Sold` | 2 |
| `Cancelled` | 3 |

### Key functions

| Function | Who calls it | What it does |
|----------|-------------|--------------|
| `listPiano(...)` | Seller | Creates a listing; price in USDC (6 decimals) |
| `buyPiano(id)` | Buyer | Transfers USDC into contract escrow |
| `confirmDelivery(id)` | Buyer | Releases escrowed USDC to seller |
| `cancelListing(id)` | Seller | Cancels before any buyer commits |
| `getAllListings()` | Anyone | Returns all listings as an array |

### Network addresses

| Network | USDC address |
|---------|-------------|
| Base Sepolia (testnet) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Base Mainnet | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Local Hardhat | Deployed as `MockUSDC` automatically |

---

## Prerequisites

- [Node.js 20](https://nodejs.org/) (use `nvm use 20`)
- [MetaMask](https://metamask.io/) browser extension
- A wallet funded with **Base Sepolia ETH** (for gas) — get some from the [Base Sepolia faucet](https://www.alchemy.com/faucets/base-sepolia)
- **Base Sepolia USDC** for testing purchases — bridge or use the [Circle faucet](https://faucet.circle.com/)

---

## Local Development

### 1. Install dependencies

```bash
cd contracts && npm install
cd ../frontend && npm install
```

### 2. Run the test suite

```bash
cd contracts
npx hardhat test
```

All 6 tests should pass:
- Seller can list a piano
- Buyer can purchase (funds go to escrow)
- Buyer confirms delivery — USDC released to seller
- Seller can cancel before a buyer
- Seller cannot buy own listing
- Only buyer can confirm delivery

### 3. Run a local Hardhat node (optional)

```bash
cd contracts
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.js --network hardhat
```

---

## Deploy to Base Sepolia

### 1. Create `contracts/.env`

```bash
cp contracts/.env.example contracts/.env
```

Edit `contracts/.env`:

```env
PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key_here   # optional, for contract verification
```

> Never commit `.env` — it is already in `.gitignore`.

### 2. Deploy

```bash
cd contracts
npx hardhat run scripts/deploy.js --network baseSepolia
```

Output will look like:

```
Deploying with: 0xYourAddress
Network: baseSepolia
BlueRoseMart deployed to: 0xDEPLOYED_ADDRESS
USDC address used: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

Add these to your frontend .env.local:
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xDEPLOYED_ADDRESS
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

### 3. (Optional) Verify on Basescan

```bash
cd contracts
npx hardhat verify --network baseSepolia 0xDEPLOYED_ADDRESS 0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

---

## Run the Frontend

### 1. Create `frontend/.env.local`

```env
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xDEPLOYED_ADDRESS
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

### 2. Start the dev server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Connect MetaMask

- Switch MetaMask to **Base Sepolia** (Chain ID 84532)
- Click **Connect Wallet** in the navbar

---

## End-to-End Test Flow

1. **Seller wallet**: open `/list`, fill in piano details, optionally paste an IPFS image CID, set a USDC price, submit — approve the transaction in MetaMask
2. **Buyer wallet**: browse the home page, click a listing, approve USDC spending, click **Buy** — USDC moves into escrow
3. **Buyer wallet**: after receiving the piano, click **Confirm Delivery** — USDC is released to the seller

---

## Uploading Images to IPFS (optional)

1. Create a free account at [Pinata](https://pinata.cloud/)
2. Upload a piano photo — copy the resulting **CID** (e.g. `QmXyz...`)
3. Paste the CID into the **IPFS Image Hash** field when listing; the frontend renders it via `https://ipfs.io/ipfs/<CID>`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart contracts | Solidity 0.8.20, OpenZeppelin 5 |
| Contract tooling | Hardhat 2, hardhat-toolbox, ethers v6 |
| L2 network | Base Sepolia / Base Mainnet |
| Payment token | USDC (ERC-20, 6 decimals) |
| Frontend | Next.js 16, React 19, TypeScript |
| Web3 hooks | wagmi v2, viem v2 |
| Async state | TanStack React Query v5 |
| Styling | Tailwind CSS v4 |
| Wallet | MetaMask (via wagmi injected connector) |
