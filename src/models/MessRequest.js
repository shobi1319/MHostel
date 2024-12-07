const mongoose = require('mongoose');

const messRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'dinner', 'both'], // Options for which meal to turn off
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'], // Status of the request
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MessRequest = mongoose.model('MessRequest', messRequestSchema);
module.exports = MessRequest;
