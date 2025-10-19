import React from 'react';
import './Loader.css';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  fullScreen = false,
  text,
}) => {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={`spinner spinner-${size}`}></div>
        {text && <p className="loader-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className="loader-inline">
      <div className={`spinner spinner-${size}`}></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};
