import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Trash2, Copy, Check, FileText } from 'lucide-react';

export default function MediaManager() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fileName: '',
    url: '',
    contentType: 'image/jpeg',
    fileSize: 102400, // mock default size: 100kb
    altText: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.media.list();
      setMediaList(response || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve media library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const openCreateModal = () => {
    setFormData({
      fileName: '',
      url: '',
      contentType: 'image/jpeg',
      fileSize: 102400,
      altText: ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);
    try {
      await api.media.create(formData);
      setSuccessMsg('Media item registered successfully!');
      setIsModalOpen(false);
      fetchMedia();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to register media item');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media item? It might break references in articles.')) return;
    try {
      await api.media.delete(id);
      setSuccessMsg('Media asset deleted!');
      fetchMedia();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete media item');
    }
  };

  const handleCopyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isImageUrl = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) != null || url.includes('unsplash.com') || url.includes('images.unsplash.com');
  };

  return (
    <div>
      <div className="dashboard-title-bar">
        <div>
          <h2 className="dashboard-view-title">Media Library</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Upload and link asset URLs to embed in your articles</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Media URL</span>
        </button>
      </div>

      {successMsg && <div className="alert-success">{successMsg}</div>}
      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>Loading media assets...</p>
        </div>
      ) : mediaList.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No media registered. Add images or file links to copy and use in articles!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {mediaList.map((media) => {
            const isImg = isImageUrl(media.url);
            return (
              <div key={media.id} className="article-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '160px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isImg ? (
                    <img 
                      src={media.url} 
                      alt={media.altText || media.fileName} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition)' }} 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541462608141-2f58c6e6b40d?q=80&w=300&auto=format&fit=crop'; }}
                    />
                  ) : (
                    <FileText size={48} style={{ color: 'var(--text-muted)' }} />
                  )}
                  
                  {/* Hover overlays */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => handleCopyLink(media.url, media.id)} 
                      className="btn btn-secondary btn-sm" 
                      style={{ padding: '6px', borderRadius: '50%', backgroundColor: 'var(--bg-card)' }}
                      title="Copy URL"
                    >
                      {copiedId === media.id ? <Check size={14} style={{ color: 'var(--accent)' }} /> : <Copy size={14} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(media.id)} 
                      className="btn btn-danger btn-sm" 
                      style={{ padding: '6px', borderRadius: '50%' }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, wordBreak: 'break-all', marginBottom: '4px' }}>{media.fileName}</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Type: {media.contentType || 'unknown'} • {(media.fileSize / 1024).toFixed(1)} KB
                  </span>
                  {media.altText && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: 'auto' }}>
                      <strong>Alt:</strong> {media.altText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register Media Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Media Reference"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Asset Name / Description</label>
            <input
              type="text"
              className="form-input"
              value={formData.fileName}
              onChange={(e) => setFormData(prev => ({ ...prev, fileName: e.target.value }))}
              placeholder="e.g. blog-cover-image"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">File / Image URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="e.g. https://images.unsplash.com/photo-..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alt Text</label>
            <input
              type="text"
              className="form-input"
              value={formData.altText}
              onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
              placeholder="e.g. Coding laptop on a desk"
            />
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Content Type</label>
              <select 
                className="form-select"
                value={formData.contentType}
                onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value }))}
              >
                <option value="image/jpeg">image/jpeg</option>
                <option value="image/png">image/png</option>
                <option value="image/webp">image/webp</option>
                <option value="application/pdf">application/pdf</option>
              </select>
            </div>
            <div>
              <label className="form-label">File Size (Bytes)</label>
              <input
                type="number"
                className="form-input"
                value={formData.fileSize}
                onChange={(e) => setFormData(prev => ({ ...prev, fileSize: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
              {formSubmitting ? 'Registering...' : 'Register Asset'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
