import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, Plus } from 'lucide-react';
import { documentAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('default');
  const [collectionNameInput, setCollectionNameInput] = useState('default');
  const [isUploading, setIsUploading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);

  const loadDocuments = useCallback(async () => {
    try {
      const response = await documentAPI.listDocuments(selectedCollection);
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  }, [selectedCollection]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function loadCollections() {
    try {
      const response = await documentAPI.listCollections();
      const list = response.collections || [];
      setCollections(list);
      if (list.length > 0) {
        const names = list.map((c) => c.name);
        // If current selection is missing, pick the first
        setSelectedCollection((prev) => (prev && names.includes(prev) ? prev : names[0]));
        // If input is empty, default to current selection for convenience
        setCollectionNameInput((prev) => (prev ? prev : (names.includes(selectedCollection) ? selectedCollection : names[0])));
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  }

  useEffect(() => {
    loadCollections();
  }, []);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus({ type: 'uploading', message: 'Uploading documents...' });

    try {
      for (const file of acceptedFiles) {
        await documentAPI.uploadDocument(file, selectedCollection);
      }
      setUploadStatus({ type: 'success', message: `${acceptedFiles.length} document(s) uploaded successfully!` });
      await loadDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus({ type: 'error', message: 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: true,
    disabled: isUploading
  });

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentAPI.deleteDocument(docId, selectedCollection);
      setUploadStatus({ type: 'success', message: 'Document deleted successfully!' });
      await loadDocuments();
    } catch (error) {
      console.error('Delete failed:', error);
      setUploadStatus({ type: 'error', message: 'Failed to delete document.' });
    }
  };

  const handleCreateCollection = async (overwrite = false) => {
    const name = collectionNameInput.trim();
    if (!name) return;
    try {
      await documentAPI.createCollection(name, {}, overwrite);
      setUploadStatus({ type: 'success', message: `Collection "${name}" ${overwrite ? 'created/replaced' : 'created'} successfully!` });
      setSelectedCollection(name);
      await loadCollections();
    } catch (error) {
      console.error('Create collection failed:', error);
      const detail = error?.response?.data?.detail || 'Failed to create collection.';
      setUploadStatus({ type: 'error', message: detail });
      // If it already exists, select it and refresh the list so it appears in dropdown
      if (String(detail).toLowerCase().includes('already exists')) {
        setSelectedCollection(name);
      }
      await loadCollections();
    }
  };

  const handleDeleteCollection = async () => {
    const name = collectionNameInput.trim();
    if (!name) return;
    if (!window.confirm(`Delete collection "${name}"?`)) return;
    try {
      await documentAPI.deleteCollection(name);
      setUploadStatus({ type: 'success', message: `Collection "${name}" deleted.` });
      // Reset selection to default if deleted selected
      if (selectedCollection === name) setSelectedCollection('default');
      await loadCollections();
    } catch (error) {
      console.error('Delete collection failed:', error);
      setUploadStatus({ type: 'error', message: error?.response?.data?.detail || 'Failed to delete collection.' });
    }
  };

  const handleSystemPromptChange = (e) => {
    setSystemPrompt(e.target.value);
    // Save to localStorage
    localStorage.setItem('systemPrompt', e.target.value);
  };

  useEffect(() => {
    // Load system prompt from localStorage
    const saved = localStorage.getItem('systemPrompt');
    if (saved) setSystemPrompt(saved);
    const savedCollection = localStorage.getItem('selectedCollection');
    if (savedCollection) {
      setSelectedCollection(savedCollection);
      setCollectionNameInput(savedCollection);
    }
    // legacy keys are ignored now that Chat Config UI is removed
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Manage your documents and configure AI settings</p>
      </div>

      {uploadStatus && (
        <div className={`status-message ${uploadStatus.type}`}>
          <span>{uploadStatus.message}</span>
        </div>
      )}

      <div className="dashboard-content">
        {/* Collection Management */}
        <div className="section collection-section">
          <h3>Collection</h3>
          {/* Choose existing */}
          <div className="collection-container" style={{ marginBottom: 12 }}>
            <select 
              className="collection-select"
              value={selectedCollection}
              onChange={(e) => {
                setSelectedCollection(e.target.value);
                try { localStorage.setItem('selectedCollection', e.target.value); } catch (_) {}
              }}
            >
              {(collections || []).map((collection) => (
                <option key={collection.name} value={collection.name}>
                  {collection.name} ({collection.document_count} docs)
                </option>
              ))}
            </select>
          </div>

          {/* Create / replace / delete */}
          <div className="collection-container">
            <input
              type="text"
              className="collection-input"
              placeholder="Enter collection name"
              value={collectionNameInput}
              onChange={(e) => setCollectionNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCollection(false);
              }}
            />
            <button onClick={() => handleCreateCollection(false)} className="new-collection-btn">
              <Plus size={16} />
              Create
            </button>
            <button onClick={() => handleCreateCollection(true)} className="new-collection-btn" title="Create or update if exists">
              Update
            </button>
            <button onClick={handleDeleteCollection} className="delete-btn" title="Delete collection">
              <Trash2 size={14} />
            </button>
          </div>
          <div style={{ marginTop: 8 }}>
            <small>Current: {selectedCollection}</small>
          </div>
        </div>

        {/* System Prompt */}
        <div className="section system-prompt-section">
          <h3>System Prompt</h3>
          <div className="textarea-container">
            <textarea
              value={systemPrompt}
              onChange={handleSystemPromptChange}
              placeholder="Enter system prompt to customize AI behavior..."
              rows={4}
              className="system-prompt-textarea"
            />
            <div className="character-count">
              {systemPrompt.length} characters
            </div>
          </div>
        </div>

        

        {/* Document Upload */}
        <div className="section">
          <h3>Upload Documents (For RAG to Learn)</h3>
          <div 
            {...getRootProps()} 
            className={`upload-zone ${isDragActive ? 'active' : ''} ${isUploading ? 'uploading' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="upload-content">
              <Upload size={24} />
              <p>
                {isUploading 
                  ? 'Uploading...' 
                  : isDragActive 
                    ? 'Drop files here...' 
                    : 'Drag & drop files here, or click to select'
                }
              </p>
              <small>PDF, DOCX, TXT</small>
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="section">
          <h3>Documents ({documents.length})</h3>
          
          {documents.length === 0 ? (
            <div className="empty-state">
              <FileText size={32} />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="document-list">
              {documents.map((doc) => (
                <div key={doc.doc_id} className="document-item">
                  <FileText size={16} />
                  <div className="doc-info">
                    <span className="doc-title">{doc.title}</span>
                    <span className="doc-meta">{doc.chunk_count} chunks</span>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteDocument(doc.doc_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
