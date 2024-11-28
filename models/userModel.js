const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    required: true,
    unique: true,
    match: [/^\+92[0-9]{10}$/, 'Please use a valid Pakistani phone number (e.g., +923001234567)'], // Pakistan phone number validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum password length requirement
  },
}, { timestamps: true }); // Add timestamps to track creation and update times

// Pre-save middleware to generate a unique userId
userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastUser = await this.constructor.findOne().sort({ userId: -1 });
    const lastId = lastUser ? parseInt(lastUser.userId.slice(1)) : 0; // Extract the numeric part of userId
    this.userId = `U${String(lastId + 1).padStart(5, '0')}`; // Generate userId in format U00001, U00002, etc.
  }
  next();
});

// Method to compare input password with hashed password
userSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
