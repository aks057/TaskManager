import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <div className="error-icon">⚠️</div>
      <p className="error-message-text">{message}</p>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};
