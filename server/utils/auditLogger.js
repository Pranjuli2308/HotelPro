const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 */
const createAuditLog = async ({
  actorId,
  hotelId,
  action,
  targetType,
  targetId,
  outcome = 'success',
  metadata = {},
  ipAddress,
}) => {
  try {
    // Redact sensitive fields from metadata
    const safeMetadata = { ...metadata };
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'refreshToken', 'secret', 'cvv', 'cardNumber'];
    sensitiveKeys.forEach((key) => {
      if (safeMetadata[key]) safeMetadata[key] = '[REDACTED]';
    });

    await AuditLog.create({
      actorId,
      hotelId,
      action,
      targetType,
      targetId,
      outcome,
      metadata: safeMetadata,
      ipAddress,
    });
  } catch (error) {
    console.error('Audit log creation failed:', error.message);
    // Don't throw - audit log failure shouldn't break the main operation
  }
};

module.exports = { createAuditLog };
