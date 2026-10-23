const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getRoomType, updateRoomType, deleteRoomType,
  getRoom, updateRoom, deleteRoom, updateRoomStatus,
} = require('../controllers/hotelController');

// Room type routes
router.get('/types/:roomTypeId', getRoomType);
router.put('/types/:roomTypeId', authenticate, authorize('admin'), updateRoomType);
router.delete('/types/:roomTypeId', authenticate, authorize('admin'), deleteRoomType);

// Room routes
router.get('/:roomId', getRoom);
router.put('/:roomId', authenticate, authorize('admin'), updateRoom);
router.delete('/:roomId', authenticate, authorize('admin'), deleteRoom);
router.patch('/:roomId/status', authenticate, authorize('staff', 'admin'), updateRoomStatus);

module.exports = router;
