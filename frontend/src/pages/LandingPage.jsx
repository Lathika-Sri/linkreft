import React, { useEffect, useRef, useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import { Link } from 'react-router-dom';
import {
  Link2, Zap, BarChart3, Shield, ArrowRight, Globe,
  Clock, Copy, Play, ChevronDown, MousePointer2,
  TrendingUp, Users, CheckCircle2, Star
} from 'lucide-react';

/* ── Scroll-reveal hook ─────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Animated counter ───────────────────────────────── */
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(id); }
      else setVal(start);
    }, 20);
    return () => clearInterval(id);
  }, [visible, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── Feature data ───────────────────────────────────── */
const features = [
  { icon: <Zap size={20} />, title: 'Lightning Fast', desc: 'Sub-millisecond redirect with edge-cached 6-char codes deployed globally.' },
  { icon: <BarChart3 size={20} />, title: 'Deep Analytics', desc: 'Real-time click streams, device breakdown, geo heat-maps, and referrer graphs.' },
  { icon: <Shield size={20} />, title: 'Secure & Private', desc: 'JWT auth, Argon2 hashed passwords, CSRF protection and per-IP rate limiting.' },
  { icon: <Globe size={20} />, title: 'Custom Aliases', desc: 'Create branded vanity links. Add UTM parameters in one click.' },
  { icon: <Clock size={20} />, title: 'Link Expiry', desc: 'Schedule expiration by date or click count. Auto-deactivate on trigger.' },
  { icon: <Copy size={20} />, title: 'Bulk Shortening', desc: 'Upload a CSV and shorten hundreds of URLs in under a second.' },
];

/* ── How-it-works steps ─────────────────────────────── */
const steps = [
  { num: '01', label: 'Paste your URL', sub: 'Drop any long URL into the input — no account needed for a quick preview.' },
  { num: '02', label: 'Customise & shorten', sub: 'Add a custom alias, expiry date, and UTM tags in one form.' },
  { num: '03', label: 'Share & track', sub: 'Copy, share or embed. Watch clicks roll in on your live dashboard.' },
];

/* ── Video placeholder card ─────────────────────────── */
function RealVideo({ src }) {
  return (
    <div className="video-placeholder">

      <div className="video-inner">

        <div className="video-chrome">
          <span />
          <span />
          <span />
          <div className="video-url-bar">
            linkreft.in/dashboard
          </div>
        </div>

        <div className="video-content">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="landing-video"
          >
            <source src={src} type="video/mp4" />
          </video>
        </div>

      </div>

    </div>
  );
}

/* ── Testimonials ───────────────────────────────────── */
const testimonials = [
  { name: 'Aisha R.', role: 'Growth Marketer', text: 'linkreft cut our link management time by 70%. The analytics are genuinely better than Bitly at a fraction of the cost.' },
  { name: 'Dev K.', role: 'SaaS Founder', text: 'Bulk CSV upload saved my team hours every campaign. The custom alias feature makes our brand look polished.' },
  { name: 'Sara M.', role: 'Content Creator', text: 'I track every link I put in my bio. The geo breakdown showed me my audience is 60% US — changed my posting schedule completely.' },
];

/* ─────────────────────────────────────────────────────
   MAIN COMPONENT
──────────────────────────────────────────────────── */
export default function LandingPage() {
  /* Parallax hero orb */
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const fn = (e) => setMouse({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  /* Scroll progress bar */
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setScroll(el.scrollTop / (el.scrollHeight - el.clientHeight));
    };
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const [statsRef, statsVisible] = useReveal();
  const [featRef, featVisible] = useReveal(0.05);
  const [howRef, howVisible] = useReveal(0.1);
  const [testRef, testVisible] = useReveal(0.1);

  return (
    <div className="landing-root">

      {/* ── Scroll progress ──────────────────────────── */}
      <div className="scroll-progress" style={{ width: `${scroll * 100}%` }} />

      {/* ── NAV ──────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <Link2 size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="nav-logo-text">linkreft<span>in</span></span>
        </div>

        <div className="nav-links hide-mobile">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how" className="nav-link">How it works</a>
          <a href="#demo" className="nav-link">Demo</a>
        </div>

        <div className="nav-actions">
          <ThemeToggle />
          <Link to="/login" className="btn btn-secondary btn-sm">Log in</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero-section">
        {/* Parallax orbs */}
        <div className="hero-orb hero-orb-1"
          style={{ transform: `translate(${mouse.x * -30}px, ${mouse.y * -30}px)` }} />
        <div className="hero-orb hero-orb-2"
          style={{ transform: `translate(${mouse.x * 20}px, ${mouse.y * 20}px)` }} />
        <div className="hero-orb hero-orb-3"
          style={{ transform: `translate(${mouse.x * -15}px, ${mouse.y * -15}px)` }} />

        {/* Dot grid */}
        <div className="hero-dots" />

        <div className="hero-content animate-fade-in">
          <div className="hero-badge">
            <span className="badge-dot" />
            <span>URL Analytics Platform — Built for Growth</span>
          </div>

          <h1 className="hero-title">
            Short Links.<br />
            <span className="hero-highlight">
              <span className="glow-text">Big Insights.</span>
              <span className="hero-underline" />
            </span>
          </h1>

          <p className="hero-sub">
            Create trackable short links in seconds. Monitor clicks, analyse audiences,
            and grow smarter with real-time analytics that actually make sense.
          </p>

          <div className="hero-cta">
            <Link to="/signup" className="btn btn-primary btn-lg hero-btn-primary">
              Start for Free <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>

          <div className="hero-trust">
            {['No credit card', 'Free tier forever', '99.9% uptime'].map(t => (
              <span key={t} className="trust-item">
                <CheckCircle2 size={13} /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Hero demo card */}
        <div className="hero-card animate-slide-up" id="demo">
          <div className="card-chrome">
            <span /><span /><span />
            <span className="card-chrome-label">linkreft.in — Dashboard</span>
          </div>

          <div className="hero-stats-row">
            {[['2,847', 'Total Clicks'], ['34', 'Active Links'], ['89%', 'CTR']].map(([val, label]) => (
              <div key={label} className="hero-stat">
                <div className="hero-stat-val">{val}</div>
                <div className="hero-stat-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="hero-links-list">
            {[
              { code: 'my-blog', url: 'https://myblog.com/a-very-long-post-about-react-hooks', clicks: 342 },
              { code: 'product-launch', url: 'https://shop.example.com/collections/new-arrivals-2024', clicks: 918 },
            ].map(item => (
              <div key={item.code} className="hero-link-row">
                <div>
                  <div className="mono link-code">linkreft.in/{item.code}</div>
                  <div className="truncate link-url">{item.url}</div>
                </div>
                <div className="badge badge-green">{item.clicks} clicks</div>
              </div>
            ))}
          </div>

          {/* Tiny sparkline decoration */}
          <div className="hero-sparkline">
            {[20, 45, 30, 70, 55, 90, 65, 85, 78, 95, 60, 88].map((h, i) => (
              <div key={i} className="sparkline-bar" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <a href="#features" className="scroll-hint">
          <ChevronDown size={20} />
        </a>
      </section>

      {/* ── STATS BAND ───────────────────────────────── */}
      <section className="stats-band" ref={statsRef}>
        {[
          { icon: <MousePointer2 size={22} />, val: 12000000, suffix: '+', label: 'Clicks tracked' },
          { icon: <Link2 size={22} />, val: 480000, suffix: '+', label: 'Links created' },
          { icon: <Users size={22} />, val: 18000, suffix: '+', label: 'Active users' },
          { icon: <TrendingUp size={22} />, val: 99, suffix: '.9%', label: 'Uptime SLA' },
        ].map(({ icon, val, suffix, label }) => (
          <div key={label} className="stat-band-item">
            <div className="stat-band-icon">{icon}</div>
            <div className="stat-band-val">
              {statsVisible ? <Counter to={val} suffix={suffix} /> : '0'}
            </div>
            <div className="stat-band-label">{label}</div>
          </div>
        ))}
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section className="features-section" id="features" ref={featRef}>
        <div className="section-header">
          <div className="section-tag">Features</div>
          <h2 className="section-title">
            Everything you need to <span className="glow-text">grow</span>
          </h2>
          <p className="section-sub">Six power tools in one clean dashboard. No bloat, just results.</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card"
              style={{
                opacity: featVisible ? 1 : 0,
                transform: featVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: `opacity 0.55s ease ${i * 80}ms, transform 0.55s ease ${i * 80}ms`,
              }}
            >
              <div className="feature-icon-wrap">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className="feature-arrow"><ArrowRight size={15} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VIDEO / HOW IT WORKS ─────────────────────── */}
      <section className="how-section" id="how" ref={howRef}>
        <div className="how-left">
          <div className="section-tag">How it works</div>
          <h2 className="section-title left">
            Up and running<br />in <span className="glow-text">60 seconds</span>
          </h2>

          <div className="steps-list">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="step-item"
                style={{
                  opacity: howVisible ? 1 : 0,
                  transform: howVisible ? 'translateX(0)' : 'translateX(-24px)',
                  transition: `opacity 0.5s ease ${i * 120}ms, transform 0.5s ease ${i * 120}ms`,
                }}
              >
                <div className="step-num">{s.num}</div>
                <div>
                  <div className="step-label">{s.label}</div>
                  <div className="step-sub">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="how-right">
          <div className="section-tag" style={{ marginBottom: 18 }}>Watch & learn</div>
          {/* Primary big video placeholder */}
          <RealVideo src="/videos/linkreft-video1.mp4" />
          <div className="video-row">
          <RealVideo src="/videos/linkreft-video2.mp4" />
          <RealVideo src="/videos/linkreft-video2.mp4" />
          </div>
        </div>
      </section>

      {/* ── FEATURE SPOTLIGHT ────────────────────────── */}
      <section className="spotlight-section">
        <div className="spotlight-card">
          <div className="spotlight-text">
            <div className="section-tag">Analytics</div>
            <h3 className="spotlight-title">Your links, your data — always.</h3>
            <p className="spotlight-desc">
              Every click is captured: device type, OS, browser, country, city, referrer and timestamp.
              Drill into any link from your dashboard and export raw CSV anytime.
            </p>
            <Link to="/signup" className="btn btn-primary" style={{ marginTop: 20, alignSelf: 'flex-start' }}>
              Explore Analytics <ArrowRight size={16} />
            </Link>
          </div>
          <RealVideo src="/videos/linkreft-video3.mp4" />
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="testimonials-section" ref={testRef}>
        <div className="section-header">
          <div className="section-tag">Testimonials</div>
          <h2 className="section-title">Loved by <span className="glow-text">thousands</span></h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="testimonial-card"
              style={{
                opacity: testVisible ? 1 : 0,
                transform: testVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.55s ease ${i * 120}ms, transform 0.55s ease ${i * 120}ms`,
              }}
            >
              <div className="test-stars">
                {[...Array(5)].map((_, k) => <Star key={k} size={13} fill="currentColor" />)}
              </div>
              <p className="test-text">"{t.text}"</p>
              <div className="test-author">
                <div className="test-avatar">{t.name[0]}</div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-orb" />
          <div className="section-tag" style={{ marginBottom: 16 }}>Get started</div>
          <h2 className="cta-title">Ready to shorten smarter?</h2>
          <p className="cta-sub">
            Join 18,000+ users who trust linkreft for link management that actually scales.
          </p>
          <Link to="/signup" className="btn btn-primary btn-lg cta-btn">
            Create free account <ArrowRight size={18} />
          </Link>
          <p className="cta-note">No credit card. Instant setup. Free tier forever.</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-left">
          <div className="nav-logo" style={{ marginBottom: 8 }}>
            <div className="nav-logo-icon">
              <Link2 size={15} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="nav-logo-text">linkreft<span>in</span></span>
          </div>
          <span className="footer-copy">© 2024 linkreft. Built for Katomaran Hackathon.</span>
        </div>
        <span className="footer-right">
          This project is part of a hackathon run by{' '}
          <a href="https://katomaran.com" className="footer-link">katomaran.com</a>
        </span>
      </footer>
    </div>
  );
}