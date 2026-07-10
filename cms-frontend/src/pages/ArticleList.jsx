import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Globe, FileClock, Archive, Search } from 'lucide-react';

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Filtering states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.articles.list({
        status: filterStatus || null,
        visibility: filterVisibility || null
      });
      setArticles(response || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [filterStatus, filterVisibility]);

  const handlePublish = async (id) => {
    try {
      await api.articles.publish(id);
      setSuccessMsg('Article published successfully!');
      fetchArticles();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to publish article');
    }
  };

  const handleArchive = async (id) => {
    try {
      await api.articles.archive(id);
      setSuccessMsg('Article archived successfully!');
      fetchArticles();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to archive article');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.articles.delete(id);
      setSuccessMsg('Article deleted successfully!');
      fetchArticles();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete article');
    }
  };

  const filteredArticles = articles.filter(article => 
    article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="dashboard-title-bar">
        <div>
          <h2 className="dashboard-view-title">Articles</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your workspace articles and publications</p>
        </div>
        <Link to="/dashboard/articles/new" className="btn btn-primary">
          <Plus size={18} />
          <span>New Article</span>
        </Link>
      </div>

      {successMsg && <div className="alert-success">{successMsg}</div>}
      {error && <div className="alert-error">{error}</div>}

      {/* Filter and Search controls */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
        <div style={{ flexGrow: 1, minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <div style={{ width: '150px' }}>
          <select 
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>

        <div style={{ width: '150px' }}>
          <select 
            className="form-select"
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
          >
            <option value="">All Visibility</option>
            <option value="PUBLIC">PUBLIC</option>
            <option value="PRIVATE">PRIVATE</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>Loading articles list...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No articles found. Write your first post or adjust filters!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map(article => (
                <tr key={article.id}>
                  <td style={{ fontWeight: 600 }}>{article.title}</td>
                  <td>{article.authorName}</td>
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
                  <td>
                    <div className="actions-cell">
                      <Link to={`/dashboard/articles/edit/${article.id}`} className="btn btn-secondary btn-sm flex items-center" style={{ padding: '6px' }} title="Edit">
                        <Edit2 size={14} />
                      </Link>

                      {article.status !== 'PUBLISHED' && (
                        <button onClick={() => handlePublish(article.id)} className="btn btn-secondary btn-sm" style={{ padding: '6px', color: 'hsl(150, 75%, 40%)' }} title="Publish">
                          <Globe size={14} />
                        </button>
                      )}

                      {article.status === 'PUBLISHED' && (
                        <button onClick={() => handleArchive(article.id)} className="btn btn-secondary btn-sm" style={{ padding: '6px', color: 'var(--warning)' }} title="Archive">
                          <Archive size={14} />
                        </button>
                      )}

                      <button onClick={() => handleDelete(article.id)} className="btn btn-secondary btn-sm" style={{ padding: '6px', color: 'var(--danger)' }} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
