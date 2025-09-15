import React, { useCallback, useState } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileUpload(file);
      } else {
        alert('Please upload a PDF file only.');
      }
    }
  }, [onFileUpload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        onFileUpload(file);
      } else {
        alert('Please upload a PDF file only.');
      }
    }
  }, [onFileUpload]);

  return (
    <div className="file-upload-container">
      <form className="file-upload-form">
        <input
          type="file"
          id="file-upload-input"
          multiple={false}
          accept=".pdf"
          onChange={handleChange}
          disabled={isProcessing}
        />
        <label
          htmlFor="file-upload-input"
          className={`file-upload-label ${dragActive ? 'drag-active' : ''} ${isProcessing ? 'processing' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="processing-state">
              <div className="spinner"></div>
              <p>Processing document with AI...</p>
              <p className="processing-note">This may take up to 60 seconds</p>
            </div>
          ) : (
            <div className="upload-state">
              <div className="upload-icon">📄</div>
              <p className="upload-text">
                <strong>Drop your PDF bundle here</strong> or click to browse
              </p>
              <p className="upload-subtext">
                Upload a single PDF containing multiple mortgage documents
              </p>
            </div>
          )}
        </label>
      </form>
    </div>
  );
};

export default FileUpload;