const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  /** Farmer account (User); one orchard profile per farmer user when set */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,
    unique: true,
  },
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
