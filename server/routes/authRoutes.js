const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validators');
const {
  register, login, logout, refreshAccessToken, getMe, updateProfile, changePassword,
} = require('../controllers/authController');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
