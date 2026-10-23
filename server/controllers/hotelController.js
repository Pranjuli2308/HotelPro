const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { createAuditLog } = require('../utils/auditLogger');

// ==================== Hotels ====================

/**
 * GET /api/v1/hotels
 */
const getHotels = asyncHandler(async (req, res) => {
  const { city, search, status, page = 1, limit = 10 } = req.query;
  const filter = {};

  // Public users can only see active hotels
  if (!req.user || req.user.role !== 'admin') {
    filter.status = 'active';
  } else if (status) {
    filter.status = status;
  }

  if (city) {
    filter['address.city'] = new RegExp(city, 'i');
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Hotel.countDocuments(filter);
  const hotels = await Hotel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      hotels,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    },
  });
});

/**
 * GET /api/v1/hotels/:hotelId
 */
const getHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.hotelId);
  if (!hotel) throw new AppError('Hotel not found', 404);

  // Non-admin can only see active hotels
  if ((!req.user || req.user.role !== 'admin') && hotel.status !== 'active') {
    throw new AppError('Hotel not found', 404);
  }

  res.json({ success: true, data: { hotel } });
});

/**
 * POST /api/v1/hotels (Admin)
 */
const createHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await createAuditLog({
    actorId: req.user._id,
    action: 'hotel.created',
    targetType: 'Hotel',
    targetId: hotel._id,
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, data: { hotel } });
});

/**
 * PUT /api/v1/hotels/:hotelId (Admin)
 */
const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByIdAndUpdate(req.params.hotelId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!hotel) throw new AppError('Hotel not found', 404);

  await createAuditLog({
    actorId: req.user._id,
    hotelId: hotel._id,
    action: 'hotel.updated',
    targetType: 'Hotel',
    targetId: hotel._id,
    ipAddress: req.ip,
  });

  res.json({ success: true, data: { hotel } });
});

/**
 * DELETE /api/v1/hotels/:hotelId (Admin)
 */
const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByIdAndDelete(req.params.hotelId);
  if (!hotel) throw new AppError('Hotel not found', 404);

  await createAuditLog({
    actorId: req.user._id,
    action: 'hotel.deleted',
    targetType: 'Hotel',
    targetId: hotel._id,
    ipAddress: req.ip,
  });

  res.json({ success: true, message: 'Hotel deleted' });
});

// ==================== Room Types ====================

/**
 * GET /api/v1/hotels/:hotelId/room-types
 */
const getRoomTypes = asyncHandler(async (req, res) => {
  const filter = { hotelId: req.params.hotelId };
  if (!req.user || req.user.role === 'guest') {
    filter.status = 'active';
  }

  const roomTypes = await RoomType.find(filter).sort({ baseRate: 1 });
  res.json({ success: true, data: { roomTypes } });
});

/**
 * GET /api/v1/room-types/:roomTypeId
 */
const getRoomType = asyncHandler(async (req, res) => {
  const roomType = await RoomType.findById(req.params.roomTypeId).populate('hotelId', 'name address');
  if (!roomType) throw new AppError('Room type not found', 404);
  res.json({ success: true, data: { roomType } });
});

/**
 * POST /api/v1/hotels/:hotelId/room-types (Admin)
 */
const createRoomType = asyncHandler(async (req, res) => {
  const roomType = await RoomType.create({
    ...req.body,
    hotelId: req.params.hotelId,
  });

  await createAuditLog({
    actorId: req.user._id,
    hotelId: req.params.hotelId,
    action: 'roomType.created',
    targetType: 'RoomType',
    targetId: roomType._id,
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, data: { roomType } });
});

/**
 * PUT /api/v1/room-types/:roomTypeId (Admin)
 */
const updateRoomType = asyncHandler(async (req, res) => {
  const roomType = await RoomType.findByIdAndUpdate(req.params.roomTypeId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!roomType) throw new AppError('Room type not found', 404);
  res.json({ success: true, data: { roomType } });
});

/**
 * DELETE /api/v1/room-types/:roomTypeId (Admin)
 */
const deleteRoomType = asyncHandler(async (req, res) => {
  const roomType = await RoomType.findByIdAndDelete(req.params.roomTypeId);
  if (!roomType) throw new AppError('Room type not found', 404);
  res.json({ success: true, message: 'Room type deleted' });
});

// ==================== Rooms ====================

/**
 * GET /api/v1/hotels/:hotelId/rooms
 */
const getRooms = asyncHandler(async (req, res) => {
  const { roomTypeId, status: opStatus, page = 1, limit = 50 } = req.query;
  const filter = { hotelId: req.params.hotelId };
  if (roomTypeId) filter.roomTypeId = roomTypeId;
  if (opStatus) filter.operationalStatus = opStatus;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Room.countDocuments(filter);
  const rooms = await Room.find(filter)
    .populate('roomTypeId', 'name baseRate')
    .sort({ floor: 1, roomNumber: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      rooms,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    },
  });
});

/**
 * GET /api/v1/rooms/:roomId
 */
const getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.roomId)
    .populate('roomTypeId')
    .populate('hotelId', 'name address');
  if (!room) throw new AppError('Room not found', 404);
  res.json({ success: true, data: { room } });
});

/**
 * POST /api/v1/hotels/:hotelId/rooms (Admin)
 */
const createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create({
    ...req.body,
    hotelId: req.params.hotelId,
  });

  await createAuditLog({
    actorId: req.user._id,
    hotelId: req.params.hotelId,
    action: 'room.created',
    targetType: 'Room',
    targetId: room._id,
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, data: { room } });
});

/**
 * PUT /api/v1/rooms/:roomId (Admin)
 */
const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.roomId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!room) throw new AppError('Room not found', 404);
  res.json({ success: true, data: { room } });
});

/**
 * DELETE /api/v1/rooms/:roomId (Admin)
 */
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndDelete(req.params.roomId);
  if (!room) throw new AppError('Room not found', 404);
  res.json({ success: true, message: 'Room deleted' });
});

/**
 * PATCH /api/v1/rooms/:roomId/status (Staff/Admin)
 */
const updateRoomStatus = asyncHandler(async (req, res) => {
  const { operationalStatus } = req.body;
  const validStatuses = ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance', 'OutOfService'];
  if (!validStatuses.includes(operationalStatus)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const room = await Room.findById(req.params.roomId);
  if (!room) throw new AppError('Room not found', 404);

  const oldStatus = room.operationalStatus;
  room.operationalStatus = operationalStatus;
  await room.save();

  await createAuditLog({
    actorId: req.user._id,
    hotelId: room.hotelId,
    action: 'room.status_changed',
    targetType: 'Room',
    targetId: room._id,
    metadata: { from: oldStatus, to: operationalStatus },
    ipAddress: req.ip,
  });

  res.json({ success: true, data: { room } });
});

module.exports = {
  getHotels, getHotel, createHotel, updateHotel, deleteHotel,
  getRoomTypes, getRoomType, createRoomType, updateRoomType, deleteRoomType,
  getRooms, getRoom, createRoom, updateRoom, deleteRoom, updateRoomStatus,
};
