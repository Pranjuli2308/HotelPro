const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config');

let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpayInstance;
};

/**
 * Create a Razorpay order
 */
const createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const razorpay = getRazorpay();
  const options = {
    amount: Math.round(amount * 100), // Razorpay expects amount in paise
    currency,
    receipt,
    notes,
  };

  const order = await razorpay.orders.create(options);
  return order;
};

/**
 * Verify payment signature from Razorpay
 */
const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Verify webhook signature
 */
const verifyWebhookSignature = (body, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Fetch payment details from Razorpay
 */
const fetchPayment = async (paymentId) => {
  const razorpay = getRazorpay();
  return razorpay.payments.fetch(paymentId);
};

/**
 * Initiate a refund
 */
const initiateRefund = async (paymentId, amount, notes = {}) => {
  const razorpay = getRazorpay();
  return razorpay.payments.refund(paymentId, {
    amount: Math.round(amount * 100),
    notes,
  });
};

module.exports = {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchPayment,
  initiateRefund,
};
