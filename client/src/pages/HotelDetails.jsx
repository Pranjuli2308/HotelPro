import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../api/api';
import BookingModal from '../components/BookingModal';
import { MapPin, Star, Users, Check, Clock, ShieldCheck, Bed, Sparkles, Phone, Mail, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export const HotelDetails = () => {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const [hotel, setHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking modal state
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialCheckIn = searchParams.get('checkIn');
  const initialCheckOut = searchParams.get('checkOut');
  const initialGuests = searchParams.get('guests');

  useEffect(() => {
    const fetchHotelAndRooms = async () => {
      setLoading(true);
      try {
        const [hotelRes, roomTypesRes] = await Promise.all([
          api.get(`/hotels/${hotelId}`),
          api.get(`/hotels/${hotelId}/room-types`),
        ]);
        setHotel(hotelRes.data);
        setRoomTypes(roomTypesRes.data || []);
      } catch (err) {
        console.error('Failed to load hotel details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotelAndRooms();
  }, [hotelId]);

  const handleBookClick = (roomType) => {
    setSelectedRoomType(roomType);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Property Not Found</h2>
        <Link to="/hotels" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '100px' }}>
      {/* Property Hero & Gallery */}
      <div style={{ background: '#0f172a', color: '#ffffff', padding: '40px 0 60px' }}>
        <div className="container">
          <Link
            to="/hotels"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--gray-300)',
              fontSize: '13px',
              marginBottom: '20px',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Back to all properties
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    color: '#fbbf24',
                    border: '1px solid rgba(251, 191, 36, 0.4)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Star size={12} fill="#fbbf24" /> {hotel.rating || '4.9'} Star Luxury Hotel
                </span>
                <span style={{ color: 'var(--gray-400)', fontSize: '13px' }}>
                  ({hotel.totalReviews || 128} verified guest reviews)
                </span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 700, margin: '6px 0' }}>
                {hotel.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-300)', fontSize: '14px' }}>
                <MapPin size={16} color="#60a5fa" />
                <span>{hotel.address?.street}, {hotel.address?.city}, {hotel.address?.state}, {hotel.address?.country}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: 'var(--gray-400)', display: 'block' }}>Direct Booking Guarantee</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8' }}>
                  From ${hotel.minPrice || 220}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--gray-300)' }}> / night</span>
              </div>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: '12px',
              height: '420px',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <div style={{ height: '100%' }}>
              <img
                src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
                alt={hotel.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
              <img
                src={hotel.images?.[1] || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'}
                alt="Interior"
                style={{ width: '100%', height: 'calc(50% - 6px)', objectFit: 'cover' }}
              />
              <img
                src={hotel.images?.[2] || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'}
                alt="Spa & Pool"
                style={{ width: '100%', height: 'calc(50% - 6px)', objectFit: 'cover' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
              <img
                src={hotel.images?.[3] || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'}
                alt="Dining"
                style={{ width: '100%', height: 'calc(50% - 6px)', objectFit: 'cover' }}
              />
              <div
                style={{
                  width: '100%',
                  height: 'calc(50% - 6px)',
                  background: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '6px',
                  color: '#94a3b8',
                }}
              >
                <ImageIcon size={24} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>+12 Photos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
          {/* Left Column: Description, Amenities & Available Suites */}
          <div>
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '14px', color: 'var(--gray-900)' }}>
                About {hotel.name}
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--gray-700)', lineHeight: 1.8 }}>
                {hotel.description}
              </p>
            </section>

            {/* Hotel Amenities */}
            <section style={{ marginBottom: '48px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
                Featured Property Amenities
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {(hotel.amenities || []).map((amenity, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      background: 'var(--gray-50)',
                      borderRadius: '10px',
                      border: '1px solid var(--gray-200)',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    <Check size={16} color="#10b981" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Available Rooms Section */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 700, margin: 0 }}>
                    Available Rooms & Suites
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--gray-600)', margin: '4px 0 0' }}>
                    Select your preferred accommodation to lock in guaranteed rates.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {roomTypes.map((room) => (
                  <div
                    key={room._id}
                    className="room-card"
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid var(--gray-200)',
                      overflow: 'hidden',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                      display: 'grid',
                      gridTemplateColumns: '260px 1fr',
                    }}
                  >
                    <div style={{ height: '100%', minHeight: '220px' }}>
                      <img
                        src={
                          room.images?.[0] ||
                          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={room.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px', color: 'var(--gray-900)' }}>
                            {room.name}
                          </h3>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-700)' }}>
                              ${room.basePrice}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}> / night</span>
                          </div>
                        </div>

                        <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: '0 0 14px', lineHeight: 1.5 }}>
                          {room.description}
                        </p>

                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--gray-700)', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={16} color="var(--gray-500)" />
                            <span>Up to {room.maxOccupancy} Guests</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Bed size={16} color="var(--gray-500)" />
                            <span>{room.bedType || 'King Bed'}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {(room.amenities || ['Ensuite Bathroom', 'Balcony', 'Mini Bar']).map((am, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '11px',
                                background: 'var(--gray-100)',
                                color: 'var(--gray-700)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontWeight: 500,
                              }}
                            >
                              {am}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--gray-100)', paddingTop: '16px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--emerald-600)', fontWeight: 600 }}>
                          ✓ Free cancellation before 48h
                        </span>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleBookClick(room)}
                        >
                          Book Suite Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Hotel Policy, Contact & Property Map */}
          <div>
            <div
              style={{
                position: 'sticky',
                top: '90px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid var(--gray-200)',
                  padding: '24px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                  Property Policies & Check-In
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={18} color="var(--primary-600)" />
                    <div>
                      <span style={{ fontWeight: 600, display: 'block' }}>Check-in & Check-out</span>
                      <span style={{ color: 'var(--gray-500)' }}>Check-in from 2:00 PM • Checkout by 11:00 AM</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={18} color="var(--emerald-600)" />
                    <div>
                      <span style={{ fontWeight: 600, display: 'block' }}>Cancellation Policy</span>
                      <span style={{ color: 'var(--gray-500)' }}>Full refund if cancelled up to 2 days prior</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={18} color="var(--gold-500)" />
                    <div>
                      <span style={{ fontWeight: 600, display: 'block' }}>Housekeeping & Care</span>
                      <span style={{ color: 'var(--gray-500)' }}>Daily premium housekeeping & linen service</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--gray-200)', marginTop: '20px', paddingTop: '16px' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Property Front Desk</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--gray-600)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} />
                      <span>{hotel.contactPhone || '+91 22 8000 1234'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} />
                      <span>{hotel.contactEmail || 'frontdesk@hotelpro.com'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hotel={hotel}
        roomType={selectedRoomType}
        initialCheckIn={initialCheckIn}
        initialCheckOut={initialCheckOut}
        initialGuests={initialGuests}
      />
    </div>
  );
};

export default HotelDetails;
