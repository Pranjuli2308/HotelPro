const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { createAuditLog } = require('../utils/auditLogger');
const { sendBookingConfirmation } = require('../services/emailService');

/**
 * Check room type availability for given dates
 */
const checkAvailability = async (hotelId, roomTypeId, checkIn, checkOut) => {
  // Count total physical rooms of this type
  const totalRooms = await Room.countDocuments({
    hotelId,
    roomTypeId,
    operationalStatus: { $nin: ['Maintenance', 'OutOfService'] },
  });

  // Count overlapping active bookings
  const overlapping = await Booking.countDocuments({
    hotelId,
    roomTypeId,
    status: { $in: ['Confirmed', 'CheckedIn', 'PendingPayment'] },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  });

  return {
    totalRooms,
    bookedRooms: overlapping,
    availableRooms: Math.max(0, totalRooms - overlapping),
    isAvailable: totalRooms - overlapping > 0,
  };
};

/**
 * GET /api/v1/availability
 * Search availability across hotel room types
 */
const searchAvailability = asyncHandler(async (req, res) => {
  const { hotelId, checkIn, checkOut, adults = 1, children = 0 } = req.query;

  if (!checkIn || !checkOut) {
    throw new AppError('Check-in and check-out dates are required', 400);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkOutDate <= checkInDate) {
    throw new AppError('Check-out must be after check-in', 400);
  }

  if (checkInDate < new Date().setHours(0, 0, 0, 0)) {
    throw new AppError('Check-in date cannot be in the past', 400);
  }

  const filter = { status: 'active' };
  if (hotelId) filter.hotelId = hotelId;

  const roomTypes = await RoomType.find(filter).populate('hotelId', 'name address taxRate currency');

  const results = [];
  for (const rt of roomTypes) {
    // Check capacity
    if (rt.capacity.adults < parseInt(adults)) continue;

    const availability = await checkAvailability(
      rt.hotelId._id || rt.hotelId,
      rt._id,
      checkIn,
      checkOut
    );

    if (availability.isAvailable) {
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const hotel = rt.hotelId;
      const subtotal = rt.baseRate * nights;
      const taxRate = hotel.taxRate || 0;
      const taxAmount = Math.round((subtotal * taxRate) / 100);
      const totalAmount = subtotal + taxAmount;

      results.push({
        roomType: rt,
        hotel: {
          _id: hotel._id,
          name: hotel.name,
          address: hotel.address,
          currency: hotel.currency,
        },
        availability: availability.availableRooms,
        pricing: {
          nightlyRate: rt.baseRate,
          numberOfNights: nights,
          subtotal,
          taxRate,
          taxAmount,
          totalAmount,
          currency: hotel.currency || 'INR',
        },
      });
    }
  }

  res.json({
    success: true,
    data: {
      results,
      searchParams: { checkIn, checkOut, adults, children },
    },
  });
});

/**
 * POST /api/v1/bookings
 */
const createBooking = asyncHandler(async (req, res) => {
  const { hotelId, roomTypeId, checkIn, checkOut, guests, specialRequests } = req.body;

  // Validate hotel and room type
  const hotel = await Hotel.findById(hotelId);
  if (!hotel || hotel.status !== 'active') {
    throw new AppError('Hotel not found or inactive', 404);
  }

  const roomType = await RoomType.findById(roomTypeId);
  if (!roomType || roomType.status !== 'active') {
    throw new AppError('Room type not found or inactive', 404);
  }

  // Validate dates
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (checkOutDate <= checkInDate) {
    throw new AppError('Check-out must be after check-in', 400);
  }

  // Server-side availability recheck (FR-009)
  const availability = await checkAvailability(hotelId, roomTypeId, checkIn, checkOut);
  if (!availability.isAvailable) {
    throw new AppError('No rooms available for the selected dates', 409);
  }

  // Server-side price calculation (FR-007)
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const subtotal = roomType.baseRate * nights;
  const taxRate = hotel.taxRate || 0;
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const totalAmount = subtotal + taxAmount;

  const booking = await Booking.create({
    guestId: req.user._id,
    hotelId,
    roomTypeId,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: {
      adults: guests?.adults || 1,
      children: guests?.children || 0,
    },
    priceSnapshot: {
      nightlyRate: roomType.baseRate,
      numberOfNights: nights,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      currency: hotel.currency || 'INR',
    },
    cancellationPolicySnapshot: {
      cancellationHours: hotel.policies?.cancellationHours || 24,
      cancellationFeePercent: hotel.policies?.cancellationFeePercent || 0,
    },
    specialRequests,
    status: 'PendingPayment',
  });

  await booking.populate([
    { path: 'hotelId', select: 'name address' },
    { path: 'roomTypeId', select: 'name' },
  ]);

  await createAuditLog({
    actorId: req.user._id,
    hotelId,
    action: 'booking.created',
    targetType: 'Booking',
    targetId: booking._id,
    metadata: { bookingRef: booking.bookingRef },
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, data: { booking } });
});

/**
 * GET /api/v1/bookings/me
 */
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { guestId: req.user._id };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('hotelId', 'name address images')
    .populate('roomTypeId', 'name images bedType')
    .populate('roomId', 'roomNumber floor')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      bookings,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    },
  });
});

/**
 * GET /api/v1/bookings/:bookingId
 */
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId)
    .populate('hotelId', 'name address contact policies')
    .populate('roomTypeId', 'name amenities images bedType capacity')
    .populate('roomId', 'roomNumber floor')
    .populate('guestId', 'name email phone');

  if (!booking) throw new AppError('Booking not found', 404);

  // Access control: guest can only see own bookings
  if (req.user.role === 'guest' && booking.guestId._id.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  // Staff can only see bookings from assigned hotels
  if (req.user.role === 'staff') {
    const isAssigned = req.user.assignedHotels.some(
      (h) => h.toString() === booking.hotelId._id.toString()
    );
    if (!isAssigned) throw new AppError('Access denied', 403);
  }

  res.json({ success: true, data: { booking } });
});

/**
 * GET /api/v1/bookings (Admin/Staff)
 */
const getAllBookings = asyncHandler(async (req, res) => {
  const { hotelId, status, guestId, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (req.user.role === 'staff') {
    filter.hotelId = { $in: req.user.assignedHotels };
  }
  if (hotelId) filter.hotelId = hotelId;
  if (status) filter.status = status;
  if (guestId) filter.guestId = guestId;
  if (search) filter.bookingRef = new RegExp(search, 'i');

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('hotelId', 'name')
    .populate('roomTypeId', 'name')
    .populate('roomId', 'roomNumber')
    .populate('guestId', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      bookings,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    },
  });
});

/**
 * PATCH /api/v1/bookings/:bookingId
 */
const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw new AppError('Booking not found', 404);

  // Guest can only modify own pending/confirmed bookings
  if (req.user.role === 'guest') {
    if (booking.guestId.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }
    if (!['PendingPayment', 'Confirmed'].includes(booking.status)) {
      throw new AppError('Booking cannot be modified in its current status', 400);
    }
  }

  const allowedFields = ['specialRequests', 'guests'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // Admin/staff can update more fields
  if (['admin', 'staff'].includes(req.user.role)) {
    if (req.body.status) updates.status = req.body.status;
    if (req.body.roomId) updates.roomId = req.body.roomId;
  }

  Object.assign(booking, updates);
  await booking.save();

  res.json({ success: true, data: { booking } });
});

/**
 * POST /api/v1/bookings/:bookingId/cancel
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw new AppError('Booking not found', 404);

  // Guest access check
  if (req.user.role === 'guest' && booking.guestId.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  if (['Cancelled', 'CheckedOut', 'CheckedIn'].includes(booking.status)) {
    throw new AppError(`Cannot cancel a booking with status: ${booking.status}`, 400);
  }

  booking.status = 'Cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationReason = req.body.reason || 'Cancelled by user';
  await booking.save();

  await createAuditLog({
    actorId: req.user._id,
    hotelId: booking.hotelId,
    action: 'booking.cancelled',
    targetType: 'Booking',
    targetId: booking._id,
    metadata: { bookingRef: booking.bookingRef, reason: booking.cancellationReason },
    ipAddress: req.ip,
  });

  res.json({ success: true, message: 'Booking cancelled', data: { booking } });
});

module.exports = {
  searchAvailability,
  createBooking,
  getMyBookings,
  getBooking,
  getAllBookings,
  updateBooking,
  cancelBooking,
};
