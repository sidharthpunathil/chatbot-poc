import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from groq import Groq
from ..core.config import settings
from ..core.prompts import TOOLS
from ..core.database import get_chroma_collection, get_embedding_model
from ..models.chat import ChatMessage, ChatResponse
from .announcement_service import get_cached_announcements, format_announcements_as_context

# Max characters kept per history message to avoid bloating the prompt
_HISTORY_CONTENT_CAP = 300
_MAX_CONTEXT_CHARS = 3000


class ChatService:
    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
        self.embedding_model = get_embedding_model()
        self.chat_sessions: Dict[str, List[Dict[str, Any]]] = {}

    # ── Tool handlers ──────────────────────────────────────────────
    def _handle_tool_call(self, name: str) -> str:
        """Execute a tool by name and return the result as a string."""
        if name == "get_announcements":
            announcements = get_cached_announcements()
            text = format_announcements_as_context(announcements)
            return text or "No announcements available at this time."
        return "Unknown tool."

    # ── Helpers ─────────────────────────────────────────────────────
    @staticmethod
    def _trim_context(chunks: List[str], max_chars: int = _MAX_CONTEXT_CHARS) -> List[str]:
        trimmed, total = [], 0
        for chunk in chunks:
            if total + len(chunk) > max_chars:
                remaining = max_chars - total
                if remaining > 100:
                    trimmed.append(chunk[:remaining])
                break
            trimmed.append(chunk)
            total += len(chunk)
        return trimmed

    @staticmethod
    def _trim_history(history: List[Dict[str, Any]], max_turns: int = 10) -> List[Dict[str, str]]:
        recent = history[-(max_turns * 2):]
        return [
            {"role": msg["role"], "content": msg["content"][:_HISTORY_CONTENT_CAP]}
            for msg in recent
        ]

    # ── Core generation ────────────────────────────────────────────
    def generate_response(
        self,
        query: str,
        context: List[str],
        *,
        history: Optional[List[Dict[str, Any]]] = None,
        groq_model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        system_prompt_override: Optional[str] = None,
    ) -> str:
        context_text = "\n\n".join(context)
        system_prompt = system_prompt_override or settings.BASE_SYSTEM_PROMPT
        user_prompt = f"Context:\n{context_text}\n\nQuestion: {query}"

        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(self._trim_history(history))
        messages.append({"role": "user", "content": user_prompt})

        model = groq_model or settings.GROQ_MODEL
        common = dict(
            model=model,
            max_tokens=max_tokens or settings.MAX_TOKENS,
            temperature=temperature if temperature is not None else settings.TEMPERATURE,
            top_p=top_p if top_p is not None else settings.TOP_P,
            stream=False,
        )

        try:
            # First call — with tools so the LLM can decide to fetch announcements
            response = self.groq_client.chat.completions.create(
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
                **common,
            )
            choice = response.choices[0]

            # If the model wants to call a tool, execute it and do a follow-up
            if choice.finish_reason == "tool_calls" and choice.message.tool_calls:
                # Append the assistant's tool-call message
                messages.append(choice.message)

                for tool_call in choice.message.tool_calls:
                    result = self._handle_tool_call(tool_call.function.name)
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": result,
                    })

                # Second call — let the model compose the final answer
                follow_up = self.groq_client.chat.completions.create(
                    messages=messages,
                    **common,
                )
                return follow_up.choices[0].message.content

            # No tool call — return directly
            return choice.message.content

        except Exception as e:
            return f"Error generating response: {str(e)}"

    # ── Message processing ─────────────────────────────────────────
    def process_chat_message(self, message: ChatMessage) -> ChatResponse:
        if not message.session_id:
            message.session_id = str(uuid.uuid4())
        if message.session_id not in self.chat_sessions:
            self.chat_sessions[message.session_id] = []

        # Always do RAG lookup
        collection = get_chroma_collection(message.collection_name)
        query_embedding = self.embedding_model.encode([message.message]).tolist()
        results = collection.query(
            query_embeddings=query_embedding, n_results=settings.N_RESULTS
        )

        context = results["documents"][0] if results["documents"] else []
        context = self._trim_context(context)

        sources = []
        if results["metadatas"][0]:
            for doc, meta, dist in zip(
                results["documents"][0], results["metadatas"][0], results["distances"][0]
            ):
                sources.append({"content": doc, "metadata": meta, "distance": dist})

        session_history = self.chat_sessions.get(message.session_id, [])

        ai_response = self.generate_response(
            message.message,
            context,
            history=session_history,
            groq_model=message.groq_model,
            max_tokens=message.max_tokens,
            temperature=message.temperature,
            top_p=message.top_p,
            system_prompt_override=message.system_prompt,
        )

        # Store conversation history
        self.chat_sessions[message.session_id].append({
            "role": "user",
            "content": message.message,
            "timestamp": datetime.now().isoformat(),
        })
        self.chat_sessions[message.session_id].append({
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now().isoformat(),
        })

        return ChatResponse(
            response=ai_response,
            session_id=message.session_id,
            sources=sources,
        )

    # ── Session management ─────────────────────────────────────────
    def get_chat_history(self, session_id: str) -> List[Dict[str, Any]]:
        return self.chat_sessions.get(session_id, [])

    def create_session(self, user_id: str = None, metadata: Dict[str, Any] = None) -> str:
        session_id = str(uuid.uuid4())
        self.chat_sessions[session_id] = []
        return session_id

    def delete_session(self, session_id: str) -> bool:
        if session_id in self.chat_sessions:
            del self.chat_sessions[session_id]
            return True
        return False

    def list_sessions(self) -> List[Dict[str, Any]]:
        return [
            {
                "session_id": sid,
                "message_count": len(msgs),
                "last_activity": msgs[-1]["timestamp"] if msgs else None,
                "created_at": msgs[0]["timestamp"] if msgs else None,
            }
            for sid, msgs in self.chat_sessions.items()
        ]


# Global instance
chat_service = ChatService()
