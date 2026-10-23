const { createModel } = require('./BaseModel');
const bcrypt = require('bcryptjs');

const User = createModel('users', {
  jsonFields: ['assignedHotels'],
  defaults: {
    role: 'guest',
    phone: '',
    avatar: '',
    status: 'active',
    assignedHotels: '[]',
  },
});

// Override create to hash password
const originalCreate = User.create;
User.create = (data) => {
  if (data.passwordHash) {
    const salt = bcrypt.genSaltSync(12);
    data.passwordHash = bcrypt.hashSync(data.passwordHash, salt);
  }
  return originalCreate(data);
};

// Add password comparison
User.comparePassword = (candidatePassword, hash) => {
  return bcrypt.compareSync(candidatePassword, hash);
};

// findOne with +passwordHash support (select flag simulation)
User.findByEmail = (email) => {
  const { getDB } = require('../config/db');
  const db = getDB();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  return row || null;
};

// Convert to JSON (remove sensitive fields)
User.toJSON = (user) => {
  if (!user) return null;
  const obj = { ...user };
  delete obj.passwordHash;
  delete obj.refreshToken;
  // Parse assignedHotels if string
  if (typeof obj.assignedHotels === 'string') {
    try { obj.assignedHotels = JSON.parse(obj.assignedHotels); } catch { obj.assignedHotels = []; }
  }
  return obj;
};

module.exports = User;
