const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');

// POS Checkout
router.post('/checkout', salesController.checkout);

// Dashboard Statistics
router.get('/stats', salesController.getStats);

module.exports = router;
