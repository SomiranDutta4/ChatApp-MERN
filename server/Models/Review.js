const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: String,
    enum: ['Excellent', 'Good', 'Okay', 'Poor', 'Terrible'],
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String, // e.g., 'video', 'chat', etc. (optional)
    default: 'general'
  }
});

module.exports = mongoose.model('Review', reviewSchema);
