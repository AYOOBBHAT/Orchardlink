const express = require('express');
const { getFarmers, getFarmerById } = require('../controllers/farmerController');

const router = express.Router();

router.get('/', getFarmers);
router.get('/:id', getFarmerById);

module.exports = router;
