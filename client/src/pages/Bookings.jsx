import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import Badge from '../components/Badge';
import { Calendar, MapPin, Users, DollarSign, XCircle, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/me');
      setBookings(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? This action cannot be undone.')) {
      return;
    }

    try {
      await api.post(`/bookings/${bookingId}/cancel`, { reason: 'Guest requested cancellation' });
      showToast('Reservation cancelled successfully', 'info');
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'Could not cancel reservation', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px', minHeight: '80vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', fontWeight: 700, margin: '0 0 6px' }}>
          My Reservations
        </h1>
        <p style={{ color: 'var(--gray-600)', fontSize: '15px' }}>
          View active stays, past history, booking confirmations, and digital invoices.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="spinner"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--gray-200)',
          }}
        >
          <Calendar size={48} color="var(--gray-400)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No reservations found</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', maxWidth: '380px', margin: '6px auto 20px' }}>
            You haven't booked any stays yet. Explore our premier hotel catalogue to plan your next retreat!
          </p>
          <Link to="/hotels" className="btn btn-primary">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookings.map((booking) => {
            const isCancellable = booking.status === 'confirmed' || booking.status === 'pending';
            const checkInFormatted = new Date(booking.checkInDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const checkOutFormatted = new Date(booking.checkOutDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={booking._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid var(--gray-200)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  padding: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-600)', letterSpacing: '0.04em' }}>
                      REF: {booking.bookingReference}
                    </span>
                    <Badge status={booking.status} />
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', color: 'var(--gray-900)' }}>
                    {booking.hotelId?.name || 'HotelPro Luxury Resort'}
                  </h3>
                  <p style={{ color: 'var(--gray-500)', fontSize: '13px', margin: 0 }}>
                    {booking.roomTypeId?.name || 'Suite'} • {booking.roomId ? `Assigned Room #${booking.roomId.roomNumber}` : 'Room allocation on check-in'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--gray-700)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={15} color="var(--gray-500)" />
                    <span><strong>Dates:</strong> {checkInFormatted} → {checkOutFormatted}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={15} color="var(--gray-500)" />
                    <span><strong>Guests:</strong> {booking.numberOfGuests || 2} persons</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={15} color="var(--emerald-600)" />
                    <span><strong>Total Paid:</strong> ${booking.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedReceipt(booking)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileText size={14} /> Receipt
                  </button>

                  {isCancellable && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelBooking(booking._id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <XCircle size={14} /> Cancel Stay
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="modal-backdrop" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '30px' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px solid var(--gray-200)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 4px', fontSize: '24px' }}>HotelPro</h2>
              <span style={{ fontSize: '11px', color: 'var(--gray-500)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Official Reservation Invoice & Receipt
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)' }}>Invoice Number:</span>
                <span style={{ fontWeight: 700 }}>INV-{selectedReceipt.bookingReference}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)' }}>Booking Date:</span>
                <span>{new Date(selectedReceipt.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)' }}>Hotel:</span>
                <span style={{ fontWeight: 600 }}>{selectedReceipt.hotelId?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)' }}>Room Category:</span>
                <span>{selectedReceipt.roomTypeId?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)' }}>Status:</span>
                <Badge status={selectedReceipt.status} />
              </div>

              <div style={{ borderTop: '1px dashed var(--gray-300)', marginTop: '8px', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Base Stay Charges:</span>
                  <span>${(selectedReceipt.totalPrice * 0.85).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Luxury Tax & Service (15%):</span>
                  <span>${(selectedReceipt.totalPrice * 0.15).toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 800,
                    fontSize: '16px',
                    borderTop: '1px solid var(--gray-200)',
                    paddingTop: '8px',
                    color: 'var(--primary-700)',
                  }}
                >
                  <span>Grand Total Paid:</span>
                  <span>${selectedReceipt.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => window.print()}
              >
                Print Receipt
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
