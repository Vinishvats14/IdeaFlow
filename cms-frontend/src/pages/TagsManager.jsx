import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function TagsManager() {
  const { hasRole } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.tags.list();
      setTags(response || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve tags.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openCreateModal = () => {
    setEditingTag(null);
    setFormData({ name: '', slug: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name || '',
      slug: tag.slug || '',
    });
    setIsModalOpen(true);
  };

  const handleSlugGen = () => {
    const slugified = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData(prev => ({ ...prev, slug: slugified }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);
    try {
      if (editingTag) {
        await api.tags.update(editingTag.id, formData);
        setSuccessMsg('Tag updated successfully!');
      } else {
        await api.tags.create(formData);
        setSuccessMsg('Tag created successfully!');
      }
      setIsModalOpen(false);
      fetchTags();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save tag');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tag? It will be removed from all articles.')) return;
    try {
      await api.tags.delete(id);
      setSuccessMsg('Tag deleted successfully!');
      fetchTags();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete tag');
    }
  };

  const canDelete = hasRole(['ADMIN', 'SUPER_ADMIN']);

  return (
    <div>
      <div className="dashboard-title-bar">
        <div>
          <h2 className="dashboard-view-title">Tags</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage keywords that connect similar articles</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Tag</span>
        </button>
      </div>

      {successMsg && <div className="alert-success">{successMsg}</div>}
      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>Loading tags list...</p>
        </div>
      ) : tags.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No tags found. Add some keywords to label your content!</p>
        </div>
      ) : (
        <div className="table-container" style={{ maxWidth: '600px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tag Name</th>
                <th>Slug</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td style={{ fontWeight: 600 }}>#{tag.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{tag.slug}</td>
                  <td>
                    <div className="actions-cell">
                      <button onClick={() => openEditModal(tag)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      {canDelete && (
                        <button onClick={() => handleDelete(tag.id)} className="btn btn-secondary btn-sm" style={{ padding: '6px', color: 'var(--danger)' }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTag ? 'Edit Tag' : 'Create Tag'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Tag Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              onBlur={handleSlugGen}
              placeholder="e.g. coding"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Slug</label>
            <input
              type="text"
              className="form-input"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="e.g. coding"
              required
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
              {formSubmitting ? 'Saving...' : 'Save Tag'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
