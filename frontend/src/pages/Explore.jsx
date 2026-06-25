import React, { useState, useEffect } from 'react';
import api from '../hooks/useApi';
import PostCard from '../components/PostCard';
import './Explore.css';

const CATEGORY_ICONS = {
  Technology: '💻', Design: '🎨', Productivity: '⚡', Culture: '🌍',
  Science: '🔬', Health: '🌿', Business: '📈', General: '✍️'
};

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/posts/meta/categories').then(r => setCategories(r.data));
    api.get('/posts', { params: { limit: 12, page: 1 } }).then(r => {
      setPosts(r.data.posts);
    }).finally(() => setLoading(false));
  }, []);

  const handleCategory = (cat) => {
    setSelected(cat);
    setLoading(true);
    api.get('/posts', { params: { category: cat, limit: 12 } })
      .then(r => setPosts(r.data.posts))
      .finally(() => setLoading(false));
  };

  return (
    <div className="explore-page">
      <div className="explore-header">
        <div className="container">
          <h1 className="explore-title display">Explore</h1>
          <p className="explore-sub">Browse stories by topic and discover new perspectives.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px' }}>
        {/* Category cards */}
        <div className="categories-grid">
          {categories.map(c => (
            <button
              key={c.category}
              className={`category-card ${selected === c.category ? 'selected' : ''}`}
              onClick={() => handleCategory(c.category)}
            >
              <span className="category-icon">{CATEGORY_ICONS[c.category] || '📝'}</span>
              <span className="category-name">{c.category}</span>
              <span className="category-cnt">{c.count} stories</span>
            </button>
          ))}
        </div>

        <div className="explore-section">
          <div className="section-header">
            <h2 className="section-heading display">
              {selected ? `${selected} Stories` : 'Latest Stories'}
            </h2>
            {selected && (
              <button className="clear-filter" onClick={() => {
                setSelected(null);
                setLoading(true);
                api.get('/posts', { params: { limit: 12 } }).then(r => setPosts(r.data.posts)).finally(() => setLoading(false));
              }}>
                Clear filter ✕
              </button>
            )}
          </div>

          {loading ? (
            <div className="explore-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="post-card-skeleton">
                  <div className="skeleton" style={{ height: 160, borderRadius: '12px 12px 0 0' }} />
                  <div style={{ padding: 20 }}>
                    <div className="skeleton" style={{ height: 16, width: '75%', marginBottom: 10 }} />
                    <div className="skeleton" style={{ height: 13, width: '55%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="explore-grid">
              {posts.map((post, i) => (
                <div key={post.id} className="fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
