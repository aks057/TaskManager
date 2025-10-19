import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface NavItem {
  path: string;
  label: string;
  icon: JSX.Element;
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 4C3 3.44772 3.44772 3 4 3H7C7.55228 3 8 3.44772 8 4V7C8 7.55228 7.55228 8 7 8H4C3.44772 8 3 7.55228 3 7V4Z"
          fill="currentColor"
        />
        <path
          d="M3 13C3 12.4477 3.44772 12 4 12H7C7.55228 12 8 12.4477 8 13V16C8 16.5523 7.55228 17 7 17H4C3.44772 17 3 16.5523 3 16V13Z"
          fill="currentColor"
        />
        <path
          d="M12 4C12 3.44772 12.4477 3 13 3H16C16.5523 3 17 3.44772 17 4V7C17 7.55228 16.5523 8 16 8H13C12.4477 8 12 7.55228 12 7V4Z"
          fill="currentColor"
        />
        <path
          d="M12 13C12 12.4477 12.4477 12 13 12H16C16.5523 12 17 12.4477 17 13V16C17 16.5523 16.5523 17 16 17H13C12.4477 17 12 16.5523 12 16V13Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    path: '/tasks',
    label: 'Tasks',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M9 2C8.44772 2 8 2.44772 8 3C8 3.55228 8.44772 4 9 4H11C11.5523 4 12 3.55228 12 3C12 2.44772 11.5523 2 11 2H9Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 5C4 3.89543 4.89543 3 6 3C6 4.65685 7.34315 6 9 6H11C12.6569 6 14 4.65685 14 3C15.1046 3 16 3.89543 16 5V16C16 17.1046 15.1046 18 14 18H6C4.89543 18 4 17.1046 4 16V5ZM7 9C6.44772 9 6 9.44772 6 10C6 10.5523 6.44772 11 7 11H13C13.5523 11 14 10.5523 14 10C14 9.44772 13.5523 9 13 9H7ZM7 13C6.44772 13 6 13.4477 6 14C6 14.5523 6.44772 15 7 15H10C10.5523 15 11 14.5523 11 14C11 13.4477 10.5523 13 10 13H7Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M2 11C2 10.4477 2.44772 10 3 10H5C5.55228 10 6 10.4477 6 11V16C6 16.5523 5.55228 17 5 17H3C2.44772 17 2 16.5523 2 16V11Z"
          fill="currentColor"
        />
        <path
          d="M8 7C8 6.44772 8.44772 6 9 6H11C11.5523 6 12 6.44772 12 7V16C12 16.5523 11.5523 17 11 17H9C8.44772 17 8 16.5523 8 16V7Z"
          fill="currentColor"
        />
        <path
          d="M14 3C14 2.44772 14.4477 2 15 2H17C17.5523 2 18 2.44772 18 3V16C18 16.5523 17.5523 17 17 17H15C14.4477 17 14 16.5523 14 16V3Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9ZM3 18C3 14.134 6.13401 11 10 11C13.866 11 17 14.134 17 18H3Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
