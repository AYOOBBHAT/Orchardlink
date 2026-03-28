const express = require('express');
const { createUpdate, getUpdatesByTree } = require('../controllers/updateController');

const router = express.Router();

router.post('/', createUpdate);
router.get('/:treeId', getUpdatesByTree);

module.exports = router;
