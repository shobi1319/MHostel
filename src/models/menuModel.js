const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
  },
  meals: {
    breakfast: { type: String, required: true },
    dinner: { type: String, required: true },
  },
}, { collection: 'menu' }); // Explicitly set the collection name

module.exports = mongoose.model('Menu', menuSchema);
