const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const AuditLog = require('../models/AuditLog');
const Review = require('../models/Review');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { createAuditLog } = require('../utils/auditLogger');

// ==================== User Management ====================

/**
 * GET /api/v1/admin/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .populate('assignedHotels', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    },
  });
});

/**
 * GET /api/v1/admin/users/:userId
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).populate('assignedHotels', 'name');
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: { user } });
});

/**
 * POST /api/v1/admin/users
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, assignedHotels } = req.body;
  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role: role || 'guest',
    phone,
    assignedHotels: assignedHotels || [],
  });

  await createAuditLog({
    actorId: req.user._id,
    action: 'admin.user_created',
    targetType: 'User',
    targetId: user._id,
    metadata: { role: user.role },
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, data: { user } });
});

/**
 * PUT /api/v1/admin/users/:userId
 */
const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'email', 'role', 'phone', 'status', 'assignedHotels'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.params.userId, updates, {
    new: true,
    runValidators: true,
  }).populate('assignedHotels', 'name');
  if (!user) throw new AppError('User not found', 404);

  await createAuditLog({
    actorId: req.user._id,
    action: 'admin.user_updated',
    targetType: 'User',
    targetId: user._id,
    metadata: { updates: Object.keys(updates) },
    ipAddress: req.ip,
  });

  res.json({ success: true, data: { user } });
});

/**
 * DELETE /api/v1/admin/users/:userId
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.userId);
  if (!user) throw new AppError('User not found', 404);

  await createAuditLog({
    actorId: req.user._id,
    action: 'admin.user_deleted',
    targetType: 'User',
    targetId: user._id,
    ipAddress: req.ip,
  });

  res.json({ success: true, message: 'User deleted' });
});

// ==================== Reports ====================

/**
 * GET /api/v1/admin/reports/occupancy
 */
const getOccupancyReport = asyncHandler(async (req, res) => {
  const { hotelId, startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(endDate) : new Date();

  const matchFilter = {
    status: { $in: ['Confirmed', 'CheckedIn', 'CheckedOut'] },
    checkIn: { $lte: end },
    checkOut: { $gte: start },
  };
  if (hotelId) matchFilter.hotelId = require('mongoose').Types.ObjectId.createFromHexString(hotelId);

  const totalRooms = await Room.countDocuments(hotelId ? { hotelId } : {});
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;

  const bookings = await Booking.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalNights: {
          $sum: {
            $divide: [{ $subtract: ['$checkOut', '$checkIn'] }, 1000 * 60 * 60 * 24],
          },
        },
        totalRevenue: { $sum: '$priceSnapshot.totalAmount' },
      },
    },
  ]);

  const stats = bookings[0] || { totalBookings: 0, totalNights: 0, totalRevenue: 0 };
  const totalRoomNights = totalRooms * totalDays;
  const occupancyRate = totalRoomNights > 0 ? Math.round((stats.totalNights / totalRoomNights) * 100) : 0;

  // Daily breakdown
  const dailyOccupancy = await Booking.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkIn' } },
        bookings: { $sum: 1 },
        revenue: { $sum: '$priceSnapshot.totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        totalRooms,
        totalBookings: stats.totalBookings,
        totalRoomNights: Math.round(stats.totalNights),
        occupancyRate,
        averageDailyRate: stats.totalBookings > 0 ? Math.round(stats.totalRevenue / stats.totalNights) : 0,
        totalRevenue: Math.round(stats.totalRevenue),
      },
      daily: dailyOccupancy,
      period: { start, end },
    },
  });
});

/**
 * GET /api/v1/admin/reports/revenue
 */
const getRevenueReport = asyncHandler(async (req, res) => {
  const { hotelId, startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(endDate) : new Date();

  const matchFilter = {
    status: 'Succeeded',
    createdAt: { $gte: start, $lte: end },
  };

  const revenue = await Payment.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalPayments: { $sum: 1 },
        totalRefunds: { $sum: '$refundAmount' },
      },
    },
  ]);

  const monthlyRevenue = await Payment.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const stats = revenue[0] || { totalRevenue: 0, totalPayments: 0, totalRefunds: 0 };

  res.json({
    success: true,
    data: {
      summary: {
        totalRevenue: Math.round(stats.totalRevenue),
        totalPayments: stats.totalPayments,
        totalRefunds: Math.round(stats.totalRefunds),
        netRevenue: Math.round(stats.totalRevenue - stats.totalRefunds),
      },
      monthly: monthlyRevenue,
      period: { start, end },
    },
  });
});

/**
 * GET /api/v1/admin/reports/dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalUsers,
    totalHotels,
    totalRooms,
    totalBookings,
    todayArrivals,
    todayDepartures,
    activeBookings,
    recentPayments,
  ] = await Promise.all([
    User.countDocuments(),
    Hotel.countDocuments({ status: 'active' }),
    Room.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ checkIn: { $gte: today, $lt: tomorrow }, status: 'Confirmed' }),
    Booking.countDocuments({ checkOut: { $gte: today, $lt: tomorrow }, status: 'CheckedIn' }),
    Booking.countDocuments({ status: { $in: ['Confirmed', 'CheckedIn'] } }),
    Payment.aggregate([
      { $match: { status: 'Succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  // Room status breakdown
  const roomStatusBreakdown = await Room.aggregate([
    { $group: { _id: '$operationalStatus', count: { $sum: 1 } } },
  ]);

  // Booking status breakdown
  const bookingStatusBreakdown = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalHotels,
      totalRooms,
      totalBookings,
      todayArrivals,
      todayDepartures,
      activeBookings,
      totalRevenue: recentPayments[0]?.total || 0,
      roomStatusBreakdown,
      bookingStatusBreakdown,
    },
  });
});

// ==================== Audit Logs ====================

/**
 * GET /api/v1/admin/audit-logs
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const { action, actorId, hotelId, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (action) filter.action = new RegExp(action, 'i');
  if (actorId) filter.actorId = actorId;
  if (hotelId) filter.hotelId = hotelId;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .populate('actorId', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      logs,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    },
  });
});

// ==================== Reviews ====================

/**
 * GET /api/v1/admin/reviews
 */
const getReviews = asyncHandler(async (req, res) => {
  const { hotelId, moderationStatus, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (hotelId) filter.hotelId = hotelId;
  if (moderationStatus) filter.moderationStatus = moderationStatus;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('guestId', 'name')
    .populate('hotelId', 'name')
    .populate('bookingId', 'bookingRef')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: { reviews, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } },
  });
});

/**
 * PATCH /api/v1/admin/reviews/:reviewId
 */
const moderateReview = asyncHandler(async (req, res) => {
  const { moderationStatus } = req.body;
  if (!['approved', 'rejected'].includes(moderationStatus)) {
    throw new AppError('Moderation status must be approved or rejected', 400);
  }

  const review = await Review.findByIdAndUpdate(
    req.params.reviewId,
    { moderationStatus },
    { new: true }
  );
  if (!review) throw new AppError('Review not found', 404);

  res.json({ success: true, data: { review } });
});

module.exports = {
  getUsers, getUser, createUser, updateUser, deleteUser,
  getOccupancyReport, getRevenueReport, getDashboardStats,
  getAuditLogs,
  getReviews, moderateReview,
};
