
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
import chromadb
from sentence_transformers import SentenceTransformer
from groq import Groq
from datetime import datetime
import os

# Define your APIRouter here
chat_router = APIRouter(prefix="/chat", tags=["Chat"]) # Renamed from 'router' to 'chat_router' for clarity

# --- Environment Variables ---
# Now loaded in main.py, but we still need to access it
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set in the environment.")

# --- Client Initialization ---
groq_client = Groq(api_key=GROQ_API_KEY)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
chroma_client = chromadb.PersistentClient(path="./chroma_db")


chat_sessions = {}

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None
    collection_name: str = "default"

class ChatResponse(BaseModel):
    response: str
    session_id: str
    sources: List[Dict[str, Any]] = []

class SessionCreate(BaseModel):
    user_id: Optional[str] = None
    metadata: Dict[str, Any] = {}

def get_chroma_collection(collection_name: str = "default"):
    try:
        collection = chroma_client.get_collection(name=collection_name)
    except:
        collection = chroma_client.create_collection(name=collection_name)
    return collection

def generate_response(query: str, context: List[str]) -> str:
    context_text = "\n\n".join(context)
    system_prompt = """You are a helpful Al assistant. Based on the provided context, answer the user's
 question accurately and concisely. If the context doesn't contain relevant information, politely say so
 and provide a general helpful response if possible."""
    user_prompt = f"""
Context:
{context_text}
Question: {query}
"""
    try:
        response = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=500,
            temperature=0.7,
            top_p=1,
            stream=False
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating response: {str(e)}"

# Change @router to @chat_router for all your endpoints
@chat_router.post("/", response_model=ChatResponse)
async def chat(message: ChatMessage):
    try:
        if not message.session_id:
            message.session_id = str(uuid.uuid4())
            chat_sessions[message.session_id] = []
        collection = get_chroma_collection(message.collection_name)
        query_embedding = embedding_model.encode([message.message]).tolist()
        results = collection.query(query_embeddings=query_embedding, n_results=5)
        context = results['documents'][0] if results['documents'] else []
        sources = []
        if results['metadatas'][0]:
            for doc, meta, dist in zip(results['documents'][0], results['metadatas'][0], results['distances'][0]):
                sources.append({"content": doc, "metadata": meta, "distance": dist})
        ai_response = generate_response(message.message, context)
        chat_sessions[message.session_id].append({"role": "user", "content": message.message, "timestamp": datetime.now().isoformat()})
        chat_sessions[message.session_id].append({"role": "assistant", "content": ai_response, "timestamp": datetime.now().isoformat()})
        return ChatResponse(response=ai_response, session_id=message.session_id, sources=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session_id": session_id, "history": chat_sessions[session_id]}

@chat_router.post("/session")
async def create_chat_session(session_data: SessionCreate):
    session_id = str(uuid.uuid4())
    chat_sessions[session_id] = []
    return {"session_id": session_id, "created_at": datetime.now().isoformat(), "user_id": session_data.user_id, "metadata": session_data.metadata}

@chat_router.delete("/session/{session_id}")
async def delete_chat_session(session_id: str):
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    del chat_sessions[session_id]
    return {"message": f"Session {session_id} deleted successfully", "deleted_at": datetime.now().isoformat()}

@chat_router.get("/sessions")
async def list_chat_sessions():
    sessions_info = []
    for session_id, messages in chat_sessions.items():
        sessions_info.append({"session_id": session_id, "message_count": len(messages), "last_activity": messages[-1]["timestamp"] if messages else None, "created_at": messages[0]["timestamp"] if messages else None})
    return {"total_sessions": len(chat_sessions), "sessions": sessions_info}

@chat_router.post("/stream")
async def stream_chat(message: ChatMessage):
    try:
        collection = get_chroma_collection(message.collection_name)
        query_embedding = embedding_model.encode([message.message]).tolist()
        results = collection.query(query_embeddings=query_embedding, n_results=5)
        context = results['documents'][0] if results['documents'] else []
        response = generate_response(message.message, context)
        return {"message": "Streaming response", "response": response, "note": "This is a basic implementation. Use SSE or WebSocket for true streaming."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))