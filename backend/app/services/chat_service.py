import uuid
from datetime import datetime
from typing import List, Dict, Any
from groq import Groq
from ..core.config import settings
from ..core.database import get_chroma_collection, get_embedding_model
from ..models.chat import ChatMessage, ChatResponse


class ChatService:
    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
        self.embedding_model = get_embedding_model()
        self.chat_sessions = {}
    
    def generate_response(self, query: str, context: List[str]) -> str:
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
            response = self.groq_client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=settings.MAX_TOKENS,
                temperature=settings.TEMPERATURE,
                top_p=settings.TOP_P,
                stream=False
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    def process_chat_message(self, message: ChatMessage) -> ChatResponse:
        """Process a chat message and return AI response"""
        if not message.session_id:
            message.session_id = str(uuid.uuid4())
            self.chat_sessions[message.session_id] = []

        collection = get_chroma_collection(message.collection_name)
        query_embedding = self.embedding_model.encode([message.message]).tolist()
        results = collection.query(query_embeddings=query_embedding, n_results=settings.N_RESULTS)

        context = results['documents'][0] if results['documents'] else []
        sources = []
        if results['metadatas'][0]:
            for doc, meta, dist in zip(results['documents'][0], results['metadatas'][0], results['distances'][0]):
                sources.append({"content": doc, "metadata": meta, "distance": dist})

        ai_response = self.generate_response(message.message, context)

        # Store conversation history
        self.chat_sessions[message.session_id].append({
            "role": "user",
            "content": message.message,
            "timestamp": datetime.now().isoformat()
        })
        self.chat_sessions[message.session_id].append({
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now().isoformat()
        })

        return ChatResponse(
            response=ai_response,
            session_id=message.session_id,
            sources=sources
        )
    
    def get_chat_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Get chat history for a session"""
        return self.chat_sessions.get(session_id, [])
    
    def create_session(self, user_id: str = None, metadata: Dict[str, Any] = None) -> str:
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        self.chat_sessions[session_id] = []
        return session_id
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a chat session"""
        if session_id in self.chat_sessions:
            del self.chat_sessions[session_id]
            return True
        return False
    
    def list_sessions(self) -> List[Dict[str, Any]]:
        """List all chat sessions"""
        sessions_info = []
        for session_id, messages in self.chat_sessions.items():
            sessions_info.append({
                "session_id": session_id,
                "message_count": len(messages),
                "last_activity": messages[-1]["timestamp"] if messages else None,
                "created_at": messages[0]["timestamp"] if messages else None
            })
        return sessions_info


# Global instance
chat_service = ChatService()
