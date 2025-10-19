import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
