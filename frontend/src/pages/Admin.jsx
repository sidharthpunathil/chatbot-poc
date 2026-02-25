import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { documentAPI } from "../services/api";
import {
  Upload,
  Trash2,
  FileText,
  Loader2,
  MessageCircle,
  LogOut,
  FolderOpen,
  X,
} from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [collections, setCollections] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("default");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) loadDocuments(selectedCollection);
  }, [selectedCollection]);

  const loadCollections = async () => {
    try {
      const res = await documentAPI.listCollections();
      setCollections(res.collections || []);
    } catch {
      console.error("Failed to load collections");
    }
  };

  const loadDocuments = async (name) => {
    setLoading(true);
    try {
      const res = await documentAPI.listDocuments(name);
      setDocuments(res.documents || []);
    } catch {
      console.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!confirm("Delete this document?")) return;
    try {
      await documentAPI.deleteDocument(docId, selectedCollection);
      setDocuments((prev) => prev.filter((d) => d.doc_id !== docId));
    } catch {
      alert("Failed to delete document");
    }
  };

  const doUpload = async (file) => {
    setUploadFile(file);
    setUploadError("");
    setUploading(true);
    try {
      await documentAPI.uploadDocument(file, selectedCollection);
      await loadDocuments(selectedCollection);
      await loadCollections();
      setUploadFile(null);
    } catch (err) {
      const msg = err.response?.data?.detail || "Upload failed. Please try again.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) doUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) doUpload(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileType = (type) => {
    if (!type) return "TXT";
    if (type.includes("pdf")) return "PDF";
    if (type.includes("word") || type.includes("docx")) return "DOCX";
    if (type.includes("text")) return "TXT";
    return type.split("/").pop()?.toUpperCase() || "FILE";
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      {/* Upload overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <Loader2 size={40} className="text-violet-600 animate-spin mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 text-lg mb-1">Uploading Document</h3>
            <p className="text-sm text-gray-500 mb-2">
              Processing &ldquo;{uploadFile?.name}&rdquo;...
            </p>
            <p className="text-xs text-gray-400">
              Extracting text, chunking, and generating embeddings. This may take a moment.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <MessageCircle size={16} className="text-white" />
          </div>
          <h1 className="text-gray-900 font-bold text-lg md:text-xl">
            Admin <span className="text-violet-600">Dashboard</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={() => navigate("/chat")}
            className="text-xs md:text-sm text-gray-600 hover:text-violet-600 cursor-pointer bg-transparent border-none whitespace-nowrap font-medium"
          >
            Go to Chat
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs md:text-sm bg-red-50 text-red-600 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 whitespace-nowrap font-medium transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Collections */}
        <section className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen size={18} className="text-violet-600" />
            <h2 className="text-base md:text-lg font-semibold">Collections</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {collections.length === 0 ? (
              <p className="text-sm text-gray-400">No collections found.</p>
            ) : (
              collections.map((col) => (
                <button
                  key={col.name}
                  onClick={() => setSelectedCollection(col.name)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg border text-xs md:text-sm cursor-pointer transition-all ${
                    selectedCollection === col.name
                      ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                      : "bg-white border-gray-200 hover:border-violet-400 text-gray-700"
                  }`}
                >
                  {col.name} ({col.document_count})
                </button>
              ))
            )}
          </div>
        </section>

        {/* Upload zone */}
        <section
          className={`bg-white rounded-xl p-4 md:p-5 shadow-sm border-2 border-dashed transition-colors ${
            dragOver ? "border-violet-400 bg-violet-50" : "border-gray-200"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
              <Upload size={22} className="text-violet-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Drag & drop a file here, or{" "}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-violet-600 font-semibold bg-transparent border-none cursor-pointer underline underline-offset-2"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, MD (max 20 MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={handleFileSelect}
            />
          </div>
          {uploadError && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <X size={14} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{uploadError}</p>
            </div>
          )}
        </section>

        {/* Documents */}
        <section className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-violet-600" />
            <h2 className="text-base md:text-lg font-semibold">
              Documents in &ldquo;{selectedCollection}&rdquo;
            </h2>
            <span className="ml-auto text-xs text-gray-400 font-medium">
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-violet-400 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No documents in this collection.</p>
              <p className="text-gray-300 text-xs mt-1">Upload a document to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.doc_id}
                  className="flex items-center gap-3 p-3 md:p-4 border border-gray-100 rounded-xl hover:border-violet-200 hover:bg-violet-50/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.title || doc.source || doc.doc_id}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                        {formatFileType(doc.file_type)}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {doc.chunk_count} chunk{doc.chunk_count !== 1 ? "s" : ""}
                      </span>
                      {doc.upload_date && (
                        <span className="text-[11px] text-gray-400 hidden sm:inline">
                          {formatDate(doc.upload_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDoc(doc.doc_id)}
                    className="p-2 rounded-lg text-gray-400 bg-transparent border-none cursor-pointer hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                    title="Delete document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Admin;
