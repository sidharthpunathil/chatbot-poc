# chat_logic.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
import chromadb
from sentence_transformers import SentenceTransformer
from groq import Groq
from datetime import datetime
import os

# Define your APIRouter here
chat_router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
    responses={404: {"description": "Not found"}},
)

# --- Environment Variables ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set in the environment.")

# --- Client Initialization ---
groq_client = Groq(api_key=GROQ_API_KEY)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
chroma_client = chromadb.PersistentClient(path="./chroma_db")

chat_sessions = {}


class ChatMessage(BaseModel):
    message: str = Field(..., description="The user's message/query", min_length=1)
    session_id: Optional[str] = Field(None,
                                      description="Optional session ID. If not provided, a new session will be created")
    collection_name: str = Field("default", description="ChromaDB collection name to query against")


class ChatResponse(BaseModel):
    response: str = Field(..., description="AI-generated response to the user's query")
    session_id: str = Field(..., description="Session ID for this conversation")
    sources: List[Dict[str, Any]] = Field(default=[],
                                          description="Relevant source documents used to generate the response")


class SessionCreate(BaseModel):
    user_id: Optional[str] = Field(None, description="Optional user identifier")
    metadata: Dict[str, Any] = Field(default={}, description="Additional metadata for the session")


class SessionInfo(BaseModel):
    session_id: str
    message_count: int
    last_activity: Optional[str]
    created_at: Optional[str]


class SessionResponse(BaseModel):
    session_id: str
    created_at: str
    user_id: Optional[str]
    metadata: Dict[str, Any]


class SessionListResponse(BaseModel):
    total_sessions: int
    sessions: List[SessionInfo]


class ChatHistory(BaseModel):
    session_id: str
    history: List[Dict[str, Any]]


def get_chroma_collection(collection_name: str = "default"):
    """Get or create a ChromaDB collection"""
    try:
        collection = chroma_client.get_collection(name=collection_name)
    except:
        collection = chroma_client.create_collection(name=collection_name)
    return collection


def generate_response(query: str, context: List[str]) -> str:
    """Generate AI response using Groq API with provided context"""
    context_text = "\n\n".join(context)
    system_prompt = """You are a helpful AI assistant. Based on the provided context, answer the user's
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


@chat_router.post("/", response_model=ChatResponse, summary="Send a chat message",
                  description="Send a message to the AI assistant and get a response based on relevant context from the knowledge base")
async def chat(message: ChatMessage):
    """
    Send a chat message and receive an AI-generated response.

    - **message**: The user's question or message
    - **session_id**: Optional session ID (auto-generated if not provided)
    - **collection_name**: ChromaDB collection to search (default: "default")

    Returns the AI response along with relevant source documents.
    """
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

        chat_sessions[message.session_id].append({
            "role": "user",
            "content": message.message,
            "timestamp": datetime.now().isoformat()
        })
        chat_sessions[message.session_id].append({
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now().isoformat()
        })

        return ChatResponse(
            response=ai_response,
            session_id=message.session_id,
            sources=sources
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@chat_router.get("/history/{session_id}", response_model=ChatHistory, summary="Get chat history",
                 description="Retrieve the complete chat history for a specific session")
async def get_chat_history(session_id: str):
    """
    Get the complete chat history for a session.

    - **session_id**: The session ID to retrieve history for

    Returns the complete conversation history.
    """
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return ChatHistory(session_id=session_id, history=chat_sessions[session_id])


@chat_router.post("/session", response_model=SessionResponse, summary="Create new chat session",
                  description="Create a new chat session with optional user ID and metadata")
async def create_chat_session(session_data: SessionCreate):
    """
    Create a new chat session.

    - **user_id**: Optional user identifier
    - **metadata**: Additional session metadata

    Returns the new session information.
    """
    session_id = str(uuid.uuid4())
    chat_sessions[session_id] = []
    return SessionResponse(
        session_id=session_id,
        created_at=datetime.now().isoformat(),
        user_id=session_data.user_id,
        metadata=session_data.metadata
    )


@chat_router.delete("/session/{session_id}", summary="Delete chat session",
                    description="Delete a specific chat session and all its history")
async def delete_chat_session(session_id: str):
    """
    Delete a chat session and all its history.

    - **session_id**: The session ID to delete

    Returns confirmation of deletion.
    """
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    del chat_sessions[session_id]
    return {
        "message": f"Session {session_id} deleted successfully",
        "deleted_at": datetime.now().isoformat()
    }


@chat_router.get("/sessions", response_model=SessionListResponse, summary="List all chat sessions",
                 description="Get a list of all active chat sessions with their basic information")
async def list_chat_sessions():
    """
    List all active chat sessions.

    Returns summary information for all sessions including message count and activity timestamps.
    """
    sessions_info = []
    for session_id, messages in chat_sessions.items():
        sessions_info.append(SessionInfo(
            session_id=session_id,
            message_count=len(messages),
            last_activity=messages[-1]["timestamp"] if messages else None,
            created_at=messages[0]["timestamp"] if messages else None
        ))
    return SessionListResponse(
        total_sessions=len(chat_sessions),
        sessions=sessions_info
    )


@chat_router.post("/stream", summary="Stream chat response",
                  description="Send a message and get a streaming response (basic implementation)")
async def stream_chat(message: ChatMessage):
    """
    Send a message and receive a streaming response.

    Note: This is a basic implementation. For true streaming, implement Server-Sent Events (SSE) or WebSocket.
    """
    try:
        collection = get_chroma_collection(message.collection_name)
        query_embedding = embedding_model.encode([message.message]).tolist()
        results = collection.query(query_embeddings=query_embedding, n_results=5)
        context = results['documents'][0] if results['documents'] else []
        response = generate_response(message.message, context)
        return {
            "message": "Streaming response",
            "response": response,
            "note": "This is a basic implementation. Use SSE or WebSocket for true streaming."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))