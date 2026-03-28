const mongoose = require('mongoose');
const Tree = require('../models/Tree');
const Update = require('../models/Update');
const User = require('../models/User');
const Farmer = require('../models/Farmer');

async function generateUniqueTreeCode(userId) {
  const suffix = userId.toString().slice(-4);
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const n = Math.floor(Math.random() * 90000) + 10000;
    const treeCode = `F${suffix}-T${n}`;
    const taken = await Tree.exists({ treeCode });
    if (!taken) return treeCode;
  }
  throw new Error('Could not generate unique treeCode');
}

async function createTree(req, res) {
  try {
    const { farmerProfileId, price, expectedYield, images, role } = req.body;
    // Farmer account creating the listing (same id stored as Tree.createdBy)
    const farmerUserId = req.body.farmerId ?? req.body.userId;

    if (!farmerUserId) {
      return res.status(400).json({ message: 'farmerId or userId is required (farmer account id)' });
    }
    if (!mongoose.Types.ObjectId.isValid(farmerUserId)) {
      return res.status(400).json({ message: 'Invalid farmer user id' });
    }
    if (price === undefined || price === null || Number.isNaN(Number(price))) {
      return res.status(400).json({ message: 'price is required (number)' });
    }

    const user = await User.findById(farmerUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'farmer') {
      return res.status(403).json({
        message: 'Forbidden: only users with role farmer can create trees',
      });
    }
    if (role !== undefined && role !== null && role !== '' && role !== user.role) {
      return res.status(400).json({ message: 'role does not match account' });
    }

    let farmerDoc;
    if (farmerProfileId) {
      farmerDoc = await Farmer.findById(farmerProfileId);
      if (!farmerDoc) {
        return res.status(404).json({ message: 'Farmer profile not found' });
      }
    } else {
      farmerDoc = await Farmer.findOne({ userId: user._id });
      if (!farmerDoc) {
        farmerDoc = await Farmer.create({
          userId: user._id,
          name: user.name?.trim() || 'Orchard',
          location: 'Kashmir',
          description: `Profile for ${user.email}`,
        });
      }
    }

    const treeCode = await generateUniqueTreeCode(farmerUserId);

    const imageUrlsFromUpload =
      Array.isArray(req.files) && req.files.length > 0
        ? req.files.map((file) => file.path).filter(Boolean)
        : [];
    const imageList =
      imageUrlsFromUpload.length > 0
        ? imageUrlsFromUpload
        : Array.isArray(images)
          ? images.filter((u) => typeof u === 'string' && u.trim())
          : [];

    const tree = await Tree.create({
      farmer: farmerDoc._id,
      createdBy: user._id, // farmer User id — links listing to the farmer account
      treeCode,
      price: Number(price),
      expectedYield: expectedYield !== undefined && expectedYield !== null ? String(expectedYield) : undefined,
      images: imageList,
      status: 'growing',
      isAvailable: true,
    });

    const populated = await Tree.findById(tree._id)
      .populate('farmer', 'name location')
      .populate('createdBy', 'name email role');

    res.status(201).json(populated);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid id' });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Tree code conflict; try again' });
    }
    res.status(500).json({ message: err.message });
  }
}

async function getTrees(req, res) {
  try {
    const trees = await Tree.find()
      .populate('farmer', 'name location')
      .sort({ treeCode: 1 });
    res.status(200).json(trees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getMyAdoptedTrees(req, res) {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const trees = await Tree.find({ adoptedBy: userId })
      .populate('farmer', 'name location')
      .sort({ treeCode: 1 });

    res.status(200).json(trees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getTreeById(req, res) {
  try {
    const tree = await Tree.findById(req.params.id).populate('farmer');
    if (!tree) {
      return res.status(404).json({ message: 'Tree not found' });
    }
    res.status(200).json(tree);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid tree id' });
    }
    res.status(500).json({ message: err.message });
  }
}

async function adoptTree(req, res) {
  try {
    const { userId } = req.body;
    if (userId === undefined || userId === null || userId === '') {
      return res.status(400).json({ message: 'userId is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const adopter = await User.findById(userId);
    if (!adopter) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tree = await Tree.findById(req.params.id);
    if (!tree) {
      return res.status(404).json({ message: 'Tree not found' });
    }
    if (!tree.isAvailable) {
      return res.status(400).json({ message: 'Tree already adopted' });
    }

    tree.adoptedBy = adopter._id;
    tree.isAvailable = false;
    await tree.save();

    await Update.create({
      tree: tree._id,
      message: 'Tree has been adopted 🌱',
    });

    const updated = await Tree.findById(tree._id)
      .populate('farmer', 'name location')
      .populate('adoptedBy', 'name email');
    res.status(200).json(updated);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid tree id' });
    }
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getTrees,
  getMyAdoptedTrees,
  getTreeById,
  adoptTree,
  createTree,
};
