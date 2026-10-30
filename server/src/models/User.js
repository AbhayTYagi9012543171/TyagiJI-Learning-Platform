const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student', index: true },
  avatarUrl: { type: String, default: '/default-avatar.png' },
  bio: { type: String, maxlength: 500 },
  settings: {
    emailNotifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' }
  },
  refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);