import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import './PostEditor.css';

const CATEGORIES = ['General', 'Technology', 'Design', 'Productivity', 'Culture', 'Science', 'Health', 'Business'];

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
  'https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800&q=80',
];

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '', content: '', excerpt: '',
    cover_image: '', category: 'General', tags: '', status: 'published'
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (isEdit) {
      api.get(`/posts?limit=100`).then(r => {
        const post = r.data.posts.find(p => p.id === id);
        if (post) {
          setForm({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt || '',
            cover_image: post.cover_image || '',
            category: post.category || 'General',
            tags: Array.isArray(post.tags) ? post.tags.join(', ') : (JSON.parse(post.tags || '[]')).join(', '),
            status: post.status || 'published'
          });
        }
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e, status = form.status) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        status,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      if (isEdit) {
        await api.put(`/posts/${id}`, payload);
      } else {
        const r = await api.post('/posts', payload);
        navigate(`/post/${r.data.slug}`);
        return;
      }
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="editor-loading"><div className="skeleton" style={{ height: '80vh', borderRadius: 16 }} /></div>;

  return (
    <div className="post-editor">
      <div className="editor-container">
        <div className="editor-topbar">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="editor-title-bar">
            <h1 className="editor-heading">{isEdit ? 'Edit Post' : 'New Story'}</h1>
          </div>
          <div className="editor-top-actions">
            <button className={`preview-toggle ${preview ? 'active' : ''}`} onClick={() => setPreview(!preview)}>
              {preview ? '← Edit' : 'Preview'}
            </button>
            <button className="btn-draft" onClick={e => handleSubmit(e, 'draft')} disabled={saving}>
              Save Draft
            </button>
            <button className="btn-publish" onClick={e => handleSubmit(e, 'published')} disabled={saving}>
              {saving ? 'Publishing…' : isEdit ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>

        {error && <div className="editor-error">{error}</div>}

        <div className={`editor-layout ${preview ? 'preview-mode' : ''}`}>
          {/* Edit panel */}
          {!preview && (
            <div className="editor-panel">
              {/* Cover */}
              <div className="field-group">
                <label className="field-label">Cover Image</label>
                {form.cover_image && (
                  <div className="cover-preview">
                    <img src={form.cover_image} alt="" />
                    <button className="cover-remove" onClick={() => set('cover_image', '')}>✕</button>
                  </div>
                )}
                <div className="cover-url-row">
                  <input
                    type="url"
                    placeholder="Paste image URL…"
                    value={form.cover_image}
                    onChange={e => set('cover_image', e.target.value)}
                    className="field-input"
                  />
                  <button className="btn-pick-cover" onClick={() => setShowCoverPicker(!showCoverPicker)}>
                    Pick sample
                  </button>
                </div>
                {showCoverPicker && (
                  <div className="cover-picker">
                    {COVER_IMAGES.map(img => (
                      <button key={img} className="cover-option" onClick={() => { set('cover_image', img); setShowCoverPicker(false); }}>
                        <img src={img} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="field-group">
                <textarea
                  className="title-input"
                  placeholder="Your story title…"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Excerpt */}
              <div className="field-group">
                <label className="field-label">Excerpt (optional)</label>
                <textarea
                  className="field-input"
                  placeholder="A short summary of your post…"
                  value={form.excerpt}
                  onChange={e => set('excerpt', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Content */}
              <div className="field-group">
                <label className="field-label">Content (HTML supported)</label>
                <div className="toolbar">
                  {[
                    ['B', '<strong>Bold</strong>'],
                    ['I', '<em>Italic</em>'],
                    ['H2', '<h2>Heading</h2>'],
                    ['H3', '<h3>Subheading</h3>'],
                    ['P', '<p>Paragraph</p>'],
                    ['»', '<blockquote>Quote</blockquote>'],
                    ['•', '<ul>\n  <li>Item</li>\n</ul>'],
                  ].map(([label, insert]) => (
                    <button key={label} className="toolbar-btn" type="button"
                      onClick={() => set('content', form.content + '\n' + insert)}>
                      {label}
                    </button>
                  ))}
                </div>
                <textarea
                  className="content-textarea"
                  placeholder="Write your story… HTML tags are supported for formatting."
                  value={form.content}
                  onChange={e => set('content', e.target.value)}
                  rows={20}
                />
              </div>

              {/* Meta row */}
              <div className="meta-row">
                <div className="field-group">
                  <label className="field-label">Category</label>
                  <select className="field-input field-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="design, ux, technology"
                    value={form.tags}
                    onChange={e => set('tags', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preview panel */}
          {preview && (
            <div className="preview-panel">
              {form.cover_image && (
                <img src={form.cover_image} alt="" className="preview-cover" />
              )}
              <h1 className="preview-title display">{form.title || 'Untitled'}</h1>
              <div className="post-content" dangerouslySetInnerHTML={{ __html: form.content || '<p>Nothing to preview yet…</p>' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
