const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { bookingValidation } = require('../middleware/validators');
const {
  searchAvailability, createBooking, getMyBookings, getBooking,
  getAllBookings, updateBooking, cancelBooking,
} = require('../controllers/bookingController');

// Search availability (public or authenticated)
router.get('/availability', searchAvailability);

// Guest booking routes
router.post('/', authenticate, authorize('guest'), bookingValidation, createBooking);
router.get('/me', authenticate, getMyBookings);

// Admin/Staff all bookings
router.get('/all', authenticate, authorize('staff', 'admin'), getAllBookings);

// Specific booking
router.get('/:bookingId', authenticate, getBooking);
router.patch('/:bookingId', authenticate, updateBooking);
router.post('/:bookingId/cancel', authenticate, cancelBooking);

module.exports = router;
