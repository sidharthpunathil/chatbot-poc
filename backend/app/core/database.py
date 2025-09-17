import chromadb
from sentence_transformers import SentenceTransformer
from functools import lru_cache
from .config import settings


@lru_cache()
def get_embedding_model():
    """Get the embedding model instance (cached)"""
    return SentenceTransformer(settings.EMBEDDING_MODEL)


def get_chroma_client():
    """Get ChromaDB client instance"""
    return chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)


def get_chroma_collection(collection_name: str = "default"):
    """Get or create a ChromaDB collection"""
    client = get_chroma_client()
    try:
        collection = client.get_collection(name=collection_name)
    except:
        collection = client.create_collection(name=collection_name)
    return collection
