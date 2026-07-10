import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.users.list();
      setUsers(response || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ fullName: '', email: '', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      fullName: u.fullName || '',
      email: u.email || '',
      password: '', // Password is not editable in simple update
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);
    try {
      if (editingUser) {
        // Only submit fullName and email
        await api.users.update(editingUser.id, {
          fullName: formData.fullName,
          email: formData.email
        });
        setSuccessMsg('User updated successfully!');
      } else {
        if (!formData.password || formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        await api.users.create(formData);
        setSuccessMsg('User registered successfully! Default role assigned: VIEWER.');
      }
      setIsModalOpen(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save user');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is irreversible.')) return;
    try {
      await api.users.delete(id);
      setSuccessMsg('User deleted successfully!');
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  return (
    <div>
      <div className="dashboard-title-bar">
        <div>
          <h2 className="dashboard-view-title">User Accounts Control</h2>
          <p style={{ color: 'var(--text-secondary)' }}>View, add, and deactivate CMS system users</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {successMsg && <div className="alert-success">{successMsg}</div>}
      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>Loading user list...</p>
        </div>
      ) : users.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No user accounts found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.roles && u.roles.map(r => (
                      <span key={r} className="tag-badge" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                        {r}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span className={`badge ${u.enabled ? 'badge-published' : 'badge-archived'}`}>
                      {u.enabled ? 'Active' : 'Inactive'}
                    </span>
                    {u.accountLocked && (
                      <span className="badge badge-private" style={{ marginLeft: '6px' }}>Locked</span>
                    )}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button onClick={() => openEditModal(u)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="btn btn-secondary btn-sm" style={{ padding: '6px', color: 'var(--danger)' }} title="Delete">
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Profile' : 'Add User Account'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@example.com"
              required
            />
          </div>

          {!editingUser && (
            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Min. 8 characters"
                required
              />
            </div>
          )}

          <div className="modal-footer" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
              {formSubmitting ? 'Saving...' : 'Save Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
