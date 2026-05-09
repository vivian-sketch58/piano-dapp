import os
import requests
from dotenv import load_dotenv
load_dotenv()

from duckduckgo_search import DDGS
from rag import retrieve

HF_TOKEN = os.getenv("HF_TOKEN", "")
MODEL = "Qwen/Qwen2.5-7B-Instruct"
HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions"


def _call_llm(system: str, user: str) -> str:
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "max_tokens": 512,
        "temperature": 0.3,
    }
    response = requests.post(HF_ROUTER_URL, headers=headers, json=payload, timeout=60)
    if not response.ok:
        raise RuntimeError(f"LLM API error {response.status_code}: {response.text[:300]}")
    return response.json()["choices"][0]["message"]["content"].strip()


def _ddg_search(query: str, max_results: int = 4) -> str:
    with DDGS() as ddgs:
        results = list(ddgs.text(query, max_results=max_results))
    if not results:
        return "No search results found."
    return "\n\n".join(f"{r['title']}\n{r['body']}" for r in results)


def route_agent(question: str) -> str:
    q = question.lower()
    if any(w in q for w in ["policy", "escrow", "refund", "dispute", "cancel", "fee", "rule", "listing policy"]):
        return "policy"
    if any(w in q for w in ["price", "buy", "sell", "brand", "model", "yamaha", "kawai", "steinway", "condition", "upright", "grand", "digital"]):
        return "product"
    if any(w in q for w in ["blockchain", "metamask", "usdc", "contract", "gas", "wallet", "transaction", "base sepolia", "network", "smart contract"]):
        return "tech"
    return "general"


def policy_agent(question: str) -> str:
    context = retrieve("policy", question)
    system = (
        "You are a policy assistant for BlueRoseMart, a blockchain piano marketplace. "
        "Answer questions about platform policies, escrow, disputes and listing rules using the context below. "
        "Be clear and concise.\n\nContext:\n" + context
    )
    return _call_llm(system, question)


def product_agent(question: str) -> str:
    context = retrieve("product", question)
    system = (
        "You are a piano product expert for BlueRoseMart marketplace. "
        "Help users understand piano brands, models, conditions and buying advice using the context below. "
        "Be helpful and informative.\n\nContext:\n" + context
    )
    return _call_llm(system, question)


def tech_agent(question: str) -> str:
    context = retrieve("tech", question)
    system = (
        "You are a blockchain and technical support agent for BlueRoseMart. "
        "Help users with MetaMask, USDC, Base Sepolia network and smart contract questions using the context below. "
        "Give clear step-by-step instructions when needed.\n\nContext:\n" + context
    )
    return _call_llm(system, question)


def general_agent(question: str) -> str:
    search_results = _ddg_search(f"piano {question}")
    system = (
        "You are a general piano assistant. Answer the user's question using the search results below. "
        "Focus on practical helpful information about pianos.\n\nSearch Results:\n" + search_results
    )
    return _call_llm(system, question)


def run_agent(question: str) -> dict:
    agent_type = route_agent(question)
    agent_map = {
        "policy":  policy_agent,
        "product": product_agent,
        "tech":    tech_agent,
        "general": general_agent,
    }
    answer = agent_map[agent_type](question)
    return {"agent": agent_type, "answer": answer}
