const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getUsers, getUser, createUser, updateUser, deleteUser,
  getOccupancyReport, getRevenueReport, getDashboardStats,
  getAuditLogs,
  getReviews, moderateReview,
} = require('../controllers/adminController');

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.get('/users/:userId', getUser);
router.post('/users', createUser);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Reports
router.get('/reports/occupancy', getOccupancyReport);
router.get('/reports/revenue', getRevenueReport);

// Audit logs
router.get('/audit-logs', getAuditLogs);

// Reviews
router.get('/reviews', getReviews);
router.patch('/reviews/:reviewId', moderateReview);

module.exports = router;
