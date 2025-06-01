# vector_db_routes.py
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any
import uuid
import chromadb

from datetime import datetime
import PyPDF2
import docx
import io
from functools import lru_cache

# Initialize router
router = APIRouter(prefix="/documents", tags=["Document Management"])



@lru_cache()
def get_embedding_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")




# Pydantic models
class DocumentUpload(BaseModel):
    content: str
    title: str
    metadata: Dict[str, Any] = {}

class BulkDocumentUpload(BaseModel):
    documents: List[DocumentUpload]

class CollectionCreate(BaseModel):
    name: str
    metadata: Dict[str, Any] = {}

# Utility functions
chroma_client = chromadb.PersistentClient(path="./chroma_db")
def get_chroma_collection(collection_name: str = "default"):
    try:
        collection = chroma_client.get_collection(name=collection_name)
    except:
        collection = chroma_client.create_collection(name=collection_name)
    return collection

def extract_text_from_file(file: UploadFile) -> str:
    content = file.file.read()

    if file.filename.endswith('.pdf'):
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text

    elif file.filename.endswith('.docx'):
        doc = docx.Document(io.BytesIO(content))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text

    elif file.filename.endswith('.txt'):
        return content.decode('utf-8')

    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap
        if end >= len(text):
            break
    return chunks

def process_and_store_document(content: str, title: str, metadata: Dict, collection_name: str) -> Dict:
    chunks = chunk_text(content)
    collection = get_chroma_collection(collection_name)
    doc_id = str(uuid.uuid4())
    embedding_model = get_embedding_model()
    embeddings = embedding_model.encode(chunks).tolist()

    metadatas = [
        {
            "title": title,
            "doc_id": doc_id,
            "chunk_index": i,
            "upload_date": datetime.now().isoformat(),
            **metadata
        } for i in range(len(chunks))
    ]
    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    collection.add(documents=chunks, embeddings=embeddings, metadatas=metadatas, ids=ids)
    return {
        "doc_id": doc_id,
        "title": title,
        "chunks_created": len(chunks),
        "collection": collection_name
    }

# Routes
@router.post("/upload")
async def upload_document(file: UploadFile = File(...), collection_name: str = "default", metadata: str = "{}"):
    import json
    try:
        doc_metadata = json.loads(metadata) if metadata != "{}" else {}
        text_content = extract_text_from_file(file)
        result = process_and_store_document(
            content=text_content,
            title=file.filename,
            metadata={**doc_metadata, "source": file.filename, "file_type": file.content_type},
            collection_name=collection_name
        )
        return {"message": "Document uploaded successfully", "filename": file.filename, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/embed")
async def embed_text_content(document: DocumentUpload, collection_name: str = "default"):
    try:
        result = process_and_store_document(
            content=document.content,
            title=document.title,
            metadata=document.metadata,
            collection_name=collection_name
        )
        return {"message": "Content embedded successfully", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk-embed")
async def bulk_embed_documents(bulk_data: BulkDocumentUpload, collection_name: str = "default"):
    try:
        results = []
        for document in bulk_data.documents:
            result = process_and_store_document(
                content=document.content,
                title=document.title,
                metadata=document.metadata,
                collection_name=collection_name
            )
            results.append(result)
        return {
            "message": f"Successfully embedded {len(results)} documents",
            "collection": collection_name,
            "documents": results,
            "total_chunks": sum(r["chunks_created"] for r in results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_documents(collection_name: str = "default", limit: int = 100):
    try:
        collection = get_chroma_collection(collection_name)
        results = collection.get(limit=limit)
        documents = {}
        for metadata in results['metadatas']:
            doc_id = metadata.get('doc_id')
            if doc_id not in documents:
                documents[doc_id] = {
                    "doc_id": doc_id,
                    "source": metadata.get('source', 'Unknown'),
                    "title": metadata.get('title', 'Untitled'),
                    "upload_date": metadata.get('upload_date'),
                    "file_type": metadata.get('file_type', 'text'),
                    "chunk_count": 0
                }
            documents[doc_id]["chunk_count"] += 1
        return {
            "collection": collection_name,
            "total_documents": len(documents),
            "documents": list(documents.values())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{doc_id}")
async def get_document_details(doc_id: str, collection_name: str = "default"):
    try:
        collection = get_chroma_collection(collection_name)
        results = collection.get(where={"doc_id": doc_id})
        if not results['ids']:
            raise HTTPException(status_code=404, detail="Document not found")
        chunks = []
        for i, (chunk_id, document, metadata) in enumerate(zip(results['ids'], results['documents'], results['metadatas'])):
            chunks.append({
                "chunk_id": chunk_id,
                "chunk_index": metadata.get('chunk_index', i),
                "content": document,
                "metadata": metadata
            })
        chunks.sort(key=lambda x: x['chunk_index'])
        doc_metadata = chunks[0]['metadata'] if chunks else {}
        return {
            "doc_id": doc_id,
            "title": doc_metadata.get('title', 'Untitled'),
            "source": doc_metadata.get('source', 'Unknown'),
            "upload_date": doc_metadata.get('upload_date'),
            "chunk_count": len(chunks),
            "chunks": chunks
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, collection_name: str = "default"):
    try:
        collection = get_chroma_collection(collection_name)
        results = collection.get(where={"doc_id": doc_id})
        if not results['ids']:
            raise HTTPException(status_code=404, detail="Document not found")
        collection.delete(ids=results['ids'])
        return {
            "message": "Document deleted successfully",
            "doc_id": doc_id,
            "chunks_deleted": len(results['ids'])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{doc_id}")
async def update_document(doc_id: str, document: DocumentUpload, collection_name: str = "default"):
    try:
        await delete_document(doc_id, collection_name)
        result = process_and_store_document(
            content=document.content,
            title=document.title,
            metadata=document.metadata,
            collection_name=collection_name
        )
        return {"message": "Document updated successfully", "old_doc_id": doc_id, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== COLLECTION MANAGEMENT ==========

@router.get("/collections/list")
async def list_collections():
    try:
        collections = chroma_client.list_collections()
        collection_info = []
        for collection in collections:
            count = collection.count()
            collection_info.append({
                "name": collection.name,
                "id": collection.id,
                "document_count": count,
                "metadata": collection.metadata
            })
        return {"collections": collection_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/collections/create")
async def create_collection(collection_data: CollectionCreate):
    try:
        existing_collections = [col.name for col in chroma_client.list_collections()]
        if collection_data.name in existing_collections:
            raise HTTPException(status_code=400, detail=f"Collection '{collection_data.name}' already exists")
        collection = chroma_client.create_collection(
            name=collection_data.name,
            metadata=collection_data.metadata
        )
        return {
            "message": "Collection created successfully",
            "name": collection.name,
            "id": collection.id,
            "metadata": collection.metadata
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/collections/{collection_name}")
async def delete_collection(collection_name: str):
    try:
        chroma_client.delete_collection(name=collection_name)
        return {"message": f"Collection '{collection_name}' deleted successfully"}
    except Exception as e:
        if "does not exist" in str(e).lower():
            raise HTTPException(status_code=404, detail="Collection not found")
        raise HTTPException(status_code=500, detail=str(e))
