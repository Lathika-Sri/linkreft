import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ExternalLink, Clock, MousePointerClick, Globe, Smartphone, Monitor, Chrome, QrCode } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { formatDistanceToNow, format } from 'date-fns';
import api from '../utils/api';
import toast from 'react-hot-toast';
import QRModal from '../components/QRModal';
import ThemeToggle from '../components/ThemeToggle';
const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 8, padding: '8px 14px', fontSize: 12 }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
      <p style={{ color: 'var(--accent-bright)', fontWeight: 700 }}>{payload[0].value} clicks</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    api.get(`/analytics/url/${id}`)
      .then(res => setData(res.data))
      .catch(() => { toast.error('Failed to load analytics'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.url.shortUrl);
      setCopied(true); toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Copy failed'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div className="loader" />
    </div>
  );

  if (!data) return null;

  const { url, analytics } = data;
  const shortUrl = url.shortUrl;

  // Format daily data for chart
  const chartData = analytics.dailyData.map(d => ({
    date: format(new Date(d.date), 'MMM d'),
    clicks: d.count,
  }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '0' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 40 }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mono" style={{ fontSize: 14, color: 'var(--accent-bright)', fontWeight: 600 }}>{shortUrl}</div>
          <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="truncate" style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', maxWidth: 400 }}>{url.originalUrl}</a>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
        <ThemeToggle />
          <button className="btn btn-secondary btn-sm" onClick={() => setShowQR(true)}><QrCode size={14} /> QR Code</button>
          <button className="btn btn-secondary btn-sm" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />} Copy</button>
          <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm"><ExternalLink size={14} /> Visit</a>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px' }}>
        {/* Title */}
        {url.title && <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{url.title}</h1>}

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { icon: <MousePointerClick size={20} />, label: 'TOTAL CLICKS', value: analytics.totalClicks.toLocaleString(), color: 'var(--accent-bright)' },
            { icon: <Clock size={20} />, label: 'LAST VISITED', value: analytics.lastVisited ? formatDistanceToNow(new Date(analytics.lastVisited), { addSuffix: true }) : 'Never', color: 'var(--accent-2)' },
            { icon: <Globe size={20} />, label: 'COUNTRIES', value: analytics.countries.length, color: 'var(--success)' },
            { icon: <Smartphone size={20} />, label: 'DEVICES', value: analytics.devices.length, color: 'var(--warning)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ color: s.color }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color, fontSize: 24 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Click trend chart */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Daily Clicks — Last 30 Days
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="clicks" stroke="var(--accent)" strokeWidth={2} fill="url(#clickGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
          {[
            { title: 'By Device', icon: <Monitor size={14} />, data: analytics.devices },
            { title: 'By Browser', icon: <Chrome size={14} />, data: analytics.browsers },
            { title: 'By Country', icon: <Globe size={14} />, data: analytics.countries },
          ].map(({ title, icon, data: bData }) => (
            <div key={title} className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {icon}{title}
              </h3>
              {bData.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No data yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {bData.slice(0, 6).map((item, i) => {
                    const pct = analytics.totalClicks > 0 ? Math.round((item.count / analytics.totalClicks) * 100) : 0;
                    return (
                      <div key={item.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{item.name}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.count} <span style={{ color: 'var(--text-muted)' }}>({pct}%)</span></span>
                        </div>
                        <div style={{ height: 5, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: COLORS[i % COLORS.length], borderRadius: 4, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recent visits */}
        <div className="card">
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recent Visit History
          </h3>
          {analytics.recentVisits.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>No visits recorded yet</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Country</th>
                    <th>City</th>
                    <th>Device</th>
                    <th>Browser</th>
                    <th>Referrer</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentVisits.map((v, i) => (
                    <tr key={i}>
                      <td className="mono" style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {format(new Date(v.timestamp), 'MMM d, HH:mm:ss')}
                      </td>
                      <td>
                        <span style={{ fontSize: 12 }}>{v.country !== 'Unknown' ? `🌐 ${v.country}` : '—'}</span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.city !== 'Unknown' ? v.city : '—'}</td>
                      <td>
                        <span className="badge badge-gray" style={{ fontSize: 10 }}>{v.device}</span>
                      </td>
                      <td style={{ fontSize: 12 }}>{v.browser}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 150 }}>
                        <span className="truncate" style={{ display: 'block' }}>{v.referrer || 'Direct'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showQR && <QRModal url={shortUrl} shortCode={url.shortCode} onClose={() => setShowQR(false)} />}
    </div>
  );
}