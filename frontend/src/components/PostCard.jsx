import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import './PostCard.css';

const CATEGORY_COLORS = {
  Technology: '#0891b2',
  Design: '#7c3aed',
  Productivity: '#059669',
  General: '#d97706',
  Culture: '#db2777',
  Science: '#2563eb',
};

export default function PostCard({ post, featured = false }) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const color = CATEGORY_COLORS[post.category] || '#d97706';

  return (
    <article className={`post-card ${featured ? 'featured' : ''}`}>
      {post.cover_image && (
        <Link to={`/post/${post.slug}`} className="card-image-wrap">
          <img
            src={post.cover_image}
            alt={post.title}
            className="card-image"
            loading="lazy"
          />
          <div className="card-image-overlay" />
          <span className="card-category" style={{ background: color }}>
            {post.category}
          </span>
        </Link>
      )}

      <div className="card-body">
        <div className="card-meta-top">
          {!post.cover_image && (
            <span className="card-category inline" style={{ color, borderColor: color }}>
              {post.category}
            </span>
          )}
          <span className="card-time">{timeAgo}</span>
        </div>

        <Link to={`/post/${post.slug}`} className="card-title-link">
          <h2 className="card-title">{post.title}</h2>
        </Link>

        <p className="card-excerpt">{post.excerpt}</p>

        <div className="card-footer">
          <Link to={`/author/${post.author_name}`} className="card-author">
            <img src={post.author_avatar} alt={post.author_name} className="author-avatar" />
            <span>{post.author_name}</span>
          </Link>

          <div className="card-stats">
            <span className="card-stat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {post.views || 0}
            </span>
            <span className="card-stat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {post.comment_count || 0}
            </span>
            <span className="card-stat read-time">{post.read_time || 1} min read</span>
          </div>
        </div>
      </div>
    </article>
  );
}