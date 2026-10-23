import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Hotel, User, Mail, Lock, Phone } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      await register({
        ...formData,
        role: 'guest',
      });
      showToast('Account created successfully! Welcome to HotelPro.', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
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
            Join HotelPro
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', margin: 0 }}>
            Unlock exclusive hotel member rates & easy reservation management
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Eleanor Vance"
                style={{ paddingLeft: '38px' }}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="eleanor@example.com"
                style={{ paddingLeft: '38px' }}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="+91 98765 43210"
                style={{ paddingLeft: '38px' }}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="At least 6 characters"
                style={{ paddingLeft: '38px' }}
                value={formData.password}
                onChange={handleChange}
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
            {loading ? 'Registering Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--gray-600)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
