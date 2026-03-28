const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  tree: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  // Cloudinary URL — optional photo for this update
  image: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Update', updateSchema);
