const express = require('express');
const { getTrees, getTreeById, adoptTree, createTree } = require('../controllers/treeController');

const router = express.Router();

router.get('/', getTrees);
router.post('/', createTree);
router.post('/:id/adopt', adoptTree);
router.get('/:id', getTreeById);

module.exports = router;
