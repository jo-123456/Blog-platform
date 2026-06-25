import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../hooks/useApi';
import PostCard from '../components/PostCard';
import './AuthorProfile.css';

export default function AuthorProfile() {
  const { username } = useParams();
  const [posts, setPosts] = useState([]);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/posts', { params: { author: username, limit: 20 } }).then(r => {
      setPosts(r.data.posts);
      if (r.data.posts.length > 0) {
        const p = r.data.posts[0];
        setAuthor({ name: p.author_name, avatar: p.author_avatar });
      }
    }).finally(() => setLoading(false));
  }, [username]);

  const totalViews = posts.reduce((a, p) => a + (p.views || 0), 0);
  const totalComments = posts.reduce((a, p) => a + (p.comment_count || 0), 0);

  return (
    <div className="author-profile">
      <div className="profile-hero">
        <div className="container">
          {loading ? (
            <div className="profile-hero-inner loading">
              <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
              <div>
                <div className="skeleton" style={{ width: 200, height: 24, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 300, height: 14 }} />
              </div>
            </div>
          ) : author ? (
            <div className="profile-hero-inner fade-in">
              <img src={author.avatar} alt={username} className="profile-avatar" />
              <div className="profile-info">
                <h1 className="profile-name display">{username}</h1>
                <div className="profile-stats">
                  <div className="profile-stat">
                    <span className="stat-num">{posts.length}</span>
                    <span className="stat-label">Posts</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-num">{totalViews.toLocaleString()}</span>
                    <span className="stat-label">Views</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-num">{totalComments}</span>
                    <span className="stat-label">Comments</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-hero-inner">
              <div className="profile-unknown">@{username}</div>
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <h2 className="section-title display">Stories by {username}</h2>

        {loading ? (
          <div className="profile-grid">
            {[1,2,3].map(i => (
              <div key={i} className="post-card-skeleton">
                <div className="skeleton" style={{ height: 160, borderRadius: '12px 12px 0 0' }} />
                <div style={{ padding: 20 }}>
                  <div className="skeleton" style={{ height: 16, width: '75%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 13, width: '55%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🖊️</div>
            <h3>No posts yet</h3>
            <p>This author hasn't published anything yet.</p>
          </div>
        ) : (
          <div className="profile-grid">
            {posts.map((post, i) => (
              <div key={post.id} className="fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
