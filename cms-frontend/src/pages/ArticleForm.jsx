import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    slug: '',
    status: 'DRAFT',
    visibility: 'PUBLIC',
    featured: false,
    coverImageUrl: '',
    readTimeMinutes: 5,
    categoryId: '',
    tagIds: []
  });

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadFormMetadata() {
      try {
        const [cats, tgList] = await Promise.all([
          api.categories.list(),
          api.tags.list()
        ]);
        setCategories(cats || []);
        setTags(tgList || []);
      } catch (err) {
        console.error('Failed to load categories/tags:', err);
      }
    }
    loadFormMetadata();
  }, []);

  useEffect(() => {
    if (isEdit) {
      async function loadArticle() {
        setLoading(true);
        setError(null);
        try {
          const article = await api.articles.getById(id);
          // In Java, tags returned in responses might be String tags, but we need tag IDs for selection
          // Wait, let's map tags by name or keep the current ones
          // Let's resolve the tag IDs by matching the names in article.tags with the tags list
          setFormData({
            title: article.title || '',
            excerpt: article.excerpt || '',
            content: article.content || '',
            slug: article.slug || '',
            status: article.status || 'DRAFT',
            visibility: article.visibility || 'PUBLIC',
            featured: article.featured || false,
            coverImageUrl: article.coverImageUrl || '',
            readTimeMinutes: article.readTimeMinutes || 5,
            categoryId: article.categoryId || '',
            tagIds: [] // Set below after tags metadata is loaded
          });
        } catch (err) {
          setError(err.message || 'Failed to load article detail');
        } finally {
          setLoading(false);
        }
      }
      loadArticle();
    }
  }, [id, isEdit]);

  // Sync tagIds if editing and tags metadata is loaded
  useEffect(() => {
    if (isEdit && tags.length > 0 && formData.title) {
      async function resolveTagIds() {
        try {
          const article = await api.articles.getById(id);
          if (article.tags) {
            const articleTagNames = Array.from(article.tags);
            const matchedTagIds = tags
              .filter(t => articleTagNames.includes(t.name))
              .map(t => t.id);
            setFormData(prev => ({ ...prev, tagIds: matchedTagIds }));
          }
        } catch (err) {
          console.error(err);
        }
      }
      resolveTagIds();
    }
  }, [tags, isEdit, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagToggle = (tagId) => {
    setFormData((prev) => {
      const tagIds = prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((tid) => tid !== tagId)
        : [...prev.tagIds, tagId];
      return { ...prev, tagIds };
    });
  };

  // Auto-generate slug from title
  const generateSlug = () => {
    const slugified = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData(prev => ({ ...prev, slug: slugified }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Prepare payload
    const payload = {
      ...formData,
      categoryId: formData.categoryId ? Number(formData.categoryId) : null,
      tagIds: formData.tagIds.map(Number),
      readTimeMinutes: formData.readTimeMinutes ? Number(formData.readTimeMinutes) : null
    };

    try {
      if (isEdit) {
        await api.articles.update(id, payload);
      } else {
        await api.articles.create(payload);
      }
      navigate('/dashboard/articles');
    } catch (err) {
      setError(err.message || 'Failed to save article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Loading article edit panel...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-title-bar">
        <div>
          <h2 className="dashboard-view-title">{isEdit ? 'Edit Article' : 'Write New Article'}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isEdit ? 'Update existing content, metadata, and status' : 'Create and publish fresh new write-ups'}
          </p>
        </div>
        <Link to="/dashboard/articles" className="btn btn-secondary flex items-center gap-1">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        {/* Main Content Pane */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="form-group">
            <label className="form-label">Article Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={generateSlug}
              placeholder="Enter a compelling title..."
              className="form-input"
              style={{ fontSize: '18px', fontWeight: 600 }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL Slug</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="url-friendly-slug"
                className="form-input"
                required
              />
              <button type="button" onClick={generateSlug} className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                Auto Gen
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Excerpt / Summary</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Short description of the article..."
              className="form-textarea"
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Body Content (supports HTML/markdown paragraphs)</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your article body here. Support HTML tag formatting..."
              className="form-textarea"
              style={{ minHeight: '360px', fontFamily: 'monospace', fontSize: '15px' }}
              required
            />
          </div>
        </div>

        {/* Sidebar Configuration Pane */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Settings block */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              Publish Settings
            </h3>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Visibility</label>
              <select name="visibility" value={formData.visibility} onChange={handleChange} className="form-select">
                <option value="PUBLIC">PUBLIC</option>
                <option value="PRIVATE">PRIVATE</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Read Time (minutes)</label>
              <input
                type="number"
                name="readTimeMinutes"
                value={formData.readTimeMinutes}
                onChange={handleChange}
                min="1"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Featured Post</span>
              </label>
            </div>
          </div>

          {/* Categorization block */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              Categorization
            </h3>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                name="categoryId" 
                value={formData.categoryId} 
                onChange={handleChange} 
                className="form-select"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                {tags.length === 0 ? (
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No tags available.</span>
                ) : (
                  tags.map((t) => (
                    <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.tagIds.includes(t.id)}
                        onChange={() => handleTagToggle(t.id)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span>{t.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Media cover image block */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              Cover Image
            </h3>

            <div className="form-group">
              <label className="form-label">Cover Image URL</label>
              <input
                type="text"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="form-input"
              />
            </div>
            {formData.coverImageUrl && (
              <img 
                src={formData.coverImageUrl} 
                alt="Preview" 
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: '8px' }} 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>

          {/* Action Trigger */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}
            disabled={saving}
          >
            <Save size={18} />
            <span>{saving ? 'Saving changes...' : 'Save Article'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
