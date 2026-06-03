import React, { useState } from 'react';
import { X, Link2, Tag, Clock, Sparkles } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CreateUrlModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    originalUrl: '',
    customAlias: '',
    title: '',
    description: '',
    expiresAt: '',
    tags: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.originalUrl) { e.originalUrl = 'URL is required'; return e; }
    try {
      const u = new URL(form.originalUrl);
      if (!['http:', 'https:'].includes(u.protocol)) e.originalUrl = 'URL must start with http:// or https://';
    } catch { e.originalUrl = 'Please enter a valid URL'; }
    if (form.customAlias && !/^[a-zA-Z0-9_-]{3,20}$/.test(form.customAlias)) {
      e.customAlias = '3-20 chars: letters, numbers, hyphens, underscores only';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setErrors({});
    try {
      const payload = {
        originalUrl: form.originalUrl,
        ...(form.customAlias && { customAlias: form.customAlias }),
        ...(form.title && { title: form.title }),
        ...(form.description && { description: form.description }),
        ...(form.expiresAt && { expiresAt: new Date(form.expiresAt).toISOString() }),
        ...(form.tags && { tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }),
      };
      const res = await api.post('/urls', payload);
      toast.success('Short URL created!');
      onCreated(res.data.url);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to create URL';
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: (e) => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Create Short URL</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>Paste your long URL and we'll shorten it instantly</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {errors.general && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--danger)' }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label className="input-label">DESTINATION URL *</label>
            <div style={{ position: 'relative' }}>
              <Link2 size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className={`input ${errors.originalUrl ? 'error' : ''}`} style={{ paddingLeft: 38 }} placeholder="https://your-very-long-url.com/goes/here" {...f('originalUrl')} />
            </div>
            {errors.originalUrl && <span className="input-error">{errors.originalUrl}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">CUSTOM ALIAS (optional)</label>
            <div style={{ display: 'flex' }}>
              <span className="input-prefix">{process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/</span>
              <input className={`input input-with-prefix ${errors.customAlias ? 'error' : ''}`} placeholder="my-custom-link" {...f('customAlias')} />
            </div>
            {errors.customAlias && <span className="input-error">{errors.customAlias}</span>}
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Leave blank for a random short code</span>
          </div>

          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', padding: '6px 0', color: 'var(--accent-bright)' }}>
            <Sparkles size={13} /> {showAdvanced ? 'Hide' : 'Show'} advanced options
          </button>

          {showAdvanced && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div className="input-group">
                <label className="input-label">TITLE</label>
                <input className="input" placeholder="e.g. Blog post about React" {...f('title')} />
              </div>
              <div className="input-group">
                <label className="input-label"><Tag size={11} style={{ display: 'inline', marginRight: 4 }} />TAGS (comma-separated)</label>
                <input className="input" placeholder="marketing, social, campaign" {...f('tags')} />
              </div>
              <div className="input-group">
                <label className="input-label"><Clock size={11} style={{ display: 'inline', marginRight: 4 }} />EXPIRY DATE</label>
                <input className="input" type="datetime-local" {...f('expiresAt')} style={{ colorScheme: 'dark' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
              {loading ? <div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '✦ Create Short URL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}