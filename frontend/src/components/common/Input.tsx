import React, { useState } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  id,
  type,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-full-width' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {props.required && <span className="input-required">*</span>}
        </label>
      )}
      <div className={isPasswordField ? 'input-password-wrapper' : ''}>
        <input
          id={inputId}
          className={`input ${error ? 'input-error' : ''} ${isPasswordField ? 'input-with-toggle' : ''}`}
          type={isPasswordField && showPassword ? 'text' : type}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            className="input-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13.359 11.238C13.759 11.638 14 12.192 14 12.8C14 14.008 13.008 15 11.8 15C11.192 15 10.638 14.759 10.238 14.359M7.8 16.8L5 19.6M16.2 7.2L19 4.4M9.8 5.2C10.515 5.068 11.251 5 12 5C16.2 5 19.6 8.4 21 12C20.2 13.96 18.8 15.6 17 16.8M12 19C7.8 19 4.4 15.6 3 12C3.8 10.04 5.2 8.4 7 7.2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 3L21 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5C7.8 5 4.4 8.4 3 12C4.4 15.6 7.8 19 12 19C16.2 19 19.6 15.6 21 12C19.6 8.4 16.2 5 12 5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};
