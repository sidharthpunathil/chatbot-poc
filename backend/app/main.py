from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api import chat, documents

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="A chatbot API with document management and vector search capabilities"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/")
def root():
    return {
        "message": "Welcome to the Chatbot API!",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

# Include routers
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
