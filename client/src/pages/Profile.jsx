import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';
import Badge from '../components/Badge';
import { User, Mail, Phone, Shield, Lock, Save, KeyRound } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, phone });
      showToast('Profile information updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 700, margin: '0 0 6px' }}>
          My Account Profile
        </h1>
        <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
          Manage your personal information, role details, and account security.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Profile Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--gray-200)',
            padding: '28px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 700,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{user?.name}</h3>
                <Badge status={user?.role} />
              </div>
              <p style={{ color: 'var(--gray-500)', fontSize: '13px', margin: '4px 0 0' }}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                  <input
                    type="tel"
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={savingProfile}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={14} /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--gray-200)',
            padding: '28px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <KeyRound size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Change Account Password</h3>
          </div>

          <form onSubmit={handleChangePassword}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '420px', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-secondary btn-sm"
              disabled={savingPassword}
            >
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
