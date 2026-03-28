const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  totalTrees: {
    type: Number,
    default: 0,
  },
  // Cloudinary URL — farmer profile photo
  image: {
    type: String,
  },
});

module.exports = mongoose.model('Farmer', farmerSchema);
