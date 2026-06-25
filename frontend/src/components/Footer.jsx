import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">✦ Inkwell</Link>
          <p className="footer-tagline">Where ideas find their voice.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/new-post">Write</Link>
          <Link to="/register">Join</Link>
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} Inkwell. Built with care.</div>
      </div>
    </footer>
  );
}
