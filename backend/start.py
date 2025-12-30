#!/usr/bin/env python3
import os
import sys
import uvicorn
from pathlib import Path

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    env_file = backend_dir / ".env"
    if not env_file.exists():
        print("No .env file found. Please copy env.example to .env and configure your settings.")
        print("Example: cp env.example .env")
        print("Then edit .env with your GROQ_API_KEY and other settings.")
        sys.exit(1)
    
    from dotenv import load_dotenv
    load_dotenv()
    
    if not os.getenv("GROQ_API_KEY"):
        print("GROQ_API_KEY not found in environment variables.")
        print("Please set GROQ_API_KEY in your .env file.")
        sys.exit(1)
    
    print("Starting Chatbot Backend...")
    print("API Documentation: http://localhost:8000/docs")
    print("API Base URL: http://localhost:8000/api/v1")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
