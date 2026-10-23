const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    provider: {
      type: String,
      enum: ['razorpay', 'manual'],
      default: 'razorpay',
    },
    providerOrderId: {
      type: String,
    },
    providerPaymentId: {
      type: String,
    },
    providerSignature: {
      type: String,
      select: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: [
        'Initiated',
        'Pending',
        'Succeeded',
        'Failed',
        'RefundPending',
        'PartiallyRefunded',
        'Refunded',
      ],
      default: 'Initiated',
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ providerOrderId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
