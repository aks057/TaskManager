import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  message,
  description,
  action,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {(message || description) && (
        <p className="empty-state-description">{message || description}</p>
      )}
      {action && (
        <button className="empty-state-btn" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};
