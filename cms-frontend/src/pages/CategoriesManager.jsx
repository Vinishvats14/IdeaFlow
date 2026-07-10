import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function CategoriesManager() {
  const { hasRole } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.categories.list();
      setCategories(response || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      active: cat.active !== false,
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
      if (editingCategory) {
        await api.categories.update(editingCategory.id, formData);
        setSuccessMsg('Category updated successfully!');
      } else {
        await api.categories.create(formData);
        setSuccessMsg('Category created successfully!');
      }
      setIsModalOpen(false);
      fetchCategories();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All articles associated might become uncategorized.')) return;
    try {
      await api.categories.delete(id);
      setSuccessMsg('Category deleted successfully!');
      fetchCategories();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const canDelete = hasRole(['ADMIN', 'SUPER_ADMIN']);

  return (
    <div>
      <div className="dashboard-title-bar">
        <div>
          <h2 className="dashboard-view-title">Categories</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Organize articles into thematic sections</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {successMsg && <div className="alert-success">{successMsg}</div>}
      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>Loading categories list...</p>
        </div>
      ) : categories.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No categories configured yet. Create one to classify your articles!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{cat.slug}</td>
                  <td>{cat.description || <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No description</span>}</td>
                  <td>
                    <span className={`badge ${cat.active ? 'badge-published' : 'badge-archived'}`}>
                      {cat.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button onClick={() => openEditModal(cat)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      {canDelete && (
                        <button onClick={() => handleDelete(cat.id)} className="btn btn-secondary btn-sm" style={{ padding: '6px', color: 'var(--danger)' }} title="Delete">
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
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              onBlur={handleSlugGen}
              placeholder="e.g. Technology"
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
              placeholder="e.g. technology"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Write a brief overview of topics in this category..."
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Active (Visible in menus/filters)</span>
            </label>
          </div>

          <div className="modal-footer" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
              {formSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
