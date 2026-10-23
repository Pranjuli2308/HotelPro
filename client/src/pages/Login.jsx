import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Hotel, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'staff') {
        navigate('/operations');
      } else {
        navigate(from);
      }
    } catch (err) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'var(--gray-50)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          border: '1px solid var(--gray-200)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}
          >
            <Hotel size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, margin: '0 0 6px' }}>
            Sign In to HotelPro
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', margin: 0 }}>
            Access reservations, front-desk tools, and administration
          </p>
        </div>

        {/* Demo Fast Logins */}
        <div
          style={{
            background: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '8px' }}>
            <Sparkles size={14} color="#2563eb" />
            <span>ONE-CLICK DEMO CREDENTIALS</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-sm"
              style={{ fontSize: '11px', padding: '6px 4px', background: '#ffffff', border: '1px solid var(--primary-300)', color: 'var(--primary-800)' }}
              onClick={() => handleQuickFill('admin@hotelpro.com', 'admin123')}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{ fontSize: '11px', padding: '6px 4px', background: '#ffffff', border: '1px solid var(--primary-300)', color: 'var(--primary-800)' }}
              onClick={() => handleQuickFill('staff@hotelpro.com', 'staff123')}
            >
              🛎️ Staff
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{ fontSize: '11px', padding: '6px 4px', background: '#ffffff', border: '1px solid var(--primary-300)', color: 'var(--primary-800)' }}
              onClick={() => handleQuickFill('guest@hotelpro.com', 'guest123')}
            >
              🧳 Guest
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                style={{ paddingLeft: '38px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                style={{ paddingLeft: '38px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', height: '44px', marginTop: '10px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--gray-600)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
            Create Guest Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
