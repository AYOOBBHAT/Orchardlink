const Farmer = require('../models/Farmer');
const Tree = require('../models/Tree');

async function getFarmers(req, res) {
  try {
    const farmers = await Farmer.find().sort({ name: 1 });
    res.status(200).json(farmers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getFarmerById(req, res) {
  try {
    const { id } = req.params;
    const farmer = await Farmer.findById(id);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    const trees = await Tree.find({ farmer: id }).sort({ treeCode: 1 });
    res.status(200).json({ ...farmer.toObject(), trees });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid farmer id' });
    }
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getFarmers,
  getFarmerById,
};
