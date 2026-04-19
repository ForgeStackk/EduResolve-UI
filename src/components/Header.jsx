import React from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container flex-between">
        <div className="logo">
          <h1 style={{ color: 'var(--primary-blue)', marginBottom: 0 }}>
            EduResolve
          </h1>
          <p style={{ fontSize: '0.75rem', marginTop: '0.125rem' }}>Academic Support Platform</p>
        </div>

        <div className="header-actions">
          <button className="notification-btn" title="Notifications">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>

          <div className="user-profile">
            <span className="avatar">{user?.avatar || '👤'}</span>
            <div className="user-info">
              <p className="user-name">{user?.name || 'User'}</p>
              <p className="user-email">{user?.email || ''}</p>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-small"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
