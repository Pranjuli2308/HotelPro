import React from 'react';

export const Badge = ({ status, type = 'status' }) => {
  const getBadgeStyle = () => {
    const s = String(status).toLowerCase();
    switch (s) {
      case 'confirmed':
      case 'available':
      case 'clean':
      case 'completed':
      case 'success':
      case 'active':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.25)' };
      case 'checked_in':
      case 'occupied':
      case 'in_progress':
      case 'inspected':
      case 'admin':
        return { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.25)' };
      case 'pending':
      case 'cleaning':
      case 'staff':
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.25)' };
      case 'checked_out':
      case 'dirty':
      case 'cancelled':
      case 'failed':
      case 'maintenance':
      case 'out_of_order':
        return { bg: 'rgba(244, 63, 94, 0.12)', color: '#e11d48', border: '1px solid rgba(244, 63, 94, 0.25)' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.12)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.25)' };
    }
  };

  const style = getBadgeStyle();
  const label = String(status || '').replace(/_/g, ' ').toUpperCase();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        backgroundColor: style.bg,
        color: style.color,
        border: style.border,
      }}
    >
      {label}
    </span>
  );
};

export default Badge;
