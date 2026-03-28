const mongoose = require('mongoose');

const treeSchema = new mongoose.Schema({
  // Orchard profile (public listing: name, location, etc.)
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
  },
  // Farmer User who listed this tree (role must be 'farmer')
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  treeCode: {
    type: String,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  expectedYield: {
    type: String,
  },
  status: {
    type: String,
    enum: ['growing', 'fruiting', 'ready', 'delivered'],
    default: 'growing',
  },
  // Adopter User who adopted this tree (set on adopt)
  adoptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  images: {
    type: [String],
    default: () => [],
  },
});

module.exports = mongoose.model('Tree', treeSchema);
