const mongoose = require('mongoose');

// Define the Manager Schema
const managerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['manager'], // Roles can be warden, cook, or student
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash the password before saving the manager data
const bcrypt = require('bcrypt');
managerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
   
  
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
managerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Create the model
const Manager = mongoose.model('managers', managerSchema);

module.exports = Manager;
