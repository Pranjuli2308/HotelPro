const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    if (config.email.user && config.email.password) {
      transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
    } else {
      console.warn('Email credentials not configured. Emails will be logged to console.');
      return null;
    }
  }
  return transporter;
};

/**
 * Send an email, falls back to console logging if no transporter
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const mailer = getTransporter();
  
  const mailOptions = {
    from: `"HotelPro" <${config.email.user || 'noreply@hotelpro.com'}>`,
    to,
    subject,
    html,
    text,
  };

  if (!mailer) {
    console.log('📧 Email (not sent - no config):', {
      to: mailOptions.to,
      subject: mailOptions.subject,
    });
    return { success: true, method: 'console' };
  }

  try {
    const info = await mailer.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send booking confirmation email
 */
const sendBookingConfirmation = async (booking, guest, hotel) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Booking Confirmed! ✓</h1>
      </div>
      <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
        <p>Dear <strong>${guest.name}</strong>,</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #dee2e6; color: #6c757d;">Booking Ref</td><td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">${booking.bookingRef}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #dee2e6; color: #6c757d;">Hotel</td><td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${hotel.name}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #dee2e6; color: #6c757d;">Check-in</td><td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${new Date(booking.checkIn).toLocaleDateString()}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #dee2e6; color: #6c757d;">Check-out</td><td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${new Date(booking.checkOut).toLocaleDateString()}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #dee2e6; color: #6c757d;">Total</td><td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">${booking.priceSnapshot.currency} ${booking.priceSnapshot.totalAmount.toLocaleString()}</td></tr>
        </table>
        <p style="color: #6c757d; font-size: 14px;">Thank you for choosing ${hotel.name}. We look forward to welcoming you!</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: guest.email,
    subject: `Booking Confirmed - ${booking.bookingRef} | HotelPro`,
    html,
    text: `Booking ${booking.bookingRef} confirmed at ${hotel.name}. Check-in: ${new Date(booking.checkIn).toLocaleDateString()}, Check-out: ${new Date(booking.checkOut).toLocaleDateString()}. Total: ${booking.priceSnapshot.currency} ${booking.priceSnapshot.totalAmount}`,
  });
};

module.exports = { sendEmail, sendBookingConfirmation };
