import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ email: 'demo@blog.com', password: 'demo1234' });

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-art-inner">
          <div className="auth-quote display">
            "The scariest moment is always just before you start."
          </div>
          <div className="auth-quote-attr">— Stephen King</div>
        </div>
        <div className="art-orb orb-a" />
        <div className="art-orb orb-b" />
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <Link to="/" className="auth-logo">✦ Inkwell</Link>

          <h1 className="auth-title display">Welcome back</h1>
          <p className="auth-sub">Sign in to your account to continue writing.</p>

          <button className="demo-btn" onClick={fillDemo} type="button">
            ⚡ Fill demo credentials
          </button>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
