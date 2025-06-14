# main.py
from fastapi import FastAPI
from dotenv import load_dotenv
from backend.chat_logic import chat_router  # Assuming your file is in a 'backend' directory
import os

load_dotenv()


app = FastAPI()
app.include_router(chat_router)

# You no longer need to load GROQ_API_KEY here if you do it in the router
# GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# if not GROQ_API_KEY:
#     raise ValueError("GROQ_API_KEY environment variable not set in main.py.")

@app.get("/")
async def root():
    return {"message": "Hello World"}

# backend/uvicorn_chat_logic_router.py