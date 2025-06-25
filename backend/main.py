# main.py
from fastapi import FastAPI
from dotenv import load_dotenv
from backend.chat_logic import chat_router
import os
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware

load_dotenv()

app = FastAPI(
    title="AI Chat API",
    description="A FastAPI application for AI-powered chat with RAG capabilities using ChromaDB and Groq",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# --- CORS Configuration Start ---
# Define the origins that are allowed to make requests to your API
origins = [
    "http://localhost:3000",          # Your frontend local development server
    "http://127.0.0.1:8000",          # If testing locally with frontend on same machine
    # Add your deployed frontend domain here when you have one
    # For example: "https://your-deployed-frontend.onrender.com",
    # You might temporarily use "*" for local testing, but it's not secure for production.
    # If you remove "http://localhost:3000" after local testing, ensure your deployed frontend domain is here.
]

# Add the CORS middleware to your FastAPI application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # List of allowed origins
    allow_credentials=True,           # Allow cookies to be included in cross-origin HTTP requests
    allow_methods=["*"],              # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],              # Allow all headers in cross-origin HTTP requests
)
# --- CORS Configuration End ---

app.include_router(chat_router)

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint for the AI Chat API.
    Returns a welcome message.
    """
    return {"message": "AI Chat API - Welcome to the backend service"}

