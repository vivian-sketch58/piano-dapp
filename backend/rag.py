import os
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

_stores: dict = {}

AGENT_DIRS = {
    "policy":  "policy",
    "product": "product",
    "tech":    "tech",
}


def _load_txt_docs(folder: str) -> list[Document]:
    docs = []
    folder_path = os.path.join(DATA_DIR, folder)
    for fname in os.listdir(folder_path):
        if not fname.endswith(".txt"):
            continue
        fpath = os.path.join(folder_path, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            text = f.read()
        # Split into chunks of ~500 chars for better retrieval
        chunk_size = 500
        for i in range(0, len(text), chunk_size):
            chunk = text[i:i + chunk_size].strip()
            if chunk:
                docs.append(Document(page_content=chunk, metadata={"source": fname}))
    return docs


def get_store(agent: str) -> FAISS:
    if agent in _stores:
        return _stores[agent]

    folder = AGENT_DIRS[agent]
    docs = _load_txt_docs(folder)
    embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL)
    store = FAISS.from_documents(docs, embeddings)
    _stores[agent] = store
    return store


def retrieve(agent: str, query: str, k: int = 4) -> str:
    store = get_store(agent)
    results = store.similarity_search(query, k=k)
    return "\n\n".join(r.page_content for r in results)
