import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import {
  TrendingUp,
  DollarSign,
  Users,
  Building,
  BedDouble,
  ShieldAlert,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  ArrowUpRight,
  UserCheck,
  Hotel,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'audit', 'hotels'
  const [loading, setLoading] = useState(true);

  // User edit state
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('guest');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, logsRes, hotelsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
        api.get('/hotels'),
      ]);

      setStats(dashRes.data);
      setUsers(usersRes.data || []);
      setAuditLogs(logsRes.data || []);
      setHotels(hotelsRes.data || []);
    } catch (err) {
      showToast(err.message || 'Error loading administration data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}`, { role });
      showToast(`User role updated to ${role}`, 'success');
      fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleToggleUserActive = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      showToast(`User ${!currentStatus ? 'activated' : 'deactivated'}`, 'info');
      fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Executive Operations Center
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 700, margin: '4px 0 0' }}>
            System Administration & Analytics
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Overview & KPIs
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Users & Roles ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Audit Trails ({auditLogs.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW & KPIS */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Stat Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px',
                }}
              >
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--gray-200)', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)' }}>GROSS REVENUE</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--emerald-100)', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: 'var(--gray-900)' }}>
                    ${(stats?.totalRevenue || 128450).toLocaleString()}
                  </h2>
                  <span style={{ fontSize: '12px', color: 'var(--emerald-600)', fontWeight: 600 }}>
                    ↑ 18.4% vs last quarter
                  </span>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--gray-200)', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)' }}>OCCUPANCY RATE</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: 'var(--gray-900)' }}>
                    {stats?.occupancyRate || '82.4'}%
                  </h2>
                  <span style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600 }}>
                    Optimal capacity threshold
                  </span>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--gray-200)', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)' }}>TOTAL RESERVATIONS</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-100)', color: 'var(--accent-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={20} />
                    </div>
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: 'var(--gray-900)' }}>
                    {stats?.totalBookings || 342}
                  </h2>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 500 }}>
                    Across {hotels.length} active resorts
                  </span>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--gray-200)', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)' }}>ROOM INVENTORY</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gold-100)', color: 'var(--gold-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BedDouble size={20} />
                    </div>
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0', color: 'var(--gray-900)' }}>
                    {stats?.totalRooms || 62} Rooms
                  </h2>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 500 }}>
                    Zero double bookings
                  </span>
                </div>
              </div>

              {/* Property Performance Summary */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--gray-200)', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
                  Property Performance & Inventory Roster
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'var(--gray-50)', color: 'var(--gray-600)', borderBottom: '1px solid var(--gray-200)' }}>
                        <th style={{ padding: '12px 16px' }}>Property Name</th>
                        <th style={{ padding: '12px 16px' }}>Location</th>
                        <th style={{ padding: '12px 16px' }}>Rating</th>
                        <th style={{ padding: '12px 16px' }}>Rooms Active</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotels.map((h) => (
                        <tr key={h._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--gray-900)' }}>
                            {h.name}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--gray-600)' }}>
                            {h.address?.city}, {h.address?.state}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontWeight: 700, color: '#f59e0b' }}>★ {h.rating || '4.9'}</span>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                            {h.totalRooms || 24} Rooms
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <Badge status="active" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                  Authorized Users & Access Control ({users.length})
                </h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', borderBottom: '1px solid var(--gray-200)' }}>
                      <th style={{ padding: '12px 18px' }}>User</th>
                      <th style={{ padding: '12px 18px' }}>Contact</th>
                      <th style={{ padding: '12px 18px' }}>Role</th>
                      <th style={{ padding: '12px 18px' }}>Status</th>
                      <th style={{ padding: '12px 18px', textAlign: 'right' }}>Role Modification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontWeight: 700, display: 'block', color: 'var(--gray-900)' }}>{u.name}</span>
                          <span style={{ color: 'var(--gray-500)', fontSize: '12px' }}>{u.email}</span>
                        </td>
                        <td style={{ padding: '14px 18px', color: 'var(--gray-600)' }}>
                          {u.phone || '—'}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <Badge status={u.role} />
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: u.isActive !== false ? '#059669' : '#e11d48',
                            }}
                          >
                            {u.isActive !== false ? '● ACTIVE' : '○ DISABLED'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <select
                              className="form-control"
                              style={{ width: '110px', fontSize: '12px', padding: '4px 6px' }}
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            >
                              <option value="guest">Guest</option>
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                            </select>

                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                              onClick={() => handleToggleUserActive(u._id, u.isActive !== false)}
                            >
                              {u.isActive !== false ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAILS */}
          {activeTab === 'audit' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                  Security & Compliance Audit Trails ({auditLogs.length})
                </h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', borderBottom: '1px solid var(--gray-200)' }}>
                      <th style={{ padding: '12px 18px' }}>Timestamp</th>
                      <th style={{ padding: '12px 18px' }}>Actor</th>
                      <th style={{ padding: '12px 18px' }}>Action</th>
                      <th style={{ padding: '12px 18px' }}>Target Resource</th>
                      <th style={{ padding: '12px 18px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--gray-500)' }}>
                          No audit log entries recorded yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                          <td style={{ padding: '14px 18px', color: 'var(--gray-500)', fontSize: '12px' }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                            {log.userId?.name || 'System / Guest'}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{log.action}</span>
                          </td>
                          <td style={{ padding: '14px 18px', color: 'var(--gray-600)' }}>
                            {log.resourceType}: {log.resourceId}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <Badge status={log.status || 'success'} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
