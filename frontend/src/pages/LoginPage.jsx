import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Link2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

import ThemeToggle from '../components/ThemeToggle';
import AuthHeroV2 from '../components/AuthHeroV2';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};

    if (!form.email) {
      e.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Invalid email';
    }

    if (!form.password) {
      e.password = 'Password is required';
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await login(
        form.email,
        form.password
      );

      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Login failed';

      toast.error(msg);

      setErrors({
        general: msg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">

      {/* LEFT SIDE */}

      <div className="auth-left">

        <div
          className="animate-slide-up"
          style={{
            width: '100%',
            maxWidth: 460
          }}
        >
          <div
            style={{
              marginBottom: 40
            }}
          >
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                marginBottom: 28
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
                <Link2
                  size={20}
                  color="#fff"
                />
              </div>

              <span
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color:
                    'var(--text-primary)'
                }}
              >
                linkreft
                <span
                  style={{
                    color:
                      'var(--accent-bright)'
                  }}
                >
                  in
                </span>
              </span>
            </Link>

                      <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
              Welcome Back
            </h1>

            <ThemeToggle />
          </div>

            <p
              style={{
                color:
                  'var(--text-secondary)',
                fontSize: 15
              }}
            >
              Sign in to manage your
              shortened URLs, analytics
              and QR codes.
            </p>
          </div>

          <div
            className="card"
            style={{
              borderColor:
                'var(--border-bright)'
            }}
          >
            {errors.general && (
              <div
                style={{
                  background:
                    'rgba(239,68,68,.1)',
                  border:
                    '1px solid rgba(239,68,68,.3)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 20,
                  fontSize: 13,
                  color: 'var(--danger)'
                }}
              >
                {errors.general}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 18
              }}
            >
              <div className="input-group">
                <label className="input-label">
                  EMAIL ADDRESS
                </label>

                <div
                  style={{
                    position: 'relative'
                  }}
                >
                  <Mail
                    size={15}
                    style={{
                      position:
                        'absolute',
                      left: 12,
                      top: '50%',
                      transform:
                        'translateY(-50%)',
                      color:
                        'var(--text-muted)'
                    }}
                  />

                  <input
                    type="email"
                    className={`input ${
                      errors.email
                        ? 'error'
                        : ''
                    }`}
                    style={{
                      paddingLeft: 38
                    }}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        email:
                          e.target.value
                      }))
                    }
                  />
                </div>

                {errors.email && (
                  <span className="input-error">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">
                  PASSWORD
                </label>

                <div
                  style={{
                    position: 'relative'
                  }}
                >
                  <Lock
                    size={15}
                    style={{
                      position:
                        'absolute',
                      left: 12,
                      top: '50%',
                      transform:
                        'translateY(-50%)',
                      color:
                        'var(--text-muted)'
                    }}
                  />

                  <input
                    className={`input ${
                      errors.password
                        ? 'error'
                        : ''
                    }`}
                    style={{
                      paddingLeft: 38,
                      paddingRight: 44
                    }}
                    type={
                      showPass
                        ? 'text'
                        : 'password'
                    }
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        password:
                          e.target.value
                      }))
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPass(
                        !showPass
                      )
                    }
                    style={{
                      position:
                        'absolute',
                      right: 12,
                      top: '50%',
                      transform:
                        'translateY(-50%)',
                      background:
                        'none',
                      border: 'none',
                      cursor: 'pointer',
                      color:
                        'var(--text-muted)'
                    }}
                  >
                    {showPass ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <span className="input-error">
                    {errors.password}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{
                  justifyContent:
                    'center',
                  marginTop: 8,
                  padding: 13
                }}
                disabled={loading}
              >
                {loading ? (
                  <div
                    className="loader"
                    style={{
                      width: 18,
                      height: 18,
                      borderWidth: 2
                    }}
                  />
                ) : (
                  <>
                    Sign In
                    <ArrowRight
                      size={16}
                    />
                  </>
                )}
              </button>
            </form>

            <div className="divider" />

            <p
              style={{
                textAlign: 'center',
                fontSize: 14,
                color:
                  'var(--text-secondary)'
              }}
            >
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{
                  color:
                    'var(--accent-bright)',
                  fontWeight: 600,
                  textDecoration:
                    'none'
                }}
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="auth-right">
        <AuthHeroV2/>
      </div>


    </div>
  );
}