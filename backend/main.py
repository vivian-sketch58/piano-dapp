import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from agents import run_agent

load_dotenv()

app = FastAPI(title="BlueRoseMart AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "ml/model.joblib")
_ml_model = None


def get_model():
    global _ml_model
    if _ml_model is None:
        if not os.path.exists(MODEL_PATH):
            raise HTTPException(status_code=503, detail="ML model not trained yet. Run ml/train.py first.")
        _ml_model = joblib.load(MODEL_PATH)
    return _ml_model


# --- Schemas ---

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    agent: str
    answer: str

class PricePredictRequest(BaseModel):
    brand: str
    type: str
    condition: str
    year_made: int

class PricePredictResponse(BaseModel):
    predicted_price_usd: float
    predicted_price_usdc: float

class N8NWebhookRequest(BaseModel):
    message: str
    chat_id: str | None = None


# --- Endpoints ---

@app.get("/")
def root():
    return {"status": "ok", "service": "BlueRoseMart AI Backend"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        result = run_agent(req.message)
        return ChatResponse(agent=result["agent"], answer=result["answer"])
    except Exception as e:
        return ChatResponse(agent="error", answer=f"AI service error: {str(e)}")


@app.post("/predict-price", response_model=PricePredictResponse)
def predict_price(req: PricePredictRequest):
    model = get_model()
    age = 2024 - req.year_made
    X = pd.DataFrame([{
        "brand": req.brand,
        "type": req.type,
        "condition": req.condition,
        "year_made": req.year_made,
        "age": age,
    }])
    price = float(model.predict(X)[0])
    price = max(100.0, round(price, 2))
    return PricePredictResponse(
        predicted_price_usd=price,
        predicted_price_usdc=price,
    )


@app.post("/n8n-webhook")
def n8n_webhook(req: N8NWebhookRequest):
    result = run_agent(req.message)
    return {
        "chat_id": req.chat_id,
        "reply": result["answer"],
        "agent": result["agent"],
    }
