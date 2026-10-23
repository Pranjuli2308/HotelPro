const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const operationsRoutes = require('./routes/operationsRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security middleware
app.use(helmet());
const allowedOrigins = [config.clientUrl, 'http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'HotelPro API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/operations', operationsRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler (Express 5 requires named wildcard params)
app.use('{*path}', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🏨 HotelPro Server running in ${config.nodeEnv} mode on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/v1/health\n`);
  });
};

startServer();

module.exports = app;
