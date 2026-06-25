import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', bio: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art register-art">
        <div className="auth-art-inner">
          <div className="auth-quote display">
            "Start writing, no matter what. The water does not flow until the faucet is turned on."
          </div>
          <div className="auth-quote-attr">— Louis L'Amour</div>
        </div>
        <div className="art-orb orb-a" />
        <div className="art-orb orb-b" />
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <Link to="/" className="auth-logo">✦ Inkwell</Link>

          <h1 className="auth-title display">Start your story</h1>
          <p className="auth-sub">Create your account and begin writing today.</p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Username</label>
              <input
                type="text"
                placeholder="your_username"
                value={form.username}
                onChange={e => set('username', e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-field">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Short bio <span className="optional">(optional)</span></label>
              <textarea
                placeholder="Tell readers a bit about yourself…"
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                rows={2}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
