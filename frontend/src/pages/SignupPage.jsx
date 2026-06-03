import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import AuthHeroV2 from '../components/AuthHeroV2';
export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setErrors({});
    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({ value: form[key], onChange: (e) => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div className="auth-layout">

    {/* LEFT SIDE */}
    <div className="auth-left">

      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 560 }}>

        <div style={{ marginBottom: 40 }}>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              marginBottom: 30
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                background:
                  'linear-gradient(135deg,var(--accent),var(--accent-2))',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Link2 size={20} color="#fff" />
            </div>

            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--text-primary)'
              }}
            >
              linkreft
              <span style={{ color: 'var(--accent-bright)' }}>
                in
              </span>
            </span>
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10
            }}
          >
            <h1
              style={{
                fontSize: 34,
                fontWeight: 800,
                margin: 0
              }}
            >
              Create Account
            </h1>

            <div className="auth-theme-toggle">
              <ThemeToggle />
            </div>
          </div>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 16
            }}
          >
            Start shortening and tracking links for free
          </p>
        </div>

        <div className="card" style={{ borderColor: 'var(--border-bright)' }}>
          {errors.general && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--danger)' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className={`input ${errors.name ? 'error' : ''}`} style={{ paddingLeft: 38 }} placeholder="John Doe" {...field('name')} />
              </div>
              {errors.name && <span className="input-error">{errors.name}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className={`input ${errors.email ? 'error' : ''}`} style={{ paddingLeft: 38 }} type="email" placeholder="you@example.com" {...field('email')} />
              </div>
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className={`input ${errors.password ? 'error' : ''}`} style={{ paddingLeft: 38, paddingRight: 40 }} type={showPass ? 'text' : 'password'} placeholder="••••••" {...field('password')} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <span className="input-error">{errors.password}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">CONFIRM</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className={`input ${errors.confirm ? 'error' : ''}`} style={{ paddingLeft: 38 }} type="password" placeholder="••••••" {...field('confirm')} />
                </div>
                {errors.confirm && <span className="input-error">{errors.confirm}</span>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8, padding: '13px' }} disabled={loading}>
              {loading ? <div className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-bright)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
      </div>
      {/* RIGHT SIDE */}
    <div className="auth-right">
      <AuthHeroV2 />
    </div>
    </div>
  );
}