import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, FolderOpen, Tag, Image, Calendar, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    articles: 0,
    categories: 0,
    tags: 0,
    media: 0,
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardStats() {
      setLoading(true);
      setError(null);
      try {
        const [articleList, catList, tagList, mediaList] = await Promise.all([
          api.articles.list().catch(() => []),
          api.categories.list().catch(() => []),
          api.tags.list().catch(() => []),
          api.media.list().catch(() => []),
        ]);

        setStats({
          articles: articleList?.length || 0,
          categories: catList?.length || 0,
          tags: tagList?.length || 0,
          media: mediaList?.length || 0,
        });

        // Get top 5 recent articles
        const sorted = [...(articleList || [])]
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          .slice(0, 5);
        setRecentArticles(sorted);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardStats();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div>
        <h2 className="dashboard-view-title" style={{ marginBottom: '24px' }}>Overview Dashboard</h2>
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>Analyzing CMS statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header bar */}
      <div className="dashboard-title-bar">
        <div>
          <h2 className="dashboard-view-title">Welcome back, {user?.email.split('@')[0]}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Role: <span className="tag-badge" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', borderColor: 'var(--primary)' }}>{user?.roles[0]}</span>
          </p>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon-wrapper">
            <FileText size={28} />
          </div>
          <div>
            <div className="stat-value">{stats.articles}</div>
            <div className="stat-label">Total Articles</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon-wrapper">
            <FolderOpen size={28} />
          </div>
          <div>
            <div className="stat-value">{stats.categories}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon-wrapper">
            <Tag size={28} />
          </div>
          <div>
            <div className="stat-value">{stats.tags}</div>
            <div className="stat-label">Active Tags</div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon-wrapper">
            <Image size={28} />
          </div>
          <div>
            <div className="stat-value">{stats.media}</div>
            <div className="stat-label">Media Assets</div>
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
          Recently Modified Articles
        </h3>

        {recentArticles.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No articles found. Start by writing your first article!</p>
            <Link to="/dashboard/articles/new" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
              Create Article
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Visibility</th>
                  <th>Last Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentArticles.map(article => (
                  <tr key={article.id}>
                    <td style={{ fontWeight: 600 }}>{article.title}</td>
                    <td>{article.categoryName || 'Uncategorized'}</td>
                    <td>
                      <span className={`badge badge-${article.status.toLowerCase()}`}>
                        {article.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${article.visibility.toLowerCase()}`}>
                        {article.visibility}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={13} /> {formatDate(article.updatedAt || article.createdAt)}
                      </span>
                    </td>
                    <td>
                      <Link to={`/dashboard/articles`} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
