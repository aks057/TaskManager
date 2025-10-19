import React from 'react';
import './Badge.css';
import { TaskStatus, TaskPriority } from '../../types/task.types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'status' | 'priority' | 'default';
  status?: TaskStatus;
  priority?: TaskPriority;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  className = '',
}) => {
  let badgeClass = 'badge';

  if (variant === 'status' && status) {
    badgeClass += ` badge-status-${status}`;
  } else if (variant === 'priority' && priority) {
    badgeClass += ` badge-priority-${priority}`;
  }

  return <span className={`${badgeClass} ${className}`}>{children}</span>;
};
