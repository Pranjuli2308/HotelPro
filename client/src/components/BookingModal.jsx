import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';
import { X, Calendar, Users, CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const BookingModal = ({ isOpen, onClose, hotel, roomType, initialCheckIn, initialCheckOut, initialGuests }) => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Date calculation defaults
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(initialCheckIn || todayStr);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut || tomorrowStr);
  const [numberOfGuests, setNumberOfGuests] = useState(initialGuests || 2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: details, 2: checkout & payment confirmation
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    if (initialCheckIn) setCheckInDate(initialCheckIn);
    if (initialCheckOut) setCheckOutDate(initialCheckOut);
    if (initialGuests) setNumberOfGuests(initialGuests);
  }, [initialCheckIn, initialCheckOut, initialGuests]);

  if (!isOpen || !roomType) return null;

  // Nights calculation
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const diffTime = Math.max(0, end - start);
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const basePricePerNight = roomType.basePrice || 250;
  const subtotal = basePricePerNight * nights;
  const tax = Math.round(subtotal * 0.12); // 12% GST / Luxury tax
  const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
  const totalAmount = subtotal + tax + serviceFee;

  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please sign in or register to complete your reservation', 'warning');
      navigate('/login');
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      showToast('Check-out date must be after check-in date', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Create booking in pending status
      const bookingData = {
        hotelId: hotel?._id,
        roomTypeId: roomType?._id,
        checkInDate,
        checkOutDate,
        numberOfGuests: Number(numberOfGuests),
        specialRequests,
      };

      const bookingRes = await api.post('/bookings', bookingData);
      const createdBooking = bookingRes.data;

      // 2. Initiate payment order
      const orderRes = await api.post('/payments/create-order', {
        bookingId: createdBooking._id,
        paymentMethod: 'card',
      });

      // 3. Confirm / verify payment (simulating sandbox payment callback)
      const verifyRes = await api.post('/payments/verify', {
        bookingId: createdBooking._id,
        orderId: orderRes.data.orderId || `order_${Date.now()}`,
        paymentId: `pay_${Date.now()}_simulated`,
        signature: 'simulated_valid_signature_sandbox',
      });

      setBookingResult(verifyRes.data?.booking || createdBooking);
      setStep(2);
      showToast('Reservation successfully confirmed!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to complete booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setBookingResult(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '24px' }}>
              {step === 1 ? 'Complete Your Reservation' : 'Booking Confirmed!'}
            </h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginTop: '2px' }}>
              {hotel?.name} — {roomType?.name}
            </p>
          </div>
          <button className="btn-close" onClick={handleClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleProceedToPayment}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Dates grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    min={todayStr}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    min={checkInDate || todayStr}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="form-group">
                <label className="form-label">
                  <Users size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Number of Guests (Max {roomType?.maxOccupancy || 2})
                </label>
                <select
                  className="form-control"
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(e.target.value)}
                >
                  {Array.from({ length: roomType?.maxOccupancy || 4 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Requests */}
              <div className="form-group">
                <label className="form-label">Special Requests (Optional)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="e.g. Quiet room away from elevator, early arrival, high floor..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>

              {/* Price Breakdown */}
              <div
                style={{
                  background: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginTop: '8px',
                }}
              >
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--gray-900)' }}>
                  Rate & Charges Breakdown
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray-600)', marginBottom: '6px' }}>
                  <span>${basePricePerNight} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray-600)', marginBottom: '6px' }}>
                  <span>Occupancy Taxes & GST (12%)</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray-600)', marginBottom: '10px' }}>
                  <span>Resort Service Fee (5%)</span>
                  <span>${serviceFee.toLocaleString()}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--gray-900)',
                    borderTop: '1px dashed var(--gray-300)',
                    paddingTop: '10px',
                  }}
                >
                  <span>Total Amount Due</span>
                  <span style={{ color: 'var(--primary-700)' }}>${totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--emerald-600)',
                  background: 'var(--emerald-50)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                }}
              >
                <ShieldCheck size={16} />
                <span>Zero cancellation fees up to 48 hours before check-in. Instant confirmation.</span>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CreditCard size={16} />
                {loading ? 'Securing Room...' : `Pay & Confirm ($${totalAmount.toLocaleString()})`}
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Success Confirmation */
          <div className="modal-body" style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--emerald-100)',
                color: 'var(--emerald-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '8px' }}>
              Your Reservation is Confirmed!
            </h3>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 20px' }}>
              Thank you for choosing HotelPro. A confirmation email and digital receipt have been registered to your profile.
            </p>

            <div
              style={{
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Booking Reference:</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-700)' }}>
                  {bookingResult?.bookingReference || 'HP-' + Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Property:</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{hotel?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Stay Dates:</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{checkInDate} to {checkOutDate} ({nights} nights)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Amount Paid:</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--emerald-600)' }}>
                  ${totalAmount.toLocaleString()} (Paid via Card)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  handleClose();
                  navigate('/bookings');
                }}
              >
                View My Reservations
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClose}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
