import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import {
  ClipboardList,
  LogIn,
  LogOut,
  BedDouble,
  Sparkles,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';

export const Operations = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('frontdesk'); // 'frontdesk', 'rooms', 'housekeeping'
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');

  // Front desk state
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Room status & Housekeeping state
  const [rooms, setRooms] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskRoom, setNewTaskRoom] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  // Load hotels
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await api.get('/hotels');
        if (res.data && res.data.length > 0) {
          setHotels(res.data);
          setSelectedHotelId(res.data[0]._id);
        }
      } catch (err) {
        showToast('Failed to load hotel properties', 'error');
      }
    };
    fetchHotels();
  }, []);

  // Fetch operational data whenever hotel changes
  const fetchOperationsData = async () => {
    if (!selectedHotelId) return;
    setLoading(true);
    try {
      const [arrivalsRes, departuresRes, allBookingsRes, roomsRes, tasksRes] = await Promise.all([
        api.get(`/operations/arrivals?hotelId=${selectedHotelId}`),
        api.get(`/operations/departures?hotelId=${selectedHotelId}`),
        api.get(`/bookings/all?hotelId=${selectedHotelId}`),
        api.get(`/hotels/${selectedHotelId}/rooms`),
        api.get(`/operations/tasks?hotelId=${selectedHotelId}`),
      ]);

      setArrivals(arrivalsRes.data || []);
      setDepartures(departuresRes.data || []);
      setAllReservations(allBookingsRes.data || []);
      setRooms(roomsRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (err) {
      showToast(err.message || 'Error fetching operational data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHotelId) {
      fetchOperationsData();
    }
  }, [selectedHotelId]);

  // Check-In Handler
  const handleCheckIn = async (bookingId, roomId) => {
    try {
      await api.post('/operations/check-in', { bookingId, roomId });
      showToast('Guest successfully checked in!', 'success');
      fetchOperationsData();
    } catch (err) {
      showToast(err.message || 'Check-in failed', 'error');
    }
  };

  // Check-Out Handler
  const handleCheckOut = async (bookingId) => {
    try {
      await api.post('/operations/check-out', { bookingId });
      showToast('Guest checked out. Room dispatched to housekeeping.', 'success');
      fetchOperationsData();
    } catch (err) {
      showToast(err.message || 'Checkout failed', 'error');
    }
  };

  // Update Room Status
  const handleRoomStatusChange = async (roomId, newStatus) => {
    try {
      await api.patch(`/rooms/${roomId}/status`, { status: newStatus });
      showToast(`Room marked as ${newStatus}`, 'info');
      fetchOperationsData();
    } catch (err) {
      showToast(err.message || 'Failed to update room status', 'error');
    }
  };

  // Housekeeping Task Creation
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    try {
      await api.post('/operations/tasks', {
        hotelId: selectedHotelId,
        title: newTaskTitle,
        roomId: newTaskRoom || undefined,
        priority: newTaskPriority,
        taskType: 'cleaning',
      });
      showToast('Housekeeping task scheduled', 'success');
      setNewTaskTitle('');
      setNewTaskRoom('');
      fetchOperationsData();
    } catch (err) {
      showToast(err.message || 'Failed to create task', 'error');
    }
  };

  // Housekeeping Task Status Update
  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/operations/tasks/${taskId}`, { status });
      showToast(`Task status updated to ${status}`, 'info');
      fetchOperationsData();
    } catch (err) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  const filteredReservations = allReservations.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.bookingReference?.toLowerCase().includes(q) ||
      b.userId?.name?.toLowerCase().includes(q) ||
      b.userId?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container" style={{ padding: '36px 20px 80px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Front Desk Operations Hub
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 700, margin: '4px 0 0' }}>
            Operations & Room Management
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="form-control"
            style={{ width: '240px', fontWeight: 600 }}
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
          >
            {hotels.map((h) => (
              <option key={h._id} value={h._id}>
                🏨 {h.name}
              </option>
            ))}
          </select>

          <button
            className="btn btn-secondary btn-icon"
            onClick={fetchOperationsData}
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--gray-200)',
          marginBottom: '28px',
        }}
      >
        <button
          onClick={() => setActiveTab('frontdesk')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'frontdesk' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'frontdesk' ? '#2563eb' : 'var(--gray-600)',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ClipboardList size={18} /> Front Desk & Arrivals ({arrivals.length + departures.length})
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'rooms' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'rooms' ? '#2563eb' : 'var(--gray-600)',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <BedDouble size={18} /> Room Readiness & Status ({rooms.length})
        </button>

        <button
          onClick={() => setActiveTab('housekeeping')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'housekeeping' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'housekeeping' ? '#2563eb' : 'var(--gray-600)',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={18} /> Housekeeping Tasks ({tasks.length})
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className="spinner"></div>
        </div>
      )}

      {/* Tab 1: Front Desk Arrivals, Departures & Lookup */}
      {activeTab === 'frontdesk' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '18px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>TODAY'S ARRIVALS</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: '4px 0 0' }}>
                {arrivals.length}
              </h2>
            </div>
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '14px', padding: '18px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400e' }}>TODAY'S DEPARTURES</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#78350f', margin: '4px 0 0' }}>
                {departures.length}
              </h2>
            </div>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '18px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>READY ROOMS AVAILABLE</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#047857', margin: '4px 0 0' }}>
                {rooms.filter((r) => r.status === 'clean' || r.status === 'available').length}
              </h2>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '440px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by reference, guest name or email..."
              style={{ paddingLeft: '38px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Arrivals & Active Board */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                Reservations Roster ({filteredReservations.length})
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', borderBottom: '1px solid var(--gray-200)' }}>
                    <th style={{ padding: '12px 18px' }}>Ref / Guest</th>
                    <th style={{ padding: '12px 18px' }}>Category</th>
                    <th style={{ padding: '12px 18px' }}>Dates</th>
                    <th style={{ padding: '12px 18px' }}>Assigned Room</th>
                    <th style={{ padding: '12px 18px' }}>Status</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>Front Desk Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--gray-500)' }}>
                        No matching reservations for this property.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((b) => (
                      <tr key={b._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-700)', display: 'block' }}>
                            {b.bookingReference}
                          </span>
                          <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>{b.userId?.name || 'Guest'}</span>
                          <span style={{ color: 'var(--gray-400)', fontSize: '11px', display: 'block' }}>{b.userId?.email}</span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontWeight: 600 }}>{b.roomTypeId?.name || 'Suite'}</span>
                          <span style={{ color: 'var(--gray-500)', fontSize: '12px', display: 'block' }}>
                            {b.numberOfGuests} Guests
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span>{new Date(b.checkInDate).toLocaleDateString()}</span>
                          <span style={{ color: 'var(--gray-400)', margin: '0 4px' }}>→</span>
                          <span>{new Date(b.checkOutDate).toLocaleDateString()}</span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {b.roomId ? (
                            <span style={{ fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                              Room #{b.roomId.roomNumber}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <Badge status={b.status} />
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          {b.status === 'confirmed' && (
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <select
                                id={`room-select-${b._id}`}
                                className="form-control"
                                style={{ width: '130px', fontSize: '12px', padding: '4px 8px' }}
                                defaultValue=""
                              >
                                <option value="" disabled>Select Room</option>
                                {rooms
                                  .filter((r) => r.status === 'clean' || r.status === 'available')
                                  .map((r) => (
                                    <option key={r._id} value={r._id}>
                                      Rm {r.roomNumber}
                                    </option>
                                  ))}
                              </select>
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => {
                                  const selectEl = document.getElementById(`room-select-${b._id}`);
                                  const selRoomId = selectEl?.value;
                                  handleCheckIn(b._id, selRoomId);
                                }}
                              >
                                <LogIn size={13} /> Check In
                              </button>
                            </div>
                          )}

                          {b.status === 'checked_in' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleCheckOut(b._id)}
                            >
                              <LogOut size={13} /> Check Out
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Room Status Grid */}
      {activeTab === 'rooms' && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
              Property Rooms Inventory ({rooms.length})
            </h3>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Clean
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span> Cleaning
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span> Dirty / Maintenance
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></span> Occupied
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '18px',
            }}
          >
            {rooms.map((room) => (
              <div
                key={room._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid var(--gray-200)',
                  padding: '18px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)' }}>
                      #{room.roomNumber}
                    </span>
                    <Badge status={room.status} />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'block' }}>
                    Floor {room.floor} • {room.roomTypeId?.name || 'Suite'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)' }}>
                    QUICK STATUS TOGGLE
                  </label>
                  <select
                    className="form-control"
                    style={{ fontSize: '12px', padding: '6px 8px' }}
                    value={room.status}
                    onChange={(e) => handleRoomStatusChange(room._id, e.target.value)}
                  >
                    <option value="clean">Clean (Ready for Guest)</option>
                    <option value="dirty">Dirty</option>
                    <option value="cleaning">Cleaning In Progress</option>
                    <option value="inspected">Inspected</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Out of Order / Maint</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Housekeeping Tasks */}
      {activeTab === 'housekeeping' && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px' }}>
          {/* New Task Form */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--gray-200)',
              padding: '24px',
              height: 'fit-content',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} /> Schedule Cleaning Task
            </h3>

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Deep clean room, restock linens..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Room Number</label>
                <select
                  className="form-control"
                  value={newTaskRoom}
                  onChange={(e) => setNewTaskRoom(e.target.value)}
                >
                  <option value="">General Area / Not Room-Specific</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room #{r.roomNumber} ({r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-control"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Assign Task
              </button>
            </form>
          </div>

          {/* Task Board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tasks.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--gray-200)' }}>
                <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: 0, fontSize: '16px' }}>All Housekeeping Tasks Completed!</h4>
                <p style={{ color: 'var(--gray-500)', fontSize: '13px', margin: '4px 0 0' }}>
                  No active cleaning or maintenance tickets pending.
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task._id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid var(--gray-200)',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{task.title}</span>
                      <Badge status={task.status} />
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: task.priority === 'urgent' ? '#e11d48' : '#d97706',
                          background: task.priority === 'urgent' ? '#fff1f2' : '#fffbeb',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {task.priority?.toUpperCase()}
                      </span>
                    </div>

                    <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                      {task.roomId ? `Room #${task.roomId.roomNumber} • ` : ''}
                      Created: {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {task.status !== 'in_progress' && task.status !== 'completed' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleUpdateTaskStatus(task._id, 'in_progress')}
                      >
                        Start Cleaning
                      </button>
                    )}
                    {task.status !== 'completed' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Operations;
