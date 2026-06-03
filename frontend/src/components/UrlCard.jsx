import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Trash2, BarChart3, QrCode, ExternalLink, Check, Edit3, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import QRModal from './QRModal';

export default function UrlCard({ url, onDelete, onUpdate }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const shortUrl = url.shortUrl || `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/${url.shortCode}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Copy failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this link? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/urls/${url._id}`);
      toast.success('Link deleted');
      onDelete(url._id);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const toggleActive = async () => {
    try {
      const res = await api.put(`/urls/${url._id}`, { isActive: !url.isActive });
      onUpdate(res.data.url);
      toast.success(url.isActive ? 'Link deactivated' : 'Link activated');
    } catch { toast.error('Failed to update'); }
  };

  const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);

  return (
    <>
      <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 14, opacity: (!url.isActive || isExpired) ? 0.65 : 1, transition: 'all 0.2s' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span className="mono" style={{ color: 'var(--accent-bright)', fontWeight: 600, fontSize: 14 }}>{shortUrl}</span>
              {isExpired && <span className="badge badge-red">Expired</span>}
              {!url.isActive && !isExpired && <span className="badge badge-gray">Inactive</span>}
              {url.customAlias && <span className="badge badge-cyan">Custom</span>}
            </div>
            {url.title && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{url.title}</div>}
            <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="truncate" style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, maxWidth: '100%', textDecoration: 'none' }}>
              <span className="truncate">{url.originalUrl}</span>
              <ExternalLink size={10} style={{ flexShrink: 0 }} />
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-bright)', lineHeight: 1 }}>{url.clicks.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>CLICKS</div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {url.tags && url.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {url.tags.map(tag => (
              <span key={tag} className="badge badge-gray" style={{ fontSize: 10 }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {formatDistanceToNow(new Date(url.createdAt), { addSuffix: true })}
            {url.expiresAt && !isExpired && <span> · Expires {formatDistanceToNow(new Date(url.expiresAt), { addSuffix: true })}</span>}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-ghost btn-icon btn-sm" title="Copy link" onClick={copy}>
              {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
            </button>
            <button className="btn btn-ghost btn-icon btn-sm" title="QR Code" onClick={() => setShowQR(true)}>
              <QrCode size={14} />
            </button>
            <button className="btn btn-ghost btn-icon btn-sm" title={url.isActive ? 'Deactivate' : 'Activate'} onClick={toggleActive}>
              {url.isActive ? <ToggleRight size={14} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={14} />}
            </button>
            <Link to={`/analytics/${url._id}`} className="btn btn-ghost btn-icon btn-sm" title="Analytics">
              <BarChart3 size={14} />
            </Link>
            <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={handleDelete} disabled={deleting}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {showQR && <QRModal url={shortUrl} shortCode={url.shortCode} onClose={() => setShowQR(false)} />}
    </>
  );
}