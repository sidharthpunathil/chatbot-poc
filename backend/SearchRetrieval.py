from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import chromadb
from sentence_transformers import SentenceTransformer
import numpy as np
from datetime import datetime

# Initialize router
router = APIRouter(prefix="/search", tags=["Search & Retrieval"])

# Initialize clients
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Pydantic models
class SearchQuery(BaseModel):
    query: str
    top_k: int = 5
    collection_name: str = "default"
    filter_metadata: Dict[str, Any] = {}

class MultiSearchQuery(BaseModel):
    queries: List[str]
    top_k: int = 5
    collection_name: str = "default"

class SimilarityThreshold(BaseModel):
    min_similarity: float = 0.5
    max_similarity: float = 1.0

class AdvancedSearchQuery(SearchQuery):
    include_metadata: bool = True
    include_distances: bool = True
    similarity_threshold: float = 0.0
    date_range: Dict[str, str] = {}

class HybridSearchQuery(BaseModel):
    query: str
    keywords: List[str] = []
    top_k: int = 5
    collection_name: str = "default"
    semantic_weight: float = 0.7

class ReRankQuery(BaseModel):
    query: str
    document_ids: List[str]
    collection_name: str = "default"

# Utility functions
def get_chroma_collection(collection_name: str = "default"):
    try:
        collection = chroma_client.get_collection(name=collection_name)
        return collection
    except:
        raise HTTPException(status_code=404, detail=f"Collection '{collection_name}' not found")

def calculate_similarity_score(distance: float) -> float:
    return max(0, 1 - distance)

def filter_by_date_range(results: Dict, date_range: Dict[str, str]) -> Dict:
    if not date_range or not date_range.get('start') or not date_range.get('end'):
        return results

    start_date = datetime.fromisoformat(date_range['start'])
    end_date = datetime.fromisoformat(date_range['end'])

    filtered_ids = []
    filtered_documents = []
    filtered_metadatas = []
    filtered_distances = []

    for i, metadata in enumerate(results['metadatas'][0]):
        if metadata and metadata.get('upload_date'):
            upload_date = datetime.fromisoformat(metadata['upload_date'])
            if start_date <= upload_date <= end_date:
                filtered_ids.append(results['ids'][0][i])
                filtered_documents.append(results['documents'][0][i])
                filtered_metadatas.append(metadata)
                filtered_distances.append(results['distances'][0][i])

    return {
        'ids': [filtered_ids],
        'documents': [filtered_documents],
        'metadatas': [filtered_metadatas],
        'distances': [filtered_distances]
    }

def keyword_match_score(text: str, keywords: List[str]) -> float:
    if not keywords:
        return 0.0
    text_lower = text.lower()
    matches = sum(1 for keyword in keywords if keyword.lower() in text_lower)
    return matches / len(keywords)

def combine_scores(semantic_score: float, keyword_score: float, semantic_weight: float) -> float:
    keyword_weight = 1.0 - semantic_weight
    return (semantic_score * semantic_weight) + (keyword_score * keyword_weight)

# ========== SEARCH AND RETRIEVAL ROUTES ==========
@router.post("/")
async def semantic_search(search_query: SearchQuery):
    try:
        collection = get_chroma_collection(search_query.collection_name)
        query_embedding = embedding_model.encode([search_query.query]).tolist()
        where_clause = search_query.filter_metadata if search_query.filter_metadata else None

        results = collection.query(
            query_embeddings=query_embedding,
            n_results=search_query.top_k,
            where=where_clause
        )

        search_results = []
        if results['documents'][0]:
            for i, (doc, metadata, distance) in enumerate(zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            )):
                search_results.append({
                    "rank": i + 1,
                    "content": doc,
                    "metadata": metadata,
                    "similarity_score": calculate_similarity_score(distance),
                    "distance": distance
                })

        return {
            "query": search_query.query,
            "collection": search_query.collection_name,
            "results": search_results,
            "total_results": len(search_results),
            "search_timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/advanced")
async def advanced_search(search_query: AdvancedSearchQuery):
    try:
        collection = get_chroma_collection(search_query.collection_name)
        query_embedding = embedding_model.encode([search_query.query]).tolist()
        where_clause = search_query.filter_metadata if search_query.filter_metadata else None

        results = collection.query(
            query_embeddings=query_embedding,
            n_results=min(search_query.top_k * 2, 50),
            where=where_clause
        )

        if search_query.date_range:
            results = filter_by_date_range(results, search_query.date_range)

        filtered_results = []
        if results['documents'][0]:
            for i, (doc, metadata, distance) in enumerate(zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            )):
                similarity_score = calculate_similarity_score(distance)
                if similarity_score >= search_query.similarity_threshold:
                    result_item = {
                        "rank": len(filtered_results) + 1,
                        "content": doc,
                        "similarity_score": similarity_score
                    }
                    if search_query.include_distances:
                        result_item["distance"] = distance
                    if search_query.include_metadata:
                        result_item["metadata"] = metadata
                    filtered_results.append(result_item)
                    if len(filtered_results) >= search_query.top_k:
                        break

        return {
            "query": search_query.query,
            "collection": search_query.collection_name,
            "filters_applied": {
                "metadata_filters": search_query.filter_metadata,
                "similarity_threshold": search_query.similarity_threshold,
                "date_range": search_query.date_range
            },
            "results": filtered_results,
            "total_results": len(filtered_results),
            "search_timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/multi-query")
async def multi_query_search(multi_search: MultiSearchQuery):
    try:
        collection = get_chroma_collection(multi_search.collection_name)
        query_embeddings = embedding_model.encode(multi_search.queries).tolist()

        all_results = []
        for i, (query, embedding) in enumerate(zip(multi_search.queries, query_embeddings)):
            results = collection.query(
                query_embeddings=[embedding],
                n_results=multi_search.top_k
            )

            query_results = []
            if results['documents'][0]:
                for j, (doc, metadata, distance) in enumerate(zip(
                    results['documents'][0],
                    results['metadatas'][0],
                    results['distances'][0]
                )):
                    query_results.append({
                        "rank": j + 1,
                        "content": doc,
                        "metadata": metadata,
                        "similarity_score": calculate_similarity_score(distance),
                        "distance": distance
                    })
            all_results.append({
                "query": query,
                "query_index": i,
                "results": query_results,
                "result_count": len(query_results)
            })

        return {
            "queries": multi_search.queries,
            "collection": multi_search.collection_name,
            "results": all_results,
            "total_queries": len(multi_search.queries),
            "search_timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/similar/{doc_id}")
async def find_similar_documents(
    doc_id: str,
    collection_name: str = "default",
    top_k: int = 5,
    exclude_same_source: bool = False
):
    try:
        collection = get_chroma_collection(collection_name)
        target_doc = collection.get(where={"doc_id": doc_id}, limit=1)

        if not target_doc['documents']:
            raise HTTPException(status_code=404, detail="Document not found")

        target_content = target_doc['documents'][0]
        target_metadata = target_doc['metadatas'][0]
        target_embedding = embedding_model.encode([target_content]).tolist()

        where_clause = None
        if exclude_same_source and target_metadata.get('source'):
            where_clause = {"source": {"$ne": target_metadata['source']}}

        results = collection.query(
            query_embeddings=target_embedding,
            n_results=top_k + 1,
            where=where_clause
        )

        similar_docs = []
        if results['documents'][0]:
            for i, (doc, metadata, distance) in enumerate(zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            )):
                if metadata.get('doc_id') == doc_id:
                    continue

                similar_docs.append({
                    "rank": len(similar_docs) + 1,
                    "doc_id": metadata.get('doc_id', 'unknown'),
                    "content": doc,
                    "metadata": metadata,
                    "similarity_score": calculate_similarity_score(distance),
                    "distance": distance
                })

                if len(similar_docs) >= top_k:
                    break

        return {
            "target_doc_id": doc_id,
            "target_content": target_content[:200] + "..." if len(target_content) > 200 else target_content,
            "collection": collection_name,
            "similar_documents": similar_docs,
            "total_found": len(similar_docs),
            "search_timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/hybrid")
async def hybrid_search(search_query: HybridSearchQuery):
    try:
        collection = get_chroma_collection(search_query.collection_name)
        query_embedding = embedding_model.encode([search_query.query]).tolist()

        results = collection.query(
            query_embeddings=query_embedding,
            n_results=min(search_query.top_k * 3, 50)
        )

        hybrid_results = []
        if results['documents'][0]:
            for i, (doc, metadata, distance) in enumerate(zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            )):
                semantic_score = calculate_similarity_score(distance)
                keyword_score = keyword_match_score(doc, search_query.keywords)
                combined_score = combine_scores(
                    semantic_score,
                    keyword_score,
                    search_query.semantic_weight
                )

                hybrid_results.append({
                    "content": doc,
                    "metadata": metadata,
                    "semantic_score": semantic_score,
                    "keyword_score": keyword_score,
                    "combined_score": combined_score,
                    "distance": distance
                })

        hybrid_results.sort(key=lambda x: x['combined_score'], reverse=True)
        final_results = hybrid_results[:search_query.top_k]

        for i, result in enumerate(final_results):
            result["rank"] = i + 1

        return {
            "query": search_query.query,
            "keywords": search_query.keywords,
            "collection": search_query.collection_name,
            "semantic_weight": search_query.semantic_weight,
            "results": final_results,
            "total_results": len(final_results),
            "search_timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rerank")
async def rerank_documents(rerank_query: ReRankQuery):
    try:
        collection = get_chroma_collection(rerank_query.collection_name)
        documents = collection.get(where={"doc_id": {"$in": rerank_query.document_ids}})

        if not documents['documents']:
            raise HTTPException(status_code=404, detail="No documents found with the provided IDs")

        query_embedding = embedding_model.encode([rerank_query.query])

        reranked_results = []
        for i, (doc_id, doc, metadata) in enumerate(zip(
            [m.get('doc_id') for m in documents['metadatas']],
            documents['documents'],
            documents['metadatas']
        )):
            doc_embedding = embedding_model.encode([doc])
            similarity = np.dot(query_embedding, doc_embedding.T)[0][0]
            distance = 1 - similarity

            reranked_results.append({
                "doc_id": doc_id,
                "content": doc,
                "metadata": metadata,
                "similarity_score": calculate_similarity_score(distance),
                "distance": distance
            })

        reranked_results.sort(key=lambda x: x['similarity_score'], reverse=True)

        for i, result in enumerate(reranked_results):
            result["rank"] = i + 1

        return {
            "query": rerank_query.query,
            "collection": rerank_query.collection_name,
            "original_doc_ids": rerank_query.document_ids,
            "reranked_results": reranked_results,
            "total_results": len(reranked_results),
            "search_timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== ANALYTICS AND STATS ROUTES ==========
@router.get("/analytics/collection-stats/{collection_name}")
async def get_collection_stats(collection_name: str = "default"):
    try:
        collection = get_chroma_collection(collection_name)
        count = collection.count()
        sample_docs = collection.get(limit=min(100, count))

        metadata_fields = set()
        source_types = set()
        upload_dates = []

        for metadata in sample_docs['metadatas']:
            if metadata:
                metadata_fields.update(metadata.keys())
                if 'source_type' in metadata:
                    source_types.add(metadata['source_type'])
                if 'upload_date' in metadata:
                    upload_dates.append(metadata['upload_date'])

        date_range = {}
        if upload_dates:
            upload_dates.sort()
            date_range = {
                "earliest": upload_dates[0],
                "latest": upload_dates[-1]
            }

        return {
            "collection_name": collection_name,
            "total_documents": count,
            "metadata_fields": list(metadata_fields),
            "source_types": list(source_types),
            "date_range": date_range,
            "analysis_timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/search-suggestions")
async def get_search_suggestions(
    partial_query: str = Query(..., min_length=2),
    collection_name: str = "default",
    limit: int = 5
):
    try:
        collection = get_chroma_collection(collection_name)
        query_embedding = embedding_model.encode([partial_query]).tolist()

        results = collection.query(
            query_embeddings=query_embedding,
            n_results=limit * 2
        )

        suggestions = []
        if results['documents'][0]:
            for doc in results['documents'][0][:limit]:
                words = doc.split()[:10]
                suggestion = ' '.join(words)
                if len(suggestion) > 50:
                    suggestion = suggestion[:50] + "..."
                suggestions.append(suggestion)

        return {
            "partial_query": partial_query,
            "suggestions": suggestions,
            "collection": collection_name,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    try:
        test_embedding = embedding_model.encode(["test"])
        collections = chroma_client.list_collections()

        return {
            "status": "healthy",
            "embedding_model": "all-MiniLM-L6-v2",
            "embedding_dimension": len(test_embedding),
            "available_collections": [col.name for col in collections],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }