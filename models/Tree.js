const mongoose = require('mongoose');

const treeSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
  },
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
  adoptedBy: {
    type: String,
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
