import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ user, onLogout, children }) {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/dashboard" className="brand">
            HeroVault
          </Link>

          <nav className="nav">
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              Dashboard
            </Link>
            <Link to="/superheroes" className={location.pathname.startsWith('/superheroes') ? 'active' : ''}>
              Roster
            </Link>
          </nav>

          <div className="topbar-actions">
            <span className="user-label">{user?.username}</span>
            <button type="button" onClick={onLogout} className="btn btn-ghost">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="page">{children}</main>
    </div>
  );
}

export default Layout;
