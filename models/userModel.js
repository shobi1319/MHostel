const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'], // Email validation
  },
  phoneNumber: {
    type: String,
    required: true, // Ensure this is set to true
    unique: true,
    match: [/^\+92[0-9]{10}$/, 'Please use a valid Pakistani phone number (e.g., +923001234567)'], // Pakistan phone number validation
  },
});

// Pre-save middleware to generate a unique userId
userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastUser = await this.constructor.findOne().sort({ userId: -1 });
    const lastId = lastUser ? parseInt(lastUser.userId.slice(1)) : 0; // Extract the numeric part of userId
    this.userId = `U${String(lastId + 1).padStart(5, '0')}`; // Generate userId in format U00001, U00002, etc.
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
