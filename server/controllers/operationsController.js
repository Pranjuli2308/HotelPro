const Booking = require('../models/Booking');
const Room = require('../models/Room');
const ServiceTask = require('../models/ServiceTask');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * POST /api/v1/operations/check-in
 */
const checkIn = asyncHandler(async (req, res) => {
  const { bookingId, roomId } = req.body;

  const booking = await Booking.findById(bookingId)
    .populate('guestId', 'name email')
    .populate('hotelId', 'name');
  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.status !== 'Confirmed') {
    throw new AppError(`Cannot check in booking with status: ${booking.status}`, 400);
  }

  // Verify staff is assigned to this hotel
  if (req.user.role === 'staff') {
    const isAssigned = req.user.assignedHotels.some(
      (h) => h.toString() === booking.hotelId._id.toString()
    );
    if (!isAssigned) throw new AppError('Not authorized for this hotel', 403);
  }

  // Assign room if provided
  if (roomId) {
    const room = await Room.findById(roomId);
    if (!room) throw new AppError('Room not found', 404);
    if (!['Available', 'Reserved'].includes(room.operationalStatus)) {
      throw new AppError(`Room ${room.roomNumber} is not available (${room.operationalStatus})`, 400);
    }
    booking.roomId = roomId;
    room.operationalStatus = 'Occupied';
    await room.save();
  }

  booking.status = 'CheckedIn';
  booking.checkedInAt = new Date();
  booking.checkedInBy = req.user._id;
  await booking.save();

  await createAuditLog({
    actorId: req.user._id,
    hotelId: booking.hotelId._id,
    action: 'booking.checked_in',
    targetType: 'Booking',
    targetId: booking._id,
    metadata: { bookingRef: booking.bookingRef, roomId },
    ipAddress: req.ip,
  });

  res.json({ success: true, message: 'Guest checked in', data: { booking } });
});

/**
 * POST /api/v1/operations/check-out
 */
const checkOut = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId)
    .populate('guestId', 'name email')
    .populate('hotelId', 'name');
  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.status !== 'CheckedIn') {
    throw new AppError(`Cannot check out booking with status: ${booking.status}`, 400);
  }

  // Verify staff is assigned to this hotel
  if (req.user.role === 'staff') {
    const isAssigned = req.user.assignedHotels.some(
      (h) => h.toString() === booking.hotelId._id.toString()
    );
    if (!isAssigned) throw new AppError('Not authorized for this hotel', 403);
  }

  booking.status = 'CheckedOut';
  booking.checkedOutAt = new Date();
  booking.checkedOutBy = req.user._id;
  await booking.save();

  // Update room to Cleaning
  if (booking.roomId) {
    const room = await Room.findById(booking.roomId);
    if (room) {
      room.operationalStatus = 'Cleaning';
      await room.save();

      // Create housekeeping task
      await ServiceTask.create({
        hotelId: booking.hotelId._id,
        roomId: room._id,
        bookingId: booking._id,
        type: 'housekeeping',
        title: `Clean room ${room.roomNumber} after checkout`,
        priority: 'high',
      });
    }
  }

  await createAuditLog({
    actorId: req.user._id,
    hotelId: booking.hotelId._id,
    action: 'booking.checked_out',
    targetType: 'Booking',
    targetId: booking._id,
    metadata: { bookingRef: booking.bookingRef },
    ipAddress: req.ip,
  });

  res.json({ success: true, message: 'Guest checked out', data: { booking } });
});

/**
 * GET /api/v1/operations/arrivals
 */
const getArrivals = asyncHandler(async (req, res) => {
  const { hotelId, date } = req.query;
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const filter = {
    checkIn: { $gte: startOfDay, $lte: endOfDay },
    status: 'Confirmed',
  };

  if (hotelId) {
    filter.hotelId = hotelId;
  } else if (req.user.role === 'staff') {
    filter.hotelId = { $in: req.user.assignedHotels };
  }

  const arrivals = await Booking.find(filter)
    .populate('guestId', 'name email phone')
    .populate('hotelId', 'name')
    .populate('roomTypeId', 'name')
    .populate('roomId', 'roomNumber floor')
    .sort({ checkIn: 1 });

  res.json({ success: true, data: { arrivals } });
});

/**
 * GET /api/v1/operations/departures
 */
const getDepartures = asyncHandler(async (req, res) => {
  const { hotelId, date } = req.query;
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const filter = {
    checkOut: { $gte: startOfDay, $lte: endOfDay },
    status: 'CheckedIn',
  };

  if (hotelId) {
    filter.hotelId = hotelId;
  } else if (req.user.role === 'staff') {
    filter.hotelId = { $in: req.user.assignedHotels };
  }

  const departures = await Booking.find(filter)
    .populate('guestId', 'name email phone')
    .populate('hotelId', 'name')
    .populate('roomTypeId', 'name')
    .populate('roomId', 'roomNumber floor')
    .sort({ checkOut: 1 });

  res.json({ success: true, data: { departures } });
});

// ==================== Service Tasks ====================

/**
 * GET /api/v1/operations/tasks
 */
const getTasks = asyncHandler(async (req, res) => {
  const { hotelId, status, type, assignedTo, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (hotelId) filter.hotelId = hotelId;
  if (req.user.role === 'staff' && !hotelId) {
    filter.hotelId = { $in: req.user.assignedHotels };
  }
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (assignedTo) filter.assignedTo = assignedTo;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await ServiceTask.countDocuments(filter);
  const tasks = await ServiceTask.find(filter)
    .populate('roomId', 'roomNumber floor')
    .populate('assignedTo', 'name')
    .populate('hotelId', 'name')
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      tasks,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    },
  });
});

/**
 * POST /api/v1/operations/tasks
 */
const createTask = asyncHandler(async (req, res) => {
  const task = await ServiceTask.create(req.body);
  res.status(201).json({ success: true, data: { task } });
});

/**
 * PATCH /api/v1/operations/tasks/:taskId
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await ServiceTask.findById(req.params.taskId);
  if (!task) throw new AppError('Task not found', 404);

  const allowedUpdates = ['status', 'assignedTo', 'priority', 'description'];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) task[field] = req.body[field];
  });

  if (req.body.status === 'completed') {
    task.completedAt = new Date();
    task.completedBy = req.user._id;

    // If housekeeping completed, mark room as Available
    if (task.type === 'housekeeping' && task.roomId) {
      const room = await Room.findById(task.roomId);
      if (room && room.operationalStatus === 'Cleaning') {
        room.operationalStatus = 'Available';
        await room.save();
      }
    }
  }

  await task.save();
  res.json({ success: true, data: { task } });
});

module.exports = {
  checkIn,
  checkOut,
  getArrivals,
  getDepartures,
  getTasks,
  createTask,
  updateTask,
};
