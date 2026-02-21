'use client';

import React, { useState, useEffect } from 'react';
import './layout.css';

interface LayoutProps {
  children: React.ReactNode;
  user: { name: string; avatar: string } | null;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AppLayout({ children, user, onLogout, activeTab, onTabChange }: LayoutProps) {
  if (!user) return <>{children}</>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="logo" onClick={() => onTabChange('dashboard')}>
          BRD<em>agent</em>
        </div>
        <div className="topbar-center">
          <button
            className={`top-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onTabChange('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`top-tab ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => onTabChange('integrations')}
          >
            Integrations
          </button>
          <button
            className={`top-tab ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => onTabChange('generate')}
          >
            Generate BRD
          </button>
          <button
            className={`top-tab ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => onTabChange('editor')}
          >
            Editor
          </button>
        </div>
        <div className="topbar-right">
          <div className="user-chip">
            <div className="user-av">{user.avatar}</div>
            <span className="user-name">{user.name}</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
