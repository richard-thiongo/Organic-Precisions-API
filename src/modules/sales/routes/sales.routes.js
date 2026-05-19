
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');

// POS Checkout
router.post('/checkout', salesController.checkout);

// Dashboard Statistics
router.get('/stats', salesController.getStats);

// Sales Reports by Date Range
router.get('/reports', salesController.getReports);

module.exports = router;
