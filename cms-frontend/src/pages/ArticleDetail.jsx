import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.publicArticles.getBySlug(slug);
        setArticle(response);
      } catch (err) {
        setError(err.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unpublished';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <p>Loading article content...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container" style={{ padding: '80px 24px', maxWidth: '600px', textAlign: 'center' }}>
        <div className="alert-error" style={{ marginBottom: '24px' }}>
          <p>{error || 'Article not found'}</p>
        </div>
        <Link to="/" className="btn btn-secondary flex items-center gap-1" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <article className="reader-container">
      {/* Back button */}
      <div style={{ marginBottom: '32px' }}>
        <Link to="/" className="flex items-center gap-1 text-secondary" style={{ display: 'inline-flex', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to articles
        </Link>
      </div>

      {/* Header */}
      <header className="reader-header">
        {article.categoryName && (
          <span 
            className="tag-badge" 
            style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', borderColor: 'var(--primary)', marginBottom: '16px', display: 'inline-block' }}
          >
            {article.categoryName}
          </span>
        )}
        <h1 className="reader-title">{article.title}</h1>
        
        <div className="reader-meta">
          <span className="flex items-center gap-1">
            <User size={16} /> By {article.authorName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={16} /> {formatDate(article.publishedAt || article.createdAt)}
          </span>
          {article.readTimeMinutes && (
            <span className="flex items-center gap-1">
              <Clock size={16} /> {article.readTimeMinutes} min read
            </span>
          )}
        </div>
      </header>

      {/* Cover Image */}
      {article.coverImageUrl ? (
        <img src={article.coverImageUrl} alt={article.title} className="reader-cover" />
      ) : (
        <div className="reader-cover" style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, hsl(var(--hue), 80%, 90%), hsl(var(--hue), 80%, 95%))', color: 'var(--primary)', marginBottom: '36px' }}>
          <span style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'var(--font-title)' }}>CMS</span>
        </div>
      )}

      {/* Content Rendering */}
      <div 
        className="reader-content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Tags section at the bottom */}
      {article.tags && article.tags.size > 0 && (
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontFamily: 'var(--font-title)', marginBottom: '12px', fontSize: '16px', color: 'var(--text-secondary)' }}>Tags</h4>
          <div className="pill-list">
            {Array.from(article.tags).map(tag => (
              <span key={tag} className="pill-item" style={{ cursor: 'default' }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
