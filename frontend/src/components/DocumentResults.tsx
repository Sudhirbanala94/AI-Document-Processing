import React, { useState } from 'react';
import { Document } from '../types';
import './DocumentResults.css';

interface DocumentResultsProps {
  documents: Document[];
}

const DocumentResults: React.FC<DocumentResultsProps> = ({ documents }) => {
  const [editingDocument, setEditingDocument] = useState<number | null>(null);
  const [editedKeyFields, setEditedKeyFields] = useState<{[key: number]: string}>({});
  const [currentPages, setCurrentPages] = useState<{[key: number]: number}>({});

  const handleDownload = (downloadUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'document.pdf';
    link.click();
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round((confidence || 0) * 100)}%`;
  };

  const formatKeyFieldsAsText = (highlights: Array<{field: string, value: string}>) => {
    return highlights.map(h => `${h.field}: ${h.value}`).join('\n');
  };

  const handleEditStart = (docIndex: number, highlights: Array<{field: string, value: string}>) => {
    setEditingDocument(docIndex);
    setEditedKeyFields({ ...editedKeyFields, [docIndex]: formatKeyFieldsAsText(highlights) });
  };

  const handleEditSave = (docIndex: number) => {
    setEditingDocument(null);
    // You could add API call here to save changes if needed
  };

  const handleEditCancel = () => {
    setEditingDocument(null);
    setEditedKeyFields({});
  };

  const getKeyFieldsText = (docIndex: number, originalHighlights: Array<{field: string, value: string}>) => {
    return editedKeyFields[docIndex] !== undefined ? editedKeyFields[docIndex] : formatKeyFieldsAsText(originalHighlights);
  };

  const getCurrentPage = (docIndex: number) => {
    return currentPages[docIndex] || 1;
  };

  const getTotalPages = (doc: Document) => {
    return doc.page_end - doc.page_start + 1;
  };

  const handlePageChange = (docIndex: number, newPage: number, doc: Document) => {
    const totalPages = getTotalPages(doc);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPages({ ...currentPages, [docIndex]: newPage });
    }
  };

  return (
    <div className="document-results">
      <h2>Processing Results</h2>
      <p className="results-summary">
        Found {documents.length} document{documents.length !== 1 ? 's' : ''} in the uploaded bundle
      </p>
      
      <div className="documents-list">
        {documents.map((doc, index) => (
          <div key={index} className="document-item">
            {/* Left side: Document preview and download */}
            <div className="document-preview-section">
              <div className="pdf-preview">
                {doc.download_url && doc.filename && (
                  <>
                    <iframe
                      key={`${index}-${getCurrentPage(index)}`}
                      src={`${doc.download_url}#page=${getCurrentPage(index)}&view=FitH&zoom=page-width`}
                      title={`Preview of ${doc.filename} - Page ${getCurrentPage(index)}`}
                      className="pdf-preview-frame"
                    />
                    <div className="preview-overlay">
                      <div className="pdf-navigation">
                        {getTotalPages(doc) > 1 && (
                          <div className="page-controls">
                            <button 
                              className="page-nav-btn"
                              onClick={() => handlePageChange(index, getCurrentPage(index) - 1, doc)}
                              disabled={getCurrentPage(index) <= 1}
                            >
                              ⬅️
                            </button>
                            <span className="page-info">
                              {getCurrentPage(index)} / {getTotalPages(doc)}
                            </span>
                            <button 
                              className="page-nav-btn"
                              onClick={() => handlePageChange(index, getCurrentPage(index) + 1, doc)}
                              disabled={getCurrentPage(index) >= getTotalPages(doc)}
                            >
                              ➡️
                            </button>
                          </div>
                        )}
                        <button 
                          className="download-btn-large"
                          onClick={() => handleDownload(doc.download_url!, doc.filename!)}
                        >
                          📄 Download PDF
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right side: Document details */}
            <div className="document-details-section">
              <div className="document-header">
                <h3 className="document-title">{doc.title || `Document ${index + 1}`}</h3>
                <div className="document-meta-row">
                  <span className="doc-type">{doc.doc_type}</span>
                  <span className="confidence">
                    {formatConfidence(doc.confidence)} confidence
                  </span>
                  <span className="page-range">
                    Pages {doc.page_start}-{doc.page_end}
                  </span>
                </div>
              </div>
              
              <div className="document-summary">
                <h4>AI Summary</h4>
                <div className="summary-content">
                  <p>{doc.summary}</p>
                  <button 
                    className="copy-btn-small"
                    onClick={() => handleCopyToClipboard(doc.summary)}
                    title="Copy summary"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
              
              <div className="key-highlights">
                <div className="key-highlights-header">
                  <h4>Extracted Key Fields</h4>
                  <div className="highlights-actions">
                    {editingDocument === index ? (
                      <div className="edit-mode-actions">
                        <button 
                          className="save-btn"
                          onClick={() => handleEditSave(index)}
                        >
                          ✓ Save
                        </button>
                        <button 
                          className="cancel-btn"
                          onClick={handleEditCancel}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="view-mode-actions">
                        <button 
                          className="edit-btn-main"
                          onClick={() => handleEditStart(index, doc.key_highlights)}
                          title="Edit fields"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="copy-btn-main"
                          onClick={() => handleCopyToClipboard(getKeyFieldsText(index, doc.key_highlights))}
                          title="Copy all fields"
                        >
                          📋 Copy All
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="highlights-container">
                  {editingDocument === index ? (
                    <textarea
                      value={getKeyFieldsText(index, doc.key_highlights)}
                      onChange={(e) => setEditedKeyFields({ ...editedKeyFields, [index]: e.target.value })}
                      className="highlights-textarea"
                      placeholder="field: value (one per line)"
                      autoFocus
                    />
                  ) : (
                    <div className="highlights-display">
                      {doc.key_highlights.map((highlight, idx) => (
                        <div key={idx} className="highlight-item">
                          <span className="highlight-field">{highlight.field}:</span>
                          <span className="highlight-value">{highlight.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentResults;