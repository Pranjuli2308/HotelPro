import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/api';
import { Search, MapPin, Star, Filter, SlidersHorizontal, BedDouble, Check, ArrowRight } from 'lucide-react';

export const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from query params
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAmenity, setSelectedAmenity] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = searchParams.get('guests');

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const params = {};
        if (cityFilter) params.city = cityFilter;
        const res = await api.get('/hotels', { params });
        setHotels(res.data || []);
      } catch (err) {
        console.error('Failed to load hotels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [cityFilter]);

  const allAmenities = ['Swimming Pool', 'Spa', 'Free Wi-Fi', 'Gym', 'Restaurant', 'Airport Shuttle', 'Bar'];

  const filteredHotels = hotels
    .filter((hotel) => {
      const matchSearch =
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.address?.state?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchAmenity = selectedAmenity ? hotel.amenities?.includes(selectedAmenity) : true;
      return matchSearch && matchAmenity;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.minPrice || 0) - (b.minPrice || 0);
      if (sortBy === 'price_desc') return (b.minPrice || 0) - (a.minPrice || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '0 0 8px' }}>
          Explore Luxury Properties
        </h1>
        <p style={{ color: 'var(--gray-600)', fontSize: '15px' }}>
          Discover handpicked hotels, resort sanctuaries, and premium city suites.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid var(--gray-200)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
          marginBottom: '36px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flex: '1 1 300px', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search by hotel name or city..."
              style={{ paddingLeft: '40px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            style={{ width: '160px' }}
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="">All Destinations</option>
            <option value="Goa">Goa</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Manali">Manali</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            style={{ width: '180px' }}
            value={selectedAmenity}
            onChange={(e) => setSelectedAmenity(e.target.value)}
          >
            <option value="">All Amenities</option>
            {allAmenities.map((amenity) => (
              <option key={amenity} value={amenity}>
                {amenity}
              </option>
            ))}
          </select>

          <select
            className="form-control"
            style={{ width: '170px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="rating">Sort: Highest Rated</option>
            <option value="price_asc">Sort: Price Low to High</option>
            <option value="price_desc">Sort: Price High to Low</option>
          </select>
        </div>
      </div>

      {/* Hotel Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="spinner"></div>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--gray-50)', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--gray-700)' }}>No properties found</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '6px' }}>
            Try adjusting your search criteria or destination filter.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '16px' }}
            onClick={() => {
              setSearchTerm('');
              setCityFilter('');
              setSelectedAmenity('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '30px',
          }}
        >
          {filteredHotels.map((hotel) => (
            <div
              key={hotel._id}
              className="hotel-card"
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid var(--gray-200)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
                <img
                  src={
                    hotel.images?.[0] ||
                    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={hotel.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(4px)',
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
                  <Star size={13} fill="#fbbf24" />
                  <span>{hotel.rating || '4.9'}</span>
                </div>
              </div>

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)', fontSize: '13px', marginBottom: '8px' }}>
                  <MapPin size={14} />
                  <span>{hotel.address?.street}, {hotel.address?.city}, {hotel.address?.country}</span>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--gray-900)' }}>
                  {hotel.name}
                </h3>

                <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
                  {hotel.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {(hotel.amenities || []).map((amenity, idx) => (
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

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--gray-100)',
                    paddingTop: '16px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', display: 'block' }}>
                      Starting from
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-700)' }}>
                      ${hotel.minPrice || 220}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}> / night</span>
                  </div>

                  <Link
                    to={`/hotels/${hotel._id}${
                      checkInParam ? `?checkIn=${checkInParam}&checkOut=${checkOutParam}&guests=${guestsParam}` : ''
                    }`}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    Select Room <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hotels;
