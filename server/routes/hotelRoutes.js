const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const {
  getHotels, getHotel, createHotel, updateHotel, deleteHotel,
  getRoomTypes, getRoomType, createRoomType, updateRoomType, deleteRoomType,
  getRooms, getRoom, createRoom, updateRoom, deleteRoom, updateRoomStatus,
} = require('../controllers/hotelController');

// Public hotel routes
router.get('/', optionalAuth, getHotels);
router.get('/:hotelId', optionalAuth, getHotel);

// Hotel admin routes
router.post('/', authenticate, authorize('admin'), createHotel);
router.put('/:hotelId', authenticate, authorize('admin'), updateHotel);
router.delete('/:hotelId', authenticate, authorize('admin'), deleteHotel);

// Room types
router.get('/:hotelId/room-types', optionalAuth, getRoomTypes);
router.post('/:hotelId/room-types', authenticate, authorize('admin'), createRoomType);

// Rooms
router.get('/:hotelId/rooms', optionalAuth, getRooms);
router.post('/:hotelId/rooms', authenticate, authorize('admin'), createRoom);

module.exports = router;
