---
title: BlueRoseMart API
emoji: 🎹
colorFrom: red
colorTo: gray
sdk: docker
pinned: false
---

# BlueRoseMart AI Backend

FastAPI backend for the BlueRoseMart piano marketplace dapp.

## Endpoints

- `GET /` — health check
- `POST /chat` — multi-agent chat (policy, product, tech, general)
- `POST /predict-price` — piano price prediction ML
- `POST /n8n-webhook` — Telegram bot via n8n

## Environment Variables

Set `HF_TOKEN` in Space secrets.
