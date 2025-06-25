# chatbot-poc

chatbot-poc
This repository hosts the backend API for the Chatbot providing conversational AI capabilities and search & retrieval functionalities.

Features
Conversational AI: Integrates with Groq with fast and efficient AI responses. Context Retrieval (RAG): s ChromaDB for vector search to retrieve and provide relevant context to the AI, significantly enhancing response accuracy and relevance. Session Management: Supports creating, managing, and retrieving individual chat sessions, ensuring continuity and history for each conversation.

Search & Retrieval
Semantic Search: vector-based similarity searches against document collections in ChromaDB. Advanced Search: Filter search results by metadata, set similarity thresholds, and narrow down results by date ranges. Multi-Query Search: Execute multiple semantic searches in a single request, optimizing batch operations. Find Similar Documents: Retrieve documents semantically similar to a given document, useful for related content discovery. Hybrid Search: Combine semantic similarity with keyword matching for more nuanced and precise search results. Document Re-ranking: Re-order a list of pre-selected documents based on their semantic similarity to a new query, improving relevance of displayed results. Collection Analytics: Get detailed statistics about your ChromaDB collections, including document counts, available metadata fields, and upload date ranges. Search Suggestions: Receive real-time search suggestions based on partial queries, enhancing user experience. Health Check: An endpoint to verify the API's status and its underlying dependencies (embedding model, ChromaDB).

Project Structure
backend/: Contains the core FastAPI application logic. backend/main.py: The main FastAPI application entry point, likely where the APIRouters are included. backend/search_retrieval.py (Hypothetical, based on previous code): Contains the APIRouter for search and retrieval endpoints, including the utility functions. docs/: Holds API documentation and related resources. docs/AI_Chat_API_Collection.json: A Postman collection for easily testing the API endpoints. requirements.txt: Lists all Python dependencies.

Setup and Running
Clone the repository:
git clone "url of repo"

Create and activate a virtual environment:\
python -m venv .search_env .search_env\Scripts\activate # For Command Prompt

Install dependencies:
pip install -r requirements.txt pip freeze > requirements.txt

Run the FastAPI application:
uvicorn backend.main:app --reload

API Documentation
Interactive Docs (Swagger UI): Access the live API documentation in your browser: http://127.0.0.1:8000/docs Postman Collection: A Postman collection is added in the docs/ folder (docs/AI_Chat_API_Collection.json).