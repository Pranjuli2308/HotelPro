const { body, param, query, validationResult } = require('express-validator');

/**
 * Process validation result and return 400 if errors exist
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validators
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Booking validators
const bookingValidation = [
  body('hotelId').isMongoId().withMessage('Valid hotel ID is required'),
  body('roomTypeId').isMongoId().withMessage('Valid room type ID is required'),
  body('checkIn').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOut').isISO8601().withMessage('Valid check-out date is required'),
  body('guests.adults').optional().isInt({ min: 1 }).withMessage('At least 1 adult guest required'),
  body('guests.children').optional().isInt({ min: 0 }).withMessage('Children count must be 0 or more'),
  validate,
];

// ID param validator
const mongoIdParam = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Valid ${paramName} is required`),
  validate,
];

// Pagination query validator
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  bookingValidation,
  mongoIdParam,
  paginationValidation,
};
