const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

/**
 * Authenticate user via JWT access token in Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or token invalid.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended or deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    next(error);
  }
};

/**
 * Optional authentication - sets req.user if token is valid, but doesn't fail
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
    if (user && user.status === 'active') {
      req.user = user;
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};

/**
 * Authorize by role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
};

/**
 * Check if staff is assigned to the given hotel
 */
const authorizeHotelAccess = async (req, res, next) => {
  if (req.user.role === 'admin') return next();

  const hotelId = req.params.hotelId || req.body.hotelId;
  if (!hotelId) return next();

  if (req.user.role === 'staff') {
    const isAssigned = req.user.assignedHotels.some(
      (h) => h.toString() === hotelId.toString()
    );
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this hotel.',
      });
    }
  }

  next();
};

module.exports = { authenticate, optionalAuth, authorize, authorizeHotelAccess };
