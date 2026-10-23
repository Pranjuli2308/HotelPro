import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building2, Calendar, ClipboardList, Shield, LogOut, User, Menu, X, Hotel, BedDouble } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isStaff, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'info');
      navigate('/');
    } catch (e) {
      showToast('Logged out', 'info');
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="container nav-content">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Hotel size={22} color="#ffffff" />
          </div>
          <div className="brand-text">
            <span className="brand-title">HotelPro</span>
            <span className="brand-subtitle">LUXURY & RESORTS</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/hotels" className={`nav-link ${isActive('/hotels') ? 'active' : ''}`}>
            Properties
          </Link>

          {isAuthenticated && (
            <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
              <Calendar size={16} /> My Reservations
            </Link>
          )}

          {isStaff && (
            <Link
              to="/operations"
              className={`nav-link ${isActive('/operations') ? 'active' : ''}`}
              style={{ color: '#2563eb', fontWeight: 600 }}
            >
              <ClipboardList size={16} /> Front Desk Ops
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              style={{ color: '#7c3aed', fontWeight: 600 }}
            >
              <Shield size={16} /> Admin Portal
            </Link>
          )}
        </nav>

        {/* User Actions */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <Link to="/profile" className="profile-pill">
                <div className="profile-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="profile-info">
                  <span className="profile-name">{user?.name}</span>
                  <span className="profile-role">{user?.role?.toUpperCase()}</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-icon"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Book a Stay
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/hotels" onClick={() => setMobileMenuOpen(false)}>Properties & Rooms</Link>
          {isAuthenticated && (
            <Link to="/bookings" onClick={() => setMobileMenuOpen(false)}>My Reservations</Link>
          )}
          {isStaff && (
            <Link to="/operations" onClick={() => setMobileMenuOpen(false)}>Front Desk Operations</Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Portal</Link>
          )}
          <div className="mobile-menu-divider" />
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile Settings</Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="btn btn-danger btn-block"
                style={{ marginTop: '12px' }}
              >
                Log Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <Link to="/login" className="btn btn-secondary btn-block" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-block" onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
