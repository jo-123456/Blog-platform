import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">Inkwell</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/explore" className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`}>Explore</Link>
          {user && <Link to="/new-post" className="nav-link">Write</Link>}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu" ref={dropRef}>
              <button className="avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <img src={user.avatar} alt={user.username} className="avatar-img" />
                <span className="username-display">{user.username}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 6l4 4 4-4"/>
                </svg>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <img src={user.avatar} alt="" className="drop-avatar" />
                    <div>
                      <div className="drop-name">{user.username}</div>
                      <div className="drop-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to={`/author/${user.username}`} className="dropdown-item">
                    <span>👤</span> My Profile
                  </Link>
                  <Link to="/new-post" className="dropdown-item">
                    <span>✏️</span> New Post
                  </Link>
                  <Link to="/settings" className="dropdown-item">
                    <span>⚙️</span> Settings
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={() => { logout(); navigate('/'); }}>
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </div>
          )}

          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>
    </nav>
  );
}
