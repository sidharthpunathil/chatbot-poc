from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class DocumentUpload(BaseModel):
    content: str
    title: str
    metadata: Dict[str, Any] = {}


class BulkDocumentUpload(BaseModel):
    documents: List[DocumentUpload]


class CollectionCreate(BaseModel):
    name: str
    metadata: Dict[str, Any] = {}


class DocumentInfo(BaseModel):
    doc_id: str
    source: str
    title: str
    upload_date: Optional[str]
    file_type: str
    chunk_count: int


class DocumentDetails(BaseModel):
    doc_id: str
    title: str
    source: str
    upload_date: Optional[str]
    chunk_count: int
    chunks: List[Dict[str, Any]]


class CollectionInfo(BaseModel):
    name: str
    id: str
    document_count: int
    metadata: Dict[str, Any]
