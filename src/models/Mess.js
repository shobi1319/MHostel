const mongoose = require('mongoose');

const messSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  breakfast: { type: Number, default: 1 }, // 1 for on, 0 for off
  dinner: { type: Number, default: 1 }, // 1 for on, 0 for off
});

module.exports = mongoose.model('Mess', messSchema);
