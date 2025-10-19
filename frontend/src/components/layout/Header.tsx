import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../common/ThemeToggle';
import './Header.css';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-logo">Task Manager</h1>
      </div>

      <div className="header-right">
        <ThemeToggle />
        <div className="user-menu" ref={dropdownRef}>
          <button
            className="user-button"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="User menu"
          >
            {/* <div className="user-avatar">
              {user ? getInitials(user.name) : 'U'}
            </div> */}
            <span className="user-name">{user?.name}</span>
            <svg
              className={`dropdown-icon ${showDropdown ? 'open' : ''}`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {showDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <strong>{user?.name}</strong>
                  <span className="dropdown-email">{user?.email}</span>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button
                className="dropdown-item"
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/profile');
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z"
                    fill="currentColor"
                  />
                  <path
                    d="M10 12C4.477 12 0 14.477 0 17.5V20H20V17.5C20 14.477 15.523 12 10 12Z"
                    fill="currentColor"
                  />
                </svg>
                Profile
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item logout" onClick={handleLogout}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M13 3L17 7M17 7L13 11M17 7H7M7 17H5C3.89543 17 3 16.1046 3 15V5C3 3.89543 3.89543 3 5 3H7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
