import React, { useRef, useState } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.slice(0, maxFiles);
    onFilesSelected(validFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`file-upload ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      <div className="file-upload-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 32V16M16 24H32M42 24C42 33.9411 33.9411 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C33.9411 6 42 14.0589 42 24Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="file-upload-text">
        <strong>Click to upload</strong> or drag and drop
      </p>
      <p className="file-upload-hint">
        {acceptedTypes.join(', ')} (max {maxFiles} files)
      </p>
    </div>
  );
};
