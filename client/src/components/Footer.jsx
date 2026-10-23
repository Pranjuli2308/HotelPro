import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Mail, Phone, MapPin, ShieldCheck, Award, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-col">
            <div className="footer-brand">
              <div className="brand-icon">
                <Hotel size={20} color="#ffffff" />
              </div>
              <span className="brand-title" style={{ color: '#ffffff', fontSize: '20px' }}>HotelPro</span>
            </div>
            <p className="footer-desc">
              Experience unparalleled hospitality and world-class retreats. Discover luxury suites, beachfront villas, and urban sanctuaries curated for discerning travelers.
            </p>
            <div className="footer-trust">
              <div className="trust-badge">
                <ShieldCheck size={16} color="#10b981" />
                <span>SSL Secured Transactions</span>
              </div>
              <div className="trust-badge">
                <Award size={16} color="#f59e0b" />
                <span>Best Rate Guarantee</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/hotels">All Properties</Link></li>
              <li><Link to="/bookings">Manage Bookings</Link></li>
              <li><Link to="/profile">Guest Profile</Link></li>
              <li><Link to="/login">Partner & Staff Login</Link></li>
            </ul>
          </div>

          {/* Top Destinations */}
          <div className="footer-col">
            <h4 className="footer-heading">Flagship Resorts</h4>
            <ul className="footer-links">
              <li><span style={{ color: 'var(--gray-300)' }}>The Grand Azure Resort & Spa — Goa</span></li>
              <li><span style={{ color: 'var(--gray-300)' }}>Elysium Palace & Suites — Mumbai</span></li>
              <li><span style={{ color: 'var(--gray-300)' }}>Highland Haven Retreat — Manali</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Guest Concierge</h4>
            <ul className="footer-contact">
              <li>
                <MapPin size={16} className="contact-icon" />
                <span>742 Ocean Boulevard, Suite 500, Mumbai 400001</span>
              </li>
              <li>
                <Phone size={16} className="contact-icon" />
                <span>+91 (22) 8000-HOTEL</span>
              </li>
              <li>
                <Mail size={16} className="contact-icon" />
                <span>reservations@hotelpro.luxury</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} HotelPro Management System. All rights reserved.</p>
          <div className="footer-bottom-links">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Cancellation Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
