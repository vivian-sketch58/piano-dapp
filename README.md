![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![MetaMask](https://img.shields.io/badge/MetaMask-E2761B?style=for-the-badge&logo=metamask&logoColor=white)
![Ethereum](https://img.shields.io/badge/Base_Sepolia-0052FF?style=for-the-badge&logo=ethereum&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![RAG](https://img.shields.io/badge/RAG-LangChain%20+%20FAISS-1C3C3C?style=for-the-badge&logoColor=white)
![ML](https://img.shields.io/badge/ML-GradientBoosting-F7931E?style=for-the-badge&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)
![DuckDuckGo](https://img.shields.io/badge/DuckDuckGo-DE5833?style=for-the-badge&logo=duckduckgo&logoColor=white)
![joblib](https://img.shields.io/badge/joblib-3670A0?style=for-the-badge&logoColor=white)

# BlueRoseMart — Blockchain Piano Marketplace

BlueRoseMart transforms the piano from a stationary household object into a liquid, verifiable, and secure financial asset, ensuring that the only thing a pianist needs to focus on is their performance.

## Executive Summary

A decentralised marketplace for buying and selling second-hand pianos, built on **Base Sepolia** (L2). Payments are made in **USDC** held in smart-contract escrow. The platform includes a **multi-agent AI assistant**, **ML price prediction**, and a **Telegram chatbot**.

**Live:** https://piano-dapp.vercel.app

## Value Proposition & Goals

Pianos are high-value, long-life assets that represent a significant financial hurdle for musicians. BlueRoseMart uses blockchain to turn these "heavy" physical goods into secure, liquid assets.

**1. Secure High-Value Exchange**
* **Escrow Security:** Smart contracts hold USDC in limbo, eliminating "payment vs. delivery" anxiety for items worth thousands.

* **Verified Provenance:** Pianos last decades. Blockchain provides an immutable "Digital Twin" to track maintenance history and ownership, preserving resale value.

**2. Supporting the Artist’s Journey**
* **Frictionless Upgrades:** As a pianist progresses from a beginner upright to a concert grand, our P2P model removes high dealer commissions (often 20%+), making "trading up" affordable.

* **Fair Valuation:** Our ML Price Prediction acts as a neutral arbiter in an opaque market, ensuring students aren't overcharged and sellers aren't low-balled.

**3. Lowering the Barrier**
* **L2 Efficiency:** Using Base Sepolia keeps transaction costs near zero, ensuring the tech doesn't eat into the artist's budget.

* **AI Onboarding:** A Telegram/AI concierge handles the complexities of Web3, letting musicians focus on the instrument, not the infrastructure.

---

## Architecture

```
piano-dapp/
├── contracts/               # Solidity + Hardhat
│   ├── contracts/
│   │   ├── BlueRoseMart.sol          # Core marketplace contract
│   │   └── MockUSDC.sol              # ERC-20 mock for local testing
│   ├── scripts/deploy.js             # Deployment script
│   ├── test/BlueRoseMart.test.js     # 6 Hardhat tests
│   └── hardhat.config.js
├── frontend/                # Next.js + wagmi + Tailwind CSS
│   ├── app/
│   │   ├── page.tsx                  # Browse listings
│   │   ├── list/page.tsx             # Seller: create a listing + AI price suggestion
│   │   └── listing/[id]/page.tsx     # Buyer: view & purchase
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── PianoCard.tsx
│   │   ├── ConnectWallet.tsx
│   │   ├── ChatWidget.tsx            # Floating AI chat widget
│   │   └── Providers.tsx
│   └── lib/
│       ├── contracts.ts
│       └── wagmi.ts
└── backend/                 # FastAPI AI backend (HuggingFace Spaces)
    ├── main.py                       # FastAPI app: /chat, /predict-price, /n8n-webhook
    ├── agents.py                     # Multi-agent routing + LLM calls
    ├── rag.py                        # FAISS vector store + RAG retrieval
    ├── ml/
    │   ├── generate_data.py          # Generates 2000 synthetic piano price records
    │   └── train.py                  # GradientBoostingRegressor (R²=0.977)
    ├── data/
    │   ├── policy/                   # delivery.txt, return_and_refund.txt, warranty.txt
    │   ├── product/                  # product.txt
    │   └── tech/                     # tech_support.txt
    └── Dockerfile
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

### Deployed addresses (Base Sepolia)

| Contract | Address |
|----------|---------|
| BlueRoseMart | `0x618CDCa2F799672C8C4D839F8329B0b98794dDdB` |
| USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

---

## AI Backend

Deployed at: **https://viviancao-bluerosemart-api.hf.space**

### Multi-Agent System

Powered by **Qwen/Qwen2.5-7B-Instruct** via HuggingFace Router. Incoming questions are routed to one of four specialised agents:

| Agent | Triggers | Knowledge source |
|-------|----------|-----------------|
| **Policy** | refund, escrow, dispute, cancel, fee | RAG over `data/policy/` |
| **Product** | price, brand, model, Yamaha, condition | RAG over `data/product/` |
| **Tech** | MetaMask, USDC, wallet, blockchain, gas | RAG over `data/tech/` |
| **General** | everything else | DuckDuckGo live search |

### ML Price Prediction

- Model: `GradientBoostingRegressor` (sklearn)
- Training data: 2000 synthetic piano records (10 brands × 5 types × 3 conditions)
- **R² = 0.977 / MAE ≈ $1,250**
- Inputs: brand, type, condition, year made
- Output: predicted price in USDC

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/chat` | Multi-agent AI chat |
| `POST` | `/predict-price` | ML price prediction |
| `POST` | `/n8n-webhook` | Telegram bot via n8n |

---

## Features

### Chat Widget
A floating 🎹 button appears on every page of the frontend. Click it to open the AI assistant and ask questions about pianos, policies, or the platform.

### AI Price Suggestion
On the **List a Piano** page, fill in Brand, Type, Condition and Year Made, then click **"Get Suggested Price"** to get an ML-predicted market price. Click **"Use this price"** to auto-fill it.

### Telegram Bot
Connected via **n8n** cloud workflow:
`Telegram Trigger → HTTP Request (/n8n-webhook) → Telegram Send`

Messages sent to the Telegram bot receive AI-generated replies from the same multi-agent system.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart contracts | Solidity 0.8.20, OpenZeppelin 5 |
| Contract tooling | Hardhat 2, ethers v6 |
| L2 network | Base Sepolia / Base Mainnet |
| Payment token | USDC (ERC-20, 6 decimals) |
| Frontend | Next.js, React, TypeScript |
| Web3 hooks | wagmi, viem |
| Styling | Tailwind CSS |
| Wallet | MetaMask (injected connector) |
| AI backend | FastAPI, LangChain, FAISS |
| LLM | Qwen/Qwen2.5-7B-Instruct (HuggingFace Router) |
| ML | scikit-learn GradientBoostingRegressor, joblib |
| Embeddings | sentence-transformers/all-MiniLM-L6-v2 |
| Search | DuckDuckGo (general agent) |
| Backend hosting | HuggingFace Spaces (Docker) |
| Frontend hosting | Vercel |
| Chatbot | Telegram + n8n Cloud |

---

## Prerequisites

- [Node.js 20](https://nodejs.org/)
- [MetaMask](https://metamask.io/) browser extension
- Wallet funded with **Base Sepolia ETH** — [Base Sepolia faucet](https://www.alchemy.com/faucets/base-sepolia)
- **Base Sepolia USDC** — [Circle faucet](https://faucet.circle.com/)

---

## Local Development

### Contracts

```bash
cd contracts && npm install
npx hardhat test        # run 6 tests
npx hardhat node        # local node (optional)
```

### Frontend

```bash
cd frontend && npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x618CDCa2F799672C8C4D839F8329B0b98794dDdB
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_API_URL=https://viviancao-bluerosemart-api.hf.space
```

```bash
npm run dev   # http://localhost:3000
```

### Backend

```bash
cd backend && pip install -r requirements.txt
python ml/generate_data.py && python ml/train.py
uvicorn main:app --reload --port 8000
```

Create `backend/.env`:
```env
HF_TOKEN=hf_your_token_here
```

---

## End-to-End Test Flow

1. **Seller**: go to `/list` → fill in piano details → click **"Get Suggested Price"** → set price → submit → approve in MetaMask
2. **Buyer**: browse home page → click a listing → approve USDC → click **Buy** → USDC moves into escrow
3. **Buyer**: after receiving piano → click **Confirm Delivery** → USDC released to seller
4. **AI chat**: click the 🎹 button → ask anything about pianos or the platform
5. **Telegram**: message the bot → receive AI reply within seconds

---

## Limitations

### Blockchain & Smart Contract
- **Testnet only** — currently deployed on Base Sepolia; not production-ready for real USDC on Base Mainnet
- **No dispute resolution** — if a buyer and seller disagree, the contract has no arbitration mechanism; the buyer holds all power via `confirmDelivery`
- **No refund path** — once USDC enters escrow, only the buyer can release it; there is no timeout or seller-initiated refund
- **No piano condition verification** — the platform relies entirely on the seller's self-reported condition; no third-party inspection
- **Single-chain only** — limited to Base network; buyers/sellers on other chains cannot participate without bridging

### AI & ML
- **Synthetic training data** — the price prediction model is trained on generated data, not real market sales; predictions may not reflect true market conditions
- **LLM hallucination risk** — the AI agents can generate plausible but incorrect answers, especially for edge-case policy or technical questions
- **Free-tier LLM quota** — HuggingFace Router free tier has rate limits; high traffic may cause slow responses or errors
- **RAG knowledge is static** — the policy, product, and tech knowledge bases are text files that must be manually updated; they do not self-update
- **English only** — all agents and the knowledge base are English-only

### Infrastructure
- **HuggingFace free tier sleeping** — the backend Space may hibernate after inactivity, causing a cold-start delay on first request
- **No user authentication** — anyone with a wallet can list or buy; no KYC or identity verification
- **IPFS images are optional** — most listings will have no photo, reducing buyer confidence

---

## Future Development

### Near-Term
- [ ] **Mainnet deployment** — deploy to Base Mainnet with real USDC after security audit
- [ ] **Dispute resolution** — add a trusted arbitrator address to the smart contract that can override delivery confirmation
- [ ] **Seller refund mechanism** — add an escrow timeout (e.g. 30 days) after which the seller can reclaim funds if the buyer is unresponsive
- [ ] **Listing photos** — integrate Pinata/IPFS upload directly in the UI so sellers can add photos without manual CID copying

### AI & ML
- [ ] **Real market data** — scrape or source real second-hand piano sale prices to retrain the ML model
- [ ] **Multilingual agents** — support Cantonese, Mandarin, and Japanese for Asian markets
- [ ] **Conversation memory** — store chat history per user session so the AI remembers context across messages
- [ ] **Agent confidence score** — display how confident the AI is in its answer

### Platform
- [ ] **Digital Twin / maintenance log** — let owners record tuning, repairs, and modifications on-chain against a piano's token ID
- [ ] **Piano NFT** — mint each listed piano as an ERC-721 token to represent verified provenance and ownership history
- [ ] **Rental mode** — extend the contract to support short-term piano rentals with time-locked escrow
- [ ] **Mobile app** — React Native app with wallet connect for on-the-go browsing and Telegram-native buying
- [ ] **Seller reputation** — on-chain rating system accumulated across completed sales
- [ ] **Search & filters** — filter listings by brand, type, price range, condition, and location
