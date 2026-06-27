import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../hooks/useApi';
import PostCard from '../components/PostCard';
import './Home.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    api.get('/posts/meta/categories').then(r => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 9 };
    if (selectedCat) params.category = selectedCat;
    if (search) params.search = search;
    api.get('/posts', { params }).then(r => {
      setPosts(Array.isArray(r.data.posts) ? r.data.posts : []);
      setTotalPages(r.data.pages || 1);
    }).catch(() => setPosts([])).finally(() => setLoading(false));
  }, [page, selectedCat, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCat = (cat) => {
    setSelectedCat(cat);
    setPage(1);
    setSearch('');
    setSearchInput('');
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge fade-in">✦ Where ideas find their voice</div>
          <h1 className="hero-title display fade-in stagger-1">
            Stories worth<br />
            <em>reading.</em>
          </h1>
          <p className="hero-sub fade-in stagger-2">
            Discover thoughtful writing on design, technology, culture, and the ideas shaping our world.
          </p>
          <form className="hero-search fade-in stagger-3" onSubmit={handleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search stories…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      <div className="container main-layout">
        {/* Category filter */}
        <div className="cat-bar">
          <button className={`cat-btn ${!selectedCat ? 'active' : ''}`} onClick={() => handleCat('')}>
            All Stories
          </button>
          {categories.map(c => (
            <button
              key={c.category}
              className={`cat-btn ${selectedCat === c.category ? 'active' : ''}`}
              onClick={() => handleCat(c.category)}
            >
              {c.category}
              <span className="cat-count">{c.count}</span>
            </button>
          ))}
        </div>

        {search && (
          <div className="search-notice">
            Showing results for <strong>"{search}"</strong>
            <button onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>✕ Clear</button>
          </div>
        )}

        {loading ? (
          <div className="posts-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="post-card-skeleton">
                <div className="skeleton" style={{ height: 180, borderRadius: '12px 12px 0 0' }} />
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 6 }} />
                  <div className="skeleton" style={{ height: 20, width: '85%', borderRadius: 6 }} />
                  <div className="skeleton" style={{ height: 14, width: '70%', borderRadius: 6 }} />
                  <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No stories found</h3>
            <p>Try a different search or check back later for new content.</p>
            <Link to="/new-post" className="btn-write">Write the first story</Link>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post, i) => (
              <div key={post.id} className="fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <PostCard post={post} featured={false} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="page-btn">
              ← Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-num ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
            </div>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="page-btn">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}