import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, Plus } from 'lucide-react';
import { documentAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('default');
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
    loadCollections();
  }, [loadDocuments]);

  const loadCollections = async () => {
    try {
      const response = await documentAPI.listCollections();
      setCollections(response.collections || []);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

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

  const handleCreateCollection = async () => {
    const name = prompt('Enter collection name:');
    if (!name) return;

    try {
      await documentAPI.createCollection(name);
      setUploadStatus({ type: 'success', message: `Collection "${name}" created successfully!` });
      await loadCollections();
    } catch (error) {
      console.error('Create collection failed:', error);
      setUploadStatus({ type: 'error', message: 'Failed to create collection.' });
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
    if (saved) {
      setSystemPrompt(saved);
    }
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
        {/* Collection Selection */}
        <div className="section collection-section">
          <h3>Collection</h3>
          <div className="collection-container">
            <select 
              value={selectedCollection} 
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="collection-select"
            >
              {collections.map((collection) => (
                <option key={collection.name} value={collection.name}>
                  {collection.name} ({collection.document_count} docs)
                </option>
              ))}
            </select>
            <button onClick={handleCreateCollection} className="new-collection-btn">
              <Plus size={16} />
              New
            </button>
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
