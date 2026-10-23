import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { Search, Calendar, Users, MapPin, Star, Award, ShieldCheck, Sparkles, ArrowRight, Utensils, Wifi, Coffee, Compass } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search widget state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await api.get('/hotels');
        if (res.data) {
          setHotels(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured hotels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({
      city: destination,
      checkIn,
      checkOut,
      guests,
    }).toString();
    navigate(`/hotels?${query}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          position: 'relative',
          padding: '120px 0 100px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(30, 58, 138, 0.8)), url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80") center/cover no-repeat',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Sparkles size={16} color="#fbbf24" />
            <span>EXCEPTIONAL ESCAPES • LUXURY HOTEL SUITES</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
              lineHeight: 1.15,
              fontWeight: 700,
              maxWidth: '860px',
              margin: '0 auto 20px',
              color: '#ffffff',
            }}
          >
            Experience the Art of Refined Hospitality
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--gray-200)',
              maxWidth: '650px',
              margin: '0 auto 40px',
              lineHeight: 1.6,
            }}
          >
            Discover breathtaking coastal resorts, mountain sanctuaries, and heritage suites designed for unforgettable stays.
          </p>

          {/* Search Form Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '960px',
              margin: '0 auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              color: 'var(--gray-900)',
              textAlign: 'left',
            }}
          >
            <form
              onSubmit={handleSearch}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                alignItems: 'flex-end',
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-600)' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                  DESTINATION OR PROPERTY
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Goa, Mumbai, Manali..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-600)' }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                  CHECK-IN
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={todayStr}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-600)' }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                  CHECK-OUT
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={checkIn || todayStr}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-600)' }}>
                  <Users size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                  GUESTS
                </label>
                <select
                  className="form-control"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests</option>
                  <option value={6}>6+ Guests</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    height: '46px',
                    fontSize: '15px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Search size={18} /> Check Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid var(--gray-200)', padding: '28px 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <ShieldCheck size={28} color="#2563eb" />
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Instant Confirmation</h4>
                <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: 0 }}>Real-time inventory locks</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <Award size={28} color="#f59e0b" />
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Best Rate Guarantee</h4>
                <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: 0 }}>Direct hotelier pricing</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <Coffee size={28} color="#10b981" />
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Complimentary Perks</h4>
                <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: 0 }}>Free breakfast & Wi-Fi</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <Compass size={28} color="#8b5cf6" />
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>24/7 Front Desk Concierge</h4>
                <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: 0 }}>Dedicated guest support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section style={{ padding: '80px 0', background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-600)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Curated Sanctuaries
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 700, margin: '6px 0 0' }}>
                Featured Signature Properties
              </h2>
            </div>
            <Link to="/hotels" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              View All Properties <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '30px',
              }}
            >
              {hotels.map((hotel) => (
                <div
                  key={hotel._id}
                  className="hotel-card"
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    border: '1px solid var(--gray-200)',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img
                      src={
                        hotel.images?.[0] ||
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={hotel.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '14px',
                        right: '14px',
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(6px)',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        color: '#fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      <Star size={14} fill="#fbbf24" />
                      <span>{hotel.rating || '4.9'}</span>
                    </div>
                  </div>

                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)', fontSize: '13px', marginBottom: '8px' }}>
                      <MapPin size={14} />
                      <span>{hotel.address?.city}, {hotel.address?.state || hotel.address?.country}</span>
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--gray-900)' }}>
                      {hotel.name}
                    </h3>

                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
                      {hotel.description?.length > 120 ? `${hotel.description.substring(0, 120)}...` : hotel.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      {(hotel.amenities || ['Free Wi-Fi', 'Swimming Pool', 'Spa']).slice(0, 3).map((amenity, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            background: 'var(--gray-100)',
                            color: 'var(--gray-700)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gray-100)', paddingTop: '16px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', display: 'block' }}>Starting from</span>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-700)' }}>
                          ${hotel.minPrice || 220}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}> / night</span>
                      </div>

                      <Link to={`/hotels/${hotel._id}`} className="btn btn-primary btn-sm">
                        View Suites
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Amenities Showcase */}
      <section style={{ padding: '80px 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-600)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              World-Class Comfort
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 700, margin: '8px 0' }}>
              Crafted For Your Well-Being
            </h2>
            <p style={{ color: 'var(--gray-600)', fontSize: '15px' }}>
              Every HotelPro property features signature amenities designed to elevate your stay beyond ordinary accommodations.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            <div className="amenity-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Utensils size={24} />
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Michelin-Inspired Dining</h4>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: 1.6 }}>
                Artisanal breakfast spreads, authentic local flavors, and 24-hour in-suite gourmet dining prepared by master chefs.
              </p>
            </div>

            <div className="amenity-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--emerald-100)', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Sparkles size={24} />
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Holistic Wellness & Spa</h4>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: 1.6 }}>
                Rejuvenating steam rooms, Swedish massages, heated infinity pools, and serene meditation gardens.
              </p>
            </div>

            <div className="amenity-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-100)', color: 'var(--accent-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Wifi size={24} />
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Seamless Smart Suites</h4>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: 1.6 }}>
                Ultra-high-speed fiber Wi-Fi, digital keyless entry, ambient climate control, and smart streaming entertainment.
              </p>
            </div>

            <div className="amenity-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gold-100)', color: 'var(--gold-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Award size={24} />
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Front Desk Concierge</h4>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: 1.6 }}>
                Curated city tours, airport transfers, yacht charters, and bespoke itinerary arrangements for every guest.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
