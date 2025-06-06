from fastapi import FastAPI
from dotenv import load_dotenv
from backend.chat_logic import chat_router
import os

load_dotenv()

app = FastAPI(
    title="AI Chat API",
    description="A FastAPI application for AI-powered chat with RAG capabilities using ChromaDB and Groq",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.include_router(chat_router)


@app.get("/", tags=["Root"])
async def root():

    return {"message": "AI Chat API - Welcome to the backend service"}
