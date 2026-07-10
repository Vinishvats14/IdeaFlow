import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Search, Calendar, User, Clock, ChevronRight, X } from 'lucide-react';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSidebarData() {
      try {
        const [cats, tgList] = await Promise.all([
          api.publicCategories.list(),
          api.publicTags.list()
        ]);
        setCategories(cats || []);
        setTags(tgList || []);
      } catch (err) {
        console.error('Failed to load sidebar metadata:', err);
      }
    }
    fetchSidebarData();
  }, []);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.publicArticles.list({
          category: selectedCategory,
          tag: selectedTag
        });
        setArticles(response || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch articles');
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [selectedCategory, selectedTag]);

  // Client-side filtering for search query
  const filteredArticles = articles.filter(article => {
    const titleMatch = article.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const excerptMatch = article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = article.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || excerptMatch || contentMatch;
  });

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSearchQuery('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unpublished';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="container">
      {/* Banner / Hero section */}
      <div style={{ padding: '60px 0 40px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '48px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
          Explore Ideas, Code, and Life.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 30px' }}>
          A beautiful Content Management space with neat writeups, insights, and updates.
        </p>

        {/* Big Search Bar */}
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <input 
            type="text"
            placeholder="Search articles by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '48px', borderRadius: '99px' }}
          />
          <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Home Layout */}
      <div className="home-layout">
        {/* Left Side: Article Grid */}
        <main>
          {(selectedCategory || selectedTag || searchQuery) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: 'var(--bg-secondary)', padding: '12px 20px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>
                Showing articles in: {' '}
                {selectedCategory && <span className="tag-badge" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>Category: {selectedCategory}</span>}
                {selectedTag && <span className="tag-badge" style={{ backgroundColor: 'var(--accent)', color: '#fff', marginLeft: '6px' }}>Tag: {selectedTag}</span>}
                {searchQuery && <span className="tag-badge" style={{ marginLeft: '6px' }}>Search: "{searchQuery}"</span>}
              </div>
              <button onClick={clearFilters} className="btn btn-secondary btn-sm flex items-center gap-1">
                <X size={14} /> Clear Filters
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div className="loading-spinner" style={{ border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
              <p>Fetching articles...</p>
            </div>
          ) : error ? (
            <div className="alert-error" style={{ textAlign: 'center', padding: '32px' }}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>Retry</button>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '16px' }}>No articles match your search or filters.</p>
              <button onClick={clearFilters} className="btn btn-primary btn-sm">Clear All Filters</button>
            </div>
          ) : (
            <div className="grid-3">
              {filteredArticles.map((article) => (
                <article key={article.id} className="article-card">
                  {article.coverImageUrl ? (
                    <img src={article.coverImageUrl} alt={article.title} className="article-cover" />
                  ) : (
                    <div className="article-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, hsl(var(--hue), 80%, 90%), hsl(var(--hue), 80%, 95%))', color: 'var(--primary)' }}>
                      <span style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'var(--font-title)' }}>CMS</span>
                    </div>
                  )}
                  <div className="article-card-content">
                    <div className="article-card-meta">
                      <span className="flex items-center gap-1"><Calendar size={13} /> {formatDate(article.publishedAt)}</span>
                      {article.readTimeMinutes && <span className="flex items-center gap-1"><Clock size={13} /> {article.readTimeMinutes} min read</span>}
                    </div>
                    <h3 className="article-card-title">
                      <Link to={`/article/${article.slug}`} style={{ color: 'inherit' }}>{article.title}</Link>
                    </h3>
                    <p className="article-card-excerpt">{article.excerpt || 'Read the full contents of this post.'}</p>
                    
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {article.categoryName && (
                        <span className="tag-badge" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                          {article.categoryName}
                        </span>
                      )}
                      {article.tags && article.tags.map(t => (
                        <span key={t} className="tag-badge">{t}</span>
                      ))}
                    </div>

                    <div className="article-card-footer">
                      <span className="article-card-author flex items-center gap-1"><User size={13} /> {article.authorName}</span>
                      <Link to={`/article/${article.slug}`} className="flex items-center gap-1 text-primary" style={{ fontWeight: 600, fontSize: '14px' }}>
                        Read <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        {/* Right Side: Sidebar Filtering Panel */}
        <aside>
          <div className="sidebar-panel">
            <h3 className="sidebar-title">Categories</h3>
            <div className="pill-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div 
                className={`pill-item ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => setSelectedCategory(null)}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span>All Categories</span>
              </div>
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  className={`pill-item ${selectedCategory === cat.name ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>

            <h3 className="sidebar-title" style={{ marginTop: '32px' }}>Popular Tags</h3>
            <div className="pill-list">
              <span 
                className={`pill-item ${selectedTag === null ? 'active' : ''}`}
                onClick={() => setSelectedTag(null)}
              >
                All Tags
              </span>
              {tags.map(tag => (
                <span 
                  key={tag.id} 
                  className={`pill-item ${selectedTag === tag.name ? 'active' : ''}`}
                  onClick={() => setSelectedTag(tag.name)}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Spinner keyframes styling directly injected */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
