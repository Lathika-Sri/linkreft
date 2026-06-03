import React from 'react';
import { Link } from 'react-router-dom';
import { Link2, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, flexDirection: 'column', textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🔗</div>
      <div className="badge badge-red" style={{ marginBottom: 20 }}>404 Not Found</div>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Link not found</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 380 }}>
        This short link doesn't exist or may have been deleted.
      </p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={16} /> Back to Home
      </Link>
    </div>
  );
}