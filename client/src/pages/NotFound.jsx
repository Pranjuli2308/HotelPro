import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '20px',
          background: 'var(--primary-100)',
          color: 'var(--primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Hotel size={36} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '56px', fontWeight: 800, margin: '0 0 10px', color: 'var(--gray-900)' }}>
        404
      </h1>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '12px' }}>
        Suite Or Page Not Found
      </h2>
      <p style={{ color: 'var(--gray-500)', maxWidth: '420px', margin: '0 auto 28px', fontSize: '14px' }}>
        The page you are looking for might have been relocated or is currently undergoing renovation.
      </p>
      <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <Home size={16} /> Return to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
