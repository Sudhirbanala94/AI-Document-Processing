import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import DocumentResults from './components/DocumentResults';
import { Document } from './types';

interface ProcessingResponse {
  message: string;
  filename: string;
  total_documents: number;
  documents: Document[];
}

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setDocuments([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/process_document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process document');
      }

      const data: ProcessingResponse = await response.json();
      setDocuments(data.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Document Processing Demo</h1>
        <p>Upload a PDF bundle to classify and extract mortgage documents</p>
      </header>
      
      <main className="App-main">
        <FileUpload 
          onFileUpload={handleFileUpload} 
          isProcessing={isProcessing} 
        />
        
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}
        
        {documents.length > 0 && (
          <DocumentResults documents={documents} />
        )}
      </main>
    </div>
  );
}

export default App;
