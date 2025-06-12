# chatbot-poc
# Chatbot PoC Backend API

This repository contains the backend API for the Chatbot 

## Features

* Conversational AI: Integrates with Groq for AI responses.
* Context Retrieval (RAG): Uses ChromaDB for vector search to provide relevant context.
* Session Management: Supports creating, managing, and retrieving chat sessions.
* FastAPI Framework: Built using FastAPI for robust and performant API development.

## Project Structure

* `backend/`: Contains the core FastAPI application logic, including chat endpoints and AI integration.
    * `backend/main.py`: Main FastAPI application entry point.
    * `backend/chat_logic.py`: Core chat logic, Groq integration, ChromaDB operations.
* `docs/`: Contains API documentation, including the Postman Collection.
* `requirements.txt`: Python dependencies.


## Setup and Running

1.  Clone the repository:
    
    git clone "url of repo"


2.  Create and activate a virtual environment:\
    
    python -m venv .chat_venv
    .chat_venv\Scripts\activate # For Command Prompt
    

3.  Install dependencies:
    
    pip install -r requirements.txt
    pip freeze > requirements.txt

4.  Set up Environment Variables:
    
    GROQ_API_KEY="your_groq_api_key_here"
    
    

5.  Run the FastAPI application:
    
    uvicorn backend.main:app --reload --port 8000
    The application will run on `http://127.0.0.1:8000`.

## API Documentation

    Interactive Docs (Swagger UI): Access the live API documentation in your browser: `http://127.0.0.1:8000/docs`
    Postman Collection: A Postman collection is added  in the `docs/` folder (`docs/AI_Chat_API_Collection.json`). Y


