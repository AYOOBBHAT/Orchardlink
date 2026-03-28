const Tree = require('../models/Tree');
const Update = require('../models/Update');

async function createUpdate(req, res) {
  try {
    const { treeId, message, image } = req.body;

    if (!treeId) {
      return res.status(400).json({ message: 'treeId is required' });
    }
    if (message === undefined || message === null) {
      return res.status(400).json({ message: 'message is required' });
    }
    const text = typeof message === 'string' ? message.trim() : String(message).trim();
    if (!text) {
      return res.status(400).json({ message: 'message is required' });
    }

    const tree = await Tree.findById(treeId);
    if (!tree) {
      return res.status(404).json({ message: 'Tree not found' });
    }

    const update = await Update.create({
      tree: treeId,
      message: text,
      image: image || undefined,
    });

    const created = await Update.findById(update._id).populate('tree', 'treeCode farmer');
    res.status(201).json(created);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid tree id' });
    }
    res.status(500).json({ message: err.message });
  }
}

async function getUpdatesByTree(req, res) {
  try {
    const { treeId } = req.params;

    const tree = await Tree.findById(treeId);
    if (!tree) {
      return res.status(404).json({ message: 'Tree not found' });
    }

    const updates = await Update.find({ tree: treeId })
      .sort({ date: -1 })
      .populate('tree', 'treeCode');

    res.status(200).json(updates);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid tree id' });
    }
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createUpdate,
  getUpdatesByTree,
};
