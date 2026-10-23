const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
  const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
};

/**
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: password,
    phone,
    role: 'guest', // Public registration is always guest
  });

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Store refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  await createAuditLog({
    actorId: user._id,
    action: 'user.register',
    targetType: 'User',
    targetId: user._id,
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    },
  });
});

/**
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status !== 'active') {
    throw new AppError('Account is suspended or deactivated', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await createAuditLog({
      actorId: user._id,
      action: 'user.login_failed',
      targetType: 'User',
      targetId: user._id,
      outcome: 'failure',
      ipAddress: req.ip,
    });
    throw new AppError('Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  await createAuditLog({
    actorId: user._id,
    action: 'user.login',
    targetType: 'User',
    targetId: user._id,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    },
  });
});

/**
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  await createAuditLog({
    actorId: req.user._id,
    action: 'user.logout',
    targetType: 'User',
    targetId: req.user._id,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * POST /api/v1/auth/refresh
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError('Refresh token required', 400);
  }

  const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

/**
 * GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('assignedHotels', 'name');
  res.json({
    success: true,
    data: { user },
  });
});

/**
 * PUT /api/v1/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'avatar'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: 'Profile updated',
    data: { user },
  });
});

/**
 * PUT /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+passwordHash');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.passwordHash = newPassword;
  await user.save();

  await createAuditLog({
    actorId: req.user._id,
    action: 'user.password_changed',
    targetType: 'User',
    targetId: req.user._id,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  updateProfile,
  changePassword,
};
