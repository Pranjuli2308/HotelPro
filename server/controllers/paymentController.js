const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { createAuditLog } = require('../utils/auditLogger');
const paymentService = require('../services/paymentService');
const { sendBookingConfirmation } = require('../services/emailService');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/v1/payments/create-order
 * Create a Razorpay order for a booking
 */
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.guestId.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  if (booking.status !== 'PendingPayment') {
    throw new AppError('Booking is not pending payment', 400);
  }

  // Check for existing initiated payment
  let payment = await Payment.findOne({
    bookingId,
    status: { $in: ['Initiated', 'Pending'] },
  });

  if (payment && payment.providerOrderId) {
    // Return existing order
    return res.json({
      success: true,
      data: {
        orderId: payment.providerOrderId,
        amount: payment.amount,
        currency: payment.currency,
        paymentId: payment._id,
      },
    });
  }

  const idempotencyKey = `pay_${bookingId}_${uuidv4()}`;

  try {
    const order = await paymentService.createOrder({
      amount: booking.priceSnapshot.totalAmount,
      currency: booking.priceSnapshot.currency || 'INR',
      receipt: booking.bookingRef,
      notes: {
        bookingId: booking._id.toString(),
        bookingRef: booking.bookingRef,
        guestId: req.user._id.toString(),
      },
    });

    payment = await Payment.create({
      bookingId,
      provider: 'razorpay',
      providerOrderId: order.id,
      amount: booking.priceSnapshot.totalAmount,
      currency: booking.priceSnapshot.currency || 'INR',
      status: 'Initiated',
      idempotencyKey,
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id,
      },
    });
  } catch (error) {
    // If Razorpay is not configured, simulate for development
    if (error.statusCode === 401 || error.message?.includes('unauthorized')) {
      payment = await Payment.create({
        bookingId,
        provider: 'razorpay',
        providerOrderId: `order_dev_${Date.now()}`,
        amount: booking.priceSnapshot.totalAmount,
        currency: booking.priceSnapshot.currency || 'INR',
        status: 'Initiated',
        idempotencyKey,
      });

      res.json({
        success: true,
        data: {
          orderId: payment.providerOrderId,
          amount: booking.priceSnapshot.totalAmount * 100,
          currency: booking.priceSnapshot.currency || 'INR',
          paymentId: payment._id,
          devMode: true,
        },
      });
    } else {
      throw error;
    }
  }
});

/**
 * POST /api/v1/payments/verify
 * Verify Razorpay payment signature and confirm booking
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId, bookingId } = req.body;

  const payment = await Payment.findOne({
    $or: [
      { _id: paymentId },
      { providerOrderId: razorpay_order_id },
    ],
  });

  if (!payment) throw new AppError('Payment not found', 404);

  // Dev mode: auto-verify
  if (payment.providerOrderId.startsWith('order_dev_')) {
    payment.status = 'Succeeded';
    payment.providerPaymentId = `pay_dev_${Date.now()}`;
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    if (booking && booking.status === 'PendingPayment') {
      booking.status = 'Confirmed';
      await booking.save();

      // Send confirmation email
      try {
        const guest = await User.findById(booking.guestId);
        const hotel = await Hotel.findById(booking.hotelId);
        if (guest && hotel) {
          await sendBookingConfirmation(booking, guest, hotel);
        }
      } catch (emailError) {
        console.error('Email send failed:', emailError.message);
      }
    }

    return res.json({
      success: true,
      message: 'Payment verified (dev mode)',
      data: { payment, booking },
    });
  }

  // Production verification
  const isValid = paymentService.verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!isValid) {
    payment.status = 'Failed';
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.status = 'PaymentFailed';
      await booking.save();
    }

    throw new AppError('Payment verification failed', 400);
  }

  payment.status = 'Succeeded';
  payment.providerPaymentId = razorpay_payment_id;
  payment.providerSignature = razorpay_signature;
  await payment.save();

  const booking = await Booking.findById(payment.bookingId);
  if (booking && booking.status === 'PendingPayment') {
    booking.status = 'Confirmed';
    await booking.save();

    // Send confirmation email
    try {
      const guest = await User.findById(booking.guestId);
      const hotel = await Hotel.findById(booking.hotelId);
      if (guest && hotel) {
        await sendBookingConfirmation(booking, guest, hotel);
      }
    } catch (emailError) {
      console.error('Email send failed:', emailError.message);
    }
  }

  await createAuditLog({
    actorId: req.user._id,
    hotelId: booking?.hotelId,
    action: 'payment.verified',
    targetType: 'Payment',
    targetId: payment._id,
    metadata: { bookingRef: booking?.bookingRef },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Payment verified successfully',
    data: { payment, booking },
  });
});

/**
 * POST /api/v1/payments/webhook
 * Handle Razorpay webhook events
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  // Verify webhook signature
  if (signature) {
    const isValid = paymentService.verifyWebhookSignature(body, signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (event === 'payment.captured') {
    const orderId = payload.payment.entity.order_id;
    const paymentId = payload.payment.entity.id;

    const payment = await Payment.findOne({ providerOrderId: orderId });
    if (payment && payment.status !== 'Succeeded') {
      payment.status = 'Succeeded';
      payment.providerPaymentId = paymentId;
      await payment.save();

      const booking = await Booking.findById(payment.bookingId);
      if (booking && booking.status === 'PendingPayment') {
        booking.status = 'Confirmed';
        await booking.save();
      }
    }
  }

  if (event === 'payment.failed') {
    const orderId = payload.payment.entity.order_id;
    const payment = await Payment.findOne({ providerOrderId: orderId });
    if (payment) {
      payment.status = 'Failed';
      await payment.save();

      const booking = await Booking.findById(payment.bookingId);
      if (booking && booking.status === 'PendingPayment') {
        booking.status = 'PaymentFailed';
        await booking.save();
      }
    }
  }

  res.json({ success: true });
});

/**
 * GET /api/v1/payments/booking/:bookingId
 */
const getPaymentsByBooking = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ bookingId: req.params.bookingId }).sort({ createdAt: -1 });
  res.json({ success: true, data: { payments } });
});

/**
 * GET /api/v1/payments (Admin)
 */
const getAllPayments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .populate({
      path: 'bookingId',
      select: 'bookingRef guestId hotelId',
      populate: [
        { path: 'guestId', select: 'name email' },
        { path: 'hotelId', select: 'name' },
      ],
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      payments,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    },
  });
});

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentsByBooking,
  getAllPayments,
};
