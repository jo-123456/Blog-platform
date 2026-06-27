import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import './PostDetail.css';

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/posts/${slug}`).then(r => {
      setPost(r.data);
      setLiked(r.data.liked || false);
      setLikeCount(r.data.likes || 0);
    }).catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const handleLike = async () => {
    if (!user) return navigate('/login');
    try {
      const r = await api.post(`/posts/${post.id}/like`);
      setLiked(r.data.liked);
      setLikeCount(c => r.data.liked ? c + 1 : c - 1);
    } catch {}
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${post.id}`);
      navigate('/');
    } catch { setDeleting(false); }
  };

  if (loading) return (
    <div className="post-detail-loading">
      <div className="container-sm">
        <div className="skeleton" style={{ height: 40, width: '80%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 20, width: '50%', marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 400, marginBottom: 24 }} />
        {[80, 70, 90, 60].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: 16, width: `${w}%`, marginBottom: 12 }} />
        ))}
      </div>
    </div>
  );

  if (!post) return null;

  const isAuthor = user && (user.id === post.author_id || user.role === 'admin');

  return (
    <div className="post-detail">
      <div className="container-md">
        {/* Breadcrumb */}
        <div className="breadcrumb fade-in">
          <Link to="/">Home</Link>
          <span>›</span>
          <span>{post.category}</span>
        </div>

        {/* Header */}
        <header className="post-header fade-in stagger-1">
          <div className="post-category-badge" data-cat={post.category}>{post.category}</div>
          <h1 className="post-main-title display">{post.title}</h1>
          <p className="post-lead">{post.excerpt}</p>

          <div className="post-byline">
            <Link to={`/author/${post.author_name}`} className="byline-author">
              <img src={post.author_avatar} alt={post.author_name} className="byline-avatar" />
              <div>
                <div className="byline-name">{post.author_name}</div>
                <div className="byline-date">
                  {format(new Date(post.created_at), 'MMMM d, yyyy')} · {post.read_time} min read
                </div>
              </div>
            </Link>

            <div className="post-actions-bar">
              <span className="stat-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {post.views}
              </span>
              <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {likeCount}
              </button>
              {isAuthor && (
                <div className="author-actions">
                  <Link to={`/edit-post/${post.id}`} className="edit-btn">Edit</Link>
                  <button className="delete-btn" onClick={handleDelete} disabled={deleting}>
                    {deleting ? '...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Cover image */}
        {post.cover_image && (
          <div className="post-cover fade-in stagger-2">
            <img src={post.cover_image.startsWith("data:") ? post.cover_image : `https://blog-platform-nbwn.onrender.com/api/proxy-image?url=${encodeURIComponent(post.cover_image)}`} alt={post.title} />
          </div>
        )}

        {/* Content */}
        <div
          className="post-content fade-in stagger-3"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && JSON.parse(post.tags || '[]').length > 0 && (
          <div className="post-tags">
            {JSON.parse(post.tags).map(t => (
              <span key={t} className="post-tag">#{t}</span>
            ))}
          </div>
        )}

        <div className="post-divider">
          <span>✦</span>
        </div>

        {/* Author card */}
        <div className="author-card fade-in">
          <img src={post.author_avatar} alt={post.author_name} className="author-card-avatar" />
          <div className="author-card-info">
            <div className="author-card-label">Written by</div>
            <Link to={`/author/${post.author_name}`} className="author-card-name display">
              {post.author_name}
            </Link>
            {post.author_bio && <p className="author-card-bio">{post.author_bio}</p>}
          </div>
        </div>

        {/* Comments */}
        <CommentSection slug={slug} postId={post.id} />
      </div>
    </div>
  );
}