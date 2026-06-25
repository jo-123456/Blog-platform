import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!user) { navigate('/login'); return null; }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const r = await api.put('/auth/profile', form);
      updateUser(r.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes');
    } finally { setSaving(false); }
  };

  return (
    <div className="settings-page">
      <div className="container-sm" style={{ paddingTop: 'calc(var(--nav-height) + 40px)', paddingBottom: 80 }}>
        <h1 className="settings-title display">Account Settings</h1>

        <div className="settings-card">
          <div className="settings-section">
            <h2 className="settings-section-title">Profile</h2>

            <div className="avatar-preview-row">
              <img src={form.avatar || user.avatar} alt="" className="settings-avatar" />
              <div>
                <div className="settings-username">@{form.username}</div>
                <div className="settings-email">{user.email}</div>
              </div>
            </div>

            {success && <div className="settings-success">{success}</div>}
            {error && <div className="settings-error">{error}</div>}

            <form className="settings-form" onSubmit={handleSubmit}>
              <div className="settings-field">
                <label>Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => set('username', e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>Avatar URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.avatar}
                  onChange={e => set('avatar', e.target.value)}
                />
                <span className="field-hint">Use a direct link to an image.</span>
              </div>
              <div className="settings-field">
                <label>Bio</label>
                <textarea
                  rows={3}
                  placeholder="Tell readers about yourself…"
                  value={form.bio}
                  onChange={e => set('bio', e.target.value)}
                />
              </div>
              <button type="submit" className="settings-save" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </div>

          <div className="settings-divider" />

          <div className="settings-section">
            <h2 className="settings-section-title danger-title">Danger Zone</h2>
            <p className="danger-desc">Signing out will end your current session on this device.</p>
            <button className="settings-logout" onClick={() => { logout(); navigate('/'); }}>
              Sign out of account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
