const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      unique: true,
      default: () => `HP-${uuidv4().slice(0, 8).toUpperCase()}`,
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    guests: {
      adults: { type: Number, required: true, min: 1, default: 1 },
      children: { type: Number, default: 0, min: 0 },
    },
    priceSnapshot: {
      nightlyRate: { type: Number, required: true },
      numberOfNights: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      taxRate: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    cancellationPolicySnapshot: {
      cancellationHours: { type: Number },
      cancellationFeePercent: { type: Number },
    },
    status: {
      type: String,
      enum: [
        'PendingPayment',
        'Confirmed',
        'CheckedIn',
        'CheckedOut',
        'CancellationRequested',
        'Cancelled',
        'PaymentFailed',
        'NoShow',
      ],
      default: 'PendingPayment',
    },
    specialRequests: {
      type: String,
      maxlength: 500,
    },
    checkedInAt: { type: Date },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkedOutAt: { type: Date },
    checkedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.index({ guestId: 1, status: 1 });
bookingSchema.index({ hotelId: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ bookingRef: 1 });
bookingSchema.index({ hotelId: 1, roomTypeId: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });

// Validate check-out is after check-in
bookingSchema.pre('validate', function (next) {
  if (this.checkOut <= this.checkIn) {
    this.invalidate('checkOut', 'Check-out must be after check-in date');
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
