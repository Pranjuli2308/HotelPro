const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createPaymentOrder, verifyPayment, handleWebhook, getPaymentsByBooking, getAllPayments,
} = require('../controllers/paymentController');

// Create payment order
router.post('/create-order', authenticate, createPaymentOrder);

// Verify payment
router.post('/verify', authenticate, verifyPayment);

// Razorpay webhook (no auth, uses signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Get payments for a booking
router.get('/booking/:bookingId', authenticate, getPaymentsByBooking);

// Admin: all payments
router.get('/', authenticate, authorize('admin'), getAllPayments);

module.exports = router;
