const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    targetType: {
      type: String,
      trim: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    outcome: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ actorId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ hotelId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
