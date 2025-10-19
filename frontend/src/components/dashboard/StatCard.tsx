import React from 'react';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: JSX.Element;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
}) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value">{value}</div>
        {trend && (
          <div className={`stat-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              {trend.isPositive ? (
                <path d="M6 2L10 6L6 6L2 6L6 2Z" fill="currentColor" />
              ) : (
                <path d="M6 10L2 6L6 6L10 6L6 10Z" fill="currentColor" />
              )}
            </svg>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
