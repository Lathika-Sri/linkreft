import React, {
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Link2, Plus, Search, Upload, LogOut, BarChart3,
  Link as LinkIcon, TrendingUp, Zap, X, Home,
  Bell, Settings, ChevronRight, Activity, Globe,
  ArrowUpRight, Layers, Sparkles, Command
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import UrlCard from '../components/UrlCard';
import CreateUrlModal from '../components/CreateUrlModal';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Area, AreaChart, LineChart, Line
} from 'recharts';
import ThemeToggle from '../components/ThemeToggle';

/* ── Custom Chart Tooltip ──────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-bright)',
        borderRadius: 10,
        padding: '10px 16px',
        fontSize: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--accent-bright)', fontWeight: 700, fontSize: 15 }}>
          {payload[0].value} clicks
        </p>
      </div>
    );
  }
  return null;
};

/* ── Animated number ───────────────────────────────── */
function AnimNum({ val }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const n = parseInt(String(val).replace(/,/g, '')) || 0;
    let cur = 0;
    const step = Math.max(1, Math.ceil(n / 40));
    const id = setInterval(() => {
      cur = Math.min(cur + step, n);
      setDisplay(cur);
      if (cur >= n) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [val]);
  return <span>{display.toLocaleString()}</span>;
}

/* ── Sidebar nav items ─────────────────────────────── */
const NAV = [
  { icon: <BarChart3 size={16} />, label: 'Dashboard', key: 'dashboard' },
  { icon: <LinkIcon size={16} />,   label: 'All Links',  key: 'links' },
  { icon: <Globe size={16} />,      label: 'Analytics',  key: 'analytics' },
  { icon: <Settings size={16} />,   label: 'Settings',   key: 'settings' },
];

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();  
  const [urls,       setUrls]       = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [csvLoading, setCsvLoading] = useState(false);
  const [sortBy,     setSortBy]     = useState('createdAt');
  const [activeNav,  setActiveNav]  = useState('dashboard');
  const analyticsRef = useRef(null);
  const linksRef = useRef(null);  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

const [profileForm, setProfileForm] = useState({
  name: user?.name || "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const handleNavClick = (key) => {
    setActiveNav(key);
  
    if (key === "analytics") {
      analyticsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
    if (key === "settings") {
      setShowSettings(true);
      return;
    }
    if (key === "links") {
      linksRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  
    if (key === "dashboard") {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };
  const handleUpdateUsername = async () => {
    try {
  
      const res = await api.put(
        "/auth/update-username",
        {
          name: profileForm.name
        }
      );
  
      toast.success("Username updated");
  
    } catch (err) {
  
      toast.error(
        err.response?.data?.error ||
        "Update failed"
      );
  
    }
  };
  /* greeting */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const loadUrls = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/urls', { params: { page, search, sortBy, limit: 12 } });
      setUrls(res.data.urls);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load URLs'); }
    finally { setLoading(false); }
  }, [page, search, sortBy]);

  const loadStats = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setStats(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadUrls(); }, [loadUrls]);
  useEffect(() => { loadStats(); }, []);

  const handleCreated = (u) => { setUrls(p => [u, ...p]); loadStats(); };
  const handleDelete  = (id) => { setUrls(p => p.filter(u => u._id !== id)); loadStats(); };
  const handleUpdate  = (upd) => { setUrls(p => p.map(u => u._id === upd._id ? upd : u)); };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/urls/bulk/csv', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Bulk created ${res.data.total} URLs!`);
      loadUrls(); loadStats();
    } catch { toast.error('CSV upload failed'); }
    finally { setCsvLoading(false); e.target.value = ''; }
  };

  const weeklyData = stats?.weeklyData?.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
  })) || [];

  /* stat cards config */
  const statCards = stats ? [
    {
      label: 'Total Links',
      value: stats.stats.totalUrls,
      icon: <Link2 size={20} />,
      color: 'var(--accent-bright)',
      bg: 'rgba(82,183,136,0.1)',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Total Clicks',
      value: stats.stats.totalClicks,
      icon: <TrendingUp size={20} />,
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.1)',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Active Links',
      value: stats.stats.activeUrls,
      icon: <Zap size={20} />,
      color: 'var(--success)',
      bg: 'rgba(52,211,153,0.1)',
      trend: 'Live',
      trendUp: true,
    },
    {
      label: 'Inactive',
      value: stats.stats.inactiveUrls,
      icon: <Activity size={20} />,
      color: 'var(--text-muted)',
      bg: 'rgba(156,163,175,0.1)',
      trend: '--',
      trendUp: false,
    },
  ] : [];

  return (
    <div className="db-root">

      {/* ── SIDEBAR ─────────────────────────────────── */}
      <aside className={`db-sidebar ${sideCollapsed ? 'collapsed' : ''}`}>

        {/* Logo */}
        <div className="db-sidebar-logo">
          <div className="db-logo-icon">
            <Link2 size={17} color="#081C15" strokeWidth={2.5} />
          </div>
          {!sideCollapsed && (
            <span className="db-logo-text">
              Linkreft<span>in</span>
            </span>
          )}
        </div>

        {/* New link button */}
        <button
          className="btn btn-primary db-new-btn"
          onClick={() => setShowCreate(true)}
          title="New Link"
        >
          <Plus size={15} />
          {!sideCollapsed && 'New Link'}
        </button>

        {/* Nav */}
        <nav className="db-nav">
          {/* Home — goes back to landing */}
          <Link
            to="/"
            className="db-nav-item"
            title="Home"
            onClick={() => setActiveNav('home')}
          >
            <span className="db-nav-icon"><Home size={16} /></span>
            {!sideCollapsed && <span className="db-nav-label">Home</span>}
          </Link>

          {NAV.map(item => (
            <button
              key={item.key}
              className={`db-nav-item ${activeNav === item.key ? 'active' : ''}`}
              onClick={() => handleNavClick(item.key)}
              title={item.label}
            >
              <span className="db-nav-icon">{item.icon}</span>
              {!sideCollapsed && <span className="db-nav-label">{item.label}</span>}
              {!sideCollapsed && activeNav === item.key && (
                <ChevronRight size={13} className="db-nav-arrow" />
              )}
            </button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          className="db-collapse-btn"
          onClick={() => setSideCollapsed(p => !p)}
          title={sideCollapsed ? 'Expand' : 'Collapse'}
        >
          <Command size={14} />
          {!sideCollapsed && <span>Collapse</span>}
        </button>

        {/* User info */}
        <div className="db-sidebar-user">
          <div className="db-user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
            <span className="db-user-online" />
          </div>
          {!sideCollapsed && (
            <div className="db-user-meta">
              <div className="db-user-name">{user?.name}</div>
              <div className="db-user-email">{user?.email}</div>
            </div>
          )}
          {!sideCollapsed && (
            <button
              className="db-logout-btn"
              onClick={logout}
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────── */}
      <div className="db-main">

        {/* ── TOP NAVBAR ──────────────────────────── */}
        <header className="db-topbar">
          <div className="db-topbar-left">
            <div className="db-greeting-wrap">
              <span className="db-greeting-emoji">
                {hour < 12 ? '🌅' : hour < 18 ? '☀️' : '🌙'}
              </span>
              <div>
                <p className="db-greeting">{greeting}, <strong>{user?.name?.split(' ')[0]}</strong></p>
                <p className="db-greeting-sub">Here's what's happening with your links today.</p>
              </div>
            </div>
          </div>

          <div className="db-topbar-right">
            <ThemeToggle />

            {/* CSV upload */}
            <label className={`btn btn-secondary btn-sm db-topbar-btn ${csvLoading ? 'disabled' : ''}`}>
              <Upload size={14} />
              {csvLoading ? 'Uploading…' : 'Bulk CSV'}
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleCsvUpload}
                disabled={csvLoading}
              />
            </label>

            <button
              className="btn btn-primary btn-sm db-topbar-btn"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={14} /> New Link
            </button>
            <div style={{ position: "relative" }}>
  <button
    className="db-icon-btn"
    onClick={() => setShowNotifications(!showNotifications)}
  >
    <Bell size={16} />
    <span className="db-notif-dot" />
  </button>

  {showNotifications && stats && (
    <div className="db-notification-panel">

      <h3>Dashboard Insights</h3>

      <div className="db-insight-card">
        <span>🔥 Top Link</span>
        <strong>
          {stats.topUrls?.[0]?.shortCode || "No Links"}
        </strong>
        <small>
          {stats.topUrls?.[0]?.clicks || 0} clicks
        </small>
      </div>

      <div className="db-insight-card">
        <span>📈 Total Clicks</span>
        <strong>
          {stats.stats.totalClicks}
        </strong>
      </div>

      <div className="db-insight-card">
        <span>🔗 Active Links</span>
        <strong>
          {stats.stats.activeUrls}
        </strong>
      </div>

      <div className="db-insight-card">
        <span>👤 Logged In</span>
        <strong>
          {user?.email}
        </strong>
      </div>

      <button
        className="btn btn-primary w-full"
        onClick={() => {
          setShowNotifications(false);
          setActiveNav("analytics");

          analyticsRef.current?.scrollIntoView({
            behavior: "smooth"
          });
        }}
      >
        View Analytics
      </button>

    </div>
  )}
</div>
 
          </div>
        </header>

        {/* ── CONTENT ─────────────────────────────── */}
        <div className="db-content">

          {/* STAT CARDS */}
          {stats && (
            <div className="db-stats-grid">
              {statCards.map((s, i) => (
                <div
                  key={s.label}
                  className="db-stat-card animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="db-stat-top">
                    <div className="db-stat-icon" style={{ background: s.bg, color: s.color }}>
                      {s.icon}
                    </div>
                    <span
                      className={`db-stat-trend ${s.trendUp ? 'up' : 'neutral'}`}
                    >
                      {s.trendUp && s.trend !== '--' && <ArrowUpRight size={11} />}
                      {s.trend}
                    </span>
                  </div>
                  <div className="db-stat-value" style={{ color: s.color }}>
                    <AnimNum val={s.value} />
                  </div>
                  <div className="db-stat-label">{s.label}</div>
                  {/* micro progress bar */}
                  <div className="db-stat-bar">
                    <div
                      className="db-stat-bar-fill"
                      style={{
                        width: `${Math.min(100, (s.value / (Math.max(...statCards.map(x => x.value)) || 1)) * 100)}%`,
                        background: s.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CHARTS ROW */}
          {stats && (
            <div
  ref={analyticsRef}
  className={`db-charts-row ${
    activeNav === "analytics"
      ? "section-highlight"
      : ""
  }`}
>
{showSettings && (
  <div
    className="modal-overlay"
    onClick={() => setShowSettings(false)}
  >
    <div
      className="settings-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h2>⚙️ Account Settings</h2>

      {/* Theme */}
      <div className="settings-section">
        <h3>Appearance</h3>

        <div className="settings-row">
          <span>Theme</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Profile */}
      <div className="settings-section">
        <h3>Profile</h3>

        <label>Username</label>

        <input
          className="input"
          value={profileForm.name}
          onChange={(e) =>
            setProfileForm({
              ...profileForm,
              name: e.target.value
            })
          }
        />

        <small className="settings-note">
          Username can be changed once every 48 hours.
        </small>

        <button
  className="btn btn-primary"
  onClick={handleUpdateUsername}
>
  Update Username
</button>
      </div>

      {/* Security */}
      <div className="settings-section">
        <h3>Security</h3>

        <input
          className="input"
          type="password"
          placeholder="Current Password"
          value={profileForm.currentPassword}
          onChange={(e) =>
            setProfileForm({
              ...profileForm,
              currentPassword: e.target.value
            })
          }
        />

        <input
          className="input"
          type="password"
          placeholder="New Password"
          value={profileForm.newPassword}
          onChange={(e) =>
            setProfileForm({
              ...profileForm,
              newPassword: e.target.value
            })
          }
        />

        <input
          className="input"
          type="password"
          placeholder="Confirm Password"
          value={profileForm.confirmPassword}
          onChange={(e) =>
            setProfileForm({
              ...profileForm,
              confirmPassword: e.target.value
            })
          }
        />

        <button
          className="btn btn-secondary"
          style={{ marginTop: 12 }}
        >
          Change Password
        </button>
      </div>

      {/* Account */}
      <div className="settings-section">
        <h3>Account</h3>

        <div className="settings-user-info">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>

        <button
          className="btn"
          style={{
            background: "#ef4444",
            color: "#fff",
            marginTop: 12
          }}
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  </div>
)}
              {/* Area chart */}
              <div className="db-chart-card">
                <div className="db-chart-header">
                  <div>
                    <h3 className="db-chart-title">Weekly Click Activity</h3>
                    <p className="db-chart-sub">Clicks over the last 7 days</p>
                  </div>
                  <div className="db-chart-badge">
                    <Sparkles size={11} /> Live
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      fill="url(#clickGrad)"
                      dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: 'var(--accent-bright)', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Top links */}
              <div className="db-top-links-card">
                <div className="db-chart-header">
                  <div>
                    <h3 className="db-chart-title">Top Links</h3>
                    <p className="db-chart-sub">By click volume</p>
                  </div>
                  <Layers size={15} style={{ color: 'var(--text-muted)' }} />
                </div>

                {stats.topUrls.length === 0 ? (
                  <div className="db-empty-mini">
                    <Link2 size={28} />
                    <p>No links yet</p>
                  </div>
                ) : (
                  <div className="db-top-links-list">
                    {stats.topUrls.map((u, i) => (
                      <Link
                        key={u.id}
                        to={`/analytics/${u.id}`}
                        className="db-top-link-row"
                      >
                        <span className={`db-rank ${i === 0 ? 'gold' : ''}`}>
                          {i + 1}
                        </span>
                        <div className="db-top-link-info">
                          <div className="db-top-link-title truncate">
                            {u.title || u.shortCode}
                          </div>
                          <div className="mono db-top-link-code">
                            /{u.shortCode}
                          </div>
                        </div>
                        <div className="db-top-link-bar-wrap">
                          <div
                            className="db-top-link-bar"
                            style={{
                              width: `${Math.min(100, (u.clicks / (stats.topUrls[0]?.clicks || 1)) * 100)}%`,
                            }}
                          />
                          <span className="badge badge-green" style={{ fontSize: 10 }}>
                            {u.clicks}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEARCH + FILTER */}
          <div className="db-filter-row">
            <div className="db-search-wrap">
              <Search size={14} className="db-search-icon" />
              <input
                className="input db-search-input"
                placeholder="Search links by title, alias, or URL…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button className="db-search-clear" onClick={() => setSearch('')}>
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              className="input db-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="createdAt">Newest first</option>
              <option value="clicks">Most clicks</option>
              <option value="updatedAt">Last updated</option>
            </select>
          </div>

          {/* LINKS SECTION HEADER */}
          <div
  ref={linksRef}
  className={
    activeNav === "links"
      ? "section-highlight"
      : ""
  }
>
  <div className="db-section-header">
            <div>
              <h2 className="db-section-title">Your Links</h2>
              {!loading && (
                <p className="db-section-sub">
                  {search
                    ? `${urls.length} result${urls.length !== 1 ? 's' : ''} for "${search}"`
                    : `${total} link${total !== 1 ? 's' : ''} total`
                  }
                </p>
              )}
            </div>
          </div>
</div>
          {/* URL GRID */}
          {loading ? (
            <div className="db-loading">
              <div className="db-loader-ring" />
              <p>Loading your links…</p>
            </div>
          ) : urls.length === 0 ? (
            <div className="db-empty-state">
              <div className="db-empty-icon">
                <Link2 size={36} />
              </div>
              <h3>{search ? 'No links found' : 'No links yet'}</h3>
              <p>
                {search
                  ? `No results for "${search}" — try a different term`
                  : 'Create your first short link to get started'}
              </p>
              {!search && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus size={15} /> Create your first link
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="db-url-grid">
                {urls.map(url => (
                  <UrlCard
                    key={url._id}
                    url={url}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>

              {total > 12 && (
                <div className="db-pagination">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Prev
                  </button>
                  <span className="db-page-info">
                    Page <strong>{page}</strong> of <strong>{Math.ceil(total / 12)}</strong>
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page >= Math.ceil(total / 12)}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateUrlModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}